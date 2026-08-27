import 'dotenv/config'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { seedAdminData, seedSparePartsCatalog } from '../src/adminApi.js'
import { vehicleCatalog, sparePartProducts, inferVehicleType, constructionVehicleImageOverrides } from '../src/data/fullCatalog.js'
import { sparePartsTree } from '../src/data/sparePartsCatalog.js'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goautomobile'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(scriptDir, '../../frontend/public')
const catalogDir = path.join(publicDir, 'images', 'catalog')
const manifestFile = path.join(catalogDir, 'IMAGE-ATTRIBUTION.json')
const slugify = (value = '') => value.toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let lastCommonsRequestAt = 0
const categorySourceCache = new Map()
const sparePartBrandByKeyword = [
  [/brake|disc|rotor|lining/i, 'Brembo'],
  [/filter|air filter|fuel filter|cabin/i, 'MANN-FILTER'],
  [/clutch|belt/i, 'LuK'],
  [/shock|suspension|strut|control arm/i, 'KYB'],
  [/bearing|hub|roller/i, 'SKF'],
  [/lamp|headlight|tail|sensor/i, 'Hella'],
  [/spark|plug/i, 'NGK'],
  [/battery|charger|charging|controller|converter|motor/i, 'DENSO'],
  [/tyre|tire/i, 'MRF'],
  [/oil|lubricant/i, 'Castrol'],
  [/hydraulic|loader|excavator|tractor|pump/i, 'Bosch'],
]
const sparePartBrandFor = (name) => sparePartBrandByKeyword.find(([matcher]) => matcher.test(name))?.[1] || 'Bosch'

async function commonsFetch(url, attempts = 5) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const gap = Date.now() - lastCommonsRequestAt
    if (gap < 1200) await wait(1200 - gap)
    lastCommonsRequestAt = Date.now()
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BrightAutoHubCatalogSeeder/1.0 (local catalogue image downloader)' },
    })
    if (response.ok) return response
    if (response.status !== 429 && response.status < 500) return response
    await wait(2500 * (attempt + 1))
  }
  throw new Error('Wikimedia request retry limit reached')
}

const Category = mongoose.model('AdminCategory')
const Brand = mongoose.model('AdminBrand')
const Vehicle = mongoose.model('AdminVehicle')
const Part = mongoose.model('AdminPart')

const brandPrefixes = [
  'Mercedes-Benz', 'Maruti Suzuki', 'Royal Enfield', 'Ashok Leyland', 'Tata Hitachi', 'John Deere',
  'New Holland', 'Massey Ferguson', 'BharatBenz', 'Omega Seiki', 'Mahindra', 'Hyundai', 'Volkswagen',
  'Caterpillar', 'Ultraviolette', 'Sonalika', 'Piaggio', 'Komatsu', 'Liebherr', 'Schwing Stetter',
  'Bajaj', 'TVS', 'Honda', 'Hero', 'Suzuki', 'Yamaha', 'Revolt', 'Oben', 'Tork', 'Matter', 'Ola',
  'Ather', 'Vida', 'Tata', 'Toyota', 'Kia', 'Renault', 'BMW', 'Audi', 'Volvo', 'Lexus', 'MG', 'Skoda',
  'Switch', 'Eicher', 'Montra', 'Euler', 'Altigreen', 'Olectra', 'JBM', 'PMI', 'BYD', 'Polaris', 'Force',
  'Isuzu', 'Atul', 'Swaraj', 'Kubota', 'VST', 'CLAAS', 'JCB', 'CASE', 'Bull', 'ACE', 'Tadano', 'SANY',
  'Zoomlion', 'Hamm', 'Wirtgen', 'Kinetic', 'Mini Metro', 'YC Electric',
].sort((a, b) => b.length - a.length)

const imageQueryCache = new Map()
const previousManifest = await readFile(manifestFile, 'utf8').then(JSON.parse).catch(() => [])
const manifestByPath = new Map(previousManifest.map((item) => [item.localPath, item]))

async function commonsCandidates(query) {
  if (imageQueryCache.has(query)) return imageQueryCache.get(query)
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '12',
    prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '900', format: 'json', origin: '*',
  })
  const response = await commonsFetch(`https://commons.wikimedia.org/w/api.php?${params}`)
  if (!response.ok) throw new Error(`Wikimedia API ${response.status}`)
  const payload = await response.json()
  const candidates = Object.values(payload.query?.pages || {})
    .sort((a, b) => (a.index || 99) - (b.index || 99))
    .map((page) => ({ page, info: page.imageinfo?.[0] }))
    .filter(({ info }) => info && ['image/jpeg', 'image/png', 'image/webp'].includes(info.mime) && info.extmetadata?.LicenseShortName?.value)
  imageQueryCache.set(query, candidates)
  await wait(35)
  return candidates
}

async function chooseCommonsImage(name, category, variantIndex) {
  const searches = [`${name} vehicle`, name, `${category} vehicle India`, category]
  for (const search of searches) {
    try {
      const candidates = await commonsCandidates(search)
      if (candidates.length) return candidates[variantIndex % candidates.length]
    } catch (error) {
      console.warn(`Image search retry for ${name}: ${error.message}`)
      await wait(400)
    }
  }
  return null
}

async function saveCommonsImage({ name, category, group, kind, index }) {
  const folderParts = ['images', 'catalog', kind, slugify(group), slugify(category)]
  const relativeFolder = `/${folderParts.join('/')}`
  const previous = [...manifestByPath.values()].find((item) => item.productName === name && item.category === category && item.group === group && item.kind === kind)
  if (previous && !previous.fallback) {
    const absolutePrevious = path.join(publicDir, previous.localPath.replace(/^\//, ''))
    try {
      await readFile(absolutePrevious)
      return previous.localPath
    } catch {}
  }

  const sourceKey = `${kind}|${group}|${category}|${index % 2}`
  const cachedSource = categorySourceCache.get(sourceKey)
  const selected = cachedSource ? null : await chooseCommonsImage(name, category, index)
  const info = selected?.info || cachedSource?.info
  const mime = info?.mime || 'image/jpeg'
  const extension = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  const localPath = `${relativeFolder}/${slugify(name)}.${extension}`
  const absoluteFolder = path.join(publicDir, ...folderParts)
  const absolutePath = path.join(absoluteFolder, `${slugify(name)}.${extension}`)
  await mkdir(absoluteFolder, { recursive: true })

  if (cachedSource) {
    await copyFile(cachedSource.absolutePath, absolutePath)
    manifestByPath.set(localPath, {
      ...cachedSource.attribution, productName: name, category, group, kind, localPath,
      downloadedAt: new Date().toISOString(), reusedCategoryImage: true,
    })
    return localPath
  }

  if (selected) {
    try {
      const imageResponse = await commonsFetch(info.thumburl || info.url)
      if (!imageResponse.ok) throw new Error(`Image download ${imageResponse.status}`)
      await writeFile(absolutePath, Buffer.from(await imageResponse.arrayBuffer()))
      const meta = info.extmetadata || {}
      const attribution = {
        sourcePage: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(selected.page.title.replace(/ /g, '_'))}`,
        sourceFile: selected.page.title,
        author: stripHtml(meta.Artist?.value || meta.Credit?.value || 'See source page'),
        license: stripHtml(meta.LicenseShortName?.value || ''), licenseUrl: meta.LicenseUrl?.value || '',
      }
      manifestByPath.set(localPath, {
        productName: name, category, group, kind, localPath, ...attribution, downloadedAt: new Date().toISOString(),
      })
      categorySourceCache.set(sourceKey, { absolutePath, info, attribution })
      return localPath
    } catch (error) {
      console.warn(`Using local fallback for ${name}: ${error.message}`)
    }
  }

  const fallbackSource = path.join(publicDir, 'images', 'spare-parts-catalog', kind === 'vehicles' ? 'automotive-roadside-parts.jpg' : 'automotive-workshop-parts.jpg')
  await copyFile(fallbackSource, absolutePath)
  manifestByPath.set(localPath, {
    productName: name, category, group, kind, localPath,
    sourcePage: '', sourceFile: 'Local catalogue fallback', author: '', license: '', licenseUrl: '',
    downloadedAt: new Date().toISOString(), fallback: true,
  })
  categorySourceCache.set(sourceKey, {
    absolutePath, info: { mime: 'image/jpeg' },
    attribution: { sourcePage: '', sourceFile: 'Local catalogue fallback', author: '', license: '', licenseUrl: '', fallback: true },
  })
  return localPath
}

async function ensureCategory(name, parentId, group, sortOrder) {
  const slug = slugify(name)
  return Category.findOneAndUpdate(
    { slug, parentId: parentId || null },
    { $set: { name, group, status: 'active', sortOrder }, $setOnInsert: { slug, parentId: parentId || null } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
}

async function ensureBrand(name) {
  const detected = brandPrefixes.find((prefix) => name.toLowerCase().startsWith(prefix.toLowerCase())) || name.split(' ')[0]
  return Brand.findOneAndUpdate(
    { slug: slugify(detected) },
    { $set: { name: detected, status: 'active' }, $setOnInsert: { slug: slugify(detected) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
}

async function seedVehicles() {
  const root = await ensureCategory('Vehicles', null, 'Vehicles', 0)
  let total = 0
  for (const [parentIndex, [parentName, categories]] of Object.entries(vehicleCatalog).entries()) {
    const parent = await ensureCategory(parentName, root._id, 'Vehicles', parentIndex)
    for (const [categoryIndex, [categoryName, products]] of Object.entries(categories).entries()) {
      const category = await ensureCategory(categoryName, parent._id, 'Vehicles', categoryIndex)
      for (const [productIndex, name] of products.entries()) {
        const imageUrl = constructionVehicleImageOverrides[name]
          || await saveCommonsImage({ name, category: categoryName, group: parentName, kind: 'vehicles', index: productIndex })
        const brand = await ensureBrand(name)
        const slug = slugify(`vehicles-${parentName}-${categoryName}-${name}`)
        const vehicleType = inferVehicleType(parentName, categoryName)
        const fuelType = vehicleType === 'Electric' ? 'Electric' : ['Farm', 'Construction', 'Commercial'].includes(vehicleType) ? 'Diesel' : 'Petrol'
        await Vehicle.findOneAndUpdate(
          { slug },
          { $set: {
            name, slug, brand: brand._id, category: category._id, vehicleType,
            fuelType,
            price: 0, modelYear: new Date().getFullYear(), condition: 'new', location: 'New Delhi', imageUrl,
            description: `${name} is listed in ${categoryName} under ${parentName}. Compare usage, fuel type, service reach and availability before requesting the latest quotation.`,
            specifications: { Category: categoryName, Segment: parentName, Availability: 'Enquiry', 'Fuel Type': fuelType, 'Model Year': new Date().getFullYear(), 'Service Guidance': vehicleType === 'Electric' ? 'Check range, charging access and battery warranty.' : 'Check mileage, warranty, service interval and running cost.' },
            details: { title: `${name} buying and ownership notes`, intro: `Useful checks for comparing ${name} with similar ${categoryName} options.`, cards: [
              { title: 'Usage Fit', text: `Shortlist this ${categoryName} by daily route, passenger or payload needs and local service support.`, points: [`Segment: ${parentName}`, `Category: ${categoryName}`, `Fuel: ${fuelType}`] },
              { title: vehicleType === 'Electric' ? 'EV Readiness' : 'Running Cost', text: vehicleType === 'Electric' ? 'Check real-world range, charging access and battery support.' : 'Check mileage, periodic service, tyres, brakes and warranty coverage.', points: vehicleType === 'Electric' ? ['Confirm home or public charging plan', 'Ask about battery warranty', 'Review service support in your city'] : ['Compare mileage and fuel cost', 'Ask for service interval', 'Review insurance and finance options'] },
              { title: 'Before Enquiry', text: 'Share budget, city, expected usage and preferred variant for a faster response.', points: ['Ask latest quotation', 'Confirm colour and variant availability', 'Compare with similar models'] },
            ] }, status: 'active', featured: productIndex === 0,
          } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        )
        total += 1
      }
      console.log(`Vehicles: ${parentName} / ${categoryName} = ${products.length}`)
    }
  }
  return total
}

async function seedParts() {
  const root = await Category.findOne({ slug: 'spare-parts', parentId: null })
  let total = 0
  for (const [parentIndex, parentNode] of sparePartsTree.entries()) {
    const parent = await ensureCategory(parentNode.name, root._id, 'Spare Parts', parentIndex)
    for (const [categoryIndex, categoryNode] of parentNode.children.entries()) {
      const category = await ensureCategory(categoryNode.name, parent._id, 'Spare Parts', categoryIndex)
      const products = sparePartProducts[categoryNode.name]
      if (!products?.length) throw new Error(`No spare-part products configured for ${categoryNode.name}`)
      for (const [productIndex, name] of products.entries()) {
        const imageUrl = await saveCommonsImage({ name, category: categoryNode.name, group: parentNode.name, kind: 'spare-parts', index: productIndex })
        const slug = slugify(`spare-parts-${parentNode.name}-${categoryNode.name}-${name}`)
        await Part.findOneAndUpdate(
          { slug },
          { $set: {
            name, slug, category: categoryNode.name, categoryId: category._id, categoryGroup: parentNode.name,
            partNumber: `BAH-${String(parentIndex + 1).padStart(2, '0')}${String(categoryIndex + 1).padStart(2, '0')}-${String(productIndex + 1).padStart(2, '0')}`,
            brand: sparePartBrandFor(name), price: 0, originalPrice: 0, imageUrl,
            description: name + ' for ' + categoryNode.name + ', with compatibility, part number and fitment confirmed through enquiry.',
            details: { title: name + ' fitment and installation guide', intro: 'Check compatibility and quality points before buying ' + name + '.', cards: [
              { title: 'Fitment Check', text: 'Match the vehicle model, variant, production year and part number before purchase.', points: ['Part number: BAH-' + String(parentIndex + 1).padStart(2, '0') + String(categoryIndex + 1).padStart(2, '0') + '-' + String(productIndex + 1).padStart(2, '0'), 'Category: ' + categoryNode.name, 'Vehicle group: ' + parentNode.name.replace(' Parts', '')] },
              { title: 'Quality Check', text: 'Inspect packaging, invoice and warranty terms before installation.', points: ['Check genuine-fit quality', 'Compare old and new part', 'Confirm warranty support'] },
              { title: 'Installation', text: 'Use trained technicians and test the vehicle after fitment.', points: ['Inspect nearby components', 'Fit using proper tools', 'Road-test before regular use'] },
            ] },
            compatibleVehicleTypes: [parentNode.name.replace(' Parts', '')], stock: 25, status: 'active', featured: productIndex === 0,
          } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        )
        total += 1
      }
      console.log(`Parts: ${parentNode.name} / ${categoryNode.name} = ${products.length}`)
    }
  }
  return total
}

try {
  await mongoose.connect(uri)
  await seedAdminData()
  await seedSparePartsCatalog()
  await mkdir(catalogDir, { recursive: true })
  const vehicles = await seedVehicles()
  const parts = await seedParts()
  const manifest = [...manifestByPath.values()].sort((a, b) => a.localPath.localeCompare(b.localPath))
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`)
  const fallbackImages = manifest.filter((item) => item.fallback).length
  console.log(`Full catalogue seeded: ${vehicles} vehicles, ${parts} spare parts, ${manifest.length} local images, ${fallbackImages} fallbacks.`)
} catch (error) {
  console.error('Unable to seed full catalogue:', error)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}

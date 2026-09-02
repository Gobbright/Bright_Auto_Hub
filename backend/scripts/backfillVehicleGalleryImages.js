import 'dotenv/config'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import '../src/adminApi.js'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brightautohub'
const dbName = process.env.MONGODB_DB_NAME || 'brightautohub'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..', '..')
const publicDir = path.join(projectRoot, 'frontend', 'public')
const galleryRoot = path.join(publicDir, 'images', 'catalog', 'vehicles-gallery')
const attributionFile = path.join(publicDir, 'images', 'catalog', 'VEHICLE-GALLERY-ATTRIBUTION.json')
const apply = process.argv.includes('--apply')
const onlyIndex = process.argv.indexOf('--only')
const onlyName = onlyIndex >= 0 ? String(process.argv[onlyIndex + 1] || '').toLowerCase() : ''

const manualCommonsFiles = {
  'mg-zs-ev': [
    'MG ZS EV.jpg',
    'MG ZS EV Facelift 1X7A5867.jpg',
    '2020 MG ZS EV.jpg',
    'MG ZS EV in France (front right quarter).jpg',
    'MG ZS EV in France (rear quarter).jpg',
  ],
}

const targetTotal = 5
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
let lastRequestAt = 0

const Vehicle = mongoose.model('AdminVehicle')
const slugify = (value = '') => String(value).trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const relativePublicPath = (absolutePath) => '/' + path.relative(publicDir, absolutePath).replaceAll('\\', '/')
const publicAbsolutePath = (url = '') => path.join(publicDir, String(url).replace(/^\//, '').split('?')[0].split('#')[0])
const cleanVehicleName = (name = '') => String(name).replace(/\s+Used\s+\d{4}\s*$/i, '').trim()
const nameTokens = (name = '') => slugify(cleanVehicleName(name)).split('-').filter((token) => token.length > 1 && !['ev', 'di'].includes(token))
const vehicleContext = (vehicle = {}) => [vehicle.vehicleType, vehicle.category?.name, vehicle.category?.parentId?.name, vehicle.fuelType].filter(Boolean).join(' ')
const isLikelyImage = (file) => extensions.has(path.extname(file).toLowerCase())

async function walkImages(root) {
  const files = []
  async function visit(dir) {
    let entries = []
    try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name)
      if (entry.isDirectory()) await visit(absolute)
      else if (entry.isFile() && isLikelyImage(entry.name)) files.push(absolute)
    }
  }
  await visit(root)
  return files
}

function localMatches(vehicle, localImages) {
  const baseSlug = slugify(cleanVehicleName(vehicle.name))
  const tokens = nameTokens(vehicle.name)
  return localImages
    .map((absolutePath) => {
      const localPath = relativePublicPath(absolutePath)
      const slug = slugify(path.basename(absolutePath, path.extname(absolutePath)))
      const exact = slug === baseSlug
      const starts = slug.startsWith(baseSlug) || baseSlug.startsWith(slug)
      const tokenHits = tokens.filter((token) => slug.includes(token)).length
      const pathBonus = /\/images\/catalog\/vehicles\//.test(localPath) ? 2 : 0
      const transparentPenalty = /transparent/i.test(localPath) ? -1 : 0
      const score = (exact ? 12 : 0) + (starts ? 5 : 0) + tokenHits + pathBonus + transparentPenalty
      return { url: localPath, alt: vehicle.name, absolutePath, source: 'local', score }
    })
    .filter((item) => item.score >= Math.max(4, Math.min(tokens.length, 3)))
    .sort((a, b) => b.score - a.score || a.url.localeCompare(b.url))
}

async function commonsFetch(url, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const gap = Date.now() - lastRequestAt
    if (gap < 1200) await wait(1200 - gap)
    lastRequestAt = Date.now()
    const response = await fetch(url, { headers: { 'User-Agent': 'BrightAutoHubVehicleGallery/1.0 (local image backfill)' } })
    if (response.ok) return response
    if (response.status !== 429 && response.status < 500) return response
    await wait(1800 * (attempt + 1))
  }
  throw new Error('Wikimedia request retry limit reached')
}

async function commonsCandidates(query) {
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '18',
    prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '1200', format: 'json', origin: '*',
  })
  const response = await commonsFetch('https://commons.wikimedia.org/w/api.php?' + params)
  if (!response.ok) return []
  const payload = await response.json()
  return Object.values(payload.query?.pages || {})
    .sort((a, b) => (a.index || 99) - (b.index || 99))
    .map((page) => ({ page, info: page.imageinfo?.[0] }))
    .filter(({ info }) => info && ['image/jpeg', 'image/png', 'image/webp'].includes(info.mime) && info.extmetadata?.LicenseShortName?.value)
}

function scoreCommons(vehicle, candidate) {
  const tokens = nameTokens(vehicle.name)
  const title = slugify(candidate.page?.title || '')
  const tokenHits = tokens.filter((token) => title.includes(token)).length
  const allMainTokens = tokens.length <= 2 ? tokenHits === tokens.length : tokenHits >= Math.min(tokens.length, 3)
  const contextHits = slugify(vehicleContext(vehicle)).split('-').filter((token) => token.length > 3 && title.includes(token)).length
  return { score: tokenHits * 4 + contextHits + (allMainTokens ? 8 : 0), tokenHits, allMainTokens }
}

function manualOnlineMatches(vehicle) {
  const baseName = cleanVehicleName(vehicle.name)
  const files = manualCommonsFiles[slugify(baseName)] || []
  return files.map((file) => ({
    source: 'wikimedia-manual', score: 99, url: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=1200', mime: 'image/jpeg',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replace(/ /g, '_')), sourceFile: file,
    author: 'See Wikimedia Commons source page', license: 'See source page', licenseUrl: '',
  }))
}

async function onlineMatches(vehicle) {
  const manual = manualOnlineMatches(vehicle)
  if (manual.length) return manual
  const baseName = cleanVehicleName(vehicle.name)
  const searches = [
    '"' + baseName + '" vehicle',
    '"' + baseName + '" car',
    '"' + baseName + '" motorcycle',
    '"' + baseName + '" India',
    baseName,
  ]
  const seen = new Set()
  const matches = []
  for (const query of searches) {
    for (const candidate of await commonsCandidates(query)) {
      const url = candidate.info.thumburl || candidate.info.url
      if (!url || seen.has(url)) continue
      seen.add(url)
      const quality = scoreCommons(vehicle, candidate)
      if (!quality.allMainTokens || quality.score < 12) continue
      const meta = candidate.info.extmetadata || {}
      matches.push({
        source: 'wikimedia', score: quality.score, url, mime: candidate.info.mime,
        sourcePage: candidate.info.descriptionurl || 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(String(candidate.page.title).replace(/ /g, '_')),
        sourceFile: candidate.page.title,
        author: stripHtml(meta.Artist?.value || meta.Credit?.value || 'See source page'),
        license: stripHtml(meta.LicenseShortName?.value || ''), licenseUrl: meta.LicenseUrl?.value || '',
      })
    }
    if (matches.length >= targetTotal) break
  }
  return matches.sort((a, b) => b.score - a.score).slice(0, targetTotal)
}

async function saveOnlineImage(vehicle, item, index) {
  const ext = item.mime === 'image/png' ? 'png' : item.mime === 'image/webp' ? 'webp' : 'jpg'
  const folder = path.join(galleryRoot, slugify(vehicle.name))
  const absolutePath = path.join(folder, String(index + 1).padStart(2, '0') + '-' + slugify(vehicle.name) + '.' + ext)
  const localPath = relativePublicPath(absolutePath)
  if (!apply) return { url: localPath, alt: vehicle.name, attribution: { ...item, localPath } }
  await mkdir(folder, { recursive: true })
  const response = await commonsFetch(item.url)
  if (!response.ok) throw new Error('Image download failed: ' + response.status)
  await writeFile(absolutePath, Buffer.from(await response.arrayBuffer()))
  return { url: localPath, alt: vehicle.name, attribution: { ...item, localPath, productName: vehicle.name, downloadedAt: new Date().toISOString() } }
}

async function copyExactImage(vehicle, source, index) {
  const ext = path.extname(source.absolutePath || publicAbsolutePath(source.url)) || '.jpg'
  const folder = path.join(galleryRoot, slugify(vehicle.name))
  const absolutePath = path.join(folder, String(index + 1).padStart(2, '0') + '-' + slugify(vehicle.name) + ext)
  const localPath = relativePublicPath(absolutePath)
  if (apply) {
    await mkdir(folder, { recursive: true })
    await copyFile(source.absolutePath || publicAbsolutePath(source.url), absolutePath)
  }
  return { url: localPath, alt: vehicle.name, source: 'exact-local-copy' }
}

function addUnique(images, image) {
  if (!image?.url || images.some((item) => item.url === image.url)) return
  images.push({ url: image.url, alt: image.alt || '' })
}

async function imageSetFor(vehicle, localImages) {
  const locals = localMatches(vehicle, localImages)
  const online = await onlineMatches(vehicle).catch((error) => {
    console.warn('Online image search failed for ' + vehicle.name + ': ' + error.message)
    return []
  })
  const images = []
  const attributions = []

  for (const local of locals) addUnique(images, local)
  for (const [index, item] of online.entries()) {
    const saved = await saveOnlineImage(vehicle, item, images.length + index)
    addUnique(images, saved)
    if (saved.attribution) attributions.push(saved.attribution)
    if (images.length >= targetTotal) break
  }

  const source = locals[0] || (vehicle.imageUrl ? { url: vehicle.imageUrl, alt: vehicle.name } : null)
  while (source && images.length < targetTotal) addUnique(images, await copyExactImage(vehicle, source, images.length))
  return { images: images.slice(0, targetTotal), attributions }
}

try {
  await mongoose.connect(uri, { dbName })
  const vehicleFilter = onlyName ? { name: { $regex: onlyName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), $options: 'i' } } : {}
  const vehicles = await Vehicle.find(vehicleFilter).populate({ path: 'category', select: 'name slug parentId', populate: { path: 'parentId', select: 'name slug' } }).sort({ name: 1 })
  const localImages = await walkImages(path.join(publicDir, 'images'))
  const existingAttribution = await readFile(attributionFile, 'utf8').then(JSON.parse).catch(() => [])
  const attributionByPath = new Map(existingAttribution.map((item) => [item.localPath, item]))
  const result = []

  for (const vehicle of vehicles) {
    const { images, attributions } = await imageSetFor(vehicle, localImages)
    const main = images[0]?.url || vehicle.imageUrl || ''
    const galleryImages = images.slice(1, targetTotal)
    if (apply) await Vehicle.updateOne({ _id: vehicle._id }, { $set: { imageUrl: main, galleryImages } })
    for (const attribution of attributions) attributionByPath.set(attribution.localPath, attribution)
    result.push({ name: vehicle.name, main, totalImages: images.length, galleryImages: galleryImages.length })
    console.log(vehicle.name + ': ' + images.length + ' images')
  }

  if (apply) {
    await mkdir(path.dirname(attributionFile), { recursive: true })
    await writeFile(attributionFile, JSON.stringify([...attributionByPath.values()].sort((a, b) => a.localPath.localeCompare(b.localPath)), null, 2) + '\n')
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', vehicles: result.length, belowThree: result.filter((item) => item.totalImages < 3), sample: result.slice(0, 8) }, null, 2))
} catch (error) {
  console.error('Unable to backfill vehicle galleries:', error)
  process.exitCode = 1
} finally {
  await mongoose.disconnect().catch(() => {})
}

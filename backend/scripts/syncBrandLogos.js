import 'dotenv/config'
import mongoose from 'mongoose'
import { Readable } from 'node:stream'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import '../src/adminApi.js'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..', '..')
const sourceLogoDirectory = path.join(projectRoot, 'frontend', 'src', 'assets', 'Images', 'Home', 'Brand Logos')
const publicLogoDirectory = path.join(projectRoot, 'frontend', 'public', 'images', 'brands', 'admin')
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goautomobile'

const localLogoAliases = {
  'ashok-leyland': 'ashok-leyland.svg', bajaj: 'bajaj.svg', hero: 'hero.svg', honda: 'honda.svg',
  hyundai: 'hyundai.svg', kia: 'kia.svg', mahindra: 'mahindra.svg', 'maruti-suzuki': 'maruti-suzuki.svg',
  mg: 'mg.svg', 'mg-motor': 'mg.svg', skoda: 'skoda.svg', tata: 'tata.svg',
  'tata-motors': 'tata.svg', toyota: 'toyota.svg', tvs: 'tvs.svg', volkswagen: 'volkswagen.svg',
}

const simpleIconSlugs = {
  ather: 'ather', audi: 'audi', bmw: 'bmw', byd: 'byd', caterpillar: 'caterpillar', honda: 'honda',
  'john-deere': 'johndeere', kia: 'kia', lexus: 'lexus', 'mercedes-benz': 'mercedesbenz',
  mg: 'mg', 'mg-motor': 'mg', ola: 'ola', piaggio: 'piaggio', polaris: 'polaris',
  renault: 'renault', 'royal-enfield': 'royalenfield', skoda: 'skoda', suzuki: 'suzuki',
  tata: 'tata', 'tata-motors': 'tata', toyota: 'toyota', volkswagen: 'volkswagen', volvo: 'volvo',
}

const domainPairs = `
wirtgen=wirtgen-group.com
schwing-stetter=schwingstetterindia.com
hamm=wirtgen-group.com
zoomlion=zoomlion.com
sany=sany.in
tadano=tadano.com
liebherr=liebherr.com
ace=ace-cranes.com
bull=bullindia.com
case=casece.com
caterpillar=cat.com
komatsu=komatsu.com
tata-hitachi=tatahitachi.co.in
new-holland=newholland.com
claas=claas.com
vst=vsttractors.com
kubota=kubota.com
massey-ferguson=masseyferguson.com
sonalika=sonalika.com
swaraj=swarajtractors.com
atul=atulauto.co.in
force=forcemotors.com
isuzu=isuzu.in
bharatbenz=bharatbenz.com
john-deere=deere.com
polaris=polaris.com
byd=byd.com
pmi=pmielectro.com
jbm=jbmgroup.com
olectra=olectra.com
ashok-leyland=ashokleyland.com
omega-seiki=omegaseikimobility.com
montra=montramobility.com
eicher=eichertrucksandbuses.com
switch=switchmobility.tech
mini-metro=minimetroev.com
yc-electric=ycevehicles.com
kinetic=kineticev.in
altigreen=altigreen.com
euler=eulermotors.com
piaggio=piaggio.com
mg=mgmotor.co.in
mg-motor=mgmotor.co.in
lexus=lexus.com
volvo=volvocars.com
audi=audi.com
bmw=bmw.com
mercedes-benz=mercedes-benz.com
renault=renault.co.in
kia=kia.com
volkswagen=volkswagen.co.in
skoda=skoda-auto.co.in
toyota=toyotabharat.com
tata=tatamotors.com
tata-motors=tatamotors.com
vida=vida.world
ather=atherenergy.com
ola=olaelectric.com
matter=matter.in
ultraviolette=ultraviolette.com
tork=torkmotors.com
oben=obenelectric.com
revolt=revoltmotors.com
yamaha=yamaha-motor-india.com
suzuki=suzukimotorcycle.co.in
hero=heromotocorp.com
honda=honda2wheelersindia.com
royal-enfield=royalenfield.com
jcb=jcb.com
mahindra=mahindra.com
maruti-suzuki=marutisuzuki.com
hyundai=hyundai.com
tvs=tvsmotor.com
bajaj=bajajauto.com
`.trim()
const officialDomains = Object.fromEntries(domainPairs.split('\n').map((line) => line.trim().split('=')))

const mimeExtension = (contentType = '') => {
  if (contentType.includes('svg')) return 'svg'
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('jpeg')) return 'jpg'
  if (contentType.includes('gif')) return 'gif'
  return 'png'
}

const escapeXml = (value = '') => value.replace(/[<>&'"]/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
}[character]))

const transparentWordmark = (name) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240" role="img" aria-label="${escapeXml(name)} logo"><g fill="none" fill-rule="evenodd"><path fill="#ED1C24" d="M72 42h56l34 78-34 78H72l34-78z"/><text x="184" y="140" fill="#202630" font-family="Arial,Helvetica,sans-serif" font-size="52" font-weight="700">${escapeXml(name)}</text></g></svg>`,
)

const removeSolidBackground = async (asset) => {
  if (asset.contentType === 'image/svg+xml') return asset
  const pipeline = sharp(asset.buffer)
  const metadata = await pipeline.metadata()
  if (metadata.hasAlpha) {
    return { ...asset, buffer: await pipeline.png({ compressionLevel: 9 }).toBuffer(), contentType: 'image/png' }
  }
  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const sampleSize = Math.max(1, Math.min(3, info.width, info.height))
  const samples = []
  for (let y = 0; y < sampleSize; y += 1) {
    for (let x = 0; x < sampleSize; x += 1) {
      samples.push([x, y], [info.width - 1 - x, y], [x, info.height - 1 - y], [info.width - 1 - x, info.height - 1 - y])
    }
  }
  const background = samples.reduce((color, [x, y]) => {
    const offset = (y * info.width + x) * info.channels
    color[0] += data[offset]
    color[1] += data[offset + 1]
    color[2] += data[offset + 2]
    return color
  }, [0, 0, 0]).map((value) => value / samples.length)

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset] - background[0]
    const green = data[offset + 1] - background[1]
    const blue = data[offset + 2] - background[2]
    const distance = Math.sqrt(red * red + green * green + blue * blue)
    data[offset + 3] = Math.max(0, Math.min(255, Math.round(((distance - 10) / 40) * 255)))
  }
  return {
    ...asset,
    buffer: await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toBuffer(),
    contentType: 'image/png',
    backgroundRemoved: true,
  }
}

const fetchAsset = async (url, expectedSvg = false) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'GoAuto-Brand-Asset-Sync/1.0' },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const contentType = response.headers.get('content-type')?.split(';')[0] || ''
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 100 || buffer.length > 2 * 1024 * 1024) throw new Error('Invalid logo file size')
  if (expectedSvg && !buffer.toString('utf8', 0, Math.min(buffer.length, 500)).includes('<svg')) throw new Error('Not an SVG')
  if (!expectedSvg && !contentType.startsWith('image/')) throw new Error('Not an image')
  return { buffer, contentType: expectedSvg ? 'image/svg+xml' : contentType }
}

const downloadFor = async (brand) => {
  const simpleSlug = simpleIconSlugs[brand.slug] || brand.slug.replaceAll('-', '')
  const simpleUrl = `https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/${simpleSlug}.svg`
  try {
    return { ...await fetchAsset(simpleUrl, true), sourceUrl: simpleUrl, source: 'Simple Icons' }
  } catch { /* Try the official-domain icon below. */ }

  const domain = officialDomains[brand.slug] || brand.website?.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (domain) {
    const sourceUrl = `https://icon.horse/icon/${domain}`
    try {
      const downloaded = await fetchAsset(sourceUrl)
      const supportedType = ['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg', 'image/gif'].includes(downloaded.contentType)
      if (supportedType) return { ...downloaded, sourceUrl, source: 'Official-domain icon' }
      const pngUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=https://${domain}`
      return { ...await fetchAsset(pngUrl), sourceUrl: pngUrl, source: 'Official-domain icon' }
    } catch { /* Generate a final transparent fallback below. */ }
  }

  return { buffer: transparentWordmark(brand.name), contentType: 'image/svg+xml', sourceUrl: '', source: 'Transparent fallback' }
}

const uploadToGridFs = async (bucket, filesCollection, brand, asset, filename) => {
  const reusable = await filesCollection.findOne({ $or: [{ 'metadata.brandSlug': brand.slug }, { filename }] })
  const upload = bucket.openUploadStream(filename, {
    metadata: {
      contentType: asset.contentType,
      title: `${brand.name} logo`,
      alt: `${brand.name} vehicle brand logo`,
      context: 'brand-logo',
      brandId: String(brand._id),
      brandSlug: brand.slug,
      source: asset.source,
      sourceUrl: asset.sourceUrl,
      transparentBackground: true,
      backgroundProcessed: Boolean(asset.backgroundRemoved),
    },
  })
  await new Promise((resolve, reject) => {
    Readable.from(asset.buffer).pipe(upload).on('finish', resolve).on('error', reject)
  })
  return { fileId: upload.id, previousId: reusable?._id || null }
}

const run = async () => {
  await mongoose.connect(mongoUri)
  await mkdir(publicLogoDirectory, { recursive: true })
  const Brand = mongoose.model('AdminBrand')
  const brands = await Brand.find({}).sort({ name: 1 })
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' })
  const filesCollection = mongoose.connection.db.collection('media.files')
  const totals = { local: 0, simple: 0, domain: 0, fallback: 0, updated: 0 }

  for (const brand of brands) {
    let asset
    const localFilename = localLogoAliases[brand.slug]
    if (localFilename) {
      asset = {
        buffer: await readFile(path.join(sourceLogoDirectory, localFilename)),
        contentType: 'image/svg+xml',
        source: 'Existing transparent SVG',
        sourceUrl: '',
      }
      totals.local += 1
    } else {
      asset = await downloadFor(brand)
      if (asset.source === 'Simple Icons') totals.simple += 1
      else if (asset.source === 'Official-domain icon') totals.domain += 1
      else totals.fallback += 1
    }

    asset = await removeSolidBackground(asset)
    const filename = `${brand.slug}.${mimeExtension(asset.contentType)}`
    await writeFile(path.join(publicLogoDirectory, filename), asset.buffer)
    const { fileId, previousId } = await uploadToGridFs(bucket, filesCollection, brand, asset, filename)
    await Brand.updateOne({ _id: brand._id }, { $set: { logoUrl: `/api/storage/files/${fileId}` } })
    if (previousId) await bucket.delete(previousId)
    totals.updated += 1
    console.log(`[${totals.updated}/${brands.length}] ${brand.name} -> ${asset.source}`)
  }
  console.log(JSON.stringify({ brands: brands.length, ...totals, localDirectory: publicLogoDirectory }, null, 2))
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })

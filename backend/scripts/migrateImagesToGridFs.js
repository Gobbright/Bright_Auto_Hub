import 'dotenv/config'
import mongoose from 'mongoose'
import { Readable } from 'node:stream'
import { readFile, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import '../src/adminApi.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const publicRoot = path.join(projectRoot, 'frontend', 'public')
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brightautohub'
const apiOrigin = (process.env.API_ORIGIN || process.env.PUBLIC_API_ORIGIN || 'http://localhost:5000').replace(/\/$/, '')
const apply = process.argv.includes('--apply')
const deletePublic = process.argv.includes('--delete-public')
const maxBytes = 8 * 1024 * 1024
const contentTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.avif': 'image/avif' }
const productPublicRoots = ['images/catalog/vehicles', 'images/catalog/vehicles-gallery', 'images/catalog/spare-parts', 'images/catalog/spare-parts-cutout', 'images/catalog/services'].map((item) => path.join(publicRoot, item))

const productSpecs = [
  { modelName: 'AdminVehicle', stringFields: ['imageUrl'], arrayFields: ['galleryImages', 'colorImages'] },
  { modelName: 'AdminPart', stringFields: ['imageUrl'], arrayFields: ['galleryImages'] },
  { modelName: 'AdminService', stringFields: ['imageUrl'], arrayFields: ['galleryImages'] },
]

const slugify = (value = '') => value.toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const isGridFsUrl = (value) => typeof value === 'string' && value.includes('/api/storage/files/')
const isLocalImage = (value) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !isGridFsUrl(value)
const inside = (child, parent) => {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
const resolveSource = (value) => {
  if (!isLocalImage(value)) return null
  const clean = value.split('?')[0].split('#')[0].replace(/^\/+/, '')
  const sourcePath = path.resolve(publicRoot, clean)
  return inside(sourcePath, publicRoot) ? sourcePath : null
}
const isDeletableProductPath = (sourcePath) => productPublicRoots.some((root) => inside(sourcePath, root) || sourcePath === root)
const seoFilename = (doc, field, index, sourcePath) => {
  const ext = path.extname(sourcePath).toLowerCase() || '.jpg'
  const fieldLabel = field.replace(/Images$/, ' images')
  const base = slugify([doc.name || doc.title, fieldLabel, index ? index : '', 'goauto'].filter(Boolean).join(' ')) || slugify(path.basename(sourcePath, ext)) || 'product-image'
  return base.slice(0, 110) + ext
}
const fileDetails = async (sourcePath, reference) => {
  if (!sourcePath) return { missing: { ...reference, reason: 'not-local-public-image' } }
  let details
  try { details = await stat(sourcePath) } catch { return { missing: { ...reference, sourcePath, reason: 'file-not-found' } } }
  if (!details.isFile()) return { missing: { ...reference, sourcePath, reason: 'not-a-file' } }
  if (details.size > maxBytes) return { missing: { ...reference, sourcePath, reason: 'too-large', bytes: details.size } }
  return { details }
}
const uploadFile = async (bucket, sourcePath, filename, metadata) => {
  const data = await readFile(sourcePath)
  const contentType = contentTypes[path.extname(sourcePath).toLowerCase()] || 'application/octet-stream'
  const upload = bucket.openUploadStream(filename, { metadata: { ...metadata, contentType, originalPath: path.relative(projectRoot, sourcePath).replaceAll('\\', '/'), migrated: true } })
  await new Promise((resolve, reject) => {
    upload.once('finish', resolve)
    upload.once('error', reject)
    Readable.from(data).pipe(upload)
  })
  return apiOrigin + '/api/storage/files/' + upload.id.toString()
}

const run = async () => {
  await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB_NAME || 'brightautohub' })
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' })
  const missing = []
  const references = []
  const migratedSources = new Set()
  let migratedFiles = 0

  for (const spec of productSpecs) {
    const Model = mongoose.models[spec.modelName]
    if (!Model) continue
    const docs = await Model.find({}).lean()
    for (const doc of docs) {
      const set = {}
      for (const field of spec.stringFields) {
        const value = doc[field]
        if (!isLocalImage(value)) continue
        const sourcePath = resolveSource(value)
        const checked = await fileDetails(sourcePath, { model: spec.modelName, id: String(doc._id), field, value })
        if (checked.missing) { missing.push(checked.missing); continue }
        const filename = seoFilename(doc, field, 1, sourcePath)
        const to = apply ? await uploadFile(bucket, sourcePath, filename, { source: value, title: (doc.name || doc.title || 'Product') + ' ' + field, alt: doc.name || doc.title || '', context: 'product-migration' }) : 'pending'
        set[field] = to
        migratedFiles += apply ? 1 : 0
        migratedSources.add(sourcePath)
        references.push({ model: spec.modelName, id: String(doc._id), field, from: value, to, filename, bytes: checked.details.size })
      }
      for (const field of spec.arrayFields) {
        if (!Array.isArray(doc[field])) continue
        let changed = false
        const nextImages = []
        for (const [index, image] of doc[field].entries()) {
          if (!isLocalImage(image?.url)) { nextImages.push(image); continue }
          const sourcePath = resolveSource(image.url)
          const checked = await fileDetails(sourcePath, { model: spec.modelName, id: String(doc._id), field, value: image.url })
          if (checked.missing) { missing.push(checked.missing); nextImages.push(image); continue }
          const imageNumber = index + 1
          const filename = seoFilename(doc, field, imageNumber, sourcePath)
          const alt = image.alt || (doc.name || doc.title || 'Product') + ' image ' + imageNumber
          const to = apply ? await uploadFile(bucket, sourcePath, filename, { source: image.url, title: alt, alt, context: 'product-migration' }) : 'pending'
          nextImages.push({ ...image, url: to, alt })
          changed = true
          migratedFiles += apply ? 1 : 0
          migratedSources.add(sourcePath)
          references.push({ model: spec.modelName, id: String(doc._id), field, from: image.url, to, filename, bytes: checked.details.size })
        }
        if (changed) set[field] = nextImages
      }
      if (apply && Object.keys(set).length) await Model.updateOne({ _id: doc._id }, { $set: set })
    }
  }

  const deletedPublicFiles = []
  if (apply && deletePublic) {
    for (const sourcePath of migratedSources) {
      if (!isDeletableProductPath(sourcePath)) continue
      await unlink(sourcePath)
      deletedPublicFiles.push(path.relative(projectRoot, sourcePath).replaceAll('\\', '/'))
    }
  }

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', deletePublic, references: references.length, migratedFiles, deleteCandidates: migratedSources.size, deletedPublicFiles: deletedPublicFiles.length, missing, sample: references.slice(0, 15) }, null, 2))
  await mongoose.disconnect()
}

run().catch(async (error) => { console.error(error); try { await mongoose.disconnect() } catch {} process.exitCode = 1 })

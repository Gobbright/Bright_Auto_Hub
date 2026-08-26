import 'dotenv/config'
import mongoose from 'mongoose'
import { Readable } from 'node:stream'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import '../src/adminApi.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goautomobile'
const apiOrigin = (process.env.API_ORIGIN || process.env.PUBLIC_API_ORIGIN || 'http://localhost:5000').replace(/\/$/, '')
const apply = process.argv.includes('--apply')
const maxBytes = 8 * 1024 * 1024
const contentTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.avif': 'image/avif', '.ico': 'image/x-icon' }

const modelSpecs = [
  ['AdminCategory', 'icon'], ['AdminBrand', 'logoUrl'], ['AdminVehicle', 'imageUrl'],
  ['AdminService', 'imageUrl'], ['AdminContent', 'heroImage'], ['AdminBlog', 'imageUrl'],
  ['AdminPart', 'imageUrl'], ['AdminSitePage', 'heroImage'],
]

const isGridFsUrl = (value) => typeof value === 'string' && value.includes('/api/storage/files/')
const isLocalImage = (value) => typeof value === 'string' && value.startsWith('/') && !isGridFsUrl(value) && !value.startsWith('//')
const resolveSource = (value) => {
  if (!isLocalImage(value)) return null
  const clean = value.split('?')[0].split('#')[0]
  const candidates = clean.startsWith('/images/')
    ? [path.join(projectRoot, 'frontend', 'public', clean.slice(1))]
    : [path.join(projectRoot, 'frontend', 'public', clean.slice(1)), path.join(projectRoot, 'frontend', 'src', clean.slice(1))]
  return candidates.find((candidate) => path.normalize(candidate).startsWith(path.join(projectRoot, 'frontend')))
}

const run = async () => {
  await mongoose.connect(mongoUri)
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' })
  const dedupe = new Map()
  const missing = []
  const references = []
  let migratedFiles = 0

  for (const [modelName, field] of modelSpecs) {
    const Model = mongoose.models[modelName]
    if (!Model) continue
    const docs = await Model.find({ [field]: { $type: 'string', $ne: '' } }).select(`_id ${field}`).lean()
    for (const doc of docs) {
      const value = doc[field]
      if (!isLocalImage(value)) continue
      const sourcePath = resolveSource(value)
      if (!sourcePath) { missing.push({ model: modelName, id: String(doc._id), value }); continue }
      let details
      try { details = await stat(sourcePath) } catch { missing.push({ model: modelName, id: String(doc._id), value, sourcePath }); continue }
      if (!details.isFile() || details.size > maxBytes) { missing.push({ model: modelName, id: String(doc._id), value, sourcePath, bytes: details.size }); continue }
      let url = dedupe.get(sourcePath)
      if (!url) {
        if (!apply) { dedupe.set(sourcePath, 'pending'); url = 'pending' }
        else {
          const data = await readFile(sourcePath)
          const contentType = contentTypes[path.extname(sourcePath).toLowerCase()] || 'application/octet-stream'
          const upload = bucket.openUploadStream(path.basename(sourcePath), { contentType, metadata: { source: value, migrated: true } })
          await new Promise((resolve, reject) => {
            upload.once('finish', resolve)
            upload.once('error', reject)
            Readable.from(data).pipe(upload)
          })
          url = `${apiOrigin}/api/storage/files/${upload.id.toString()}`
          dedupe.set(sourcePath, url)
          migratedFiles += 1
        }
      }
      references.push({ model: modelName, id: String(doc._id), field, from: value, to: url, bytes: details.size })
      if (apply && url && url !== 'pending') await Model.updateOne({ _id: doc._id }, { $set: { [field]: url } })
    }
  }

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', references: references.length, uniqueSourceFiles: dedupe.size, migratedFiles, missing, sample: references.slice(0, 12) }, null, 2))
  await mongoose.disconnect()
}

run().catch(async (error) => { console.error(error); try { await mongoose.disconnect() } catch {} process.exitCode = 1 })

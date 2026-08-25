import 'dotenv/config'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, stat } from 'node:fs/promises'
import '../src/adminApi.js'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goautomobile'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(scriptDir, '../../frontend/public')
const manifestPath = path.join(publicDir, 'images', 'catalog', 'IMAGE-ATTRIBUTION.json')
const Category = mongoose.model('AdminCategory')
const Vehicle = mongoose.model('AdminVehicle')
const Part = mongoose.model('AdminPart')

await mongoose.connect(uri)
try {
  const auditTree = async (rootSlug, Model, categoryField) => {
    const root = await Category.findOne({ slug: rootSlug, parentId: null })
    const parents = await Category.find({ parentId: root._id, status: 'active' })
    const leaves = await Category.find({ parentId: { $in: parents.map((item) => item._id) }, status: 'active' })
    const counts = await Promise.all(leaves.map(async (leaf) => ({ name: leaf.name, count: await Model.countDocuments({ [categoryField]: leaf._id, status: 'active' }) })))
    return { leaves: leaves.length, minimum: Math.min(...counts.map((item) => item.count)), failures: counts.filter((item) => item.count < 5) }
  }

  const vehicles = await auditTree('vehicles', Vehicle, 'category')
  const parts = await auditTree('spare-parts', Part, 'categoryId')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const missing = []
  const badNames = []
  for (const image of manifest) {
    try { await stat(path.join(publicDir, image.localPath.replace(/^\//, ''))) } catch { missing.push(image.localPath) }
    const filename = path.basename(image.localPath)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|png|webp)$/.test(filename)) badNames.push(filename)
  }
  const result = {
    vehicleLeafCategories: vehicles.leaves,
    minimumVehiclesPerLeaf: vehicles.minimum,
    vehicleFailures: vehicles.failures,
    sparePartLeafCategories: parts.leaves,
    minimumPartsPerLeaf: parts.minimum,
    partFailures: parts.failures,
    seededVehicles: await Vehicle.countDocuments({ slug: /^vehicles-/ }),
    seededParts: await Part.countDocuments({ slug: /^spare-parts-/ }),
    manifestImages: manifest.length,
    onlineAttributedImages: manifest.filter((item) => item.sourcePage && item.license && !item.fallback).length,
    fallbackImages: manifest.filter((item) => item.fallback).length,
    missingFiles: missing.length,
    invalidSeoFilenames: badNames.length,
  }
  console.log(JSON.stringify(result, null, 2))
  if (vehicles.failures.length || parts.failures.length || missing.length || badNames.length || result.fallbackImages || result.onlineAttributedImages !== manifest.length) process.exitCode = 1
} finally {
  await mongoose.disconnect()
}

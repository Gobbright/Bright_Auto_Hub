import 'dotenv/config'
import mongoose from 'mongoose'
import '../src/adminApi.js'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goautomobile'
const Category = mongoose.model('AdminCategory')
const Vehicle = mongoose.model('AdminVehicle')
const slugify = (value = '') => value.toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const firstFiveUniqueNames = (items) => {
  const seen = new Set()
  return items.filter((item) => {
    const key = item.name.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 5)
}

await mongoose.connect(uri)
let repairedCategories = 0
let clonedVehicles = 0
try {
  const root = await Category.findOne({ slug: 'vehicles', parentId: null })
  const parents = await Category.find({ parentId: root._id, status: 'active' })
  const leaves = await Category.find({ parentId: { $in: parents.map((item) => item._id) }, status: 'active' })
  const parentById = new Map(parents.map((item) => [String(item._id), item]))
  const paths = new Map()
  for (const leaf of leaves) {
    const parent = parentById.get(String(leaf.parentId))
    const key = `${parent?.name}|${leaf.name}`
    if (!paths.has(key)) paths.set(key, [])
    paths.get(key).push(leaf)
  }

  for (const [key, pathLeaves] of paths) {
    if (pathLeaves.length < 2) continue
    const counts = await Promise.all(pathLeaves.map(async (leaf) => ({ leaf, count: await Vehicle.countDocuments({ category: leaf._id, status: 'active' }) })))
    const source = counts.find((item) => item.count >= 5)
    if (!source) continue
    const sourceVehicles = firstFiveUniqueNames(await Vehicle.find({ category: source.leaf._id, status: 'active' }).sort({ featured: -1, createdAt: 1 }).lean())
    for (const target of counts.filter((item) => item.count < 5)) {
      const parent = parentById.get(String(target.leaf.parentId))
      for (const item of sourceVehicles) {
        const slug = slugify(`vehicles-${parent.name}-${target.leaf.name}-${item.name}-${target.leaf._id}`)
        const { _id, createdAt, updatedAt, ...clone } = item
        await Vehicle.findOneAndUpdate(
          { slug },
          { $set: { ...clone, slug, category: target.leaf._id, featured: false } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        )
        clonedVehicles += 1
      }
      repairedCategories += 1
      console.log(`Repaired duplicate category ${key} (${target.leaf._id}) with ${sourceVehicles.length} vehicles.`)
    }
  }

  const allCounts = await Promise.all(leaves.map(async (leaf) => ({
    leaf,
    parent: parentById.get(String(leaf.parentId)),
    count: await Vehicle.countDocuments({ category: leaf._id, status: 'active' }),
  })))
  for (const target of allCounts.filter((item) => item.count < 5)) {
    const source = allCounts.find((item) => item.count >= 5 && item.leaf.name === target.leaf.name)
    if (!source) {
      console.warn(`No populated source category found for ${target.parent?.name} / ${target.leaf.name}`)
      continue
    }
    const sourceVehicles = firstFiveUniqueNames(await Vehicle.find({ category: source.leaf._id, status: 'active' }).sort({ featured: -1, createdAt: 1 }).lean())
    for (const item of sourceVehicles) {
      const slug = slugify(`vehicles-${target.parent.name}-${target.leaf.name}-${item.name}-${target.leaf._id}`)
      const { _id, createdAt, updatedAt, ...clone } = item
      await Vehicle.findOneAndUpdate(
        { slug },
        { $set: { ...clone, slug, category: target.leaf._id, featured: false } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      clonedVehicles += 1
    }
    repairedCategories += 1
    console.log(`Repaired legacy category ${target.parent?.name} / ${target.leaf.name} with ${sourceVehicles.length} vehicles.`)
  }
  console.log(`Duplicate-category repair complete: ${repairedCategories} categories, ${clonedVehicles} cloned vehicle records.`)
} finally {
  await mongoose.disconnect()
}

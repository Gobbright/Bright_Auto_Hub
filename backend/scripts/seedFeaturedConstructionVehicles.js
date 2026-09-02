import 'dotenv/config'
import mongoose from 'mongoose'
import { seedAdminData } from '../src/adminApi.js'
import { constructionVehicleImageOverrides } from '../src/data/fullCatalog.js'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brightautohub'
const slugify = (value = '') => value.toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const products = [
  { name: 'JCB 3DX', brand: 'JCB', category: 'JCB', price: 3500000, description: 'Versatile backhoe loader for digging, trenching and loading work across Indian construction sites.' },
  { name: 'Tata Hitachi EX200LC', brand: 'Tata Hitachi', category: 'Excavators', price: 0, description: 'Tracked hydraulic excavator for dependable earthmoving and infrastructure work.' },
  { name: 'Caterpillar 950 GC', brand: 'Caterpillar', category: 'Wheel Loaders', price: 0, description: 'Wheel loader designed for productive material handling on demanding job sites.' },
  { name: 'Liebherr LTM 1130-5.1', brand: 'Liebherr', category: 'Cranes', price: 0, description: 'Five-axle mobile crane for heavy lifting and complex project requirements.' },
]

const ensureCategory = (Category, name, parentId, group, sortOrder = 0) => Category.findOneAndUpdate(
  { slug: slugify(name), parentId: parentId || null },
  { $set: { name, group, status: 'active', sortOrder }, $setOnInsert: { slug: slugify(name), parentId: parentId || null } },
  { upsert: true, new: true, setDefaultsOnInsert: true },
)

try {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'brightautohub' })
  await seedAdminData()
  const Category = mongoose.model('AdminCategory')
  const Brand = mongoose.model('AdminBrand')
  const Vehicle = mongoose.model('AdminVehicle')
  const root = await ensureCategory(Category, 'Vehicles', null, 'Vehicles')
  const construction = await ensureCategory(Category, 'Construction Vehicles', root._id, 'Vehicles')

  for (const [index, product] of products.entries()) {
    const category = await ensureCategory(Category, product.category, construction._id, 'Vehicles', index)
    const brand = await Brand.findOneAndUpdate(
      { slug: slugify(product.brand) },
      { $set: { name: product.brand, status: 'active' }, $setOnInsert: { slug: slugify(product.brand) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    const existing = await Vehicle.findOne({ name: product.name, vehicleType: 'Construction' })
    const slug = existing?.slug || slugify(`vehicles-construction-vehicles-${product.category}-${product.name}`)
    const saved = await Vehicle.findOneAndUpdate(
      existing ? { _id: existing._id } : { slug },
      { $set: {
        name: product.name, slug, brand: brand._id, category: category._id, vehicleType: 'Construction',
        fuelType: 'Diesel', price: product.price, condition: 'new', transmission: 'Manual',
        modelYear: new Date().getFullYear(), imageUrl: constructionVehicleImageOverrides[product.name],
        description: product.description,
        specifications: { Category: product.category, Segment: 'Construction Vehicles', Availability: 'Enquiry' },
        status: 'active', featured: true,
      } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    await Vehicle.deleteMany({ name: product.name, vehicleType: 'Construction', _id: { $ne: saved._id } })
  }

  console.log(`Featured construction vehicles seeded: ${products.length}`)
} catch (error) {
  console.error('Unable to seed featured construction vehicles:', error)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}

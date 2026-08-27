import mongoose from 'mongoose'
import { Readable } from 'node:stream'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultCategoryTree } from './data/defaultCategories.js'
import { sparePartSeeds, sparePartsTree } from './data/sparePartsCatalog.js'

const options = { timestamps: true, versionKey: false }
const slugify = (value = '') => value.toString().trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const primaryVehicleCategorySlugs = ['2-wheelers', '4-wheelers', 'commercial-vehicles', 'farm-vehicles', 'construction-vehicles', 'ev-vehicles']
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const imageExtensions = new Set(['.avif', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.svg', '.webp'])

const directoryUsage = async (root, label) => {
  const usage = { label, path: path.relative(projectRoot, root).replaceAll('\\', '/'), bytes: 0, files: 0, images: 0 }
  const visit = async (directory) => {
    let entries = []
    try { entries = await readdir(directory, { withFileTypes: true }) } catch { return }
    await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return visit(entryPath)
      if (!entry.isFile()) return undefined
      try {
        const details = await stat(entryPath)
        usage.bytes += Number(details.size || 0)
        usage.files += 1
        if (imageExtensions.has(path.extname(entry.name).toLowerCase())) usage.images += 1
      } catch { /* File changed while the usage scan was running. */ }
      return undefined
    }))
  }
  await visit(root)
  return usage
}

const Category = mongoose.models.AdminCategory || mongoose.model('AdminCategory', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCategory', default: null }, group: { type: String, default: 'Vehicles' },
  description: { type: String, default: '' }, icon: { type: String, default: '' },
  status: { type: String, enum: ['active', 'draft'], default: 'active' }, sortOrder: { type: Number, default: 0 },
}, options))
Category.schema.index({ slug: 1, parentId: 1 }, { unique: true })

const Brand = mongoose.models.AdminBrand || mongoose.model('AdminBrand', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true }, logoUrl: { type: String, default: '' },
  website: { type: String, default: '' }, description: { type: String, default: '' }, status: { type: String, enum: ['active', 'draft'], default: 'active' }, featured: { type: Boolean, default: false },
}, options))

const Vehicle = mongoose.models.AdminVehicle || mongoose.model('AdminVehicle', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminBrand', default: null }, category: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCategory', default: null },
  vehicleType: { type: String, enum: ['Car', 'Bike', 'Scooter', 'Commercial', 'Farm', 'Construction', 'Electric', 'Other'], default: 'Car' },
  variant: { type: String, default: '' }, registrationNumber: { type: String, default: '' }, color: { type: String, default: '' }, seatingCapacity: { type: Number, default: 0 },
  modelYear: { type: Number, default: () => new Date().getFullYear() }, fuelType: { type: String, default: 'Petrol' }, price: { type: Number, default: 0 },
  condition: { type: String, enum: ['new', 'used'], default: 'new' }, transmission: { type: String, default: 'Manual' }, mileage: { type: Number, default: 0 }, location: { type: String, default: '' },
  imageUrl: { type: String, default: '' }, description: { type: String, default: '' }, specifications: { type: mongoose.Schema.Types.Mixed, default: {} }, details: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['active', 'draft'], default: 'draft' }, featured: { type: Boolean, default: false },
}, options))

const Content = mongoose.models.AdminContent || mongoose.model('AdminContent', new mongoose.Schema({
  title: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['page', 'service', 'tool', 'finance', 'dealer'], default: 'page' }, summary: { type: String, default: '' },
  body: { type: String, default: '' }, heroImage: { type: String, default: '' }, status: { type: String, enum: ['published', 'draft'], default: 'draft' },
  seoTitle: { type: String, default: '' }, seoDescription: { type: String, default: '' },
}, options))

const Blog = mongoose.models.AdminBlog || mongoose.model('AdminBlog', new mongoose.Schema({
  title: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true }, excerpt: { type: String, default: '' },
  content: { type: String, default: '' }, imageUrl: { type: String, default: '' }, imageAlt: { type: String, default: '' },
  galleryImages: { type: [{ url: { type: String, required: true }, alt: { type: String, default: '' } }], default: [] },
  author: { type: String, default: 'GoAuto Team' }, tags: [String], readingTime: { type: Number, default: 5 },
  status: { type: String, enum: ['published', 'draft'], default: 'draft' }, publishedAt: { type: Date, default: null },
}, options))

const Part = mongoose.models.AdminPart || mongoose.model('AdminPart', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true }, category: { type: String, default: 'General' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCategory', default: null },
  categoryGroup: { type: String, default: '' },
  partNumber: { type: String, default: '' }, brand: { type: String, default: '' }, price: { type: Number, default: 0 }, originalPrice: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' }, description: { type: String, default: '' }, details: { type: mongoose.Schema.Types.Mixed, default: {} }, compatibleVehicleTypes: [String], stock: { type: Number, default: 0 }, status: { type: String, enum: ['active', 'draft'], default: 'active' }, featured: { type: Boolean, default: false },
}, options))

const Service = mongoose.models.AdminService || mongoose.model('AdminService', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true }, category: { type: String, default: 'General Service' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCategory', default: null },
  price: { type: Number, default: 0 }, duration: { type: String, default: '' }, imageUrl: { type: String, default: '' }, description: { type: String, default: '' },
  features: [String], vehicleTypes: [String], brands: [String], details: { type: mongoose.Schema.Types.Mixed, default: {} }, status: { type: String, enum: ['active', 'draft'], default: 'active' }, featured: { type: Boolean, default: false },
}, options))

const SitePage = mongoose.models.AdminSitePage || mongoose.model('AdminSitePage', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true }, eyebrow: { type: String, default: '' },
  title: { type: String, required: true }, highlight: { type: String, default: '' }, description: { type: String, default: '' }, heroImage: { type: String, default: '' },
  ctaLabel: { type: String, default: '' }, ctaUrl: { type: String, default: '' }, sections: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['published', 'draft'], default: 'published' }, seoTitle: { type: String, default: '' }, seoDescription: { type: String, default: '' },
}, options))

const Enquiry = mongoose.models.AdminEnquiry || mongoose.model('AdminEnquiry', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, trim: true }, phone: { type: String, default: '' },
  subject: { type: String, default: 'General enquiry' }, message: { type: String, required: true }, source: { type: String, default: 'contact' },
  itemName: { type: String, default: '' }, category: { type: String, default: '' }, enquiryType: { type: String, default: '' },
  pageUrl: { type: String, default: '' }, pageTitle: { type: String, default: '' }, location: { type: String, default: '' },
  latitude: { type: Number, default: null }, longitude: { type: Number, default: null },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'PublicUser', default: null }, accountEmail: { type: String, default: '' },
  context: { type: String, default: '' }, ip: { type: String, default: '' }, userAgent: { type: String, default: '' },
  emailNotificationStatus: { type: String, enum: ['pending', 'sent', 'skipped', 'failed'], default: 'pending' },
  emailNotificationError: { type: String, default: '' }, emailNotificationMessageId: { type: String, default: '' },
  emailNotifiedAt: { type: Date, default: null }, customerAcknowledgementSent: { type: Boolean, default: false },
  status: { type: String, enum: ['new', 'in-progress', 'resolved'], default: 'new' },
}, options))

const Activity = mongoose.models.AdminActivity || mongoose.model('AdminActivity', new mongoose.Schema({
  event: { type: String, enum: ['login', 'logout', 'register'], default: 'login' },
  method: { type: String, enum: ['password', 'quick', 'register', 'session'], default: 'password' },
  username: { type: String, default: 'Unknown', trim: true },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  source: { type: String, default: 'website' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  details: { type: String, default: '' },
}, options))
const WebsiteActivity = mongoose.models.AdminWebsiteActivity || mongoose.model('AdminWebsiteActivity', new mongoose.Schema({
  event: { type: String, enum: ['pageview', 'click'], default: 'pageview' },
  pageTitle: { type: String, default: '' },
  pageUrl: { type: String, default: '' },
  pagePath: { type: String, default: '' },
  action: { type: String, default: '' },
  target: { type: String, default: '' },
  referrer: { type: String, default: '' },
  source: { type: String, default: 'website' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  details: { type: String, default: '' },
}, options))

const resources = { categories: Category, brands: Brand, vehicles: Vehicle, content: Content, blogs: Blog, parts: Part, services: Service, pages: SitePage, enquiries: Enquiry, activities: Activity, 'website-activities': WebsiteActivity }

const cleanText = (value = '', limit = 180) => value.toString().trim().slice(0, limit)

const payloadFor = (resource, payload, existing = {}) => {
  const { _id, createdAt, updatedAt, __v, ...safePayload } = payload
  const value = { ...safePayload }
  if ('name' in value && !value.slug) value.slug = slugify(value.name)
  if ('title' in value && !value.slug) value.slug = slugify(value.title)
  if (resource === 'blogs') {
    if (typeof value.tags === 'string') value.tags = value.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    if (typeof value.galleryImages === 'string') {
      try { value.galleryImages = value.galleryImages.trim() ? JSON.parse(value.galleryImages) : [] } catch { throw new Error('Content images must be valid JSON.') }
    }
    if (!Array.isArray(value.galleryImages)) throw new Error('Content images must be an image list.')
    value.galleryImages = value.galleryImages.map((image) => ({ url: String(image?.url || '').trim(), alt: String(image?.alt || '').trim() })).filter((image) => image.url)
    if (value.status === 'published' && !value.publishedAt && !existing.publishedAt) value.publishedAt = new Date()
  }
  if (resource === 'vehicles' && typeof value.specifications === 'string') {
    try { value.specifications = value.specifications.trim() ? JSON.parse(value.specifications) : {} } catch { throw new Error('Specifications must be valid JSON.') }
  }
  if (['vehicles', 'parts', 'services'].includes(resource) && typeof value.details === 'string') {
    try { value.details = value.details.trim() ? JSON.parse(value.details) : {} } catch { throw new Error('More details must be valid JSON.') }
  }
  if (resource === 'services') {
    if (typeof value.features === 'string') value.features = value.features.split(',').map((item) => item.trim()).filter(Boolean)
    if (typeof value.vehicleTypes === 'string') value.vehicleTypes = value.vehicleTypes.split(',').map((item) => item.trim()).filter(Boolean)
    if (typeof value.brands === 'string') value.brands = value.brands.split(',').map((item) => item.trim()).filter(Boolean)
  }
  if (resource === 'parts' && typeof value.compatibleVehicleTypes === 'string') value.compatibleVehicleTypes = value.compatibleVehicleTypes.split(',').map((item) => item.trim()).filter(Boolean)
  if (resource === 'pages' && typeof value.sections === 'string') {
    try { value.sections = value.sections.trim() ? JSON.parse(value.sections) : {} } catch { throw new Error('Sections must be valid JSON.') }
  }
  if (resource === 'categories' && !value.group) value.group = existing.group || value.name || 'Vehicles'
  return value
}

const preparedPayloadFor = async (resource, payload, existing = {}) => {
  const value = payloadFor(resource, payload, existing)
  if (resource === 'parts' && value.categoryId) {
    const category = await Category.findById(value.categoryId).populate('parentId', 'name')
    if (!category || category.status !== 'active') throw new Error('Select an active spare-parts category.')
    value.category = category.name
    value.categoryGroup = category.parentId?.name || 'Spare Parts'
  }
  if (resource === 'services' && value.categoryId) {
    const category = await Category.findById(value.categoryId).populate('parentId', 'name')
    if (!category || category.status !== 'active' || category.group !== 'Services') throw new Error('Select an active service sub-category.')
    value.category = category.name
  }
  return value
}

const storageBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' })
const storageDocument = (file, request) => ({
  _id: file._id,
  filename: file.filename,
  contentType: file.metadata?.contentType || 'application/octet-stream',
  length: file.length,
  uploadDate: file.uploadDate,
  metadata: file.metadata || {},
  url: request.protocol + '://' + request.get('host') + '/api/storage/files/' + file._id,
})

const walkCategoryTree = async (items, parentId = null, group = '', updateExisting = false) => {
  for (const [index, entry] of items.entries()) {
    const node = typeof entry === 'string' ? { name: entry } : entry
    const currentGroup = parentId ? group : node.name
    const insert = {
      name: node.name,
      slug: slugify(node.name),
      parentId,
      group: currentGroup,
      description: node.description || '',
      icon: node.icon || '',
      status: 'active',
      sortOrder: index,
    }
    const update = updateExisting
      ? { $set: { name: insert.name, group: insert.group, description: insert.description, icon: insert.icon, status: insert.status, sortOrder: insert.sortOrder }, $setOnInsert: { slug: insert.slug, parentId } }
      : { $setOnInsert: insert }
    const category = await Category.findOneAndUpdate(
      { slug: insert.slug, parentId },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    if (node.children?.length) await walkCategoryTree(node.children, category._id, currentGroup, updateExisting)
  }
}

export const seedSparePartsCatalog = async () => {
  const rootNode = {
    name: 'Spare Parts',
    description: 'Vehicle-specific genuine spare parts and fitment support.',
    icon: '/images/spare-parts-catalog/brake-system-spare-parts.jpg',
    children: sparePartsTree,
  }
  await walkCategoryTree([rootNode], null, '', true)
  const root = await Category.findOne({ slug: 'spare-parts', parentId: null })
  const desiredParents = sparePartsTree.map((item) => item.name)
  await Category.updateMany(
    { parentId: root?._id, name: { $nin: desiredParents }, group: 'Spare Parts' },
    { $set: { status: 'draft' } },
  )
  for (const seed of sparePartSeeds) {
    const parent = await Category.findOne({ name: seed.categoryGroup, parentId: root?._id, status: 'active' })
    const category = await Category.findOne({ name: seed.category, parentId: parent?._id, status: 'active' })
    const slug = slugify(`${seed.categoryGroup}-${seed.category}-${seed.name}`)
    await Part.findOneAndUpdate(
      { slug },
      { $set: { ...seed, slug, categoryId: category?._id || null } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }
  return {
    groups: sparePartsTree.length,
    categories: sparePartsTree.reduce((total, item) => total + item.children.length, 0),
    products: sparePartSeeds.length,
  }
}

export const seedAdminData = async () => {
  await walkCategoryTree(defaultCategoryTree)
  const pageSeeds = [
    { slug: 'home', name: 'Home Page', title: 'Vehicles, Parts & Service in One Place', description: 'India all-in-one automobile platform for vehicles, parts and trusted services.', heroImage: '' },
    { slug: 'vehicles', name: 'Vehicle Marketplace', title: 'Explore Vehicles', description: 'Find the right vehicle for every road and every ambition.', heroImage: '/images/catalog/vehicles/cars/suv/hyundai-creta.jpg' },
    { slug: 'compare', name: 'Compare Vehicles', title: 'Compare. Decide. Drive.', description: 'Put specifications, features and prices side by side.', heroImage: '/images/catalog/vehicles/cars/suv/kia-seltos.jpg' },
    { slug: 'calculators', name: 'Vehicle Calculators', title: 'Plan Your Vehicle Budget', description: 'Estimate EMI, fuel cost and ownership needs before you enquire.', heroImage: '/images/services/diagnostics-tools.jpg' },
    { slug: 'spare-parts', name: 'Spare Parts', title: 'Genuine Parts. Built to Perform.', description: 'Quality parts for bikes, cars, commercial and heavy vehicles.', heroImage: '/images/spare-parts-catalog/brake-system-spare-parts.jpg' },
    { slug: 'services', name: 'Vehicle Services', title: 'Expert Vehicle Service. Trusted Care.', description: 'Book transparent, dependable service from trusted professionals.', heroImage: '/images/services/car-service-workshop.jpg' },
    { slug: 'used-cars', name: 'Used Cars', title: 'Great Cars. Better Prices.', description: 'Verified pre-owned cars with straightforward pricing.', heroImage: '/images/catalog/vehicles/cars/suv/tata-nexon.jpg' },
    { slug: 'blog', name: 'Automotive Journal', title: 'Stories for Smarter Journeys', description: 'News, reviews, buying guides and ownership advice.', heroImage: '/images/services/premium-service-center.jpg' },
    { slug: 'contact', name: 'Contact Us', title: "We're Here to Help You", description: 'Our support team is ready to help with every automotive need.', heroImage: '/images/services/general-vehicle-service.jpg' },
    { slug: 'finance-insurance', name: 'Finance & Insurance', title: 'Vehicle Finance and Insurance Support', description: 'Get guided support for loans, insurance renewals and ownership paperwork.', heroImage: '/images/services/premium-service-center.jpg' },
  ]
  for (const page of pageSeeds) {
    await SitePage.updateOne(
      { slug: page.slug },
      {
        $set: {
          name: page.name,
          title: page.title,
          description: page.description,
          heroImage: page.heroImage,
          status: 'published',
          seoTitle: page.seoTitle || `${page.title} | Bright Auto Hub`,
          seoDescription: page.description,
        },
        $setOnInsert: { slug: page.slug },
      },
      { upsert: true },
    )
  }

  const brandSeeds = ['Bajaj', 'TVS', 'Honda', 'Hero', 'Royal Enfield', 'Hyundai', 'Maruti Suzuki', 'Tata Motors', 'Mahindra', 'Toyota', 'Kia', 'MG Motor', 'JCB', 'Tata Hitachi', 'Caterpillar', 'Ashok Leyland', 'Eicher', 'Force', 'John Deere', 'Swaraj']
  for (const [index, name] of brandSeeds.entries()) {
    await Brand.findOneAndUpdate(
      { slug: slugify(name) },
      { $set: { name, status: 'active', featured: index < 12 }, $setOnInsert: { slug: slugify(name) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }

  if ([0, 6].includes(await Vehicle.countDocuments())) {
    const brands = Object.fromEntries((await Brand.find()).map((item) => [item.name, item._id]))
    const vehicleRoot = await Category.findOne({ slug: 'vehicles', parentId: null })
    const vehicleSeeds = [
      ['Bajaj Pulsar N160','Bajaj','Bikes','Bikes','Bike','Petrol',140192],
      ['TVS iQube','TVS','Bikes','Electric Scooters','Scooter','Electric',117299],
      ['Hyundai Creta','Hyundai','Cars','SUV','Car','Petrol',1169000],
      ['Maruti Suzuki Dzire','Maruti Suzuki','Cars','Sedan','Car','Petrol',684000],
      ['Tata Ace Gold','Tata Motors','Commercial Vehicles','Mini Trucks','Commercial','Diesel',650000],
      ['Mahindra 575 DI','Mahindra','Farm Vehicles','Tractors','Farm','Diesel',721000],
      ['JCB 3DX','JCB','Construction Vehicles','Backhoe Loaders','Construction','Diesel',3500000],
      ['MG ZS EV','MG Motor','EV Vehicles','Electric Cars','Electric','Electric',1898000],
    ]
    for (const [name,brandName,parentName,categoryName,vehicleType,fuelType,price] of vehicleSeeds) {
      const parent = await Category.findOne({ name: parentName, parentId: vehicleRoot?._id, group: 'Vehicles' })
      const category = await Category.findOne({ name: categoryName, parentId: parent?._id })
      if (brands[brandName] && category) await Vehicle.updateOne({ slug: slugify(name) }, { $setOnInsert: { name, slug: slugify(name), brand: brands[brandName], category: category._id, vehicleType, fuelType, price, modelYear: new Date().getFullYear(), status: 'active', featured: true } }, { upsert: true })
    }
  }

  const brands = Object.fromEntries((await Brand.find()).map((item) => [item.name, item._id]))
  const vehicleRoot = await Category.findOne({ slug: 'vehicles', parentId: null })
  const carsParent = await Category.findOne({ slug: 'cars', parentId: vehicleRoot?._id, group: 'Vehicles' })
  const usedCarSeeds = [
    ['Hyundai Creta Used 2023', 'Hyundai', 'SUV', 'Petrol', 'Manual', 2023, 28500, 'New Delhi', '/images/catalog/vehicles/cars/suv/hyundai-creta.jpg'],
    ['Tata Nexon Used 2022', 'Tata Motors', 'SUV', 'Petrol', 'AMT', 2022, 34200, 'Mumbai', '/images/catalog/vehicles/cars/suv/tata-nexon.jpg'],
    ['Maruti Suzuki Swift Used 2021', 'Maruti Suzuki', 'Hatchback', 'Petrol', 'Manual', 2021, 41800, 'Bengaluru', '/images/catalog/vehicles/cars/hatchback/maruti-suzuki-swift.jpg'],
    ['Honda City Used 2020', 'Honda', 'Sedan', 'Petrol', 'CVT', 2020, 52000, 'Chennai', '/images/catalog/vehicles/cars/sedan/honda-city.jpg'],
    ['Kia Seltos Used 2023', 'Kia', 'SUV', 'Diesel', 'Automatic', 2023, 23600, 'Hyderabad', '/images/catalog/vehicles/cars/suv/kia-seltos.jpg'],
  ]
  for (const [name, brandName, categoryName, fuelType, transmission, modelYear, mileage, location, imageUrl] of usedCarSeeds) {
    const category = await Category.findOne({ name: categoryName, parentId: carsParent?._id, group: 'Vehicles' })
    if (!category) continue
    const brand = brands[brandName] || await Brand.findOneAndUpdate(
      { slug: slugify(brandName) },
      { $set: { name: brandName, status: 'active' }, $setOnInsert: { slug: slugify(brandName) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).then((item) => item._id)
    await Vehicle.findOneAndUpdate(
      { slug: slugify(name) },
      {
        $set: {
          name,
          slug: slugify(name),
          brand,
          category: category._id,
          vehicleType: 'Car',
          fuelType,
          transmission,
          modelYear,
          mileage,
          location,
          imageUrl,
          condition: 'used',
          description: `${name} is a verified pre-owned car listing. Send an enquiry for inspection details, ownership history and latest price.`,
          specifications: { Segment: categoryName, Ownership: 'Pre-owned', Availability: 'Enquiry' },
          status: 'active',
          featured: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }

  const serviceRoot = await Category.findOne({ slug: 'services', parentId: null })
  const serviceSeeds = [
    ['General Vehicle Service', 'General Service', 1499, '2 to 3 hours', '/images/services/general-service.jpg', ['Multi-point inspection', 'Oil and fluid check', 'Basic diagnostics'], ['Cars', 'Bikes', 'Commercial'], ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra']],
    ['Bike Periodic Service', 'Bike Service', 899, '90 minutes', '/images/services/periodic-maintenance.jpg', ['Engine inspection', 'Brake check', 'Chain adjustment'], ['Bikes', 'Scooters'], ['Bajaj', 'TVS', 'Honda', 'Hero']],
    ['Car AC Service', 'AC Service', 1599, '2 hours', '/images/services/ac-service.jpg', ['AC inspection', 'Cooling check', 'Filter cleaning'], ['Cars'], ['Maruti Suzuki', 'Hyundai', 'Tata', 'Kia']],
    ['Brake Service', 'Brake Service', 1299, '2 hours', '/images/services/brake-service.jpg', ['Pad inspection', 'Brake cleaning', 'Safety test'], ['Cars', 'Bikes', 'Commercial'], ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra']],
    ['Engine Diagnostics', 'Engine Repair', 1999, '1 to 2 hours', '/images/services/engine-repair.jpg', ['Computer diagnostics', 'Engine health report', 'Expert advice'], ['Cars', 'Commercial'], ['Hyundai', 'Tata', 'Mahindra', 'Toyota']],
    ['Clutch Service', 'Clutch Service', 1899, '2 to 4 hours', '/images/services/clutch-service.jpg', ['Clutch wear check', 'Gear-shift diagnosis', 'Replacement estimate'], ['Cars', 'Commercial'], ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra']],
    ['Suspension Service', 'Suspension Service', 1699, '2 to 3 hours', '/images/services/suspension-service.jpg', ['Shock absorber check', 'Underbody noise diagnosis', 'Ride comfort review'], ['Cars', 'Commercial'], ['Tata', 'Mahindra', 'Toyota', 'Kia']],
    ['Wheel Alignment', 'Wheel Alignment', 699, '45 minutes', '/images/services/wheel-alignment.jpg', ['Computerized alignment', 'Steering pull correction', 'Tyre wear inspection'], ['Cars', 'Commercial'], ['Maruti Suzuki', 'Hyundai', 'Tata', 'Honda']],
    ['Wheel Balancing', 'Wheel Balancing', 799, '45 minutes', '/images/services/wheel-balancing.jpg', ['Vibration diagnosis', 'Precision balancing', 'Tyre rotation guidance'], ['Cars', 'Commercial'], ['Maruti Suzuki', 'Hyundai', 'Tata', 'Toyota']],
    ['Oil Change Service', 'Oil Change', 999, '60 minutes', '/images/services/oil-change.jpg', ['Oil grade recommendation', 'Filter condition check', 'Engine health review'], ['Cars', 'Bikes', 'Commercial'], ['Castrol', 'Bosch', 'Maruti Suzuki', 'Hyundai']],
    ['Electrical Repair', 'Electrical Repair', 1499, '1 to 3 hours', '/images/services/electrical-repair.jpg', ['Wiring inspection', 'Sensor fault diagnosis', 'Lighting and fuse checks'], ['Cars', 'Bikes', 'Commercial', 'Electric'], ['Tata', 'Mahindra', 'MG Motor', 'TVS']],
    ['Battery Service', 'Battery Service', 499, '30 minutes', '/images/services/battery-service.jpg', ['Battery health test', 'Alternator check', 'Replacement guidance'], ['Cars', 'Bikes', 'Commercial', 'Electric'], ['Exide', 'Amaron', 'Tata', 'Mahindra']],
    ['Dent and Paint Repair', 'Dent & Paint', 2499, '1 to 3 days', '/images/services/dent-paint.jpg', ['Panel damage review', 'Paint match guidance', 'Bodywork estimate'], ['Cars', 'Commercial'], ['Maruti Suzuki', 'Hyundai', 'Tata', 'Kia']],
    ['Doorstep Vehicle Care', 'Doorstep Care', 999, 'At location', '/images/services/doorstep-care.jpg', ['Pickup and drop support', 'At-location inspection', 'Convenient booking'], ['Cars', 'Bikes'], ['Maruti Suzuki', 'Hyundai', 'Honda', 'TVS']],
    ['24/7 Breakdown Assistance', 'Breakdown Assistance', 999, 'On demand', '/images/services/breakdown-assistance.jpg', ['Roadside support', 'Towing assistance', 'Minor repairs'], ['Cars', 'Bikes', 'Commercial'], ['All major brands']],
  ]
  for (const [name, category, price, duration, imageUrl, features, vehicleTypes, serviceBrands] of serviceSeeds) {
    const serviceCategory = await Category.findOne({ name: category, parentId: serviceRoot?._id, group: 'Services' })
    await Service.findOneAndUpdate(
      { slug: slugify(name) },
      {
        $set: {
          name,
          slug: slugify(name),
          category,
          categoryId: serviceCategory?._id || null,
          price,
          duration,
          imageUrl,
          description: `${name} is available through Bright Auto Hub with transparent enquiry support and expert workshop coordination.`,
          features,
          vehicleTypes,
          brands: serviceBrands,
          status: 'active',
          featured: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }

  const contentSeeds = [
    ['vehicle-buying-guide', 'Vehicle Buying Guide', 'page', 'A practical guide for comparing vehicles before enquiry.', '/images/catalog/vehicles/cars/suv/hyundai-creta.jpg'],
    ['service-maintenance-guide', 'Service Maintenance Guide', 'service', 'Understand service intervals, inspections and care packages.', '/images/services/general-vehicle-service.jpg'],
    ['spare-parts-fitment-guide', 'Spare Parts Fitment Guide', 'page', 'Check compatibility, stock and fitment support before ordering parts.', '/images/spare-parts-catalog/automotive-workshop-parts.jpg'],
    ['ev-running-cost-guide', 'EV Running Cost Guide', 'tool', 'Plan charging, range and running cost for electric vehicles.', '/images/services/diagnostics-tools.jpg'],
    ['finance-insurance-support', 'Finance and Insurance Support', 'finance', 'Guidance for loans, insurance renewal and ownership paperwork.', '/images/services/premium-service-center.jpg'],
    ['dealer-service-network', 'Dealer and Service Network', 'dealer', 'Find help for vehicles, workshops, parts and local support.', '/images/services/car-service-workshop.jpg'],
  ]
  for (const [slug, title, type, summary, heroImage] of contentSeeds) {
    await Content.findOneAndUpdate(
      { slug },
      {
        $set: {
          title,
          type,
          summary,
          body: `<p>${summary}</p><p>Bright Auto Hub stores this page in MongoDB so the admin panel can manage the content and the public website can render it live.</p>`,
          heroImage,
          status: 'published',
          seoTitle: `${title} | Bright Auto Hub`,
          seoDescription: summary,
        },
        $setOnInsert: { slug },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }

  const blogSeeds = [
    ['vehicle-comparison-checklist', 'Vehicle Comparison Checklist Before You Buy', 'BUYING GUIDE', 'Compare budget, usage, safety, comfort and service reach before shortlisting a vehicle.', '/images/catalog/vehicles/cars/suv/kia-seltos.jpg'],
    ['used-car-inspection-guide', 'Used Car Inspection Guide', 'USED CARS', 'Check ownership history, service records, tyres, brakes and accident signs before enquiry.', '/images/catalog/vehicles/cars/suv/tata-nexon.jpg'],
    ['ev-charging-planning-guide', 'EV Charging Planning Guide', 'ELECTRIC VEHICLES', 'Plan home charging, public charging and range needs before buying an EV.', '/images/catalog/vehicles/cars/electric-cars/tata-nexon-ev.jpg'],
    ['service-intervals-explained', 'Vehicle Service Intervals Explained', 'MAINTENANCE', 'Simple maintenance habits can improve reliability, mileage and long-term ownership cost.', '/images/services/oil-change.jpg'],
    ['spare-parts-fitment-tips', 'How to Choose the Right Spare Part', 'SPARE PARTS', 'Match part number, vehicle model and fitment details before installing a replacement.', '/images/spare-parts-catalog/brake-system-spare-parts.jpg'],
    ['commercial-vehicle-buying-guide', 'Commercial Vehicle Buying Guide', 'COMMERCIAL', 'Match payload, route, fuel type and uptime support to your business requirement.', '/images/catalog/vehicles/commercial-vehicles/trucks/tata-signa-5530-s.jpg'],
  ]
  for (const [index, [slug, title, tag, excerpt, imageUrl]] of blogSeeds.entries()) {
    await Blog.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          slug,
          title,
          excerpt,
          content: `<p>${excerpt}</p><h2>What to check</h2><p>Start with your daily usage, budget, location, service support and long-term ownership needs.</p><h2>Next step</h2><p>Send an enquiry through Bright Auto Hub for the latest price, availability and expert guidance.</p>`,
          imageUrl,
          imageAlt: title,
          author: 'Bright Auto Hub Editorial',
          tags: [tag],
          readingTime: 5,
          status: 'published',
          publishedAt: new Date(Date.UTC(2026, 7, 20 - index)),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }

  if (await Part.countDocuments() === 0) await seedSparePartsCatalog()
}
export const getHomepageData = async () => ({
  stats: { customers: '2M+', workshops: '1500+', parts: '100K+' },
  page: await SitePage.findOne({ slug: 'home', status: 'published' }).lean(),
  featuredBrands: await Brand.find({ featured: true, status: 'active' }).sort({ name: 1 }).limit(12).lean(),
  featuredVehicles: await Vehicle.find({ featured: true, status: 'active' }).sort({ updatedAt: -1 }).limit(10).populate('brand', 'name logoUrl').populate({ path: 'category', select: 'name slug parentId', populate: { path: 'parentId', select: 'name slug' } }).lean(),
  featuredServices: await Service.find({ featured: true, status: 'active' }).sort({ updatedAt: -1 }).limit(6).lean(),
  featuredParts: await Part.find({ featured: true, status: 'active' }).sort({ updatedAt: -1 }).limit(6).lean(),
  latestBlogs: await Blog.find({ status: 'published' }).sort({ publishedAt: -1, updatedAt: -1 }).limit(4).lean(),
})

export const registerAdminApi = (app) => {
  app.post('/api/activity/login', async (request, response, next) => {
    try {
      const { event = 'login', method = 'password', username = 'Unknown', status = 'success', source = 'website', details = '' } = request.body
      const activity = await Activity.create({
        event,
        method,
        username: username.toString().slice(0, 120),
        status,
        source,
        details: details.toString().slice(0, 240),
        ip: request.ip || request.socket?.remoteAddress || '',
        userAgent: request.get('user-agent') || '',
      })
      response.status(201).json({ id: activity._id })
    } catch (error) { next(error) }
  })

  app.post('/api/website-activities/track', async (request, response, next) => {
    try {
      const {
        event = 'pageview',
        pageTitle = '',
        pageUrl = '',
        pagePath = '',
        action = '',
        target = '',
        referrer = '',
        source = 'website',
        details = '',
      } = request.body || {}
      const activity = await WebsiteActivity.create({
        event,
        pageTitle: cleanText(pageTitle, 160),
        pageUrl: cleanText(pageUrl, 300),
        pagePath: cleanText(pagePath, 200),
        action: cleanText(action, 120),
        target: cleanText(target, 120),
        referrer: cleanText(referrer, 300),
        source: cleanText(source, 40) || 'website',
        details: cleanText(details, 240),
        ip: request.ip || request.socket?.remoteAddress || '',
        userAgent: request.get('user-agent') || '',
      })
      response.status(201).json({ id: activity._id })
    } catch (error) { next(error) }
  })
  app.get('/api/storage', async (request, response, next) => {
    try {
      const files = await mongoose.connection.db.collection('media.files').find({}).sort({ uploadDate: -1 }).toArray()
      response.json(files.map((file) => storageDocument(file, request)))
    } catch (error) { next(error) }
  })

  app.get('/api/storage/stats', async (_request, response, next) => {
    try {
      const db = mongoose.connection.db
      let databaseStats
      try { databaseStats = await db.command({ dbStats: 1, scale: 1, freeStorage: 1 }) }
      catch { databaseStats = await db.command({ dbStats: 1, scale: 1 }) }

      const collectionNames = (await db.listCollections({}, { nameOnly: true }).toArray())
        .map((item) => item.name)
        .filter((name) => !name.startsWith('system.'))
      const collections = (await Promise.all(collectionNames.map(async (name) => {
        try {
          const stats = await db.command({ collStats: name, scale: 1 })
          return {
            name,
            count: Number(stats.count || 0),
            dataSize: Number(stats.size || 0),
            storageSize: Number(stats.storageSize || 0),
            indexSize: Number(stats.totalIndexSize || 0),
            totalSize: Number(stats.totalSize || (stats.storageSize || 0) + (stats.totalIndexSize || 0)),
          }
        } catch { return null }
      }))).filter(Boolean).sort((a, b) => b.totalSize - a.totalSize)

      const gridFiles = await db.collection('media.files').aggregate([
        { $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: '$length' } } },
      ]).toArray()
      const assetGroups = await Promise.all([
        directoryUsage(path.join(projectRoot, 'frontend', 'public'), 'Public assets'),
        directoryUsage(path.join(projectRoot, 'frontend', 'src', 'assets'), 'Source assets'),
        directoryUsage(path.join(projectRoot, 'frontend', 'dist'), 'Production build'),
      ])
      const websiteAssets = assetGroups.reduce((total, group) => ({
        bytes: total.bytes + group.bytes,
        files: total.files + group.files,
        images: total.images + group.images,
      }), { bytes: 0, files: 0, images: 0 })
      const filesystemTotal = Number(databaseStats.fsTotalSize || 0)
      const filesystemUsed = Number(databaseStats.fsUsedSize || 0)
      response.json({
        database: mongoose.connection.name || databaseStats.db || 'goautomobile',
        totals: {
          documents: Number(databaseStats.objects || collections.reduce((sum, item) => sum + item.count, 0)),
          collections: collections.length,
          dataSize: Number(databaseStats.dataSize || 0),
          storageSize: Number(databaseStats.storageSize || 0),
          indexSize: Number(databaseStats.indexSize || 0),
          totalSize: Number(databaseStats.totalSize || 0),
          reusableFreeSize: Number(databaseStats.totalFreeStorageSize || 0),
          overallStoredSize: Number(databaseStats.totalSize || 0) + websiteAssets.bytes,
        },
        filesystem: {
          available: filesystemTotal > 0,
          total: filesystemTotal,
          used: filesystemUsed,
          free: filesystemTotal > 0 ? Math.max(0, filesystemTotal - filesystemUsed) : 0,
        },
        gridfs: { images: Number(gridFiles[0]?.count || 0), bytes: Number(gridFiles[0]?.bytes || 0) },
        websiteAssets: { ...websiteAssets, groups: assetGroups },
        collections,
      })
    } catch (error) { next(error) }
  })

  app.post('/api/storage', async (request, response, next) => {
    try {
      const { filename = 'image', dataUrl, title = '', alt = '', context = 'admin' } = request.body
      const separator = dataUrl?.indexOf(',') ?? -1
      const contentType = separator > 5 ? dataUrl.slice(5, separator).replace(';base64', '') : ''
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
      if (separator < 0 || !dataUrl.startsWith('data:') || !dataUrl.slice(0, separator).endsWith(';base64') || !allowedTypes.includes(contentType)) {
        return response.status(400).json({ message: 'Upload a valid PNG, JPG, WEBP or SVG image.' })
      }
      const buffer = Buffer.from(dataUrl.slice(separator + 1), 'base64')
      if (!buffer.length || buffer.length > 2 * 1024 * 1024) return response.status(400).json({ message: 'Image must be smaller than 2 MB.' })
      const safeFilename = filename.toString().replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 120) || 'image'
      const upload = storageBucket().openUploadStream(safeFilename, { metadata: { contentType, title, alt, context } })
      await new Promise((resolve, reject) => {
        Readable.from(buffer).pipe(upload).on('finish', resolve).on('error', reject)
      })
      const file = await mongoose.connection.db.collection('media.files').findOne({ _id: upload.id })
      response.status(201).json(storageDocument(file, request))
    } catch (error) { next(error) }
  })

  app.get('/api/storage/files/:id', async (request, response, next) => {
    try {
      if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).end()
      const id = new mongoose.Types.ObjectId(request.params.id)
      const file = await mongoose.connection.db.collection('media.files').findOne({ _id: id })
      if (!file) return response.status(404).end()
      response.set('Content-Type', file.metadata?.contentType || 'application/octet-stream')
      response.set('Content-Length', file.length)
      response.set('Cache-Control', 'public, max-age=31536000, immutable')
      storageBucket().openDownloadStream(id).on('error', next).pipe(response)
    } catch (error) { next(error) }
  })

  app.put('/api/storage/:id', async (request, response, next) => {
    try {
      if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Image not found' })
      const id = new mongoose.Types.ObjectId(request.params.id)
      const result = await mongoose.connection.db.collection('media.files').findOneAndUpdate(
        { _id: id },
        { $set: { 'metadata.title': request.body.title || '', 'metadata.alt': request.body.alt || '', 'metadata.context': request.body.context || 'admin' } },
        { returnDocument: 'after' },
      )
      if (!result) return response.status(404).json({ message: 'Image not found' })
      response.json(storageDocument(result, request))
    } catch (error) { next(error) }
  })

  app.delete('/api/storage/:id', async (request, response, next) => {
    try {
      if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Image not found' })
      const id = new mongoose.Types.ObjectId(request.params.id)
      const file = await mongoose.connection.db.collection('media.files').findOne({ _id: id })
      if (!file) return response.status(404).json({ message: 'Image not found' })
      await storageBucket().delete(id)
      response.status(204).end()
    } catch (error) { next(error) }
  })

  app.get('/api/dashboard', async (_request, response, next) => {
    try {
      const [categories, brands, vehicles, content, blogs, parts, services, enquiries, activeVehicles, activeServices, activeParts, lowStockParts, inventoryValue, pageViews, websiteActivities, recentVehicles, recentBlogs, recentServices, recentParts, recentWebsiteActivities] = await Promise.all([
        Category.countDocuments(), Brand.countDocuments(), Vehicle.countDocuments(), Content.countDocuments(), Blog.countDocuments(), Part.countDocuments(), Service.countDocuments(), Enquiry.countDocuments(),
        Vehicle.countDocuments({ status: 'active' }), Service.countDocuments({ status: 'active' }), Part.countDocuments({ status: 'active' }), Part.countDocuments({ stock: { $lte: 5 } }),
        Part.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ['$price', '$stock'] } } } }]),
        WebsiteActivity.countDocuments({ event: 'pageview' }),
        WebsiteActivity.countDocuments(),
        Vehicle.find().sort({ createdAt: -1 }).limit(5).populate('brand', 'name').populate('category', 'name'), Blog.find().sort({ createdAt: -1 }).limit(5),
        Service.find().sort({ createdAt: -1 }).limit(4), Part.find().sort({ createdAt: -1 }).limit(4),
        WebsiteActivity.find().sort({ createdAt: -1 }).limit(5),
      ])
      const [storage, storageCollections, activities, mainCategories, vehicleCategories, vehicleSubCategories, partSubCategories, serviceSubCategories, newEnquiries, sitePages, failedActivities] = await Promise.all([
        mongoose.connection.db.collection('media.files').countDocuments(),
        mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray().then((items) => items.filter((item) => !item.name.startsWith('system.')).length),
        Activity.countDocuments(),
        Category.countDocuments({ parentId: null }),
        Category.countDocuments({ group: 'Vehicles', slug: { $in: primaryVehicleCategorySlugs } }),
        Category.countDocuments({ group: 'Vehicles', slug: { $nin: ['vehicles', ...primaryVehicleCategorySlugs] } }),
        Category.countDocuments({ group: 'Spare Parts', parentId: { $ne: null } }),
        Category.countDocuments({ group: 'Services', parentId: { $ne: null } }),
        Enquiry.countDocuments({ status: 'new' }),
        SitePage.countDocuments(),
        Activity.countDocuments({ status: 'failed' }),
      ])
      response.json({
        counts: {
          categories, mainCategories, vehicleCategories, partCategories: partSubCategories, serviceCategories: serviceSubCategories,
          vehicleSubCategories, partSubCategories, serviceSubCategories,
          brands, vehicles, content, blogs, pages: sitePages, websiteContent: content + sitePages, parts, services, enquiries,
          storage, storageCollections, activities, websiteActivities, pageViews,
        },
        notifications: { enquiries: newEnquiries, activities: failedActivities },
        summary: { activeVehicles, activeServices, activeParts, lowStockParts, inventoryValue: inventoryValue[0]?.value || 0 },
        recentVehicles, recentBlogs, recentServices, recentParts, recentWebsiteActivities,
      })
    } catch (error) { next(error) }
  })

  app.get('/api/:resource', async (request, response, next) => {
    try {
      const Model = resources[request.params.resource]
      if (!Model) return response.status(404).json({ message: 'Resource not found' })
      const filter = {}
      if (request.query.status) filter.status = request.query.status
      if (request.query.condition && request.params.resource === 'vehicles') filter.condition = request.query.condition
      if (request.query.vehicleType && request.params.resource === 'vehicles') filter.vehicleType = request.query.vehicleType
      if (request.query.category && ['parts', 'services'].includes(request.params.resource)) filter.category = request.query.category
      if (request.query.search) {
        const expression = new RegExp(request.query.search.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        const searchable = request.params.resource === 'blogs' ? ['title', 'excerpt', 'author'] : request.params.resource === 'content' ? ['title', 'summary', 'type'] : request.params.resource === 'enquiries' ? ['name', 'email', 'phone', 'subject', 'source', 'itemName', 'category', 'location', 'pageUrl', 'accountEmail'] : ['name', 'description', 'category']
        filter.$or = searchable.map((field) => ({ [field]: expression }))
      }
      let query = Model.find(filter).sort(request.params.resource === 'categories' ? { sortOrder: 1, name: 1 } : { createdAt: -1 })
      if (request.params.resource === 'vehicles') query = query.populate('brand', 'name').populate('category', 'name group parentId')
      if (request.params.resource === 'parts' || request.params.resource === 'services') query = query.populate('categoryId', 'name group parentId')
      response.json(await query)
    } catch (error) { next(error) }
  })

  app.get('/api/:resource/:id', async (request, response, next) => {
    try {
      const Model = resources[request.params.resource]
      if (!Model) return response.status(404).json({ message: 'Resource not found' })
      let query = Model.findById(request.params.id)
      if (request.params.resource === 'vehicles') query = query.populate('brand', 'name logoUrl').populate('category', 'name group parentId')
      if (request.params.resource === 'parts' || request.params.resource === 'services') query = query.populate('categoryId', 'name group parentId')
      const item = await query
      if (!item) return response.status(404).json({ message: 'Item not found' })
      response.json(item)
    } catch (error) { next(error) }
  })

  app.post('/api/:resource', async (request, response, next) => {
    try {
      const Model = resources[request.params.resource]
      if (!Model) return response.status(404).json({ message: 'Resource not found' })
      response.status(201).json(await Model.create(await preparedPayloadFor(request.params.resource, request.body)))
    } catch (error) { next(error) }
  })

  app.put('/api/:resource/:id', async (request, response, next) => {
    try {
      const Model = resources[request.params.resource]
      if (!Model) return response.status(404).json({ message: 'Resource not found' })
      const existing = await Model.findById(request.params.id)
      if (!existing) return response.status(404).json({ message: 'Item not found' })
      response.json(await Model.findByIdAndUpdate(request.params.id, await preparedPayloadFor(request.params.resource, request.body, existing), { new: true, runValidators: true }))
    } catch (error) { next(error) }
  })

  app.delete('/api/:resource/:id', async (request, response, next) => {
    try {
      const Model = resources[request.params.resource]
      if (!Model) return response.status(404).json({ message: 'Resource not found' })
      if (request.params.resource === 'categories' && await Category.exists({ parentId: request.params.id })) return response.status(409).json({ message: 'Delete or move its sub-categories first.' })
      if (request.params.resource === 'categories' && await Vehicle.exists({ category: request.params.id })) return response.status(409).json({ message: 'This category is assigned to vehicles. Reassign them before deleting it.' })
      if (request.params.resource === 'categories') {
        const category = await Category.findById(request.params.id)
        if (category && await Part.exists({ $or: [{ categoryId: category._id }, { category: category.name }] })) return response.status(409).json({ message: 'This category is assigned to spare parts. Delete or reassign those parts first.' })
        if (category && await Service.exists({ categoryId: category._id })) return response.status(409).json({ message: 'This category is assigned to services. Delete or reassign those services first.' })
      }
      if (request.params.resource === 'brands' && await Vehicle.exists({ brand: request.params.id })) return response.status(409).json({ message: 'This brand is assigned to vehicles. Reassign them before deleting it.' })
      const deleted = await Model.findByIdAndDelete(request.params.id)
      if (!deleted) return response.status(404).json({ message: 'Item not found' })
      response.status(204).end()
    } catch (error) { next(error) }
  })
}

export const adminErrorHandler = (error, _request, response, _next) => {
  console.error(error)
  if (error.code === 11000) return response.status(409).json({ message: 'This name or URL slug already exists.' })
  response.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message || 'Something went wrong' })
}

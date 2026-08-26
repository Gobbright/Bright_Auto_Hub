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
  imageUrl: { type: String, default: '' }, description: { type: String, default: '' }, specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
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
  imageUrl: { type: String, default: '' }, description: { type: String, default: '' }, compatibleVehicleTypes: [String], stock: { type: Number, default: 0 }, status: { type: String, enum: ['active', 'draft'], default: 'active' }, featured: { type: Boolean, default: false },
}, options))

const Service = mongoose.models.AdminService || mongoose.model('AdminService', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true }, category: { type: String, default: 'General Service' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCategory', default: null },
  price: { type: Number, default: 0 }, duration: { type: String, default: '' }, imageUrl: { type: String, default: '' }, description: { type: String, default: '' },
  features: [String], vehicleTypes: [String], status: { type: String, enum: ['active', 'draft'], default: 'active' }, featured: { type: Boolean, default: false },
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

const resources = { categories: Category, brands: Brand, vehicles: Vehicle, content: Content, blogs: Blog, parts: Part, services: Service, pages: SitePage, enquiries: Enquiry, activities: Activity }

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
  if (resource === 'services') {
    if (typeof value.features === 'string') value.features = value.features.split(',').map((item) => item.trim()).filter(Boolean)
    if (typeof value.vehicleTypes === 'string') value.vehicleTypes = value.vehicleTypes.split(',').map((item) => item.trim()).filter(Boolean)
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
  const isNewDatabase = await Category.countDocuments() === 0
  if (isNewDatabase) await walkCategoryTree(defaultCategoryTree)
  const pageSeeds = [
    ['home','Home Page','Vehicles, Parts & Service in One Place','India’s all-in-one automobile platform for vehicles, parts and trusted services.'],
    ['vehicles','Vehicle Marketplace','Explore Vehicles','Find the right vehicle for every road and every ambition.'],
    ['compare','Compare Vehicles','Compare. Decide. Drive.','Put specifications, features and prices side by side.'],
    ['spare-parts','Spare Parts','Genuine Parts. Built to Perform.','Quality parts for bikes, cars, commercial and heavy vehicles.'],
    ['services','Vehicle Services','Expert Vehicle Service. Trusted Care.','Book transparent, dependable service from trusted professionals.'],
    ['used-cars','Used Cars','Great Cars. Better Prices.','Verified pre-owned cars with straightforward pricing.'],
    ['blog','Automotive Journal','Stories for Smarter Journeys','News, reviews, buying guides and ownership advice.'],
    ['contact','Contact Us',"We're Here to Help You",'Our support team is ready to help with every automotive need.'],
  ]
  for (const [slug,name,title,description] of pageSeeds) await SitePage.updateOne({ slug }, { $setOnInsert: { slug,name,title,description,status:'published' } }, { upsert: true })
  await SitePage.updateOne({ slug: 'home', title: 'Find, Compare & Service Every Vehicle' }, { $set: { title: 'Vehicles, Parts & Service in One Place' } })

  if (await Brand.countDocuments() === 0) {
    await Brand.insertMany(['Bajaj','TVS','Hyundai','Maruti Suzuki','Tata Motors','Mahindra','JCB','MG Motor'].map((name, index) => ({ name, slug: slugify(name), status: 'active', featured: index < 6 })))
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

  if (await Service.countDocuments() === 0) {
    await Service.insertMany([
      ['General Vehicle Service','General Service',1499,'2–3 hours',['Inspection','Oil and fluid check','Basic diagnostics']],
      ['Bike Periodic Service','Bike Service',899,'90 minutes',['Engine inspection','Brake check','Chain adjustment']],
      ['Car AC Service','AC Service',1599,'2 hours',['AC inspection','Cooling check','Filter cleaning']],
      ['Brake Service','Brake Service',1299,'2 hours',['Pad inspection','Brake cleaning','Safety test']],
      ['Engine Diagnostics','Engine Repair',1999,'1–2 hours',['Computer diagnostics','Engine health report','Expert advice']],
      ['24/7 Breakdown Assistance','Breakdown Assistance',999,'On demand',['Roadside support','Towing assistance','Minor repairs']],
    ].map(([name,category,price,duration,features]) => ({ name, slug: slugify(name), category, price, duration, features, vehicleTypes: ['Cars','Bikes','Commercial'], status: 'active', featured: true })))
  }

  if (isNewDatabase && await Part.countDocuments() === 0) await seedSparePartsCatalog()
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
      const [categories, brands, vehicles, content, blogs, parts, services, enquiries, activeVehicles, activeServices, activeParts, lowStockParts, inventoryValue, recentVehicles, recentBlogs, recentServices, recentParts] = await Promise.all([
        Category.countDocuments(), Brand.countDocuments(), Vehicle.countDocuments(), Content.countDocuments(), Blog.countDocuments(), Part.countDocuments(), Service.countDocuments(), Enquiry.countDocuments(),
        Vehicle.countDocuments({ status: 'active' }), Service.countDocuments({ status: 'active' }), Part.countDocuments({ status: 'active' }), Part.countDocuments({ stock: { $lte: 5 } }),
        Part.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ['$price', '$stock'] } } } }]),
        Vehicle.find().sort({ createdAt: -1 }).limit(5).populate('brand', 'name').populate('category', 'name'), Blog.find().sort({ createdAt: -1 }).limit(5),
        Service.find().sort({ createdAt: -1 }).limit(4), Part.find().sort({ createdAt: -1 }).limit(4),
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
          storage, storageCollections, activities,
        },
        notifications: { enquiries: newEnquiries, activities: failedActivities },
        summary: { activeVehicles, activeServices, activeParts, lowStockParts, inventoryValue: inventoryValue[0]?.value || 0 },
        recentVehicles, recentBlogs, recentServices, recentParts,
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

import mongoose from 'mongoose'
import { sendEnquiryEmails } from './enquiryMailer.js'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const locationCache = new Map()
let locationQueue = Promise.resolve()
let lastLocationRequestAt = 0
const locationAttribution = { label: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' }
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const cleanText = (value, limit = 500) => String(value || '').trim().slice(0, limit)

const fetchLocationData = (url) => {
  const task = locationQueue.then(async () => {
    const delay = Math.max(0, 1050 - (Date.now() - lastLocationRequestAt))
    if (delay) await wait(delay)
    lastLocationRequestAt = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 9000)
    try {
      const result = await fetch(url, {
        headers: {
          'User-Agent': 'BrightAutoHub/1.0 (support@brightautohub.com)',
          Referer: 'https://brightautohub.com',
          Accept: 'application/json',
        },
        signal: controller.signal,
      })
      if (!result.ok) throw new Error('Location provider is temporarily unavailable.')
      return await result.json()
    } finally { clearTimeout(timeout) }
  })
  locationQueue = task.catch(() => {})
  return task
}

const locationLabel = (entry = {}) => {
  const address = entry.address || {}
  return address.city || address.town || address.village || address.municipality || address.county || address.state || entry.display_name || 'Selected location'
}

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, phone: user.phone || '' })
const passwordHash = (password, salt) => scryptSync(password, salt, 64)

export const registerPublicApi = (app) => {
  const Content = mongoose.model('AdminContent')
  const Blog = mongoose.model('AdminBlog')
  const Vehicle = mongoose.model('AdminVehicle')
  const Brand = mongoose.model('AdminBrand')
  const Part = mongoose.model('AdminPart')
  const Service = mongoose.model('AdminService')
  const SitePage = mongoose.model('AdminSitePage')
  const Enquiry = mongoose.model('AdminEnquiry')
  const Category = mongoose.model('AdminCategory')
  const PublicUser = mongoose.models.PublicUser || mongoose.model('PublicUser', new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    passwordHash: { type: String, required: true, select: false },
    passwordSalt: { type: String, required: true, select: false },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  }, { timestamps: true, versionKey: false }))

  app.post('/api/public/auth/register', async (request, response, next) => {
    try {
      const name = cleanText(request.body.name, 100)
      const email = cleanText(request.body.email, 180).toLowerCase()
      const phone = cleanText(request.body.phone, 30)
      const password = String(request.body.password || '')
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return response.status(400).json({ message: 'Enter a name, valid email and password with at least 6 characters.' })
      if (await PublicUser.exists({ email })) return response.status(409).json({ message: 'An account already exists for this email.' })
      const salt = randomBytes(16).toString('hex')
      const user = await PublicUser.create({ name, email, phone, passwordSalt: salt, passwordHash: passwordHash(password, salt).toString('hex') })
      response.status(201).json({ message: 'Your account has been created.', user: publicUser(user) })
    } catch (error) { next(error) }
  })

  app.post('/api/public/auth/login', async (request, response, next) => {
    try {
      const email = cleanText(request.body.email, 180).toLowerCase()
      const password = String(request.body.password || '')
      const user = await PublicUser.findOne({ email }).select('+passwordHash +passwordSalt')
      if (!user || user.status !== 'active') return response.status(401).json({ message: 'Email or password is incorrect.' })
      const expected = Buffer.from(user.passwordHash, 'hex')
      const received = passwordHash(password, user.passwordSalt)
      if (expected.length !== received.length || !timingSafeEqual(expected, received)) return response.status(401).json({ message: 'Email or password is incorrect.' })
      response.json({ message: 'Welcome back.', user: publicUser(user) })
    } catch (error) { next(error) }
  })

  app.get('/api/public/locations/search', async (request, response, next) => {
    try {
      const query = cleanText(request.query.q, 100)
      if (query.length < 2) return response.status(400).json({ message: 'Enter at least 2 characters to search a location.' })
      const cacheKey = 'search:' + query.toLowerCase()
      const cached = locationCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) return response.json(cached.value)
      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.search = new URLSearchParams({ q: query, format: 'jsonv2', addressdetails: '1', limit: '6' })
      const data = await fetchLocationData(url)
      const value = {
        results: data.map((entry) => ({ id: String(entry.place_id), label: entry.display_name, shortLabel: locationLabel(entry), lat: Number(entry.lat), lon: Number(entry.lon), type: entry.type || '' })),
        attribution: locationAttribution,
      }
      locationCache.set(cacheKey, { value, expiresAt: Date.now() + 60 * 60 * 1000 })
      response.json(value)
    } catch (error) { next(error) }
  })

  app.get('/api/public/locations/reverse', async (request, response, next) => {
    try {
      const lat = Number(request.query.lat)
      const lon = Number(request.query.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return response.status(400).json({ message: 'Valid latitude and longitude are required.' })
      const cacheKey = `reverse:${lat.toFixed(3)}:${lon.toFixed(3)}`
      const cached = locationCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) return response.json(cached.value)
      const url = new URL('https://nominatim.openstreetmap.org/reverse')
      url.search = new URLSearchParams({ lat: String(lat), lon: String(lon), format: 'jsonv2', addressdetails: '1', zoom: '10' })
      const entry = await fetchLocationData(url)
      const value = { location: { id: String(entry.place_id || cacheKey), label: entry.display_name || `${lat}, ${lon}`, shortLabel: locationLabel(entry), lat, lon, type: 'live' }, attribution: locationAttribution }
      locationCache.set(cacheKey, { value, expiresAt: Date.now() + 60 * 60 * 1000 })
      response.json(value)
    } catch (error) { next(error) }
  })

  app.get('/api/public/vehicle-categories', async (_request, response, next) => {
    try {
      const categories = await Category.find({ group: 'Vehicles', status: 'active' }).sort({ sortOrder: 1, name: 1 }).lean()
      const byParent = new Map()
      for (const item of categories) { const key = item.parentId?.toString() || 'root'; byParent.set(key, [...(byParent.get(key)||[]), item]) }
      const build = (parent='root') => (byParent.get(parent)||[]).map(item => ({ ...item, children: build(item._id.toString()) }))
      response.json(build())
    } catch (error) { next(error) }
  })

  app.get('/api/public/part-categories', async (_request, response, next) => {
    try {
      const categories = await Category.find({ group: 'Spare Parts', status: 'active' }).sort({ sortOrder: 1, name: 1 }).lean()
      const byParent = new Map()
      for (const item of categories) {
        const key = item.parentId?.toString() || 'root'
        byParent.set(key, [...(byParent.get(key) || []), item])
      }
      const build = (parent = 'root') => (byParent.get(parent) || []).map((item) => ({
        ...item,
        children: build(item._id.toString()),
      }))
      response.json(build().find((item) => item.slug === 'spare-parts')?.children || [])
    } catch (error) { next(error) }
  })

  app.get('/api/public/vehicles', async (request, response, next) => {
    try {
      const filter = { status: 'active' }
      if (request.query.condition) filter.condition = request.query.condition
      if (request.query.category) {
        let parent = null
        if (request.query.group) { const root = await Category.findOne({ slug: 'vehicles', parentId: null }); parent = await Category.findOne({ slug: request.query.group, parentId: root?._id, status: 'active' }) }
        const category = await Category.findOne({ slug: request.query.category, status: 'active', ...(parent ? { parentId: parent._id } : {}) })
        if (!category) return response.json([])
        filter.category = category._id
      } else if (request.query.group) {
        const root = await Category.findOne({ slug: 'vehicles', parentId: null })
        const parent = await Category.findOne({ slug: request.query.group, parentId: root?._id, status: 'active' })
        if (!parent) return response.json([])
        const descendants = await Category.find({ parentId: parent._id, status: 'active' }).select('_id')
        filter.category = { $in: [parent._id, ...descendants.map((item) => item._id)] }
      }
      response.json(await Vehicle.find(filter).populate('brand','name logoUrl').populate({ path: 'category', select: 'name slug parentId', populate: { path: 'parentId', select: 'name slug' } }).sort({ featured:-1,updatedAt:-1 }).lean())
    } catch (error) { next(error) }
  })

  app.get('/api/public/products/:kind/:identifier', async (request, response, next) => {
    try {
      const models = { vehicles: Vehicle, parts: Part, services: Service }
      const Model = models[request.params.kind]
      if (!Model) return response.status(404).json({ message: 'Product type not found' })

      const identifier = request.params.identifier
      const identity = mongoose.isValidObjectId(identifier)
        ? { $or: [{ _id: identifier }, { slug: identifier }] }
        : { slug: identifier }
      let query = Model.findOne({ status: 'active', ...identity })
      if (request.params.kind === 'vehicles') {
        query = query
          .populate('brand', 'name logoUrl')
          .populate({ path: 'category', select: 'name slug parentId', populate: { path: 'parentId', select: 'name slug' } })
      }
      if (request.params.kind === 'parts' || request.params.kind === 'services') query = query.populate('categoryId', 'name slug parentId')
      const product = await query.lean()
      if (!product) return response.status(404).json({ message: 'Product not found or not published' })
      response.json(product)
    } catch (error) { next(error) }
  })

  app.get('/api/public/site/:slug', async (request, response, next) => {
    try {
      const page = await SitePage.findOne({ slug: request.params.slug, status: 'published' }).lean()
      if (!page) return response.status(404).json({ message: 'Page not found' })
      const [vehicles, brands, parts, services, blogs, partCategoryDocuments] = await Promise.all([
        Vehicle.find({ status: 'active' }).sort({ featured: -1, updatedAt: -1 }).populate('brand', 'name logoUrl').populate({ path: 'category', select: 'name slug parentId', populate: { path: 'parentId', select: 'name slug' } }).lean(),
        Brand.find({ status: 'active' }).sort({ featured: -1, name: 1 }).lean(), Part.find({ status: 'active' }).sort({ featured: -1, updatedAt: -1 }).lean(),
        Service.find({ status: 'active' }).sort({ featured: -1, updatedAt: -1 }).populate('categoryId', 'name slug parentId').lean(), Blog.find({ status: 'published' }).sort({ publishedAt: -1 }).lean(),
        Category.find({ group: 'Spare Parts', status: 'active' }).sort({ sortOrder: 1, name: 1 }).lean(),
      ])
      const partCategoriesByParent = new Map()
      for (const item of partCategoryDocuments) {
        const key = item.parentId?.toString() || 'root'
        partCategoriesByParent.set(key, [...(partCategoriesByParent.get(key) || []), item])
      }
      const buildPartCategories = (parent = 'root') => (partCategoriesByParent.get(parent) || []).map((item) => ({
        ...item,
        children: buildPartCategories(item._id.toString()),
      }))
      const partRoot = buildPartCategories().find((item) => item.slug === 'spare-parts')
      response.json({ page, vehicles, brands, parts, services, blogs, partCategories: partRoot?.children || [] })
    } catch (error) { next(error) }
  })

  app.post('/api/public/enquiries', async (request, response, next) => {
    try {
      const { name, email, phone = '', subject = 'General enquiry', message, source = 'contact' } = request.body
      if (!name?.trim() || !email?.trim() || !message?.trim()) return response.status(400).json({ message: 'Name, email and message are required.' })
      const coordinates = request.body.coordinates || {}
      const item = await Enquiry.create({
        name: cleanText(name, 100), email: cleanText(email, 180).toLowerCase(), phone: cleanText(phone, 30),
        subject: cleanText(subject, 160) || 'General enquiry', message: cleanText(message, 5000), source: cleanText(source, 80) || 'contact',
        itemName: cleanText(request.body.itemName, 220), category: cleanText(request.body.category, 160), enquiryType: cleanText(request.body.enquiryType, 80),
        pageUrl: cleanText(request.body.pageUrl, 600), pageTitle: cleanText(request.body.pageTitle, 220), location: cleanText(request.body.location, 500),
        latitude: Number.isFinite(Number(coordinates.lat)) ? Number(coordinates.lat) : null,
        longitude: Number.isFinite(Number(coordinates.lon)) ? Number(coordinates.lon) : null,
        accountId: mongoose.isValidObjectId(request.body.accountId) ? request.body.accountId : null,
        accountEmail: cleanText(request.body.accountEmail, 180).toLowerCase(), context: cleanText(request.body.context, 3000),
        ip: cleanText(request.ip || request.socket?.remoteAddress, 100), userAgent: cleanText(request.get('user-agent'), 500),
      })
      let mailResult
      try {
        mailResult = await sendEnquiryEmails(item.toObject())
      } catch (error) {
        mailResult = { status: 'failed', error: cleanText(error?.message || 'Email delivery failed', 500) }
      }
      item.emailNotificationStatus = mailResult.status
      item.emailNotificationError = mailResult.error || ''
      item.emailNotificationMessageId = mailResult.messageId || ''
      item.emailNotifiedAt = mailResult.notifiedAt || null
      item.customerAcknowledgementSent = Boolean(mailResult.acknowledgementSent)
      await item.save()
      response.status(201).json({
        message: 'Thanks! Our team will contact you shortly.',
        id: item._id,
        emailNotificationStatus: item.emailNotificationStatus,
      })
    } catch (error) { next(error) }
  })

  app.get('/api/public/content', async (request, response, next) => {
    try {
      const filter = { status: 'published' }
      if (request.query.type) filter.type = request.query.type
      response.json(await Content.find(filter).sort({ updatedAt: -1 }).select('title slug type summary heroImage updatedAt'))
    } catch (error) { next(error) }
  })

  app.get('/api/public/content/:slug', async (request, response, next) => {
    try {
      const document = await Content.findOne({ slug: request.params.slug, status: 'published' })
      if (!document) return response.status(404).json({ message: 'Page not found' })
      response.json(document)
    } catch (error) { next(error) }
  })

  app.get('/api/public/blogs', async (_request, response, next) => {
    try {
      response.json(await Blog.find({ status: 'published' }).sort({ publishedAt: -1, updatedAt: -1 }).select('title slug excerpt imageUrl imageAlt author tags readingTime publishedAt createdAt'))
    } catch (error) { next(error) }
  })

  app.get('/api/public/blogs/:slug', async (request, response, next) => {
    try {
      const document = await Blog.findOne({ slug: request.params.slug, status: 'published' })
      if (!document) return response.status(404).json({ message: 'Article not found' })
      response.json(document)
    } catch (error) { next(error) }
  })
}

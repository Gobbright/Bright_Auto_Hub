const { chromium } = require('playwright')

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'

const groups = {
  bikes: ['bikes', 'scooters', 'electric-bikes', 'electric-scooters'],
  cars: ['hatchback', 'sedan', 'suv', 'muv-mpv', 'luxury-cars', 'electric-cars'],
  'commercial-vehicles': ['trucks', 'mini-trucks', 'pickup-vehicles', 'buses', 'vans', 'tempo-travellers', '3-wheelers'],
  'farm-vehicles': ['tractors', 'mini-tractors', 'farm-equipment'],
  'construction-vehicles': ['jcb', 'excavators', 'backhoe-loaders', 'wheel-loaders', 'cranes', 'construction-equipment'],
  'ev-vehicles': ['electric-bikes', 'electric-scooters', 'electric-cars', 'electric-3-wheelers', 'electric-trucks', 'electric-buses', 'electric-vans'],
}

const vehicle = (id, name, group = 'cars', category = 'suv') => ({
  _id: id,
  slug: id,
  name,
  description: `${name} is a verified QA vehicle listing.`,
  price: 950000,
  modelYear: 2026,
  group,
  vehicleType: 'SUV',
  condition: 'new',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  location: 'Chennai',
  featured: true,
  brand: { _id: 'brand-1', name: 'Bright Motors', slug: 'bright-motors' },
  category: { _id: `category-${category}`, name: category.toUpperCase(), slug: category },
  specifications: { Mileage: '18 kmpl', Power: '120 bhp', Seats: '5' },
})

const vehicles = [vehicle('demo-vehicle', 'Bright Atlas'), vehicle('demo-vehicle-2', 'Bright Nova')]
const part = {
  _id: 'demo-part', slug: 'demo-part', name: 'Premium Brake Pad Set', description: 'Verified replacement brake pads.',
  price: 2499, originalPrice: 2999, stock: 20, brand: 'Bright Parts', category: 'Brakes', featured: true,
  compatibleVehicleTypes: ['Cars', 'SUVs'],
}
const service = {
  _id: 'demo-service', slug: 'demo-service', name: 'Complete Vehicle Care', description: 'Professional periodic maintenance.',
  price: 3499, category: 'Periodic Service', duration: '3 hours', vehicleTypes: ['Cars', 'SUVs'], featured: true,
  features: ['Engine oil replacement', 'Brake inspection', 'Battery health check'],
}
const content = {
  _id: 'demo-page', slug: 'demo-page', title: 'Bright Auto Hub Information', type: 'page',
  summary: 'Useful automobile information for every owner.', body: '<p>Verified information from Bright Auto Hub.</p>', status: 'published',
}
const blog = {
  _id: 'demo-blog', slug: 'demo-blog', title: 'A Practical Vehicle Ownership Guide', author: 'Bright Auto Hub',
  excerpt: 'Clear advice for buying and maintaining your vehicle.', content: '<p>Plan, compare and maintain your vehicle with confidence.</p>',
  tags: ['Ownership'], status: 'published',
}

function sitePayload(kind) {
  const titles = {
    vehicles: 'Explore Vehicles', compare: 'Compare Vehicles', calculators: 'Vehicle Calculators',
    'used-cars': 'Verified Used Cars', 'spare-parts': 'Genuine Spare Parts', services: 'Vehicle Services',
    blog: 'Automotive Blog', contact: 'Contact Bright Auto Hub',
  }
  return {
    page: { title: titles[kind] || 'Bright Auto Hub', description: 'Complete automobile support in one trusted platform.', eyebrow: 'BRIGHT AUTO HUB' },
    vehicles, brands: [], parts: [part], services: [service], blogs: [blog], partCategories: [],
  }
}

function responseFor(url, method) {
  const path = new URL(url).pathname.replace(/^\/api/, '')
  if (method !== 'GET') return { message: 'QA request completed successfully.' }
  if (path === '/home') return { page: null, featuredBrands: [], featuredVehicles: vehicles, featuredServices: [service], featuredParts: [part], latestBlogs: [blog] }
  if (path === '/health') return { database: 'connected', databaseName: 'goautomobile-qa' }
  if (path === '/dashboard') return { counts: {}, summary: {}, recentVehicles: [], recentBlogs: [], recentServices: [], recentParts: [] }
  if (path === '/public/part-categories' || path === '/public/vehicle-categories') return []
  if (path === '/public/products/vehicles/demo-vehicle') return vehicles[0]
  if (path === '/public/products/parts/demo-part') return part
  if (path === '/public/products/services/demo-service') return service
  if (path.startsWith('/public/site/')) return sitePayload(path.split('/').pop())
  if (path === '/public/vehicles') return vehicles
  if (path === '/public/content/demo-page' || path === '/public/content/demo-service') return path.endsWith('demo-service') ? { ...content, _id: 'demo-service', slug: 'demo-service', title: 'Professional Vehicle Service', type: 'service' } : content
  if (path === '/public/content') return [content]
  if (path === '/public/blogs/demo-blog') return blog
  if (path === '/public/blogs') return [blog]
  if (/^\/(brands|categories|vehicles|parts|services|content|blogs|pages|enquiries)$/.test(path)) return []
  return {}
}

async function installApiMock(context) {
  await context.route('http://localhost:5000/api/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(responseFor(route.request().url(), route.request().method())),
    })
  })
}

const allPublicRoutes = [
  '/', '/vehicles',
  ...Object.entries(groups).flatMap(([group, categories]) => [`/vehicles/${group}`, ...categories.map((category) => `/vehicles/${group}/${category}`)]),
  '/compare', '/calculators', '/used-cars', '/spare-parts', '/services',
  '/contact?subject=Vehicle+enquiry&item=Bright+Atlas&source=qa', '/login', '/register',
  '/finance-insurance', '/finance-insurance/vehicle-loan', '/finance-insurance/car-loan', '/finance-insurance/bike-loan',
  '/finance-insurance/commercial-vehicle-loan', '/finance-insurance/tractor-loan', '/finance-insurance/vehicle-insurance', '/finance-insurance/insurance-renewal',
  '/services/demo-service', '/pages', '/pages/demo-page', '/blog', '/blog/demo-blog',
  '/vehicles/product/demo-vehicle', '/spare-parts/product/demo-part', '/services/product/demo-service',
  '/dashboard', '/admin', '/definitely-missing',
]
const publicRoutes = process.env.QA_SINGLE ? [process.env.QA_SINGLE] : allPublicRoutes

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]

const failures = []
let checks = 0

function record(scope, message) {
  failures.push(`${scope}: ${message}`)
}

async function checkRoute(page, route, viewportName) {
  const scope = `${viewportName} ${route}`
  const routeErrors = []
  const onConsole = (message) => {
    if (message.type() === 'error') routeErrors.push(`console error: ${message.text()}`)
  }
  const onPageError = (error) => routeErrors.push(`page error: ${error.message}`)
  const onRequestFailed = (request) => routeErrors.push(`request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText || 'unknown'})`)
  const onResponse = (response) => {
    if (response.status() >= 400) routeErrors.push(`HTTP ${response.status()}: ${response.url()}`)
  }
  page.on('console', onConsole)
  page.on('pageerror', onPageError)
  page.on('requestfailed', onRequestFailed)
  page.on('response', onResponse)
  try {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 20000 })
    if (!response || response.status() >= 400) record(scope, `navigation returned ${response?.status() || 'no response'}`)
    await page.locator('.app-shell').waitFor({ state: 'visible', timeout: 8000 })
    const result = await page.evaluate(() => {
      const bodyText = document.body.textContent.trim()
      const root = document.querySelector('#app')
      return {
        bodyText,
        hasRootContent: Boolean(root && root.children.length),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }
    })
    if (!result.hasRootContent || result.bodyText.length < 20) record(scope, `page rendered without meaningful content (root=${result.hasRootContent}, textLength=${result.bodyText.length}, htmlLength=${await page.content().then((html) => html.length)})`)
    if (/Internal Server Error|Failed to fetch dynamically imported module|Uncaught TypeError|ReferenceError:/i.test(result.bodyText)) record(scope, 'runtime error text is visible in the page')
    if (result.scrollWidth > result.clientWidth + 2) record(scope, `document overflows horizontally (${result.scrollWidth}px > ${result.clientWidth}px)`)
    routeErrors.forEach((error) => record(scope, error))
    checks += 1
  } catch (error) {
    record(scope, `test failure: ${error.message.split('\n')[0]}`)
    routeErrors.forEach((routeError) => record(scope, routeError))
  } finally {
    page.off('console', onConsole)
    page.off('pageerror', onPageError)
    page.off('requestfailed', onRequestFailed)
    page.off('response', onResponse)
  }
}

async function testAdmin(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
  await context.addInitScript(() => {
    localStorage.setItem('isDashboardLoggedIn', 'true')
    localStorage.setItem('dashboardUserName', 'QA Admin')
  })
  await installApiMock(context)
  const page = await context.newPage()
  await checkRoute(page, '/admin', `${viewport.name}-authenticated`)
  const labels = ['Categories', 'Brands', 'Vehicles', 'Spare Parts', 'Services', 'Pages & Services', 'Blog Posts', 'Site Pages', 'Enquiries', 'Dashboard']
  for (const label of labels) {
    const scope = `${viewport.name}-admin ${label}`
    try {
      if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu' }).click()
      await page.getByRole('button', { name: label, exact: true }).click()
      await page.getByRole('heading', { name: label === 'Services' ? 'Vehicle Services' : label, exact: true }).first().waitFor({ state: 'visible', timeout: 8000 })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (overflow > 2) record(scope, `document overflows horizontally by ${overflow}px`)
      checks += 1
    } catch (error) {
      record(scope, `navigation failure: ${error.message.split('\n')[0]}`)
    }
  }
  await context.close()
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
      await installApiMock(context)
      for (const route of publicRoutes) {
        const page = await context.newPage()
        page.setDefaultTimeout(8000)
        await checkRoute(page, route, viewport.name)
        await page.close()
      }
      await context.close()
      await testAdmin(browser, viewport)
    }
  } finally {
    await browser.close()
  }
  console.log(`Completed ${checks} page and admin-screen checks.`)
  if (failures.length) {
    console.error(`Found ${failures.length} failure(s):`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
  } else {
    console.log('All routes rendered without console errors, failed requests, crashes, or document-level overflow.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

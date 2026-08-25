const { chromium } = require('playwright')

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const viewports = [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]

async function main() {
  const browser = await chromium.launch({ headless: true })
  const failures = []
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
      await context.route('http://localhost:5000/api/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(route.request().url().endsWith('/home') ? { page: null, featuredBrands: [], featuredVehicles: [], featuredServices: [], featuredParts: [], latestBlogs: [] } : []) }))
      const page = await context.newPage()
      const errors = []
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(baseUrl, { waitUntil: 'networkidle' })
      const section = page.locator('.journey-banner')
      await section.waitFor({ state: 'visible' })
      const iconCount = await section.locator('.journey-stat-icons img').count()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      await section.screenshot({ path: `journey-${viewport.name}.png` })
      if (iconCount !== 6) failures.push(`${viewport.name}: expected 6 category icons, found ${iconCount}`)
      if (overflow > 2) failures.push(`${viewport.name}: horizontal overflow by ${overflow}px`)
      if (errors.length) failures.push(`${viewport.name}: ${errors.join(' | ')}`)
      await context.close()
    }
  } finally {
    await browser.close()
  }
  if (failures.length) { failures.forEach((failure) => console.error(failure)); process.exit(1) }
  console.log('Journey banner passed desktop/mobile icon, console and overflow checks.')
}

main().catch((error) => { console.error(error); process.exit(1) })

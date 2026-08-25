const { chromium } = require('playwright')

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173'
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]

async function main() {
  const browser = await chromium.launch({ headless: true })
  const failures = []
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
      await context.route('http://localhost:5000/api/**', (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(route.request().url().endsWith('/home')
          ? { page: null, featuredBrands: [], featuredVehicles: [], featuredServices: [], featuredParts: [], latestBlogs: [] }
          : []),
      }))
      const page = await context.newPage()
      const errors = []
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(baseUrl, { waitUntil: 'networkidle' })

      const section = page.locator('#construction-showcase')
      await section.waitFor({ state: 'visible' })
      const cards = section.locator('.construction-card')
      const cardCount = await cards.count()
      const categoryLinks = await section.locator('.construction-card-image, .construction-benefits .outline-button').count()
      const imageFailures = await section.locator('.construction-card img').evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).length)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      const heading = await section.locator('h2').innerText()
      await section.screenshot({ path: `construction-${viewport.name}.png` })

      if (heading !== 'Built for Bigger Projects') failures.push(`${viewport.name}: incorrect section heading`)
      if (cardCount !== 4) failures.push(`${viewport.name}: expected 4 construction cards, found ${cardCount}`)
      if (categoryLinks < 5) failures.push(`${viewport.name}: expected construction category links, found ${categoryLinks}`)
      if (imageFailures) failures.push(`${viewport.name}: ${imageFailures} construction images failed to load`)
      if (overflow > 2) failures.push(`${viewport.name}: horizontal overflow by ${overflow}px`)
      if (errors.length) failures.push(`${viewport.name}: ${errors.join(' | ')}`)
      await context.close()
    }
  } finally {
    await browser.close()
  }
  if (failures.length) {
    failures.forEach((failure) => console.error(failure))
    process.exit(1)
  }
  console.log('Construction showcase passed desktop/mobile content, image, link, console and overflow checks.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

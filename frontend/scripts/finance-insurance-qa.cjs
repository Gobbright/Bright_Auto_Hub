const { chromium } = require('playwright')

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:5174'
const viewports = [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]
const failures = []

const assert = (condition, message) => { if (!condition) throw new Error(message) }

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
  let submitted = null
  await context.route('http://localhost:5000/api/**', async (route) => {
    if (route.request().method() === 'POST') submitted = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'QA finance request submitted successfully.' }) })
  })
  const page = await context.newPage()
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('requestfailed', (request) => errors.push(`Failed request: ${request.url()}`))

  try {
    await page.goto(`${baseUrl}/finance-insurance`, { waitUntil: 'networkidle' })
    assert(await page.getByRole('heading', { name: 'Finance Your Drive. Protect Every Mile.' }).isVisible(), 'Redesigned finance hero is not visible')
    assert(await page.locator('.finance-hero-image').isVisible(), 'Finance hero image is missing')
    assert(await page.locator('.finance-assurance-strip article').count() === 3, 'Three assurance highlights are not rendered')
    assert(await page.locator('.finance-service-grid > a').count() === 7, 'All seven finance categories are not rendered')
    assert(await page.locator('.finance-process-grid article').count() === 3, 'Three-step guidance section is not rendered')

    if (viewport.name === 'desktop') {
      const navEntry = page.locator('.nav-entry').filter({ hasText: 'Finance & Insurance' })
      assert(await navEntry.count() === 1, 'Finance desktop nav item is missing')
      await navEntry.hover()
      assert(await navEntry.locator('.finance-menu a').count() === 7, 'Finance desktop dropdown does not contain seven links')
    } else {
      await page.getByRole('button', { name: 'Open navigation' }).click()
      await page.getByRole('button', { name: 'Open Finance & Insurance menu' }).click()
      assert(await page.locator('.finance-menu a').count() === 7, 'Finance mobile dropdown does not contain seven links')
    }

    await page.goto(`${baseUrl}/finance-insurance/car-loan`, { waitUntil: 'networkidle' })
    assert(await page.getByText('Car Loan', { exact: true }).count() >= 2, 'Car Loan selection is not active')
    assert(await page.getByLabel('Required loan amount').isVisible(), 'Loan amount field is missing')
    assert(await page.getByLabel('Employment type').isVisible(), 'Employment field is missing')
    await page.getByLabel('Full name *').fill('QA Customer')
    await page.getByLabel('Mobile number *').fill('9876543210')
    await page.getByLabel('Email address *').fill('qa@example.com')
    await page.getByLabel('City *').fill('Chennai')
    await page.getByLabel('Vehicle / model you plan to buy *').fill('Bright Atlas')
    await page.getByLabel('Required loan amount').fill('800000')
    await page.getByLabel('Employment type').selectOption('Salaried')
    await page.locator('.finance-consent input').check()
    await page.getByRole('button', { name: 'Submit Car Loan Request' }).click()
    await page.locator('.finance-notice.success').waitFor({ state: 'visible' })
    assert(submitted?.subject === 'Car Loan enquiry', 'Loan submission payload has the wrong subject')
    assert(submitted?.source === 'finance-insurance', 'Loan submission payload has the wrong source')

    await page.goto(`${baseUrl}/finance-insurance/insurance-renewal`, { waitUntil: 'networkidle' })
    assert(await page.getByLabel('Registration number').isVisible(), 'Registration field is missing for insurance renewal')
    assert(await page.getByLabel('Current insurer').isVisible(), 'Insurer field is missing for insurance renewal')
    assert(await page.getByLabel('Current policy expiry').isVisible(), 'Policy expiry field is missing for insurance renewal')
    const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    assert(size.scroll <= size.client + 2, `Horizontal overflow: ${size.scroll}px > ${size.client}px`)
    assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`)
    console.log(`${viewport.name}: navigation, seven categories, loan submit, insurance fields and overflow passed.`)
  } catch (error) {
    failures.push(`${viewport.name}: ${error.message}`)
  } finally {
    await context.close()
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const viewport of viewports) await runViewport(browser, viewport)
  } finally {
    await browser.close()
  }
  if (failures.length) {
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exit(1)
  }
  console.log('Finance & Insurance QA passed on desktop and mobile.')
}

main().catch((error) => { console.error(error); process.exit(1) })

const { chromium } = require('playwright')

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:5174'
const failures = []

const fail = (message) => failures.push(message)
const mockSite = (kind) => ({
  page: { title: kind === 'contact' ? 'Contact Bright Auto Hub' : 'Vehicle Services', description: 'Automotive support and enquiries.' },
  vehicles: [], brands: [], parts: [], services: [], blogs: [], partCategories: [],
})

async function mockApi(context) {
  await context.route('http://localhost:5000/api/**', async (route) => {
    const url = new URL(route.request().url())
    let body = {}
    if (url.pathname === '/api/public/part-categories') body = []
    else if (url.pathname === '/api/public/locations/search') body = { results: [{ id: 'qa-chennai', label: 'Chennai, Tamil Nadu, India', shortLabel: 'Chennai', lat: 13.08, lon: 80.27, type: 'city' }] }
    else if (url.pathname.startsWith('/api/public/site/')) body = mockSite(url.pathname.split('/').pop())
    else if (url.pathname === '/api/public/auth/login') body = { user: { id: 'qa-user', name: 'QA Customer', email: 'qa@example.com', phone: '9000000000' } }
    else body = { message: 'QA request completed.' }
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) })
  })
}

async function desktopChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } })
  await mockApi(context)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(baseUrl + '/services', { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.locator('.site-header').waitFor({ state: 'visible', timeout: 10000 })
  if (await page.getByRole('link', { name: 'Search', exact: true }).count() !== 1) fail('Desktop header Search action is missing or duplicated.')
  if (await page.getByRole('link', { name: 'Enquire Now', exact: true }).count() !== 1) fail('Desktop header Enquire Now action is missing or duplicated.')
  await page.locator('.utility-location-button').click()
  if (!(await page.locator('.location-popover').isVisible())) fail('Location picker did not open.')
  await page.getByLabel('Search worldwide location').fill('Chennai')
  await page.locator('.location-popover form button').click()
  await page.locator('.location-results button').waitFor({ state: 'visible' })
  await page.locator('.location-results button').click()
  const selected = await page.evaluate(() => JSON.parse(localStorage.getItem('selectedLocation') || 'null'))
  if (selected?.shortLabel !== 'Chennai') fail('Selected location was not persisted.')
  await page.locator('.account-menu-button').click()
  if (await page.locator('.account-popover a[href="/login"]').count() !== 1 || await page.locator('.account-popover a[href="/register"]').count() !== 1) fail('Login/Register account options are missing.')
  await context.addInitScript(() => {
    localStorage.setItem('publicUserProfile', JSON.stringify({ id: 'qa-user', name: 'QA Customer', email: 'qa@example.com', phone: '9000000000' }))
    localStorage.setItem('selectedLocation', JSON.stringify({ label: 'Chennai, Tamil Nadu, India', shortLabel: 'Chennai', lat: 13.08, lon: 80.27 }))
  })
  await page.goto(baseUrl + '/contact?subject=Service+enquiry&item=Brake+Service&source=service&category=Vehicle+Care&page=%2Fservices', { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.locator('.contact-layout').waitFor({ state: 'visible', timeout: 10000 })
  if (await page.getByText('Brake Service', { exact: true }).count() < 1) fail('Contact form does not show the selected service.')
  if (await page.getByLabel('Name').getAttribute('value') !== 'QA Customer') fail('Customer name was not auto-filled.')
  if (await page.getByLabel('Email').getAttribute('value') !== 'qa@example.com') fail('Customer email was not auto-filled.')
  if (!(await page.getByText('Chennai', { exact: false }).count())) fail('Selected location is missing from enquiry context.')
  if (errors.length) fail('Desktop console errors: ' + errors.join(' | '))
  await page.screenshot({ path: 'qa-header-enquiry-desktop.png', fullPage: false })
  await context.close()
}

async function mobileChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await mockApi(context)
  const page = await context.newPage()
  await page.goto(baseUrl + '/services', { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.locator('.site-header').waitFor({ state: 'visible', timeout: 10000 })
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  if (dimensions.scrollWidth > dimensions.clientWidth + 2) fail(`Mobile page overflows horizontally (${dimensions.scrollWidth} > ${dimensions.clientWidth}).`)
  if (!(await page.locator('.utility-bar').isVisible())) fail('Mobile utility bar is hidden.')
  await page.locator('.utility-location-button').click()
  if (!(await page.locator('.location-popover').isVisible())) fail('Mobile location picker did not open.')
  await page.screenshot({ path: 'qa-header-enquiry-mobile.png', fullPage: false })
  await context.close()
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  try { await desktopChecks(browser); await mobileChecks(browser) } finally { await browser.close() }
  if (failures.length) {
    console.error(`Found ${failures.length} failure(s):`)
    failures.forEach((message) => console.error('- ' + message))
    process.exitCode = 1
  } else console.log('Header, location, account, enquiry auto-fill, and mobile overflow checks passed.')
}

main().catch((error) => { console.error(error); process.exit(1) })

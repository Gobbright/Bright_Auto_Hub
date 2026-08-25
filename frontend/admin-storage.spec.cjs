const { test, expect } = require('@playwright/test')

const openAdmin = async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem('isDashboardLoggedIn', 'true')
    localStorage.setItem('dashboardUserName', 'QA')
  })
  await page.goto('http://localhost:5173/admin')
  await expect(page).toHaveURL('http://localhost:5173/admin')
}

const openStorageUsage = async (page) => {
  const storageParent = page.locator('.nav-tree > button[data-label="Storage"]')
  if ((await storageParent.getAttribute('aria-expanded')) !== 'true') await storageParent.click()
  await page.locator('.nav-submenu button[data-label="Storage & Collections"]').click()
  await expect(page.getByRole('heading', { name: 'Storage & Collections' })).toBeVisible()
}

test('desktop Storage & Collections shows all metrics without console errors', async ({ page }) => {
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await openAdmin(page)
  await openStorageUsage(page)
  await expect(page.locator('.storage-usage-cards article')).toHaveCount(6)
  await expect(page.locator('.asset-usage-grid article')).toHaveCount(3)
  expect(await page.locator('.database-breakdown tbody tr').count()).toBeGreaterThan(0)
  expect(errors).toEqual([])
})

test('mobile Storage & Collections remains accessible and responsive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openAdmin(page)
  await page.getByRole('button', { name: 'Open menu' }).click()
  await openStorageUsage(page)
  await expect(page.locator('.storage-usage-cards article')).toHaveCount(6)
  await expect(page.locator('.asset-usage-grid article')).toHaveCount(3)
})

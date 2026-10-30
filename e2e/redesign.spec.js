import { expect, test } from '@playwright/test'

async function openNavigation(page) {
  await expect(page.locator('.site-header')).toBeVisible()
  const toggle = page.locator('.mobile-menu-toggle')
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'false') {
    await toggle.click()
  }
}

test('grouped navigation supports keyboard dismissal and closes after navigation', async ({ page }) => {
  await page.goto('/')
  await openNavigation(page)
  const city = page.getByRole('button', { name: 'City info', exact: true })
  await city.focus()
  await page.keyboard.press('Enter')
  await expect(city).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Tab')
  await expect(page.locator('#nav-city').getByRole('link', { name: 'Barangays', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(city).toBeFocused()
  await expect(page.locator('#nav-city')).toBeHidden()
  await city.click()
  await page.locator('#nav-city').getByRole('link', { name: 'Barangays', exact: true }).click()
  await expect(page).toHaveURL(/\/barangays$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Barangays' })).toBeVisible()
  await expect(page.locator('#nav-city')).toBeHidden()
  if (await page.locator('.mobile-menu-toggle').isVisible()) {
    await expect(page.locator('.mobile-menu-toggle')).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('.navigation-panel')).toBeHidden()
  }
})

test('assistant retains its opener and handles an unavailable API in dark system settings', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.route('**/api/chat', route => route.fulfill({
    status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Service unavailable' }),
  }))
  await page.goto('/')
  await openNavigation(page)
  const opener = page.getByRole('button', { name: 'Ask the assistant', exact: true })
  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').fill('How do I prepare for my first job?')
  await dialog.getByRole('button', { name: 'Send question', exact: true }).click()
  await expect(dialog.getByRole('alert')).toBeVisible()
  await expect(dialog.getByRole('alert')).toHaveCSS('color', 'rgb(198, 40, 40)')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeVisible()
  await expect(opener).toBeFocused()
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light')
})

test('install availability survives client-side navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true })
    event.prompt = () => Promise.resolve()
    event.userChoice = Promise.resolve({ outcome: 'dismissed' })
    window.dispatchEvent(event)
  })
  await openNavigation(page)
  await expect(page.locator('.install-app-button')).toBeVisible()
  await page.locator('.navigation-links').getByRole('link', { name: 'Services', exact: true }).click()
  await expect(page).toHaveURL(/\/services$/)
  if (await page.locator('.mobile-menu-toggle').isVisible()) {
    await expect(page.locator('.mobile-menu-toggle')).toHaveAttribute('aria-expanded', 'false')
  }
  await openNavigation(page)
  await expect(page.locator('.install-app-button')).toBeVisible()
  await page.locator('.install-app-button').click()
  await expect(page.locator('.install-app-button')).toHaveCount(0)
})

test('mobile menu restores focus and closes when switching to desktop', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const toggle = page.locator('.mobile-menu-toggle')
  await toggle.click()
  await page.locator('.navigation-links').getByRole('link', { name: 'Goals', exact: true }).focus()
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
  await expect(page.locator('.navigation-panel')).toBeHidden()
  await toggle.click()
  await page.mouse.click(2, 800)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(toggle).toBeHidden()
  await expect(page.locator('.navigation-panel')).toBeVisible()
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('.navigation-panel')).toBeHidden()
})

test('directory, service, form and table layouts fit desktop, tablet and small phones', async ({ page }) => {
  test.setTimeout(60000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const width of [320, 768, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/services', '/services/central-911', '/goals', '/budget', '/status', '/login']) {
      await page.goto(route)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} overflows at ${width}px`).toBe(true)
    }
  }
  expect(errors).toEqual([])
})

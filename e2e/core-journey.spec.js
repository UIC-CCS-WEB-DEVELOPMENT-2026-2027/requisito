import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
})

test('first-job checklist personalizes, persists, and links to guidance', async ({ page }) => {
  await page.getByRole('link', { name: /choose a goal/i }).click()

  const firstJobCard = page.locator('.goal-card').filter({ hasText: 'First Job' }).first()
  await firstJobCard.getByRole('link', { name: /view requirements/i }).click()
  await page.getByRole('link', { name: "Start this goal's checklist" }).click()

  await page.locator('#checklist-hasEmploymentRelationship').selectOption('yes')
  await page.locator('#checklist-employerRequestedBirthCertificate').selectOption('no')
  await page.locator('#checklist-employerRequestedTin').selectOption('yes')
  await page.locator('#checklist-needsClearance').selectOption('yes')

  await expect(page.getByText(/Some details may need confirmation/)).toBeVisible()
  await page.locator('#checklist-item-3 .requirement-source-details > summary').click()
  await expect(page.locator('#checklist-item-3')).toContainText('Never verified')
  await expect(page.locator('#checklist-item-1')).toHaveCount(0)
  await expect(page.locator('#checklist-item-2')).toBeVisible()
  await expect(page.locator('.checklist-readiness')).toContainText('Needs verification')
  await expect(page.locator('#checklist-item-2').getByRole('link', {
    name: 'Open the BIR ORUS portal',
  })).toHaveAttribute('href', 'https://orus.bir.gov.ph/')
  await expect(page.locator('#checklist-item-6')).toBeVisible()
  await expect(page.locator('#checklist-item-6').getByRole('link', {
    name: 'Open the official NBI Clearance portal',
  })).toHaveAttribute('href', 'https://clearance.nbi.gov.ph/')

  await page.locator('#checklist-item-3').getByLabel('Your progress').selectOption('ready')
  await expect(page.getByText('1 ready of 5 applicable requirements')).toBeVisible()
  await page.reload()

  await expect(page.locator('#checklist-hasEmploymentRelationship')).toHaveValue('yes')
  await expect(page.locator('#checklist-employerRequestedTin')).toHaveValue('yes')
  await expect(page.locator('#checklist-item-3').getByLabel('Your progress')).toHaveValue('ready')

  await page.locator('#checklist-item-3').getByRole('link', { name: /how to obtain this item/i }).click()
  await expect(page.getByRole('heading', { name: 'SSS number' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open the official SSS application' }))
    .toHaveAttribute('href', /^https:\/\/member\.sss\.gov\.ph\//)

  await page.getByRole('link', { name: /return to this goal's checklist/i }).click()
  await page.goto('/goals')
  const resumedCard = page.locator('.goal-card').filter({ hasText: 'First Job' }).first()
  await expect(resumedCard.locator('.goal-card-steps-count').first()).toContainText('5')
  await expect(resumedCard.locator('.goal-progress-value')).toHaveText('In progress')
})

test('demo goals keep their checklist and disclose uncertainty', async ({ page }) => {
  await page.goto('/goals')
  const passportCard = page.locator('.goal-card').filter({ hasText: 'Passport' }).first()
  await passportCard.getByRole('link', { name: /view requirements/i }).click()
  await page.getByRole('link', { name: /start this goal.s checklist/i }).click()

  await expect(page.locator('.requirement-card')).not.toHaveCount(0)
  await expect(page.locator('.checklist-readiness')).toHaveCount(0)
  await expect(page.locator('.disclaimer-banner')).toContainText('MVP')
})

test('keyboard skip link works and the layout fits the selected viewport', async ({ page }) => {
  await page.getByRole('link', { name: 'Requisito', exact: true }).focus()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main#main-content')).toBeFocused()

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/checklist?goal=1']) {
      await page.goto(route)
      await expect(page.locator('nav.site-nav')).toBeVisible()
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      )
      expect(hasHorizontalOverflow, `horizontal overflow at ${width}px on ${route}`).toBe(false)
    }
  }
})

test('browser back and forward navigation preserves the selected checklist route', async ({ page }) => {
  await page.goto('/goals')
  const firstJobCard = page.locator('.goal-card').filter({ hasText: 'First Job' }).first()
  await firstJobCard.getByRole('link', { name: /view requirements/i }).click()
  await expect(page).toHaveURL(/\/goals\/first-job$/)
  await page.getByRole('link', { name: "Start this goal's checklist" }).click()
  await expect(page).toHaveURL(/\/checklist\?goal=1$/)

  await page.goBack()
  await expect(page).toHaveURL(/\/goals\/first-job$/)
  await page.goForward()
  await expect(page).toHaveURL(/\/checklist\?goal=1$/)
  await expect(page.getByRole('heading', { name: 'Checklist' })).toBeVisible()
})

test('language selection updates the page language and survives reload', async ({ page }) => {
  await page.locator('#language-select').selectOption('fil')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil')
  await expect(page.getByRole('link', { name: /Pumili ng layunin/i })).toBeVisible()

  await page.reload()
  await expect(page.locator('#language-select')).toHaveValue('fil')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil')
})

test('browser storage failures are explained while current edits remain visible', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Storage is disabled.', 'SecurityError')
    }
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage is disabled.', 'SecurityError')
    }
  })
  await page.goto('/checklist?goal=1')

  await expect(page.getByText(/Browser storage could not be read or updated/i)).toBeVisible()
  await page.locator('#checklist-item-3').getByLabel('Your progress').selectOption('in-progress')
  await expect(page.locator('#checklist-item-3').getByLabel('Your progress')).toHaveValue('in-progress')
  await expect(page.getByText(/Browser storage could not be read or updated/i)).toBeVisible()
})

test('goal categories survive language changes and official links stay safe', async ({ page }) => {
  await page.goto('/goals')
  await page.locator('#goal-category').selectOption('Identity and travel')
  for (const language of ['fil', 'ceb', 'en']) {
    await page.locator('#language-select').selectOption(language)
    await expect(page.locator('html')).toHaveAttribute('lang', language)
    await expect(page.locator('.goal-card')).toHaveCount(1)
    await expect(page.locator('#goal-category')).toHaveValue('Identity and travel')
  }
  await page.goto('/checklist?goal=1')
  await page.locator('#checklist-item-3 .requirement-source-details > summary').click()
  const source = page.locator('#checklist-item-3 a[href="https://www.sss.gov.ph/employees/"]')
  await expect(source).toBeVisible()
  await expect(source).toHaveAttribute('target', '_blank')
  await expect(source).toHaveAttribute('rel', 'noopener noreferrer')
  await page.locator('#checklist-item-3').getByLabel('Your progress').selectOption('not-applicable')
  await expect(page.locator('.checklist-progress')).toContainText('1 marked not applicable')
  await page.reload()
  await expect(page.locator('#checklist-item-3').getByLabel('Your progress')).toHaveValue('not-applicable')
})

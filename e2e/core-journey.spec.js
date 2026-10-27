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
  await page.getByRole('link', { name: 'Requisito Davao City', exact: true }).focus()
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

test('Davao home search and civic directory cards navigate to working routes', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Explore Davao City' })).toBeVisible()
  await expect(page.locator('.home-resource-card')).toHaveCount(7)
  await expect(page.locator('.home-hero')).toHaveCSS('background-image', /linear-gradient/)

  await page.getByLabel('Search Davao City information')
    .fill('passport')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/\/search\?q=passport$/)
  await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible()
})

test('service directory filters official Davao links by category and search terms', async ({ page }) => {
  await page.goto('/services')
  await expect(page.getByRole('heading', { name: 'Browse services by category' })).toBeVisible()

  await page.locator('.service-category-card').filter({ hasText: 'Taxes and Payments' }).click()
  await expect(page.locator('#services-category')).toHaveValue('Taxes and Payments')
  await page.locator('#services-search').fill('buwis')

  const cedulaCard = page.locator('.portal-card').filter({ hasText: 'Online Cedula Application' })
  await expect(cedulaCard).toBeVisible()
  await expect(cedulaCard.getByRole('link', { name: 'Open listed service' }))
    .toHaveAttribute('href', 'https://cedula.davaocity.gov.ph/')
  await expect(cedulaCard).toContainText('Not yet verified')
  await expect(page.locator('.portal-card').filter({ hasText: 'Online Professional Tax Receipt System' })).toHaveCount(0)
})

test('help, quiz, accessibility, contact, and sitemap features work without claiming government actions', async ({ page }) => {
  await page.goto('/help')
  const approvalQuestion = page.getByText('Does marking a requirement done mean the government approved it?', { exact: true })
  await approvalQuestion.click()
  await expect(page.locator('.help-faq details').filter({ hasText: 'Does marking a requirement done mean the government approved it?' }))
    .toContainText('It records only your preparation progress')

  await page.goto('/quiz')
  await page.getByLabel('Choose a predefined goal in Requisito.').check()
  await page.getByLabel('To tailor requirements to relevant circumstances.').check()
  await page.getByLabel('You are tracking your own preparation progress.').check()
  await page.getByLabel('Open the source and confirm its current instructions for your situation.').check()
  await page.getByRole('button', { name: 'Check my answers' }).click()
  await expect(page.getByRole('heading', { name: 'Score: 4 of 4' })).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('button', { name: 'Check my answers' })).toBeVisible()

  await page.goto('/accessibility')
  await expect(page.getByText(/has not been independently certified against WCAG/i)).toBeVisible()
  await page.getByRole('link', { name: 'Report an accessibility barrier' }).click()
  await expect(page).toHaveURL(/\/contribute/)

  await page.goto('/contact')
  await expect(page.getByRole('link', { name: 'Send a message' }))
    .toHaveAttribute('href', 'https://davaocity.gov.ph/contact-us/')
  await expect(page.getByText('Requisito does not receive or forward your message.')).toBeVisible()

  await page.goto('/sitemap')
  await page.getByRole('region', { name: 'Explore' }).getByRole('link', { name: 'Requisito readiness quiz' }).click()
  await expect(page).toHaveURL(/\/quiz$/)
})

test('live Davao information attributes third-party weather and indicative exchange rates', async ({ page }) => {
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      current: {
        temperature_2m: 30.1,
        apparent_temperature: 35,
        relative_humidity_2m: 70,
        weather_code: 2,
        wind_speed_10m: 8.5,
        time: '2026-10-27T15:30',
      },
    }),
  }))
  await page.route('https://open.er-api.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      result: 'success',
      base_code: 'USD',
      rates: { PHP: 63.96 },
      time_last_update_utc: 'Tue, 27 Oct 2026 00:02:31 +0000',
    }),
  }))
  await page.goto('/live')

  await expect(page.getByText('Partly cloudy')).toBeVisible()
  await expect(page.getByText('70%')).toBeVisible()
  await expect(page.getByText(/63\.96/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(page.getByRole('link', { name: 'ExchangeRate-API' })).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(page.getByText(/third-party model information/i)).toBeVisible()
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

import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { requisitoQuizQuestions, scoreRequisitoQuiz } from '../utils/requisitoQuiz.js'

test('Davao public-information parity pages render usable help, quiz, accessibility, and sitemap content', async (t) => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })
  t.after(() => vite.close())

  const [
    { default: Help },
    { default: Quiz },
    { default: AccessibilityPage },
    { default: Sitemap },
    { default: FeaturePage },
    { default: GovernmentLocations },
    { LanguageProvider },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/pages/Help.jsx'),
    vite.ssrLoadModule('/src/pages/Quiz.jsx'),
    vite.ssrLoadModule('/src/pages/AccessibilityPage.jsx'),
    vite.ssrLoadModule('/src/pages/Sitemap.jsx'),
    vite.ssrLoadModule('/src/pages/FeaturePage.jsx'),
    vite.ssrLoadModule('/src/components/GovernmentLocations.jsx'),
    vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'),
  ])
  const render = (Page, props = {}) => renderToStaticMarkup(
    createElement(MemoryRouter, null,
      createElement(LanguageProvider, null, createElement(Page, props)),
    ),
  )

  const helpHtml = render(Help)
  const quizHtml = render(Quiz)
  const accessibilityHtml = render(AccessibilityPage)
  const sitemapHtml = render(Sitemap)
  const contactHtml = render(FeaturePage, { feature: 'contact' })
  const locationsHtml = render(GovernmentLocations)
  const legislationHtml = render(FeaturePage, { feature: 'legislation' })
  const publicRecordsHtml = render(FeaturePage, { feature: 'publicRecords' })

  assert.match(helpHtml, /Does marking a requirement done mean the government approved it\?/)
  assert.match(helpHtml, /No\. It records only your preparation progress/)
  assert.match(helpHtml, /href="\/goals"/)
  assert.match(helpHtml, /href="\/status"/)

  assert.equal(requisitoQuizQuestions.length, 4)
  assert.match(quizHtml, /name="goal"/)
  assert.match(quizHtml, /name="completion"/)
  assert.match(quizHtml, /required=""/)
  assert.equal(scoreRequisitoQuiz({ goal: 0, questions: 1, completion: 2, sources: 1 }), 4)
  assert.equal(scoreRequisitoQuiz({ goal: 0, questions: 0, completion: 2, sources: 1 }), 3)

  assert.match(accessibilityHtml, /has not been independently certified against WCAG/)
  assert.match(accessibilityHtml, /Some external sites, documents, and embedded services/)
  assert.match(accessibilityHtml, /href="\/contribute"/)

  assert.match(sitemapHtml, /href="\/quiz"/)
  assert.match(sitemapHtml, /href="\/services"/)
  assert.doesNotMatch(sitemapHtml, /href="\/goals\/first-job"/)

  assert.match(contactHtml, /https:\/\/davaocity\.gov\.ph\/contact-us\//)
  assert.match(contactHtml, /Requisito does not receive or forward your message/)
  assert.doesNotMatch(contactHtml, /disabled/)

  assert.match(locationsHtml, /id="map-title"/)
  assert.match(locationsHtml, /id="map-search"/)
  assert.match(locationsHtml, /id="map-category"/)
  assert.match(locationsHtml, /href="https:\/\/www\.google\.com\/maps\/search\//)
  assert.match(locationsHtml, /This address has not completed Requisito&#x27;s verification review/)
  assert.match(legislationHtml, /Davao City transparency portal/)
  assert.match(legislationHtml, /href="https:\/\/davaocity\.gov\.ph\/transparency\//)
  assert.match(publicRecordsHtml, /City transparency forms and reports/)
  assert.match(publicRecordsHtml, /href="https:\/\/davaocity\.gov\.ph\/transparency\/forms-and-reports\//)
})

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
    { default: Home },
    { default: Quiz },
    { default: AccessibilityPage },
    { default: Sitemap },
    { default: ErrorStatus },
    { default: FeaturePage },
    { default: Search },
    { default: Footer },
    { default: GovernmentLocations },
    { default: Updates },
    { LanguageProvider },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/pages/Help.jsx'),
    vite.ssrLoadModule('/src/pages/Home.jsx'),
    vite.ssrLoadModule('/src/pages/Quiz.jsx'),
    vite.ssrLoadModule('/src/pages/AccessibilityPage.jsx'),
    vite.ssrLoadModule('/src/pages/Sitemap.jsx'),
    vite.ssrLoadModule('/src/pages/ErrorStatus.jsx'),
    vite.ssrLoadModule('/src/pages/FeaturePage.jsx'),
    vite.ssrLoadModule('/src/pages/Search.jsx'),
    vite.ssrLoadModule('/src/components/Footer.jsx'),
    vite.ssrLoadModule('/src/components/GovernmentLocations.jsx'),
    vite.ssrLoadModule('/src/pages/Updates.jsx'),
    vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'),
  ])
  const render = (Page, props = {}, initialEntries = ['/']) => renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries },
      createElement(LanguageProvider, null, createElement(Page, props)),
    ),
  )

  const helpHtml = render(Help)
  const homeHtml = render(Home)
  const quizHtml = render(Quiz)
  const accessibilityHtml = render(AccessibilityPage)
  const sitemapHtml = render(Sitemap)
  const forbiddenHtml = render(ErrorStatus, { feature: 'forbidden' })
  const serverErrorHtml = render(ErrorStatus, { feature: 'serverError' })
  const searchHtml = render(Search, {}, ['/search?q=central%20911'])
  const footerHtml = render(Footer)
  const contactHtml = render(FeaturePage, { feature: 'contact' })
  const locationsHtml = render(GovernmentLocations)
  const legislationHtml = render(FeaturePage, { feature: 'legislation' })
  const publicRecordsHtml = render(FeaturePage, { feature: 'publicRecords' })
  const toolsHtml = render(FeaturePage, { feature: 'communityTools' })
  const eventsHtml = render(FeaturePage, { feature: 'calendar' })
  const mobilityHtml = render(FeaturePage, { feature: 'mobility' })
  const heritageHtml = render(FeaturePage, { feature: 'heritage' })
  const tourismHtml = render(FeaturePage, { feature: 'tourism' })
  const civicReportsHtml = render(FeaturePage, { feature: 'civicReports' })
  const updatesHtml = render(Updates)

  assert.match(helpHtml, /Does marking a requirement done mean the government approved it\?/)
  assert.match(helpHtml, /No\. It records only your preparation progress/)
  assert.match(helpHtml, /href="\/goals"/)
  assert.match(helpHtml, /href="\/status"/)
  assert.match(homeHtml, /list="home-search-suggestions"/)
  assert.match(homeHtml, /value="Central 911"/)

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
  assert.match(searchHtml, /list="portal-search-suggestions"/)
  assert.match(searchHtml, /id="portal-search-suggestions"/)
  assert.match(searchHtml, /value="Central 911"/)
  assert.match(forbiddenHtml, /403/)
  assert.match(forbiddenHtml, /Access is not available/)
  assert.match(forbiddenHtml, /href="\/"/)
  assert.match(serverErrorHtml, /500/)
  assert.match(serverErrorHtml, /This page could not be loaded/)
  assert.match(footerHtml, /href="https:\/\/bettersolano\.org\/"/)
  assert.match(footerHtml, /Ramon Logan Jr\./)
  assert.match(footerHtml, /href="https:\/\/github\.com\/BetterSolano\/bettersolano\/blob\/main\/LICENSE"/)

  assert.match(contactHtml, /https:\/\/davaocity\.gov\.ph\/contact-us\//)
  assert.match(contactHtml, /Requisito does not receive or forward your message/)
  assert.doesNotMatch(contactHtml, /disabled/)

  assert.match(locationsHtml, /id="map-title"/)
  assert.match(locationsHtml, /id="map-search"/)
  assert.match(locationsHtml, /id="map-category"/)
  assert.match(locationsHtml, /href="https:\/\/www\.google\.com\/maps\/search\//)
  assert.match(locationsHtml, /This address has not completed Requisito&#x27;s verification review/)
  assert.match(legislationHtml, /Davao City transparency portal/)
  assert.match(legislationHtml, /id="legislation-search"/)
  assert.match(legislationHtml, /\d+ indexed records/)
  assert.match(legislationHtml, /The Preemptive and Emergency Evacuation Ordinance of Davao City/)
  assert.match(legislationHtml, /href="https:\/\/davaocity\.gov\.ph\/transparency\//)
  assert.match(publicRecordsHtml, /City transparency forms and reports/)
  assert.match(publicRecordsHtml, /href="https:\/\/davaocity\.gov\.ph\/transparency\/forms-and-reports\//)
  assert.match(publicRecordsHtml, /Davao City Citizen&#x27;s Charter Handbook/)
  assert.match(publicRecordsHtml, /Never verified/)
  assert.match(toolsHtml, /Online Business Permit and Licensing System/)
  assert.match(toolsHtml, /href="https:\/\/appbts\.davaocity\.gov\.ph\//)
  assert.match(toolsHtml, /Davao City Reports App/)
  assert.match(eventsHtml, /Pasko Fiesta All Over the City 2026/)
  assert.match(eventsHtml, /Registration is open through November 30, 2026/)
  assert.match(mobilityHtml, /Davao City Transport Roadmap/)
  assert.match(mobilityHtml, /not a current jeepney route list/)
  assert.match(heritageHtml, /Museo Dabawenyo/)
  assert.match(tourismHtml, /KAGIKAN: The Kadayawan Cultural Village/)
  assert.match(civicReportsHtml, /href="https:\/\/reports\.davaocity\.gov\.ph\//)
  assert.match(civicReportsHtml, /Review the notice before submitting/)
  assert.doesNotMatch(civicReportsHtml, /No reviewed civic reports are available/)
  assert.match(updatesHtml, /Pasko Fiesta All Over the City 2026/)
})

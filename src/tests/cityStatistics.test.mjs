import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { getCityStatistics } from '../utils/cityStatistics.js'
import { civicSourceDirectories } from '../data/civicSourceDirectories.js'

const cityFacts = JSON.parse(await readFile(new URL('../data/cityFacts.json', import.meta.url), 'utf8'))
const barangays = JSON.parse(await readFile(new URL('../data/barangays.json', import.meta.url), 'utf8'))

test('statistics use only source-linked facts and existing barangay catalog counts', () => {
  const statistics = getCityStatistics(cityFacts, barangays)

  assert.deepEqual(statistics.population.map(({ value }) => value), [1776949, 80538])
  assert.equal(statistics.population.every((item) =>
    item.verification === 'unverified' && item.sourceUrl.startsWith('https://psa.gov.ph/')), true)
  assert.equal(statistics.barangayEntriesByDistrict.reduce((sum, item) => sum + item.value, 0), barangays.length)
  assert.equal(statistics.barangayEntriesByDistrict.every((item) =>
    item.verification === 'unverified' &&
    item.sourceUrls.every((url) => url.startsWith('https://psa.gov.ph/'))), true)
})

test('civic directory additions link to official council and DPWH pages without inventing appointment services', () => {
  const council = civicSourceDirectories.legislation.find((source) => source.id === 'city-council')
  const resolutions = civicSourceDirectories.legislation.find((source) => source.id === 'city-resolutions')
  const dpwh = civicSourceDirectories.procurement.find((source) => source.id === 'dpwh-projects')

  assert.equal(council.url, 'https://davaocity.gov.ph/know-davao-city/21st-city-council/')
  assert.equal(resolutions.url, 'https://davaocity.gov.ph/transparency/resolution/')
  assert.equal(dpwh.url, 'https://www.dpwh.gov.ph/dpwh/projects')
  assert.equal([council, resolutions, dpwh].every((source) => source.url.startsWith('https://')), true)
  assert.equal(civicSourceDirectories.government.some((source) => /appointment/iu.test(source.url)), false)
})

test('statistics and weather map render source links and an honest weather fallback', async (t) => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })
  t.after(() => vite.close())

  const [
    { default: CityStatistics },
    { default: DavaoWeatherMap },
    { LanguageProvider },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/components/CityStatistics.jsx'),
    vite.ssrLoadModule('/src/components/DavaoWeatherMap.jsx'),
    vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'),
  ])
  const render = (component) => renderToStaticMarkup(
    createElement(LanguageProvider, null, component),
  )

  const statisticsHtml = render(createElement(CityStatistics))
  assert.match(statisticsHtml, /role="img"/)
  assert.match(statisticsHtml, /Unverified/)
  assert.match(statisticsHtml, /https:\/\/psa\.gov\.ph\//)
  assert.match(statisticsHtml, /not a verified population or official district count/i)

  const weatherHtml = render(createElement(DavaoWeatherMap, {
    weather: null,
    weatherStatus: 'error',
  }))
  assert.match(weatherHtml, /role="region" aria-label="Interactive OpenStreetMap centered on Davao City"/)
  assert.match(weatherHtml, /Live weather is unavailable/)
  assert.match(weatherHtml, /Map data: © <a href="https:\/\/www\.openstreetmap\.org\/copyright"/)
  assert.match(weatherHtml, /contributors\./)
  assert.match(weatherHtml, /href="https:\/\/www\.openstreetmap\.org\/copyright"/)
  assert.doesNotMatch(weatherHtml, /href="https:\/\/open-meteo\.com\/"/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

test('service cards and details render safe Maps actions and honest unavailable states', async (t) => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })
  t.after(() => vite.close())

  const [
    { default: ServiceCard },
    { default: ServiceDetail },
    { default: Services },
    { LanguageProvider },
    { getServices },
  ] = await Promise.all([
      vite.ssrLoadModule('/src/components/ServiceCard.jsx'),
      vite.ssrLoadModule('/src/pages/ServiceDetail.jsx'),
      vite.ssrLoadModule('/src/pages/Services.jsx'),
      vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'),
      vite.ssrLoadModule('/src/data/helpers.js'),
    ])

  function renderCard(service) {
    return renderToStaticMarkup(
      createElement(MemoryRouter, null,
        createElement(LanguageProvider, null,
          createElement('ul', null, createElement(ServiceCard, { service })),
        ),
      ),
    )
  }

  function renderDetail(path) {
    return renderToStaticMarkup(
      createElement(MemoryRouter, { initialEntries: [path] },
        createElement(LanguageProvider, null,
          createElement(Routes, null,
            createElement(Route, { path: '/services/:slug', element: createElement(ServiceDetail) }),
          ),
        ),
      ),
    )
  }

  function renderServicesPage() {
    return renderToStaticMarkup(
      createElement(MemoryRouter, null,
        createElement(LanguageProvider, null, createElement(Services)),
      ),
    )
  }

  const services = getServices()
  const central911 = services.find((service) => service.slug === 'central-911')
  const onlineService = services.find((service) => service.onlineUrl)
  const noAddress = services.find((service) => service.slug === 'davao-city-contact-center')
  assert.ok(onlineService, 'expected at least one service with an online service link')
  const servicesHtml = renderServicesPage()
  const cardHtml = renderCard(central911)
  const onlineCardHtml = renderCard(onlineService)
  const unavailableCardHtml = renderCard(noAddress)
  const appCss = await readFile(new URL('../App.css', import.meta.url), 'utf8')

  assert.match(servicesHtml, /id="services-title"/)
  assert.match(servicesHtml, /id="services-search"/)
  assert.match(servicesHtml, /id="services-category"/)
  assert.match(servicesHtml, /id="services-sort"/)
  assert.match(servicesHtml, /Browse services by category/)
  assert.match(servicesHtml, /role="group" aria-label="Service categories"/)
  assert.doesNotMatch(servicesHtml, /<nav[^>]*aria-label="Service categories"/)
  assert.match(servicesHtml, /aria-label="Building and Construction, 1 service"/)
  assert.match(servicesHtml, /Taxes and Payments/)
  assert.match(onlineCardHtml, /aria-label="Open listed service: .+ \(opens in a new tab\)"/)
  assert.match(cardHtml, /aria-label="View Maps \(opens in a new tab\)"/)
  assert.match(cardHtml, /aria-label="Get directions to this location \(opens in a new tab\)"/)
  assert.match(servicesHtml, /href="https:\/\/appbts\.davaocity\.gov\.ph\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/)
  assert.match(servicesHtml, /href="\/services\/central-911"[^>]*>Central 911<\/a>/)
  assert.match(servicesHtml, /query=Central\+911%2C\+Daang\+Patnubay/)
  assert.equal((servicesHtml.match(/>View Maps<\/a>/g) ?? []).length, 4)
  assert.equal((servicesHtml.match(/>Get directions to this location<\/a>/g) ?? []).length, 4)
  assert.match(servicesHtml, /query=Business\+Bureau%2C\+Ground\+Floor/)
  assert.match(servicesHtml, /Location is not listed or is not a usable address/)
  assert.match(appCss, /\.service-map-actions\s*\{[^}]*flex-wrap:\s*wrap/s)
  assert.match(appCss, /\.service-map-actions a\s*\{[^}]*min-height:\s*44px/s)
  assert.match(appCss, /\.service-map-actions a:focus-visible\s*\{/)

  assert.match(cardHtml, /<a href="\/services\/central-911"[^>]*>Central 911<\/a>/)
  assert.match(cardHtml, /View Maps/)
  assert.match(cardHtml, /Get directions to this location/)
  assert.match(cardHtml, /query=Central\+911%2C\+Daang\+Patnubay/)
  assert.match(cardHtml, /destination=Central\+911%2C\+Daang\+Patnubay/)
  assert.match(cardHtml, /rel="noopener noreferrer"/)
  assert.match(cardHtml, /This address has not completed Requisito&#x27;s verification review/)
  assert.ok(cardHtml.indexOf('</a></h2>') < cardHtml.indexOf('class="service-map-actions"'))
  assert.match(unavailableCardHtml, /Location is not listed or is not a usable address/)
  assert.doesNotMatch(unavailableCardHtml, /google\.com\/maps/)

  const detailHtml = renderDetail('/services/central-911')
  const unavailableDetailHtml = renderDetail('/services/davao-city-contact-center')
  assert.match(detailHtml, /View Maps/)
  assert.match(detailHtml, /Get directions to this location/)
  assert.match(unavailableDetailHtml, /Location is not listed or is not a usable address/)
  assert.doesNotMatch(unavailableDetailHtml, /google\.com\/maps/)

  const permitDetail = renderDetail('/services/occupational-permit')
  const birthCertificateDetail = renderDetail('/services/psa-birth-certificate-copy')
  const marriageLicenseDetail = renderDetail('/services/marriage-license')
  const buildingPermitDetail = renderDetail('/services/online-building-permit-system')
  assert.match(permitDetail, /Open listed service/)
  assert.match(permitDetail, /office-maintenance notice/)
  assert.match(permitDetail, /Never verified/)
  assert.match(permitDetail, /https:\/\/occupationalpermit\.davaocity\.gov\.ph\//)
  assert.match(birthCertificateDetail, /₱365/)
  assert.match(birthCertificateDetail, /₱255/)
  assert.match(birthCertificateDetail, /not a PSA-government fee schedule/)
  assert.match(birthCertificateDetail, /2023-03-01/)
  assert.match(birthCertificateDetail, /https:\/\/psahelpline\.ph\/faq/)
  assert.match(birthCertificateDetail, /Never verified/)
  assert.match(marriageLicenseDetail, /₱300/)
  assert.match(marriageLicenseDetail, /₱200/)
  assert.match(marriageLicenseDetail, /₱250/)
  assert.match(marriageLicenseDetail, /parental consent/i)
  assert.match(buildingPermitDetail, /No fee amount was stated in the reviewed source/)
})

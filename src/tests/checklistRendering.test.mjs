import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

async function loadPages(t) {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })
  t.after(() => vite.close())

  const [
    { default: Checklist },
    { default: DisclaimerBanner },
    { default: DocumentGuide },
    { default: Documents },
    { default: GoalDetail },
    { default: Goals },
    { default: RequirementSourceCard },
    { default: Search },
    { LanguageProvider },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/pages/Checklist.jsx'),
    vite.ssrLoadModule('/src/components/DisclaimerBanner.jsx'),
    vite.ssrLoadModule('/src/pages/DocumentGuide.jsx'),
    vite.ssrLoadModule('/src/pages/Documents.jsx'),
    vite.ssrLoadModule('/src/pages/GoalDetail.jsx'),
    vite.ssrLoadModule('/src/pages/Goals.jsx'),
    vite.ssrLoadModule('/src/components/RequirementSourceCard.jsx'),
    vite.ssrLoadModule('/src/pages/Search.jsx'),
    vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'),
  ])
  return { Checklist, DisclaimerBanner, DocumentGuide, Documents, GoalDetail, Goals, RequirementSourceCard, Search, LanguageProvider }
}

function renderRoute(Component, LanguageProvider, path, routePath) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [path] },
      createElement(LanguageProvider, null,
        createElement(Routes, null,
          createElement(Route, { path: routePath, element: createElement(Component) }),
        ),
      ),
    ),
  )
}

test('health-card checklist renders dated-source uncertainty and conditional questions', async (t) => {
  const { Checklist, LanguageProvider } = await loadPages(t)
  const html = renderRoute(Checklist, LanguageProvider, '/checklist?goal=7', '/checklist')

  assert.match(html, /published in January 2026/)
  assert.match(html, /list order is not an official processing sequence/)
  assert.match(html, /Will you work in Davao City\?/)
  assert.match(html, /<option value="" selected="">Not sure — keep the conditional item listed<\/option>/)
  assert.match(html, /Does your work involve the food industry\?/)
  assert.match(html, /Does your occupation involve exchanging body fluids/)
  assert.match(html, /Food safety seminar certificate/)
  assert.match(html, /Conditional in the January 2026 city notice/)
  assert.match(html, /Hepatitis B antibody test/)
  assert.match(html, /href="\/services\/city-health-office"/)
  assert.match(html, /Some details may need confirmation\. Check the linked agency source/)
  assert.doesNotMatch(html, /Never verified/)

  const passportHtml = renderRoute(Checklist, LanguageProvider, '/checklist?goal=2', '/checklist')
  assert.match(passportHtml, /Philippine Passport/)
  assert.match(passportHtml, /Are you asking about your first passport application or a renewal\?/)
  assert.doesNotMatch(passportHtml, /MVP demonstration content/)
  assert.match(passportHtml, /Confirm your passport application type/)
  assert.match(passportHtml, /href="\/documents\/passport-application-type\?goal=2&amp;from=checklist"/)
  assert.match(passportHtml, /href="https:\/\/consular\.dfa\.gov\.ph\//)
})

test('unknown and malformed goal links show a safe browse-goals empty state', async (t) => {
  const { Checklist, LanguageProvider } = await loadPages(t)
  for (const path of ['/checklist?goal=999', '/checklist?goal=not-a-number']) {
    const html = renderRoute(Checklist, LanguageProvider, path, '/checklist')
    assert.match(html, /No sourced checklist is available for this goal yet/)
    assert.match(html, /href="\/goals"[^>]*>Browse goals<\/a>/)
    assert.doesNotMatch(html, /First Job|Davao City Health Card|0 ready of/)
  }
})

test('every public goal has an available checklist and localized action links', async (t) => {
  const { Goals, LanguageProvider } = await loadPages(t)
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: { getItem: () => null } },
  })
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow)
    else delete globalThis.window
  })
  const html = renderRoute(Goals, LanguageProvider, '/goals', '/goals')

  assert.match(html, /6 requirements shown/)
  assert.doesNotMatch(html, /Checklist not available yet/)
  assert.match(html, /href="\/goals\/philippine-passport"/)
  assert.match(html, /href="\/goals\/first-job"/)
  assert.match(html, /href="\/checklist\?goal=2"/)
  assert.match(html, /href="\/checklist\?goal=3"/)
  assert.match(html, /href="\/checklist\?goal=4"/)
  assert.match(html, /href="\/checklist\?goal=5"/)
})

test('first-job checklist separates employer requests from registration guidance and links full guides', async (t) => {
  const { Checklist, DocumentGuide, GoalDetail, LanguageProvider } = await loadPages(t)
  const html = renderRoute(Checklist, LanguageProvider, '/checklist?goal=1', '/checklist')

  assert.match(html, /Do you already have an employee-employer relationship/)
  assert.match(html, /Has your employer asked for a birth certificate\?/)
  assert.match(html, /Has your employer asked for TIN details or help with TIN registration\?/)
  assert.match(html, /Needs verification — some guidance has not been verified against current official instructions/)
  assert.match(html, /confirm your record with SSS before starting another application/)
  assert.match(html, /href="https:\/\/member\.sss\.gov\.ph\/members\/rcsmi\/crosscontext\/crossContextUtil\.jsp/)
  assert.match(html, /href="https:\/\/www\.sss\.gov\.ph\/list-of-valid-ids\//)
  assert.match(html, /href="\/documents\/first-job-sss-number\?goal=1&amp;from=checklist"/)
  assert.match(html, /href="https:\/\/member\.sss\.gov\.ph\/members\/rcsmi\/crosscontext\/crossContextUtil\.jsp/)
  assert.match(html, /href="https:\/\/www\.sss\.gov\.ph\/list-of-valid-ids\//)
  assert.match(html, /href="\/documents\/first-job-philhealth-number\?goal=1&amp;from=checklist"/)
  assert.match(html, /<p class="eyebrow">First Job<\/p>/)
  assert.match(html, /This is preparation guidance, not confirmation of a universal government requirement/)
  assert.doesNotMatch(html, /does not mean an agency has approved or accepted an application/)
  assert.doesNotMatch(html, /Chest x-ray|City Health Office/)

  const goalHtml = renderRoute(GoalDetail, LanguageProvider, '/goals/first-job', '/goals/:slug')
  assert.match(goalHtml, /Republic Act No\. 11261/)
  assert.match(goalHtml, /href="\/checklist\?goal=1"/)
  assert.match(goalHtml, /href="\/documents\/first-job-nbi-clearance"/)
  assert.match(goalHtml, /href="https:\/\/www\.officialgazette\.gov\.ph\/2019\/04\/10\/republic-act-no-11261\//)

  const passportHtml = renderRoute(
    GoalDetail,
    LanguageProvider,
    '/goals/philippine-passport',
    '/goals/:slug',
  )
  assert.match(passportHtml, /Confirm your passport application type/)
  assert.doesNotMatch(passportHtml, /MVP demonstration content/)
  assert.match(passportHtml, /href="\/checklist\?goal=2"[^>]*>Start this goal&#x27;s checklist/)
  assert.doesNotMatch(passportHtml, /No requirements for this goal have been confirmed/)

  const guideHtml = renderRoute(
    DocumentGuide,
    LanguageProvider,
    '/documents/first-job-nbi-clearance?goal=1&from=checklist',
    '/documents/:slug',
  )
  assert.match(guideHtml, /NBI clearance/)
  assert.match(guideHtml, /Ask your barangay and NBI before relying on a waiver/)
  assert.match(guideHtml, /Additional source 1/)
  assert.match(guideHtml, /href="\/goals\/first-job"/)
  assert.match(guideHtml, /href="\/goals\/first-job#requirement-6"/)
  assert.match(guideHtml, /href="\/checklist\?goal=1"[^>]*>Return to this goal&#x27;s checklist/)
  assert.match(guideHtml, /href="\/checklist\?goal=1"[^>]*>Open this goal&#x27;s checklist/)

  const sssGuideHtml = renderRoute(
    DocumentGuide,
    LanguageProvider,
    '/documents/first-job-sss-number',
    '/documents/:slug',
  )
  assert.match(sssGuideHtml, /first day of employment/)
  assert.match(sssGuideHtml, /href="https:\/\/member\.sss\.gov\.ph\/members\/rcsmi\/crosscontext\/crossContextUtil\.jsp/)
})

test('demo guides have localized instructions, agency links, and a return path to their goal checklist', async (t) => {
  const { Checklist, DocumentGuide, LanguageProvider } = await loadPages(t)
  const cases = [
    { goal: 2, slug: 'passport-application-type', title: /Confirm your passport application type/, href: /https:\/\/consular\.dfa\.gov\.ph\// },
    { goal: 3, slug: 'nbi-clearance-purpose', title: /Confirm the purpose of your clearance/, href: /https:\/\/clearance\.nbi\.gov\.ph\// },
    { goal: 4, slug: 'drivers-license-pathway', title: /Identify the license pathway/, href: /https:\/\/lto\.gov\.ph\// },
    { goal: 5, slug: 'social-registration-employment-status', title: /Confirm your employment and registration situation/, href: /https:\/\/www\.sss\.gov\.ph\// },
  ]

  for (const item of cases) {
    const checklist = renderRoute(Checklist, LanguageProvider, `/checklist?goal=${item.goal}`, '/checklist')
    assert.match(checklist, item.title)
    assert.doesNotMatch(checklist, /MVP demonstration content/)
    assert.doesNotMatch(checklist, /Not yet verified|Never verified|Unverified/)
    assert.match(checklist, new RegExp(`href="\\/documents\\/${item.slug}\\?goal=${item.goal}&amp;from=checklist"`))

    const guide = renderRoute(
      DocumentGuide,
      LanguageProvider,
      `/documents/${item.slug}?goal=${item.goal}&from=checklist`,
      '/documents/:slug',
    )
    assert.match(guide, item.title)
    assert.match(guide, item.href)
    assert.doesNotMatch(guide, /MVP demonstration content/)
    assert.match(guide, new RegExp(`href="\\/checklist\\?goal=${item.goal}"`))
    assert.doesNotMatch(guide, /Unverified|Not verified|research/i)
  }
})

test('demo documents and search results omit record verification labels while official records retain them', async (t) => {
  const { Documents, Search, LanguageProvider } = await loadPages(t)
  const documentsHtml = renderRoute(Documents, LanguageProvider, '/documents', '/documents')
  const passportTitleIndex = documentsHtml.indexOf('Confirm your passport application type')
  assert.notEqual(passportTitleIndex, -1, 'passport demo guide should appear in the document directory')
  const passportGuideStart = documentsHtml.lastIndexOf('<li class="guidance-card"', passportTitleIndex)
  const passportGuideEnd = documentsHtml.indexOf('</li>', passportTitleIndex) + '</li>'.length
  const passportGuide = documentsHtml.slice(passportGuideStart, passportGuideEnd)
  assert.doesNotMatch(passportGuide, /Not yet verified|Never verified|Unverified/)

  const demoSearchHtml = renderRoute(
    Search,
    LanguageProvider,
    '/search?q=Confirm%20instructions%20for%20a%20first%20application&type=requirements',
    '/search',
  )
  assert.match(demoSearchHtml, /Confirm instructions for a first application/)
  assert.doesNotMatch(demoSearchHtml, /Not yet verified|Never verified|Unverified/)

  const demoGoalSearchHtml = renderRoute(
    Search,
    LanguageProvider,
    '/search?q=Philippine%20Passport&type=goals',
    '/search',
  )
  assert.match(demoGoalSearchHtml, /Philippine Passport/)
  assert.doesNotMatch(demoGoalSearchHtml, /Not yet verified|Never verified|Unverified/)

  const officialSearchHtml = renderRoute(
    Search,
    LanguageProvider,
    '/search?q=SSS%20number&type=requirements',
    '/search',
  )
  assert.match(officialSearchHtml, /Not yet verified/)
})

test('global banner contains one localized MVP notice and preserves agency independence', async (t) => {
  const { DisclaimerBanner, LanguageProvider } = await loadPages(t)
  const html = renderToStaticMarkup(
    createElement(LanguageProvider, null, createElement(DisclaimerBanner)),
  )
  assert.match(html, /MVP demonstration content\. Requirements may change; confirm current instructions with the responsible agency before applying\./)
  assert.match(html, /not affiliated with any government agency/)
  assert.match(html, /Checklist completion does not mean agency approval/)
})

test('a valid checklist with zero applicable requirements has a safe empty state', async (t) => {
  const { Checklist, LanguageProvider } = await loadPages(t)
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => JSON.stringify({
          7: { items: {}, answers: { workLocationDavao: 'no' } },
        }),
        setItem: () => {},
      },
    },
  })
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow)
    else delete globalThis.window
  })

  const html = renderRoute(Checklist, LanguageProvider, '/checklist?goal=7', '/checklist')
  assert.match(html, /No items match these answers right now/)
  assert.doesNotMatch(html, /Checklist unavailable|Readiness assessment|0 ready of 0/)
  assert.match(html, /href="\/goals\/davao-city-health-card"/)
})

test('source cards safely disclose missing or malformed source metadata', async (t) => {
  const { RequirementSourceCard, LanguageProvider } = await loadPages(t)
  const html = renderToStaticMarkup(
    createElement(LanguageProvider, null,
      createElement(RequirementSourceCard, {
        source: {
          id: 'incomplete-source',
          title: '',
          agency: null,
          evidenceType: 42,
          url: 'javascript:alert(1)',
          lastChecked: 'not-a-date',
          verification: 'unknown',
          supports: 'not-a-list',
          relatedSources: 'not-a-list',
          limitations: '',
        },
      }),
    ),
  )

  assert.match(html, /Source title not recorded/)
  assert.match(html, /Evidence type not recorded/)
  assert.match(html, /No publication, statement, or effective date is recorded/)
  assert.match(html, /No last-checked date is recorded/)
  assert.match(html, /No supported claims are recorded/)
  assert.match(html, /Source limitations are not recorded/)
  assert.match(html, /Source link not provided/)
  assert.doesNotMatch(html, /href="javascript:/)
})

test('public search connects canonical guides to unverified source links and handles empty results', async (t) => {
  const { Search, LanguageProvider } = await loadPages(t)
  const requirementHtml = renderRoute(
    Search,
    LanguageProvider,
    '/search?q=SSS%20number&type=requirements',
    '/search',
  )
  assert.match(requirementHtml, /href="\/documents\/first-job-sss-number"/)
  assert.match(requirementHtml, /href="https:\/\/www\.sss\.gov\.ph\/become-an-sss-member\/" target="_blank" rel="noopener noreferrer">Be an SSS Member/)
  assert.match(requirementHtml, /Not yet verified/)

  const sourceHtml = renderRoute(
    Search,
    LanguageProvider,
    '/search?q=Social%20Security%20System&type=sources',
    '/search',
  )
  assert.match(sourceHtml, /href="https:\/\/www\.sss\.gov\.ph\/become-an-sss-member\/" target="_blank" rel="noopener noreferrer">Be an SSS Member/)
  assert.match(sourceHtml, /href="\/documents\/first-job-sss-number"/)

  const emptyHtml = renderRoute(Search, LanguageProvider, '/search?q=not-a-civic-record', '/search')
  assert.match(emptyHtml, /No results for “not-a-civic-record”/)
})

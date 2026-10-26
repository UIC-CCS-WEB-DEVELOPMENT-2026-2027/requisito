import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { PassThrough } from 'node:stream'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { routeManifest } from '../src/routeManifest.js'

function renderApp(App, AuthProvider, LanguageProvider, location) {
  const tree = createElement(MemoryRouter, { initialEntries: [location] },
    createElement(AuthProvider, null,
      createElement(LanguageProvider, null, createElement(App)),
    ),
  )
  return new Promise((resolve, reject) => {
    let html = ''
    let stream
    stream = renderToPipeableStream(tree, {
      onAllReady() {
        const output = new PassThrough()
        output.on('data', (chunk) => { html += chunk.toString() })
        output.on('end', () => resolve(html))
        output.on('error', reject)
        stream.pipe(output)
      },
      onShellError: reject,
      onError: reject,
    })
  })
}

test('public manifest routes render a main landmark and one page heading with real route samples', async (t) => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })
  t.after(() => vite.close())
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
  const { AuthProvider } = await vite.ssrLoadModule('/src/context/AuthContext.jsx')
  const { LanguageProvider } = await vite.ssrLoadModule('/src/i18n/LanguageContext.jsx')
  const renderableRoutes = routeManifest.filter((route) =>
    route.access === 'public' &&
    route.component !== 'QuestionFlow',
  )
  for (const route of renderableRoutes) {
    const html = await renderApp(App, AuthProvider, LanguageProvider, route.smokePath)
    const headings = html.match(/<h1(?:\s|>)/g) ?? []
    assert.equal(headings.length, 1, `${route.id} should render exactly one h1 at ${route.smokePath}`)
    assert.match(html, /<main[^>]+id="main-content"/, `${route.id} should render the shared main landmark`)
  }
})

test('anonymous First Job deep links render the connected public guidance journey', async (t) => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })
  t.after(() => vite.close())
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
  const { AuthProvider } = await vite.ssrLoadModule('/src/context/AuthContext.jsx')
  const { LanguageProvider } = await vite.ssrLoadModule('/src/i18n/LanguageContext.jsx')

  const goalHtml = await renderApp(App, AuthProvider, LanguageProvider, '/goals/first-job')
  assert.match(goalHtml, /Prepare for employer onboarding/)
  assert.match(goalHtml, /href="\/checklist\?goal=1"/)
  assert.doesNotMatch(goalHtml, /Sign in to continue/)

  const checklistHtml = await renderApp(App, AuthProvider, LanguageProvider, '/checklist?goal=1')
  assert.match(checklistHtml, /First Job/)
  assert.match(checklistHtml, /No account is needed to plan or track progress/)
  assert.match(checklistHtml, /href="\/documents\/first-job-sss-number\?goal=1&amp;from=checklist"/)
  assert.match(checklistHtml, /stored only in this browser profile/)

  const guideHtml = await renderApp(App, AuthProvider, LanguageProvider, '/documents/first-job-sss-number')
  assert.match(guideHtml, /Social Security System/)
  assert.match(guideHtml, /href="\/goals\/first-job#requirement-3"/)
  assert.match(guideHtml, /href="https:\/\/www\.sss\.gov\.ph\/become-an-sss-member\//)
  assert.doesNotMatch(guideHtml, /Sign in to continue/)
})

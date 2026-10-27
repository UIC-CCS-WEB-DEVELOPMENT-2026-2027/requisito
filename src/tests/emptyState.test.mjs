import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('empty state supports the default message, description, and accessible icon', async (t) => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })
  t.after(() => vite.close())

  const [{ default: EmptyState }, { LanguageProvider }] = await Promise.all([
    vite.ssrLoadModule('/src/components/EmptyState.jsx'),
    vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'),
  ])

  const html = renderToStaticMarkup(
    createElement(LanguageProvider, null,
      createElement(EmptyState, { description: 'Try adjusting your filters.' }),
    ),
  )

  assert.match(html, /class="empty-state" role="status"/)
  assert.match(html, /class="empty-state__icon"[^>]*aria-hidden="true"/)
  assert.match(html, /class="empty-state__message">No records found<\/p>/)
  assert.match(html, /class="empty-state__description">Try adjusting your filters\.<\/p>/)

  const customHtml = renderToStaticMarkup(
    createElement(LanguageProvider, null,
      createElement(EmptyState, { message: 'Nothing here yet' }),
    ),
  )
  assert.match(customHtml, /class="empty-state__message">Nothing here yet<\/p>/)
  assert.doesNotMatch(customHtml, /empty-state__description/)
})

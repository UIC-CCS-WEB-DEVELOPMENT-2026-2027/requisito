import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)

test('Vercel builds the Vite SPA and provides its documented deep-link fallback', async () => {
  const config = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'))

  assert.equal(config.buildCommand, 'npm run build')
  assert.equal(config.outputDirectory, 'dist')
  assert.deepEqual(config.rewrites, [
    { source: '/(.*)', destination: '/index.html' },
  ])
  assert.equal(typeof config.$schema, 'string')
})

test('Vercel deployment keeps the public chat function and excludes internal admin storage', async () => {
  const ignorePatterns = (await readFile(new URL('.vercelignore', root), 'utf8'))
    .split(/\r?\n/)
    .map((pattern) => pattern.trim())
    .filter(Boolean)
  const chatHandler = await readFile(new URL('api/chat.js', root), 'utf8')

  for (const pattern of ['.env', '.env.*', '.local/', 'server/', '*.sqlite', '*.sqlite-*', '*.db', '*.db-*']) {
    assert.ok(ignorePatterns.includes(pattern), `Vercel ignore list must contain ${pattern}`)
  }
  assert.match(chatHandler, /netlify\/functions\/chat\.js/)
  assert.doesNotMatch(chatHandler, /server\/index\.js|DATABASE_PATH/)
})

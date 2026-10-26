import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import process from 'node:process'
import handler from './chat.js'
import requirements from '../src/data/requirements.json' with { type: 'json' }

const envNames = [
  'AI_PROVIDER',
  'AI_MODEL',
  'AI_API_KEYS',
  'NETLIFY_DEV',
  'ALLOW_UNVERIFIED_FOR_TESTING',
  'DEPLOY_ID',
  'CONTEXT',
  'DAILY_LIMIT_PER_IP',
]
let requestNumber = 0

function configure(t, { testMode = false, credentials = true } = {}) {
  const saved = Object.fromEntries(envNames.map(name => [name, process.env[name]]))
  for (const name of envNames) delete process.env[name]
  Object.assign(process.env, {
    AI_PROVIDER: 'gemini',
    AI_MODEL: 'gemini-3.5-flash-lite',
    AI_API_KEYS: credentials ? 'synthetic-vercel-test-key' : '',
  })
  if (testMode) Object.assign(process.env, {
    NETLIFY_DEV: 'true',
    ALLOW_UNVERIFIED_FOR_TESTING: 'true',
  })
  t.after(() => {
    for (const name of envNames) {
      if (saved[name] === undefined) delete process.env[name]
      else process.env[name] = saved[name]
    }
  })
}

async function invoke({ method = 'POST', body, headers = {} } = {}) {
  const response = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name.toLowerCase()] = value },
    end(value) { this.body = value },
  }
  const id = ++requestNumber
  await handler({
    method,
    url: '/api/chat',
    headers: {
      host: 'localhost:3000',
      'content-type': 'application/json',
      'x-forwarded-for': `192.0.2.${id}`,
      ...headers,
    },
    body,
  }, response)
  return {
    status: response.statusCode,
    headers: response.headers,
    data: JSON.parse(response.body),
  }
}

function providerResponse(answer = 'Check with the issuing office.', ids = [requirements[0].id]) {
  return Response.json({
    candidates: [{
      content: {
        parts: [{
          text: JSON.stringify({ answer, used_ids: ids, confidence: 'verified' }),
        }],
      },
    }],
  })
}

test('Vercel API adapter accepts a valid request and keeps credentials server-side', async t => {
  configure(t, { testMode: true })
  const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent')
    assert.equal(options.headers['x-goog-api-key'], 'synthetic-vercel-test-key')
    assert.ok(!options.body.includes('synthetic-vercel-test-key'))
    return providerResponse()
  })

  const result = await invoke({ body: { question: 'What does the record say?' } })

  assert.equal(result.status, 200)
  assert.equal(result.data.answer, 'Check with the issuing office.')
  assert.equal(result.data.confidence, 'partial')
  assert.deepEqual(result.data.sources.map(source => source.id), [requirements[0].id])
  assert.ok(!JSON.stringify(result).includes('synthetic-vercel-test-key'))
  assert.equal(fetch.mock.callCount(), 1)
})

test('Vercel API adapter forwards method and rejects invalid or empty questions', async t => {
  configure(t, { testMode: true })
  const fetch = t.mock.method(globalThis, 'fetch', () => {
    throw new Error('Provider must not be called for invalid requests')
  })

  assert.equal((await invoke({ method: 'GET' })).status, 405)
  assert.equal((await invoke({ body: { question: '' } })).status, 400)
  assert.equal((await invoke({ body: { question: '   ' } })).status, 400)
  assert.equal((await invoke({ body: { question: 'x'.repeat(501) } })).status, 400)
  assert.equal(fetch.mock.callCount(), 0)
})

test('Vercel API adapter preserves the no-eligible-record refusal without credentials', async t => {
  configure(t, { credentials: false })
  const fetch = t.mock.method(globalThis, 'fetch', () => {
    throw new Error('Provider must not be called when no verified records exist')
  })

  const result = await invoke({ body: { question: 'What are the requirements?' } })

  assert.equal(result.status, 200)
  assert.equal(result.data.confidence, 'unknown')
  assert.deepEqual(result.data.sources, [])
  assert.ok(result.data.warnings.includes('No verified civic records are available yet.'))
  assert.equal(result.headers['x-assistant-provider'], 'skipped')
  assert.equal(fetch.mock.callCount(), 0)
})

test('Vercel API adapter fails safely when eligible test data has no credentials', async t => {
  configure(t, { testMode: true, credentials: false })
  const fetch = t.mock.method(globalThis, 'fetch', () => {
    throw new Error('Provider must not be called without credentials')
  })

  const result = await invoke({ body: { question: 'What does the record say?' } })

  assert.equal(result.status, 503)
  assert.deepEqual(result.data, { error: 'The assistant is unavailable right now.' })
  assert.equal(result.headers['x-assistant-provider'], 'skipped')
  assert.equal(fetch.mock.callCount(), 0)
})

test('Vercel API adapter fails safely when an eligible-record request has no model', async t => {
  configure(t, { testMode: true })
  delete process.env.AI_MODEL
  const fetch = t.mock.method(globalThis, 'fetch', () => {
    throw new Error('Provider must not be called without a model')
  })

  const result = await invoke({ body: { question: 'What does the record say?' } })

  assert.equal(result.status, 503)
  assert.deepEqual(result.data, { error: 'The assistant is unavailable right now.' })
  assert.equal(result.headers['x-assistant-provider'], 'skipped')
  assert.equal(fetch.mock.callCount(), 0)
})

test('Vercel API adapter returns generic provider errors without leaking credentials', async t => {
  configure(t, { testMode: true })
  t.mock.method(console, 'warn', () => {})
  t.mock.method(globalThis, 'fetch', async () => new Response('PRIVATE_PROVIDER_BODY', { status: 503 }))

  const result = await invoke({ body: { question: 'What does the record say?' } })

  assert.equal(result.status, 503)
  assert.deepEqual(result.data, { error: 'The assistant is unavailable right now.' })
  assert.ok(!JSON.stringify(result).includes('PRIVATE_PROVIDER_BODY'))
  assert.ok(!JSON.stringify(result).includes('synthetic-vercel-test-key'))
})

test('Vercel API adapter converts provider timeouts into generic errors', async t => {
  configure(t, { testMode: true })
  t.mock.method(console, 'warn', () => {})
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal)
    throw new DOMException('Provider request timed out', 'AbortError')
  })

  const result = await invoke({ body: { question: 'What does the record say?' } })

  assert.equal(result.status, 503)
  assert.deepEqual(result.data, { error: 'The assistant is unavailable right now.' })
  assert.ok(!JSON.stringify(result).includes('synthetic-vercel-test-key'))
})

test('Vercel API adapter refuses invalid citations and unsupported numeric claims', async t => {
  configure(t, { testMode: true })
  t.mock.method(globalThis, 'fetch', async () =>
    providerResponse('The office requires 987654 copies.', [999999]))

  const result = await invoke({ body: { question: 'What does the record say?' } })

  assert.equal(result.status, 200)
  assert.equal(result.data.confidence, 'unknown')
  assert.equal(result.data.sources.length, 0)
})

test('Vercel uses the Vite SPA fallback and registers the API function', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.deepEqual(config.rewrites, [
    { source: '/(.*)', destination: '/index.html' },
  ])
  assert.equal(typeof handler, 'function')
})

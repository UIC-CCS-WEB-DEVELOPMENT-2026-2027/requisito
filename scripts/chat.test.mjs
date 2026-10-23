import test from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import requirements from '../src/data/requirements.json' with { type: 'json' }
import { buildAnswer, getAssistantRecords, refusal, retrieve, verificationOf, REFUSAL } from '../netlify/lib/assistant-records.js'

// All credentials and record edits below are synthetic, in-memory test fixtures.
const envNames = ['AI_PROVIDER', 'AI_MODEL', 'AI_API_KEYS', 'NETLIFY_DEV', 'ALLOW_UNVERIFIED_FOR_TESTING', 'DEPLOY_ID', 'CONTEXT']
let moduleId = 0
async function setup(t, testMode = false) {
  const saved = Object.fromEntries(envNames.map(name => [name, process.env[name]]))
  for (const name of envNames) delete process.env[name]
  Object.assign(process.env, { AI_PROVIDER: 'gemini', AI_MODEL: 'gemini-3.5-flash-lite', AI_API_KEYS: 'test-credential-a,test-credential-b' })
  if (testMode) Object.assign(process.env, { NETLIFY_DEV: 'true', ALLOW_UNVERIFIED_FOR_TESTING: 'true' })
  t.after(() => {
    for (const name of envNames) {
      if (saved[name] === undefined) delete process.env[name]
      else process.env[name] = saved[name]
    }
  })
  return (await import(`../netlify/functions/chat.js?test=${moduleId++}`)).default
}

const request = question => new Request('http://localhost/chat', { method: 'POST', body: JSON.stringify({ question }) })
const providerResponse = (answer = 'Check with the issuing office.', ids = [1]) => Response.json({
  candidates: [{ content: { parts: [{ text: JSON.stringify({ answer, used_ids: ids, confidence: 'verified' }) }] } }],
})

test('assistant catalog adapts Davao services and keeps unverified records out of normal mode', () => {
  const records = getAssistantRecords()
  const central911 = records.find(record => record.slug === 'central-911')
  assert.equal(central911.type, 'hotline')
  assert.ok(central911.notes.includes('911'))
  assert.equal(verificationOf(central911), 'unverified')
  assert.equal(verificationOf({
    ...central911,
    verification: 'verified',
    lastVerified: '2026-10-20',
    notes: 'Current service contact details.',
  }), 'verified')
  assert.equal(verificationOf({
    ...central911,
    verification: 'verified',
    sourceUrl: 'https://davaocity.gov.ph.attacker.invalid/',
    lastVerified: '2026-10-20',
    notes: 'Current service contact details.',
  }), 'unverified')
  const brief = records.find(record => record.slug === 'how-to-get-a-health-card')
  assert.equal(brief.type, 'brief')
  assert.equal(verificationOf(brief), 'unverified')
  const verifiedSupplemental = getAssistantRecords({
    history: [{
      id: 'history-fixture', type: 'history', title: 'Sourced timeline fixture',
      notes: 'A supported date from an official source.', sourceUrl: 'https://davaocity.gov.ph/history',
      lastVerified: '2026-10-20', verification: 'verified',
    }],
    briefs: [{
      id: 'brief-fixture', type: 'brief', title: 'Sourced brief fixture',
      notes: 'Steps supported by an official source.', sourceUrl: 'https://davaocity.gov.ph/brief',
      lastVerified: '2026-10-20', verification: 'verified',
    }],
    budget: [{
      id: 'budget-fixture', type: 'budget', title: 'Sourced budget fixture',
      notes: 'A budget figure supported by an official source.', sourceUrl: 'https://davaocity.gov.ph/budget',
      lastVerified: '2026-10-20', verification: 'verified',
    }],
  })
  for (const type of ['history', 'brief', 'budget']) {
    assert.equal(verificationOf(verifiedSupplemental.find(record => record.type === type)), 'verified')
  }
})

test('guards reject malformed JSON, types, length and PII before counting requests', async t => {
  const chat = await setup(t)
  t.mock.method(globalThis, 'fetch', () => { throw new Error('Provider must not be called') })
  assert.equal((await chat(new Request('http://localhost/chat'))).status, 405)
  assert.equal((await chat(new Request('http://localhost/chat', { method: 'POST', body: '{' }))).status, 400)
  for (let i = 0; i < 2; i++) for (const value of [null, 42, '', '   ', 'x'.repeat(501), '1111-2222', '11 11 22 22', 'fake@example.invalid']) {
    assert.equal((await chat(request(value), { ip: 'guard-test' })).status, 400)
  }
  for (let i = 0; i < 10; i++) assert.equal((await chat(request('What is listed?'), { ip: 'guard-test' })).status, 200)
  assert.equal((await chat(request('What is listed?'), { ip: 'guard-test' })).status, 429)
})

test('missing model and disallowed models fail safely without a provider request', async t => {
  const chat = await setup(t)
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Must not call') })
  for (const model of ['', 'gemini-2.5-flash', 'gemini-3.5-flash-preview', 'gemini-3.5-flash-latest', 'gemma-3']) {
    process.env.AI_MODEL = model
    const response = await chat(request('What is listed?'))
    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), { error: 'The assistant is unavailable right now.' })
  }
  assert.equal(fetch.mock.callCount(), 0)
})

test('normal mode refuses unverified catalog and ignores request-supplied records', async t => {
  const chat = await setup(t)
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Must not call') })
  const response = await chat(new Request('http://localhost/chat', { method: 'POST', body: JSON.stringify({
    question: 'What do I need?', records: [{ id: 999, verification: 'verified' }],
  }) }))
  assert.deepEqual(await response.json(), refusal(['No verified civic records are available yet.']))
  assert.equal(fetch.mock.callCount(), 0)
  assert.equal(response.headers.get('X-Assistant-Provider'), 'skipped')
})

test('local test mode caps confidence, warns and keeps dates and URLs out of provider data', async t => {
  const chat = await setup(t, true)
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    const body = JSON.parse(options.body)
    assert.ok(body.system_instruction)
    assert.equal(body.generationConfig.responseMimeType, 'application/json')
    assert.equal(body.generationConfig.temperature, 0.2)
    assert.ok(!options.body.includes('lastVerified'))
    assert.ok(!options.body.includes('sourceUrl'))
    assert.ok(!options.body.includes('test-credential'))
    return providerResponse()
  })
  const response = await chat(request('What is listed?'))
  const data = await response.json()
  assert.equal(data.confidence, 'partial')
  assert.ok(data.warnings.includes('TEST MODE: unverified placeholder data'))
  assert.equal(data.sources[0].id, 1)
  assert.equal(data.sources[0].status, requirements[0].status)
  assert.equal(response.headers.get('X-Assistant-Provider'), 'called')
})

test('test override is ignored outside Netlify Dev and in deployed contexts', async t => {
  const chat = await setup(t, true)
  t.mock.method(globalThis, 'fetch', () => { throw new Error('Must not call') })
  for (const context of ['production', 'deploy-preview', 'branch-deploy']) {
    process.env.CONTEXT = context
    assert.equal((await (await chat(request('What is listed?'))).json()).confidence, 'unknown')
  }
  delete process.env.CONTEXT
  delete process.env.NETLIFY_DEV
  assert.equal((await (await chat(request('What is listed?'))).json()).confidence, 'unknown')
})

test('response validation rejects invented IDs, malformed JSON, links, dates and secrets', () => {
  for (const text of ['not json', 'null', JSON.stringify({ answer: 'Invented answer', used_ids: [999], confidence: 'verified' }),
    ...['https://example.invalid', 'January 1', '2026-01-01', 'fake@example.invalid', 'test-credential-a'].map(answer =>
      JSON.stringify({ answer, used_ids: [1], confidence: 'verified' }))]) {
    assert.equal(buildAnswer(text, requirements, false, ['test-credential-a']).answer, REFUSAL)
  }
  assert.deepEqual(buildAnswer(JSON.stringify({ answer: 'Guess', used_ids: [1], confidence: 'unknown' }), requirements, false), refusal())
})

test('warnings are derived from verification, not progress, and dates are checked', () => {
  const record = { ...requirements[0], status: 'done', verification: 'conflicting', lastVerified: '2000-01-01' }
  const answer = JSON.stringify({ answer: 'Confirm this with the office.', used_ids: [1, 999, 1], confidence: 'verified' })
  const result = buildAnswer(answer, [record], false)
  assert.equal(result.confidence, 'partial')
  assert.equal(result.sources.length, 1)
  assert.ok(result.warnings.some(warning => warning.includes('conflicting')))
  assert.ok(result.warnings.some(warning => warning.includes('90 days')))
  assert.equal(verificationOf({ ...record, verification: 'verified' }), 'unverified')
  assert.equal(verificationOf({ ...record, title: undefined, label: undefined }), 'unverified')
})

test('retrieval keeps small catalogs and ranks large catalogs to eight records', () => {
  assert.equal(retrieve(requirements, 'Birth certificate').length, requirements.length)
  const records = Array.from({ length: 41 }, (_, id) => ({ id, label: id === 40 ? 'matching' : 'other', notes: '' }))
  const selected = retrieve(records, 'matching')
  assert.equal(selected.length, 8)
  assert.equal(selected[0].id, 40)
})

test('failover retries only retryable errors and keeps the last successful key', async t => {
  const { generateAnswer } = await import(`../netlify/lib/gemini.js?test=${moduleId++}`)
  const calls = []
  const statuses = [429, 200, 200]
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    calls.push(options.headers['x-goog-api-key'])
    const status = statuses.shift()
    return status === 200 ? providerResponse() : new Response('withheld', { status })
  })
  t.mock.method(console, 'warn', () => {})
  await generateAnswer('Test', [], 'gemini-3.5-flash-lite', ['test-a', 'test-b'])
  await generateAnswer('Test', [], 'gemini-3.5-flash-lite', ['test-a', 'test-b'])
  assert.deepEqual(calls, ['test-a', 'test-b', 'test-b'])
})

test('provider 400 stops immediately and raw errors never reach the browser', async t => {
  const chat = await setup(t, true)
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('PRIVATE PROVIDER BODY', { status: 400 }))
  t.mock.method(console, 'warn', () => {})
  const response = await chat(request('What is listed?'))
  assert.equal(response.status, 502)
  assert.equal(fetch.mock.callCount(), 1)
  assert.ok(!(await response.text()).includes('PRIVATE'))
})

test('all keys failing returns 503 and duplicate keys are attempted only once', async t => {
  const chat = await setup(t, true)
  process.env.AI_API_KEYS = ' test-a, test-a\ntest-b '
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 403 }))
  t.mock.method(console, 'warn', () => {})
  assert.equal((await chat(request('What is listed?'))).status, 503)
  assert.equal(fetch.mock.callCount(), 2)
})

test('network failures fail over and timeouts use AbortController', async t => {
  const { generateAnswer } = await import(`../netlify/lib/gemini.js?test=${moduleId++}`)
  let calls = 0
  t.mock.method(console, 'warn', () => {})
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal)
    if (++calls === 1) throw new Error('Offline')
    return providerResponse()
  })
  assert.ok((await generateAnswer('Test', [], 'gemini-3.5-flash-lite', ['test-a', 'test-b'])).text)
  assert.equal(calls, 2)
})

test('stalled attempts abort within the total deadline', async t => {
  const { generateAnswer, TOTAL_DEADLINE_MS } = await import(`../netlify/lib/gemini.js?test=${moduleId++}`)
  let aborted = 0
  t.mock.method(console, 'warn', () => {})
  t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => { aborted++; reject(new Error('Aborted')) }, { once: true })
  }))
  const started = Date.now()
  const result = await generateAnswer('Test', [], 'gemini-3.5-flash-lite', ['test-a', 'test-b', 'test-c', 'test-d'])
  assert.equal(result.status, 503)
  assert.ok(aborted >= 2 && aborted <= 3)
  assert.ok(Date.now() - started < TOTAL_DEADLINE_MS + 1500)
})

test('a body network error retries but malformed provider JSON refuses without retrying', async t => {
  const { generateAnswer } = await import(`../netlify/lib/gemini.js?test=${moduleId++}`)
  let calls = 0
  t.mock.method(console, 'warn', () => {})
  t.mock.method(globalThis, 'fetch', async () => {
    if (++calls === 1) return { ok: true, json: async () => { throw new TypeError('Network failure') } }
    return new Response('not JSON')
  })
  const result = await generateAnswer('Test', [], 'gemini-3.5-flash-lite', ['test-a', 'test-b', 'test-c'])
  assert.equal(calls, 2)
  assert.equal(result.text, '')
})

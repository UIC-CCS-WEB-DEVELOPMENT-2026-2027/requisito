import test from 'node:test'
import assert from 'node:assert/strict'
import { getAssistantConfigStatus } from './diagnose-ai-config.mjs'
import { getAssistantRecords, verificationOf } from '../netlify/lib/assistant-records.js'

test('configuration diagnostic returns only safe booleans and the local function command', () => {
  const privateKey = 'synthetic-diagnostic-secret-do-not-print'
  const status = getAssistantConfigStatus({
    AI_PROVIDER: 'gemini',
    AI_MODEL: 'gemini-3.5-flash-lite',
    AI_API_KEYS: ` ,\n${privateKey}\n`,
  })
  const serialized = JSON.stringify(status)

  assert.deepEqual(Object.keys(status), [
    'providerConfigured',
    'modelPresent',
    'modelFormatAccepted',
    'credentialsConfigured',
    'eligibleVerifiedRecordsExist',
    'localFunctionCommand',
  ])
  assert.equal(status.providerConfigured, true)
  assert.equal(status.modelPresent, true)
  assert.equal(status.modelFormatAccepted, true)
  assert.equal(status.credentialsConfigured, true)
  assert.equal(status.eligibleVerifiedRecordsExist,
    getAssistantRecords().some(record => verificationOf(record) === 'verified'))
  assert.equal(status.localFunctionCommand, 'npx vercel dev --listen 3000')
  assert.ok(!serialized.includes(privateKey))
  assert.ok(!serialized.includes('gemini-3.5-flash-lite'))
})

test('diagnostic distinguishes missing and unsupported configuration without network access', t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => {
    throw new Error('The diagnostic must not contact a provider')
  })
  const status = getAssistantConfigStatus({
    AI_PROVIDER: 'other',
    AI_MODEL: 'gemini-3.5-flash-preview',
    AI_API_KEYS: ' , \n ',
  })

  assert.equal(status.providerConfigured, false)
  assert.equal(status.modelPresent, true)
  assert.equal(status.modelFormatAccepted, false)
  assert.equal(status.credentialsConfigured, false)
  assert.equal(fetch.mock.callCount(), 0)
})

test('diagnostic reports missing model separately from format acceptance', () => {
  const status = getAssistantConfigStatus({
    AI_PROVIDER: 'gemini',
    AI_API_KEYS: '',
  })

  assert.equal(status.providerConfigured, true)
  assert.equal(status.modelPresent, false)
  assert.equal(status.modelFormatAccepted, false)
  assert.equal(status.credentialsConfigured, false)
})

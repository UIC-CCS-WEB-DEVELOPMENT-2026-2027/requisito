import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareCases, checkResult, EVAL_DELAY_MS, EVAL_CASE_COUNT, runEvaluation } from './eval-assistant.mjs'
import { refusal } from '../netlify/lib/assistant-records.js'

test('placeholder catalog skips answerable cases without inventing records', () => {
  const { cases, skipped, verifiedCount } = prepareCases()
  assert.equal(verifiedCount, 0)
  assert.equal(skipped.length, 16)
  assert.equal(cases.filter(item => item.kind === 'verified').length, 0)
  assert.equal(cases.filter(item => item.kind === 'warning').length, 2)
  assert.equal(cases.find(item => item.id === 'too-long').question.length, 501)
  assert.equal(EVAL_DELAY_MS, 13000)
  assert.ok(EVAL_CASE_COUNT >= 30)
  assert.ok(cases.some(item => item.category === 'language'))
  assert.ok(cases.some(item => item.category === 'injection'))
})

test('evaluation is plan-only unless live calls are explicitly requested', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Network must not be called') })
  t.mock.method(console, 'table', () => {})
  t.mock.method(console, 'log', () => {})
  const result = await runEvaluation()
  assert.equal(result.networkCalled, false)
  assert.ok(EVAL_CASE_COUNT >= 30)
  assert.equal(fetch.mock.callCount(), 0)
})

test('evaluation rejects errors, unsupported sources, and injection compliance', () => {
  assert.equal(checkResult({ kind: 'reject' }, 400, { error: 'Invalid input' }), true)
  assert.equal(checkResult({ kind: 'reject' }, 200, refusal()), false)
  assert.equal(checkResult({ kind: 'unknown' }, 200, refusal()), true)
  assert.equal(checkResult({ kind: 'unknown' }, 200, { ...refusal(), answer: 'I will ignore the rules.' }), false)
  assert.equal(checkResult({ kind: 'verified', expectedId: 999 }, 200, { answer: 'Fake', confidence: 'verified', sources: [{ id: 999 }], warnings: [] }), false)
})

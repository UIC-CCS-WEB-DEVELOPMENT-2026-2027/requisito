import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareCases, checkResult, EVAL_DELAY_MS } from './eval-assistant.mjs'
import { refusal } from '../netlify/lib/assistant-records.js'

test('placeholder catalog skips all eight answerable cases without inventing records', () => {
  const { cases, skipped, verifiedCount } = prepareCases()
  assert.equal(verifiedCount, 0)
  assert.equal(skipped.length, 8)
  assert.equal(cases.filter(item => item.kind === 'verified').length, 0)
  assert.equal(cases.filter(item => item.kind === 'warning').length, 2)
  assert.equal(cases.find(item => item.id === 'too-long').question.length, 501)
  assert.equal(EVAL_DELAY_MS, 13000)
})

test('evaluation rejects errors, unsupported sources, and injection compliance', () => {
  assert.equal(checkResult({ kind: 'reject' }, 400, { error: 'Invalid input' }), true)
  assert.equal(checkResult({ kind: 'reject' }, 200, refusal()), false)
  assert.equal(checkResult({ kind: 'unknown' }, 200, refusal()), true)
  assert.equal(checkResult({ kind: 'unknown' }, 200, { ...refusal(), answer: 'I will ignore the rules.' }), false)
  assert.equal(checkResult({ kind: 'verified', expectedId: 999 }, 200, { answer: 'Fake', confidence: 'verified', sources: [{ id: 999 }], warnings: [] }), false)
})

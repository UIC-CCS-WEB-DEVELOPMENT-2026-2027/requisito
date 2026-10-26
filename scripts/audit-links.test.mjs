import test from 'node:test'
import assert from 'node:assert/strict'
import { auditLinks } from './audit-links.mjs'

test('all local JSX links and accessible controls satisfy the static audit', () => {
  const result = auditLinks()
  assert.ok(result.files.length > 0)
  assert.deepEqual(result.issues, [])
})

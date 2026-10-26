import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './index.js'

test('API entry point can be imported without loading config or starting a listener', () => {
  assert.equal(typeof startServer, 'function')
})

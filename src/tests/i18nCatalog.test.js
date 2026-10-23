import test from 'node:test'
import assert from 'node:assert/strict'
import en from '../i18n/en.json' with { type: 'json' }
import fil from '../i18n/fil.json' with { type: 'json' }
import ceb from '../i18n/ceb.json' with { type: 'json' }
import { resolveTranslation } from '../i18n/translation.js'

test('all three locale catalogs have exactly the same keys and retain review notices', () => {
  const expected = Object.keys(en).filter((key) => !key.startsWith('_')).sort()
  for (const locale of [fil, ceb]) {
    assert.deepEqual(Object.keys(locale).filter((key) => !key.startsWith('_')).sort(), expected)
    assert.equal(locale._reviewStatus, 'needs native-speaker review')
  }
})

test('translation lookup falls back to English and warns when a key is missing', () => {
  const warnings = []
  const catalogs = { en: { known: 'Known' }, fil: {} }
  assert.equal(resolveTranslation(catalogs, 'fil', 'known', (...args) => warnings.push(args)), 'Known')
  assert.equal(resolveTranslation(catalogs, 'fil', 'unknown', (...args) => warnings.push(args)), 'unknown')
  assert.deepEqual(warnings, [['known', 'fil'], ['unknown', 'fil']])
})

import test from 'node:test'
import assert from 'node:assert/strict'
import en from '../i18n/en.json' with { type: 'json' }
import fil from '../i18n/fil.json' with { type: 'json' }
import ceb from '../i18n/ceb.json' with { type: 'json' }

test('Filipino and Bisaya catalogs cover every English key and retain review notices', () => {
  for (const locale of [fil, ceb]) {
    assert.deepEqual(Object.keys(en).filter((key) => !(key in locale)), [])
    assert.equal(locale._reviewStatus, 'needs native-speaker review')
  }
})

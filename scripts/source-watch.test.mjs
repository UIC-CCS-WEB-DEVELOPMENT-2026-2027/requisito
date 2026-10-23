import test from 'node:test'
import assert from 'node:assert/strict'
import { compareHashes, hashText, stripPageMarkup, validateWatchlist } from './source-watch.mjs'

test('source watch strips scripts and styles before hashing normalized text', () => {
  const text = stripPageMarkup('<style>hidden</style><main> Davao <b>City</b></main><script>secret()</script>')
  assert.equal(text, 'Davao City')
  assert.equal(hashText(text), hashText('Davao City'))
  assert.notEqual(hashText(text), hashText('Davao'))
})

test('source watch comparison marks unchanged, changed, new, and unreachable URLs', () => {
  const watchlist = [
    { id: 'same', url: 'https://example.test/same', label: 'Same' },
    { id: 'changed', url: 'https://example.test/changed', label: 'Changed' },
    { id: 'new', url: 'https://example.test/new', label: 'New' },
    { id: 'offline', url: 'https://example.test/offline', label: 'Offline' },
  ]
  const previous = {
    [watchlist[0].url]: { hash: 'a' },
    [watchlist[1].url]: { hash: 'b' },
    [watchlist[3].url]: { hash: 'c' },
  }
  const current = {
    [watchlist[0].url]: { hash: 'a' },
    [watchlist[1].url]: { hash: 'new-b' },
    [watchlist[2].url]: { hash: 'new-c' },
    [watchlist[3].url]: null,
  }
  assert.deepEqual(compareHashes(watchlist, previous, current).map((item) => item.status),
    ['unchanged', 'changed', 'changed', 'unreachable'])
})

test('watchlist rejects non-government URLs and duplicate entries', () => {
  assert.doesNotThrow(() => validateWatchlist([
    { id: 'one', label: 'One', url: 'https://city.gov.ph/' },
  ]))
  assert.throws(() => validateWatchlist([
    { id: 'one', label: 'One', url: 'https://example.com/' },
  ]), /\.gov\.ph/)
  assert.throws(() => validateWatchlist([
    { id: 'same', label: 'One', url: 'https://city.gov.ph/one' },
    { id: 'same', label: 'Two', url: 'https://city.gov.ph/two' },
  ]), /unique/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { filterVerifiedGuides } from '../data/helpers.js'

const completeGuide = {
  id: 'fixture-guide',
  title: 'Fixture guide',
  description: 'Test-only complete guide fixture.',
  category: 'Health',
  sourceUrl: 'https://example.invalid/fixture',
  verification: 'verified',
  steps: ['Check the source.'],
  whatYouNeed: [],
}

test('guide finder returns only complete verified guides in the selected category', () => {
  const guides = [
    completeGuide,
    { ...completeGuide, id: 'other-category', category: 'Business' },
    { ...completeGuide, id: 'unverified', verification: 'unverified' },
    { ...completeGuide, id: 'incomplete', steps: [] },
  ]
  assert.deepEqual(filterVerifiedGuides(guides, 'Health').map((guide) => guide.id), ['fixture-guide'])
  assert.deepEqual(filterVerifiedGuides(guides).map((guide) => guide.id), ['fixture-guide', 'other-category'])
  assert.deepEqual(filterVerifiedGuides([
    { ...completeGuide, id: 'unsafe-url', sourceUrl: 'javascript:alert(1)' },
  ]), [])
})

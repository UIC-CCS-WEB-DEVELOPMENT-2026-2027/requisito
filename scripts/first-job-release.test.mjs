import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { assessFirstJobRelease } from './first-job-release.mjs'

const root = new URL('../', import.meta.url)
const readJson = (path) => readFile(new URL(path, root), 'utf8').then(JSON.parse)

async function currentData() {
  return {
    goals: await readJson('src/data/goals.json'),
    requirements: await readJson('src/data/requirements.json'),
    sources: await readJson('src/data/requirementSources.json'),
    evidence: await readJson('src/data/firstJobEvidence.json'),
    locales: await Promise.all(['en', 'fil', 'ceb'].map((language) =>
      readJson(`src/i18n/${language}.json`))),
  }
}

test('First Job gate blocks current records without losing evidence dispositions', async () => {
  const assessment = assessFirstJobRelease(await currentData())
  assert.equal(assessment.result, 'BLOCKED')
  assert.deepEqual(
    assessment.requirements.map(({ requirementId, status }) => [requirementId, status]),
    [
      [1, 'BLOCKED'],
      [2, 'BLOCKED'],
      [3, 'PENDING'],
      [4, 'BLOCKED'],
      [5, 'BLOCKED'],
      [6, 'BLOCKED'],
    ],
  )
  assert.deepEqual(assessment.issues, [])
  assert.equal(assessment.sources.length, 18)
  assert.ok(assessment.sources.every((source) => source.verification === 'unverified'))
  assert.ok(assessment.sources.every((source) =>
    ['PENDING', 'BLOCKED'].includes(source.status),
  ))
  assert.ok(assessment.sources.every((source) => source.status !== 'PASS'))
  assert.ok(assessment.blockers.some((item) =>
    item.type === 'requirement' &&
    item.id === 1 &&
    item.reasons.some((reason) => reason.includes('Research is blocked')),
  ))
  assert.ok(assessment.requirements[2].blockingReasons.some((reason) =>
    reason.includes('has not received independent approval'),
  ))
})

test('release gate blocks missing evidence, source links, or required disclaimers', async () => {
  const data = await currentData()
  data.evidence.requirements = data.evidence.requirements.slice(1)
  data.locales[1]['goals.noApprovalNotice'] = ''
  const assessment = assessFirstJobRelease(data)
  assert.equal(assessment.result, 'BLOCKED')
  assert.ok(assessment.issues.some((issue) => issue.includes('missing required disclaimer')))
  assert.ok(assessment.requirements.some((item) => item.requirementId === 1 && item.status === 'BLOCKED'))
})

test('only complete independently reviewed records and sources can pass', async () => {
  const data = await currentData()
  const review = {
    reviewedById: 11,
    requestId: 12,
    independent: true,
    reviewedAt: '2026-10-26',
    sourceAccessedOn: '2026-10-26',
    note: 'Compared the current source text with the requirement claim.',
  }
  const first = data.requirements.find((record) => record.id === 1)
  first.verification = 'verified'
  first.verificationReview = review
  first.sourceIds = ['only-source']
  const source = data.sources.find((record) => record.id === 'ra11261-first-time-jobseekers-act')
  source.id = 'only-source'
  source.verification = 'verified'
  source.verificationReview = review
  data.sources = [source]
  const evidence = data.evidence.requirements.find((entry) => entry.requirementId === 1)
  evidence.sourceIds = ['only-source']
  evidence.researchStatus = 'complete'
  evidence.evidenceCompleteness = 'complete_for_limited_claims'
  evidence.claims = [{
    claim: 'A supported claim.',
    sourceIds: ['only-source'],
    supportingPassage: 'A source passage.',
    accessedOn: '2026-10-26',
  }]
  evidence.releaseDisposition = 'included'
  const assessment = assessFirstJobRelease(data)
  assert.equal(assessment.requirements[0].status, 'PASS', JSON.stringify(assessment.requirements[0]))
  assert.equal(assessment.result, 'BLOCKED')

  evidence.evidenceCompleteness = 'partial'
  const incompleteAssessment = assessFirstJobRelease(data)
  assert.equal(incompleteAssessment.requirements[0].status, 'BLOCKED')
})

test('release gate blocks conflicting sources and malformed review evidence', async () => {
  const data = await currentData()
  const source = data.sources.find((record) => record.id === 'ra11261-first-time-jobseekers-act')
  source.verification = 'conflicting'
  let assessment = assessFirstJobRelease(data)
  assert.equal(assessment.sources.find((record) => record.sourceId === source.id).status, 'BLOCKED')
  assert.ok(assessment.blockers.some((item) => item.type === 'source' &&
    item.id === source.id &&
    item.reasons.some((reason) => reason.includes('conflicting'))))

  source.verification = 'unverified'
  source.verificationReview = {}
  assessment = assessFirstJobRelease(data)
  assert.equal(assessment.requirements[0].status, 'BLOCKED')
})

test('excluded requirements remain blocked until public catalog withholding is implemented', async () => {
  const data = await currentData()
  for (const entry of data.evidence.requirements) {
    entry.releaseDisposition = 'excluded'
    entry.exclusionReason = 'Withheld pending independent review.'
  }
  const assessment = assessFirstJobRelease(data)
  assert.ok(assessment.requirements.every((item) => item.status === 'EXCLUDED'))
  assert.ok(assessment.issues.some((issue) => issue.includes('withheld from the public catalog')))
  assert.equal(assessment.result, 'BLOCKED')
})

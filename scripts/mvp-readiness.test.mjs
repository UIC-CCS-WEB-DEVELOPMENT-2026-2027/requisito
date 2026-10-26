import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { assessFirstJobRelease } from './first-job-release.mjs'
import { assessMvpReadiness } from './mvp-readiness.mjs'

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

test('MVP readiness can pass with honestly qualified guidance while production verification remains pending', async () => {
  const data = await currentData()
  const governmentGate = assessFirstJobRelease(data)
  const assessment = assessMvpReadiness({ ...data, governmentGate })

  assert.equal(governmentGate.result, 'BLOCKED')
  assert.equal(assessment.result, 'MVP_READY')
  assert.equal(assessment.productionVerificationStatus, 'PRODUCTION_VERIFICATION_PENDING')
  assert.equal(assessment.governmentVerificationGate, 'BLOCKED')
  assert.ok(assessment.limitations.length > 0)
})

test('MVP readiness blocks unsupported source links and missing public caveats', async () => {
  const data = await currentData()
  const requirement = data.requirements.find((item) => item.id === 1)
  requirement.sourceIds = ['missing-source']
  requirement.description = 'Birth certificate required for every first job.'
  requirement.notes = 'Obtain the document.'
  requirement.guideInstructions = 'Submit the document.'

  const assessment = assessMvpReadiness({
    ...data,
    governmentGate: assessFirstJobRelease(data),
  })

  assert.equal(assessment.result, 'MVP_BLOCKED')
  assert.ok(assessment.blockers.some((reason) => reason.includes('missing-source')))
  assert.ok(assessment.blockers.some((reason) => reason.includes('lacks a clear caveat')))
})

test('MVP readiness blocks missing localized non-approval notices', async () => {
  const data = await currentData()
  data.locales[2]['goals.noApprovalNotice'] = ''

  const assessment = assessMvpReadiness({
    ...data,
    governmentGate: assessFirstJobRelease(data),
  })

  assert.equal(assessment.result, 'MVP_BLOCKED')
  assert.ok(assessment.blockers.some((reason) => reason.includes('noApprovalNotice')))
})

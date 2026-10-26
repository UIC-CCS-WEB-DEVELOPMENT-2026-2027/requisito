import test from 'node:test'
import assert from 'node:assert/strict'
import requirements from '../data/requirements.json' with { type: 'json' }
import sources from '../data/requirementSources.json' with { type: 'json' }
import evidence from '../data/firstJobEvidence.json' with { type: 'json' }

const sourceById = new Map(sources.map((source) => [source.id, source]))
const requirementsById = new Map(requirements.map((requirement) => [requirement.id, requirement]))
const evidenceById = new Map(evidence.requirements.map((entry) => [entry.requirementId, entry]))

test('provided research documents remain attributed and do not imply government approval', () => {
  const summary = evidence.referenceDocuments.find((document) =>
    document.id === 'egovph-requirements-summary',
  )
  const handoff = evidence.referenceDocuments.find((document) =>
    document.id === 'first-job-government-requirements-research',
  )

  assert.match(summary.evidenceRole, /Secondary research lead only/)
  assert.match(summary.limitations, /guide articles rather than agency pages/i)
  assert.match(handoff.evidenceRole, /not independent approval/i)
  assert.match(handoff.reviewBasis, /printed pages 1–13.*PDFKit/i)
  assert.deepEqual(handoff.reportedPageCounts, {
    extractedPrintedPages: 13,
    localPdfUtility: 13,
    browserPdfReader: 13,
  })
})

test('new report-derived evidence links to canonical records and stays pending review', () => {
  const addedSourceIds = [
    'psa-birth-certificate-service',
    'bir-citizens-charter-2026',
    'bir-cdr-2025',
    'sss-employees-coverage',
    'philhealth-formal-employee-registration',
    'philhealth-employer-reporting',
    'nbi-clearance-how-to-apply',
    'nbi-ftjs-citizens-charter',
  ]

  for (const sourceId of addedSourceIds) {
    const source = sourceById.get(sourceId)
    assert.ok(source, `missing source record ${sourceId}`)
    assert.equal(source.verification, 'unverified')
    assert.equal(source.lastChecked, source.directInspection ? '2026-10-26' : null)
    assert.equal(source.verificationReview, undefined)
    assert.ok(source.researchAttribution.sourceCheckDateReported)
    assert.match(source.limitations, /not independently|not rechecked|not re-opened|independent approval remains pending/i)
  }

  for (const requirementId of [1, 2, 3, 4, 6]) {
    const requirement = requirementsById.get(requirementId)
    const entry = evidenceById.get(requirementId)
    assert.deepEqual(entry.sourceIds, requirement.sourceIds)
    for (const claim of entry.claims.filter((item) => item.documentEvidence)) {
      assert.equal(claim.researchStatus, 'pending_independent_comparison')
      assert.ok(claim.documentEvidence.printedPage || claim.documentEvidence.printedPages)
      assert.ok(claim.sourceIds.every((sourceId) => entry.sourceIds.includes(sourceId)))
      assert.ok(claim.sourceIds.every((sourceId) => sourceById.has(sourceId)))
    }
  }
})

test('Pag-IBIG interface observations remain research leads, not verified procedure', () => {
  const lead = evidenceById.get(5).researchLeads[0]
  assert.equal(lead.researchStatus, 'partial_report_not_independently_compared')
  assert.equal(lead.reportedSourceUrls.length, 3)
  assert.match(lead.limitations, /fee, timing, and employer\/manual alternatives remain unresolved/i)
  assert.equal(requirementsById.get(5).verification, 'unverified')
})

test('research findings do not promote First Job requirements or source records', () => {
  for (const requirement of requirements.filter((record) => record.goalId === 1)) {
    assert.equal(requirement.verification, 'unverified', requirement.slug)
    assert.equal(requirement.verificationReview, undefined, requirement.slug)
  }
  for (const sourceId of [
    'psa-birth-certificate-service',
    'bir-citizens-charter-2026',
    'bir-cdr-2025',
    'sss-employees-coverage',
    'philhealth-formal-employee-registration',
    'philhealth-employer-reporting',
    'nbi-clearance-how-to-apply',
    'nbi-ftjs-citizens-charter',
  ]) {
    assert.equal(sourceById.get(sourceId).verification, 'unverified')
  }

  assert.doesNotMatch(requirementsById.get(2).guideInstructions, /within 10 days|no processing fee/i)
  assert.doesNotMatch(requirementsById.get(4).guideInstructions, /two PMRF copies|30 days from assumption/i)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getChecklistPlan,
  getDocumentGuideBySlug,
  getDocuments,
  getGoals,
  getPlanningQuestions,
  getRequirementSources,
  getRequirementsByGoal,
} from '../data/helpers.js'
import requirements from '../data/requirements.json' with { type: 'json' }
import en from '../i18n/en.json' with { type: 'json' }
import fil from '../i18n/fil.json' with { type: 'json' }
import ceb from '../i18n/ceb.json' with { type: 'json' }
import { href, routeMatches } from '../routeManifest.js'
import {
  CHECKLIST_STORAGE_KEY,
  getGoalProgressSummary,
  readChecklistProgress,
  reconcileChecklistProgress,
  writeChecklistProgress,
} from '../utils/checklistProgress.js'
import { assessChecklistReadiness } from '../utils/readinessAssessment.js'

test('readiness assessment never reports ready when evidence or prerequisites are unresolved', () => {
  const requirements = [
    { id: 1, verification: 'verified' },
    { id: 2, verification: 'verified', requires: ['1'] },
  ]

  assert.equal(assessChecklistReadiness([], {}).status, 'unavailable')
  assert.equal(
    assessChecklistReadiness(
      [{ id: 1, verification: 'verified' }],
      { 1: { status: 'ready' } },
      false,
    ).status,
    'plan-needs-review',
  )
  assert.equal(
    assessChecklistReadiness(requirements, { 2: { status: 'ready' } }).status,
    'missing-prerequisites',
  )
  assert.equal(
    assessChecklistReadiness([{ id: 1, verification: 'unverified' }], {
      1: { status: 'ready' },
    }).status,
    'needs-verification',
  )
  assert.equal(
    assessChecklistReadiness([{ id: 1, verification: 'verified' }]).status,
    'not-started',
  )
  assert.equal(
    assessChecklistReadiness(requirements, {
      1: { status: 'ready' },
      2: { status: 'ready' },
    }).status,
    'ready-to-apply',
  )
  assert.equal(
    assessChecklistReadiness([{ id: 1, verification: 'verified' }], {
      1: { status: 'in-progress' },
    }).status,
    'preparing',
  )
  assert.equal(
    assessChecklistReadiness([{ id: 1, verification: 'verified' }], {
      1: { status: 'not-applicable' },
    }).status,
    'ready-to-apply',
  )
})

test('readiness states are localized in all supported languages', () => {
  for (const locale of [en, fil, ceb]) {
    for (const state of [
      'unavailable',
      'not-started',
      'preparing',
      'plan-needs-review',
      'missing-prerequisites',
      'needs-verification',
      'ready-to-apply',
    ]) {
      assert.ok(locale[`checklist.readiness.${state}`]?.trim(), `${state} must be translated`)
    }
  }
})

test('current-instructions notice is localized for each supported language', () => {
  for (const locale of [en, fil, ceb]) {
    assert.ok(locale['requirement.currentDetailsNotice']?.trim())
  }
})

test('goal requirement IDs resolve to unique canonical records and checklist items', () => {
  const goals = getGoals().filter((goal) => !goal.isSample)
  const linkedIds = goals.flatMap((goal) => goal.requirementIds)
  const definitions = new Map(requirements.map((requirement) => [requirement.id, requirement]))

  assert.equal(new Set(requirements.map((requirement) => requirement.id)).size, requirements.length)
  assert.equal(new Set(requirements.map((requirement) => requirement.slug)).size, requirements.length)
  assert.ok(linkedIds.every((id) => definitions.has(id)))
  assert.ok(goals.every((goal) => new Set(goal.requirementIds).size === goal.requirementIds.length))
  assert.ok(requirements.every((requirement) =>
    goals.find((goal) => goal.id === requirement.goalId)?.requirementIds.includes(requirement.id),
  ))
  assert.ok(!getRequirementsByGoal(1).some((item) => item.id === 7))
  assert.ok(getRequirementsByGoal(7).some((item) => item.id === 7))

  for (const goal of goals) {
    const requirements = getRequirementsByGoal(goal.id)
    const plan = getChecklistPlan(goal.id)
    assert.deepEqual(
      plan.steps.map((step) => step.id),
      requirements.map((requirement) => requirement.id).filter((id) =>
        plan.steps.some((step) => step.id === id),
      ),
    )
    assert.ok(plan.steps.every((step) => step.requirement.id === step.id))
  }
})

test('every public goal has an honest checklist and sound canonical links', () => {
  const goals = getGoals().filter((goal) => !goal.isSample)
  const expectedAvailableGoalIds = [1, 2, 3, 4, 5, 7]
  const questionsById = new Map(getPlanningQuestions().map((question) => [question.id, question]))
  const sourceIds = new Set(getRequirementSources().map((source) => source.id))

  assert.deepEqual(
    goals.filter((goal) => getRequirementsByGoal(goal.id).length).map((goal) => goal.id),
    expectedAvailableGoalIds,
  )

  for (const goal of goals) {
    const linked = getRequirementsByGoal(goal.id)
    const plan = getChecklistPlan(goal.id)
    assert.equal(new Set(goal.requirementIds).size, goal.requirementIds.length, `${goal.title} has duplicate IDs`)
    assert.ok(goal.requirementIds.every((id) => linked.some((requirement) => requirement.id === id)))
    assert.ok(plan.ok)
    assert.deepEqual(
      plan.steps.map((step) => step.id),
      linked.map((requirement) => requirement.id),
    )

    for (const requirement of linked) {
      assert.equal(requirement.goalId, goal.id)
      assert.ok(requirement.slug)
      assert.ok(requirement.guideInstructions)
      assert.ok(getDocumentGuideBySlug(requirement.slug)?.goals.some((item) => item.id === goal.id))
      assert.ok((requirement.sourceIds ?? []).every((id) => sourceIds.has(id)))
      assert.equal(requirement.verification, 'unverified')
      if (requirement.demoOnly) {
        assert.notEqual(requirement.requirementType, 'mandatory')
        assert.ok(requirement.applicationUrl.startsWith('https://'))
        assert.ok(requirement.labelKey)
        assert.ok(requirement.descriptionKey)
        assert.ok(requirement.notesKey)
        assert.ok(requirement.guideInstructionsKey)
      }
      if (requirement.requirementType === 'conditional') {
        assert.ok(Object.keys(requirement.when ?? {}).length, `${requirement.id} must define its condition`)
        assert.ok(requirement.conditionKey || requirement.goalContextKey)
        for (const questionId of Object.keys(requirement.when)) {
          const question = questionsById.get(questionId)
          assert.ok(question?.goalIds.includes(goal.id), `${questionId} must be asked for ${goal.title}`)
        }
      }
    }
  }
})

test('readiness consumes each canonical goal plan and keeps unreviewed demo guidance unverified', () => {
  for (const goal of getGoals().filter((item) => !item.isSample)) {
    const plan = getChecklistPlan(goal.id)
    const requirements = plan.steps
      .filter((step) => step.kind === 'requirement')
      .map(({ requirement, ...step }) => ({ ...requirement, ...step }))
    const items = Object.fromEntries(requirements.map((requirement) => [
      String(requirement.id),
      { status: 'ready' },
    ]))
    const readiness = assessChecklistReadiness(
      requirements,
      items,
      plan.ok && plan.warnings.length === 0,
    )

    assert.notEqual(readiness.status, 'ready-to-apply', `${goal.title} has unverified guidance`)
    assert.equal(readiness.status, 'needs-verification', `${goal.title} must reflect source review state`)
  }
})

test('unavailable goal status and related-guide messages are localized in all supported languages', () => {
  for (const locale of [en, fil, ceb]) {
    for (const key of [
      'goals.checklistNotAvailable',
      'goals.viewChecklistStatus',
      'checklist.unavailableForGoal',
      'checklist.goalResearchPending',
      'checklist.relatedGuidesNotSubstitute',
      'checklist.browseRelatedGuides',
    ]) {
      assert.ok(locale[key]?.trim(), `${key} must be translated`)
    }
  }
})

test('first-job checklist excludes Davao health-card claims and filters employer/status conditions', () => {
  const goal = getGoals().find((item) => item.id === 1)
  assert.deepEqual(goal.requirementIds, [1, 2, 3, 4, 5, 6])
  assert.deepEqual(getChecklistPlan(1).steps.map((step) => step.id), goal.requirementIds)

  const notYetEmployed = getChecklistPlan(1, {
    hasEmploymentRelationship: 'no',
    employerRequestedBirthCertificate: 'no',
    employerRequestedTin: 'no',
    needsClearance: 'no',
  })
  assert.deepEqual(notYetEmployed.steps.map((step) => step.id), [3, 5])

  const employed = getChecklistPlan(1, {
    hasEmploymentRelationship: 'yes',
    employerRequestedBirthCertificate: 'no',
    employerRequestedTin: 'no',
    needsClearance: 'no',
  })
  assert.deepEqual(employed.steps.map((step) => step.id), [3, 4, 5])

  const employerRequestsBoth = getChecklistPlan(1, {
    hasEmploymentRelationship: 'yes',
    employerRequestedBirthCertificate: 'yes',
    employerRequestedTin: 'yes',
    needsClearance: 'yes',
  })
  assert.deepEqual(employerRequestsBoth.steps.map((step) => step.id), goal.requirementIds)
  assert.ok(employerRequestsBoth.steps.every((step) => ![7, 8, 9, 10, 11, 12, 13, 14].includes(step.id)))

  const definitions = getRequirementsByGoal(1)
  assert.deepEqual(
    definitions.filter((item) => item.requirementType === 'conditional').map((item) => item.id),
    [1, 2, 4, 6],
  )
  assert.deepEqual(
    definitions.filter((item) => item.requirementType === 'recommended').map((item) => item.id),
    [3, 5],
  )
  assert.ok(definitions.every((item) => item.verification === 'unverified'))
  assert.deepEqual(definitions.find((item) => item.id === 2).when, { employerRequestedTin: 'yes' })
  assert.equal(definitions.find((item) => item.id === 5).when, undefined)
})

test('document guides and sources derive from linked requirements without sample document records', () => {
  const guides = getDocuments()
  assert.equal(guides.length, 36)
  assert.equal(new Set(guides.map((guide) => guide.id)).size, guides.length)
  assert.ok(guides.every((guide) =>
    Boolean(guide.slug) &&
    guide.goals.length > 0 &&
    guide.guideInstructions &&
    guide.requirementType,
  ))

  const guide = getDocumentGuideBySlug('health-card-chest-x-ray')
  assert.equal(guide.id, 7)
  assert.deepEqual(guide.goals.map((goal) => goal.slug), ['davao-city-health-card'])
  assert.equal(guide.sources[0].id, 'davao-cho-health-card-2026')
  assert.equal(guide.sources[0].verification, 'unverified')
  assert.deepEqual(getDocumentGuideBySlug('missing'), null)

  const firstJobRequirements = getRequirementsByGoal(1)
  assert.ok(firstJobRequirements.every((requirement) => {
    const guide = getDocumentGuideBySlug(requirement.slug)
    return guide?.goals.some((goal) => goal.slug === 'first-job')
  }))
})

test('first-job official sources record exact claims, conditions, check dates, and limits', () => {
  const sources = getRequirementSources()
  const byId = new Map(sources.map((source) => [source.id, source]))
  const sss = byId.get('sss-become-member-faq')
  const philhealth = byId.get('philhealth-direct-contributors')
  const nbiPortal = byId.get('nbi-clearance-portal')
  const pagibigRegistration = byId.get('pagibig-membership-registration')
  const birOrus = byId.get('bir-orus-portal')
  const psaRequest = byId.get('psa-birth-certificate-request')
  const unavailableNotes = getRequirementsByGoal(1)
    .filter((item) => item.id === 5)
  const firstJob = getRequirementsByGoal(1)
  const sssRequirement = firstJob.find((item) => item.id === 3)
  const sssGuide = getDocumentGuideBySlug(sssRequirement.slug)

  assert.equal(sss.lastChecked, '2026-10-26')
  assert.equal(sss.verification, 'unverified')
  assert.match(sss.url, /^https:\/\/www\.sss\.gov\.ph\//)
  assert.match(sss.supports.join(' '), /without an SS Number/i)
  assert.match(sss.supports.join(' '), /five calendar days/i)
  assert.match(sss.supports.join(' '), /first day of employment/i)
  assert.match(sss.limitations, /(does not state|nor does it state).*fee/i)
  assert.match(sss.limitations, /confirm.*SSS/i)
  assert.ok(sssRequirement.applicationUrl.startsWith('https://member.sss.gov.ph/'))
  assert.ok(sssRequirement.supportingDocumentsUrl.startsWith('https://www.sss.gov.ph/'))
  assert.match(sssRequirement.guideInstructions, /without uploading supporting documents/i)
  assert.equal(sssRequirement.revision, 4)
  const sssIds = byId.get('sss-list-of-valid-ids')
  assert.equal(sssIds.lastChecked, '2026-10-26')
  assert.equal(sssIds.verification, 'unverified')
  assert.match(sssIds.limitations, /does not say that every listed document must be uploaded/i)
  assert.ok(sssGuide.sources.some((source) => source.id === sssIds.id))
  assert.equal(philhealth.lastChecked, '2026-10-26')
  assert.equal(philhealth.verification, 'unverified')
  assert.match(philhealth.supports.join(' '), /employee-employer relations/i)
  assert.match(philhealth.limitations, /does not establish.*enrollment/i)
  assert.equal(sssGuide.sources.some((source) => source.id === sss.id), true)
  assert.equal(firstJob.find((item) => item.id === 4).sourceIds.includes('philhealth-member-services'), true)
  const jobseekerAct = byId.get('ra11261-first-time-jobseekers-act')
  assert.equal(jobseekerAct.lastChecked, '2026-10-26')
  assert.equal(jobseekerAct.verification, 'unverified')
  assert.match(jobseekerAct.url, /^https:\/\/www\.officialgazette\.gov\.ph\//)
  assert.match(jobseekerAct.supports.join(' '), /signing date as April 10, 2019/i)
  assert.match(jobseekerAct.limitations, /PDF text itself was not extracted or reviewed/i)
  assert.match(jobseekerAct.limitations, /Lawphil transcription/i)
  assert.match(jobseekerAct.limitations, /Lawphil transcription/i)
  assert.ok(jobseekerAct.relatedSources.every((url) => url.startsWith('https://')))
  assert.equal(nbiPortal.verification, 'unverified')
  assert.match(nbiPortal.supports.join(' '), /OFFICIAL NBI CLEARANCE/i)
  assert.match(nbiPortal.limitations, /eligibility.*documents.*fees/i)
  const nbiCharter = byId.get('nbi-clearance-citizens-charter')
  assert.equal(nbiCharter.verification, 'unverified')
  assert.match(nbiCharter.supports.join(' '), /two valid government-issued identification cards/i)
  assert.match(nbiCharter.supports.join(' '), /walk-in, online without e-payment/i)
  assert.match(nbiCharter.limitations, /do not confirm a Davao service office/i)
  assert.equal(pagibigRegistration.verification, 'unverified')
  assert.match(pagibigRegistration.supports.join(' '), /browser-verification challenge/i)
  assert.equal(birOrus.verification, 'unverified')
  assert.match(birOrus.supports.join(' '), /application shell titled ORUS/i)
  assert.match(birOrus.limitations, /no visible TIN registration instructions/i)
  assert.equal(psaRequest.verification, 'unverified')
  assert.match(psaRequest.supports.join(' '), /transport-level DNS or connection failure/i)
  assert.ok(firstJob.find((item) => item.id === 2).sourceIds.includes(birOrus.id))
  assert.ok(firstJob.find((item) => item.id === 5).sourceIds.includes(pagibigRegistration.id))
  assert.ok(firstJob.find((item) => item.id === 6).sourceIds.includes(nbiPortal.id))
  assert.ok(firstJob.find((item) => item.id === 1).sourceIds.includes(psaRequest.id))
  assert.equal(firstJob.find((item) => item.id === 2).applicationLabelKey, 'requirement.birOrusPortal')
  assert.equal(firstJob.find((item) => item.id === 6).applicationLabelKey, 'requirement.nbiApplication')
  assert.ok([1, 2, 6].every((id) =>
    firstJob.find((item) => item.id === id).sourceIds.includes(jobseekerAct.id),
  ))
  assert.ok(unavailableNotes.every((item) =>
    item.verification === 'unverified' &&
    (item.id === 5
      ? item.sourceIds.includes(pagibigRegistration.id)
      : item.sourceIds.length === 0) &&
    /not confirmed|not researched|could not be reviewed|not established|no universal|unconfirmed|no current/i.test(`${item.notes} ${item.guideInstructions}`),
  ))
  assert.equal(sources.length, 19)
  assert.ok(sources.every((source) =>
    source.url.startsWith('https://') &&
    (source.lastChecked === null
      ? source.verification === 'unverified' &&
        /^\d{4}-\d{2}-\d{2}$/.test(source.researchAttribution?.sourceCheckDateReported)
      : /^\d{4}-\d{2}-\d{2}$/.test(source.lastChecked)) &&
    source.supports.length > 0
  ))
  assert.match(byId.get('davao-cho-health-card-2026').limitations, /not current confirmation/i)
})

test('checklist progress retains status across definition changes and flags review', () => {
  const oldDefinitions = [{ id: 7, revision: 1 }, { id: 8, revision: 1 }]
  const saved = {
    answers: { employerRequestedTin: 'yes' },
    items: {
      7: { status: 'ready', revision: 1 },
      8: { status: 'in-progress', revision: 1 },
    },
  }
  const changed = reconcileChecklistProgress(saved, [
    { id: 7, revision: 2 },
    { id: 8, revision: 1 },
  ])
  assert.equal(changed.items['7'].status, 'ready')
  assert.equal(changed.items['7'].needsReview, true)
  assert.deepEqual(changed.answers, saved.answers)
  assert.equal(changed.items['8'].status, 'in-progress')
  assert.equal(changed.needsReview, true)

  const removed = reconcileChecklistProgress(saved, oldDefinitions.slice(0, 1))
  assert.deepEqual(removed.obsoleteIds, ['8'])
  assert.equal(removed.items['8'].status, 'in-progress')

  const currentSss = getRequirementsByGoal(1).find((item) => item.id === 3)
  const revisedSss = reconcileChecklistProgress({
    items: { 3: { status: 'ready', revision: currentSss.revision - 1 } },
  }, [currentSss])
  assert.equal(revisedSss.items['3'].status, 'ready')
  assert.equal(revisedSss.items['3'].needsReview, true)
  assert.equal(revisedSss.needsReview, true)
})

test('browser checklist storage round-trips goal progress without account-sync claims', () => {
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  const progress = reconcileChecklistProgress({ items: {} }, [{ id: 1, revision: 1 }])
  progress.items['1'].status = 'ready'
  progress.answers = { employerRequestedTin: 'yes' }
  writeChecklistProgress(storage, 1, progress)
  assert.equal(readChecklistProgress(storage, 1).items['1'].status, 'ready')
  assert.deepEqual(readChecklistProgress(storage, 1).answers, { employerRequestedTin: 'yes' })
  assert.ok(values.has(CHECKLIST_STORAGE_KEY))
})

test('goal progress summaries report unavailable when browser storage cannot be read', () => {
  const failingStorage = {
    getItem() {
      throw new Error('Storage unavailable')
    },
  }

  assert.equal(getGoalProgressSummary(1, failingStorage).available, false)
  assert.equal(getGoalProgressSummary(1, failingStorage).status, 'unavailable')
  assert.equal(getGoalProgressSummary(7, failingStorage).available, false)
  assert.equal(getGoalProgressSummary(1).available, false)
  assert.throws(() => readChecklistProgress(failingStorage, 1), /could not be read/)
})

test('checklist answers and progress persist independently for each goal', () => {
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  const firstJob = reconcileChecklistProgress({ items: {} }, getRequirementsByGoal(1))
  firstJob.items['3'].status = 'ready'
  firstJob.answers = {
    hasEmploymentRelationship: 'yes',
    employerRequestedBirthCertificate: 'no',
    employerRequestedTin: 'yes',
    needsClearance: 'no',
  }
  const healthCard = reconcileChecklistProgress({ items: {} }, getRequirementsByGoal(7))
  healthCard.items['7'].status = 'in-progress'
  healthCard.answers = {
    workLocationDavao: 'yes',
    healthCardFoodIndustry: 'no',
    healthCardBodyFluids: 'no',
  }

  writeChecklistProgress(storage, 1, firstJob)
  writeChecklistProgress(storage, 7, healthCard)

  const reloadedFirstJob = readChecklistProgress(storage, 1)
  const reloadedHealthCard = readChecklistProgress(storage, 7)
  assert.equal(reloadedFirstJob.items['3'].status, 'ready')
  assert.deepEqual(reloadedFirstJob.answers, firstJob.answers)
  assert.equal(getGoalProgressSummary(1, storage).total, 4)
  assert.equal(getGoalProgressSummary(1, storage).completed, 1)
  assert.equal(reloadedHealthCard.items['7'].status, 'in-progress')
  assert.deepEqual(reloadedHealthCard.answers, healthCard.answers)
  assert.deepEqual(getChecklistPlan(1, reloadedFirstJob.answers).steps.map((step) => step.id), [2, 3, 4, 5])
  assert.deepEqual(getChecklistPlan(7, reloadedHealthCard.answers).steps.map((step) => step.id), [7, 8, 9, 10, 11, 12])
})

test('legacy checklist entries gain empty answers and malformed answers fail explicitly', () => {
  const values = new Map([[CHECKLIST_STORAGE_KEY, JSON.stringify({
    1: { items: { 3: { status: 'ready', revision: 3 } } },
  })]])
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  assert.deepEqual(readChecklistProgress(storage, 1).answers, {})

  values.set(CHECKLIST_STORAGE_KEY, JSON.stringify({
    1: { items: {}, answers: [] },
  }))
  assert.throws(() => readChecklistProgress(storage, 1), /invalid/)
})

test('goal and document guides have navigable deep links', () => {
  assert.equal(href('goalDetail', { slug: 'first-job' }), '/goals/first-job')
  assert.equal(href('documentGuide', { slug: 'health-card-chest-x-ray' }), '/documents/health-card-chest-x-ray')
  assert.equal(routeMatches('/goals/first-job')?.id, 'goalDetail')
  assert.equal(routeMatches('/documents/health-card-chest-x-ray')?.id, 'documentGuide')
})

test('demo goal questions filter conditional items without assuming unanswered answers', () => {
  assert.ok(getChecklistPlan(2).steps.some((step) => step.id === 16))
  assert.ok(getChecklistPlan(2).steps.some((step) => step.id === 17))
  assert.deepEqual(
    getChecklistPlan(2, { passportApplicationType: 'first-time' }).steps.map((step) => step.id),
    [15, 16, 18, 19],
  )
  assert.deepEqual(
    getChecklistPlan(2, { passportApplicationType: 'renewal' }).steps.map((step) => step.id),
    [15, 17, 18, 19],
  )
  assert.deepEqual(
    getChecklistPlan(3, { hasExistingNbiClearance: 'no' }).steps.map((step) => step.id),
    [20, 21, 22, 23],
  )
  assert.deepEqual(
    getChecklistPlan(4, { driversLicenseRoute: 'conversion' }).steps.map((step) => step.id),
    [25, 28, 29, 30],
  )
  assert.deepEqual(
    getChecklistPlan(5, {
      hasExistingSssNumber: 'no',
      hasExistingPhilhealthNumber: 'yes',
      hasEmploymentRelationship: 'yes',
    }).steps.map((step) => step.id),
    [31, 33, 34, 36],
  )
  assert.deepEqual(getChecklistPlan(999).steps, [])
  assert.equal(getChecklistPlan(999).ok, false)
})

test('demo goal progress follows applicable items and remains isolated by goal', () => {
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  const passport = reconcileChecklistProgress(
    { items: {}, answers: { passportApplicationType: 'first-time' } },
    getRequirementsByGoal(2),
  )
  passport.items['15'].status = 'ready'
  writeChecklistProgress(storage, 2, passport)

  const passportSummary = getGoalProgressSummary(2, storage)
  assert.equal(passportSummary.available, true)
  assert.equal(passportSummary.total, 4)
  assert.equal(passportSummary.completed, 1)
  assert.equal(passportSummary.status, 'in-progress')
  assert.equal(passportSummary.nextRequirement.id, 16)
  assert.equal(getGoalProgressSummary(3, storage).total, 5)
  assert.equal(getGoalProgressSummary(3, storage).completed, 0)
})

test('goal progress summary skips completed and not-applicable items when choosing the next item', () => {
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  const plan = getChecklistPlan(2, { passportApplicationType: 'first-time' })
  const progress = reconcileChecklistProgress({
    answers: { passportApplicationType: 'first-time' },
    items: {
      15: { status: 'ready', revision: 1 },
      16: { status: 'not-applicable', revision: 1 },
    },
  }, getRequirementsByGoal(2))
  writeChecklistProgress(storage, 2, progress)

  const summary = getGoalProgressSummary(2, storage)
  assert.equal(summary.nextRequirement.id, plan.steps.find((step) => step.id === 18).id)

  for (const step of plan.steps) {
    progress.items[String(step.id)] = {
      status: 'ready',
      revision: step.requirement.revision,
      needsReview: false,
    }
  }
  writeChecklistProgress(storage, 2, progress)
  assert.equal(getGoalProgressSummary(2, storage).nextRequirement, null)

  const unavailable = getGoalProgressSummary(2, {
    getItem() {
      throw new Error('Storage unavailable')
    },
  })
  assert.equal(unavailable.nextRequirement, null)
})

test('new demo journey labels and notice are localized in every supported language', () => {
  for (const locale of [en, fil, ceb]) {
    assert.ok(locale['disclaimer.banner']?.includes('MVP'))
    assert.ok(locale['checklist.nextItem']?.trim())
    assert.ok(locale['demo.commonMistakesHeading']?.trim())
    assert.ok(locale['checklist.noApplicableItems']?.trim())
    for (const goal of getGoals().filter((item) => item.demoContent)) {
      assert.ok(locale[goal.titleKey]?.trim(), `${goal.slug} title must be translated`)
      assert.ok(locale[goal.descriptionKey]?.trim(), `${goal.slug} description must be translated`)
      assert.ok(locale[goal.audienceKey]?.trim(), `${goal.slug} audience must be translated`)
      assert.ok(locale[goal.categoryKey]?.trim(), `${goal.slug} category must be translated`)
      for (const key of [
        goal.demoPreparationKey,
        goal.demoMistakesKey,
        goal.demoNoteKey,
        goal.demoGuideKey,
      ]) {
        assert.ok(locale[key]?.trim(), `${key} must be translated`)
      }
      for (const requirement of getRequirementsByGoal(goal.id)) {
        for (const key of [
          requirement.labelKey,
          requirement.descriptionKey,
          requirement.notesKey,
          requirement.guideInstructionsKey,
          requirement.applicationLabelKey,
          requirement.conditionKey,
        ].filter(Boolean)) {
          assert.ok(locale[key]?.trim(), `${key} must be translated`)
        }
      }
    }
    for (const question of getPlanningQuestions().filter((item) =>
      [2, 3, 4, 5].some((goalId) => item.goalIds.includes(goalId)),
    )) {
      assert.ok(locale[question.labelKey]?.trim())
      for (const option of question.options) assert.ok(locale[option.labelKey]?.trim())
    }
  }
})

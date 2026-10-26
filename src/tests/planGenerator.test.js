import test from 'node:test'
import assert from 'node:assert/strict'
import { generatePlan } from '../utils/planGenerator.js'
import { getChecklistPlan, getRequirementsByGoal, getPlanningQuestions, getGoals, getSummaryCounts } from '../data/helpers.js'

const goal = (...requirements) => ({ id: 'test', requirements })

test('orders prerequisites before dependents even when catalog order differs', () => {
  const plan = generatePlan(goal('b'), {}, [{ id: 'b', requires: ['a'] }, { id: 'a' }])
  assert.deepEqual(plan.steps.map((step) => step.id), ['a', 'b'])
  assert.equal(plan.ok, true)
})

test('filters conditional requirements and retains unanswered conditions', () => {
  const records = [{ id: 'a', when: { clearance: 'yes' } }]
  assert.equal(generatePlan(goal('a'), { clearance: 'no' }, records).steps.length, 0)
  assert.equal(generatePlan(goal('a'), {}, records).steps.length, 1)
})

test('duplicate goal requirement references generate only one checklist item', () => {
  const plan = generatePlan(goal('a', 'a'), {}, [{ id: 'a', title: 'Requirement A' }])
  assert.equal(plan.steps.length, 1)
  assert.equal(plan.steps[0].id, 'a')
})

test('creates one shared choice step before its dependents', () => {
  const group = { anyOf: ['id-a', 'id-b'], label: 'One ID' }
  const records = [{ id: 'a', requires: [group] }, { id: 'b', requires: [group] }, { id: 'id-a' }, { id: 'id-b' }]
  const plan = generatePlan(goal('a', 'b'), {}, records)
  assert.equal(plan.steps.filter((step) => step.kind === 'anyOf').length, 1)
  assert.equal(plan.steps[0].kind, 'anyOf')
  assert.equal(plan.steps[0].options.length, 2)
})

test('an already required option satisfies a choice group', () => {
  const plan = generatePlan(goal('a', 'id-a'), {}, [
    { id: 'a', requires: [{ anyOf: ['id-a', 'id-b'] }] }, { id: 'id-a' }, { id: 'id-b' },
  ])
  assert.deepEqual(plan.steps.map((step) => step.id), ['id-a', 'a'])
})

test('reports missing data instead of silently treating warnings as verified guidance', () => {
  const plan = generatePlan(goal('a'), {}, [{ id: 'a', requires: ['missing'] }])
  assert.ok(plan.warnings.some((warning) => warning.includes('missing')))
  assert.equal(generatePlan(null).ok, false)
})

test('reports cycles and distinguishes blocked steps', () => {
  const plan = generatePlan(goal('c'), {}, [
    { id: 'a', requires: ['b'] }, { id: 'b', requires: ['a'] }, { id: 'c', requires: ['b'] },
  ])
  assert.equal(plan.ok, false)
  assert.equal(plan.steps.length, 0)
  assert.ok(plan.cycles.length > 0)
  assert.equal(plan.unresolved.find((step) => step.id === 'c').inCycle, false)
})

test('adapter preserves numeric IDs, filters answers, and leaves catalog unchanged', () => {
  const before = getRequirementsByGoal(1)
  const plan = getChecklistPlan(1, {
    employerRequestedBirthCertificate: 'no',
    employerRequestedTin: 'yes',
    needsClearance: 'no',
  })
  assert.deepEqual(plan.steps.map((step) => step.id), [2, 3, 4, 5])
  assert.ok(plan.steps.every((step) => typeof step.id === 'number'))
  assert.ok(plan.steps.findIndex((step) => step.id === 2) < plan.steps.findIndex((step) => step.id === 3))
  assert.deepEqual(getChecklistPlan(1).steps.map((step) => step.id), [1, 2, 3, 4, 5, 6])
  assert.deepEqual(getChecklistPlan(1, {
    hasEmploymentRelationship: 'no',
    employerRequestedBirthCertificate: 'no',
    employerRequestedTin: 'no',
    needsClearance: 'no',
  }).steps.map((step) => step.id), [3, 5])
  assert.equal(getChecklistPlan(1, {
    employerRequestedBirthCertificate: 'no',
    employerRequestedTin: 'yes',
    needsClearance: 'yes',
  }).steps.length, 5)
  assert.deepEqual(getRequirementsByGoal(1), before)
  plan.steps[0].requirement.notes = 'changed'
  assert.deepEqual(getRequirementsByGoal(1), before)
})

test('unknown goal yields a visible warning and questions are isolated copies', () => {
  assert.equal(getChecklistPlan(99).ok, false)
  assert.deepEqual(getChecklistPlan(99).steps, [])
  assert.deepEqual(getChecklistPlan('1').steps, [])
  assert.deepEqual(getRequirementsByGoal(99), [])
  const questions = getPlanningQuestions()
  questions[0].options[0].label = 'changed'
  assert.notEqual(getPlanningQuestions()[0].options[0].label, 'changed')
})

test('every non-sample public goal has its own canonical checklist plan', () => {
  const goals = getGoals()
  assert.equal(goals.length, 7)
  assert.equal(goals[0].title, 'First Job')
  assert.equal(goals[0].slug, 'first-job')
  assert.equal(goals[6].requirementIds.length, 8)
  assert.equal(getSummaryCounts().goals, goals.length - 1)
  for (const [index, goal] of goals.slice(1, 5).entries()) {
    assert.equal(typeof goal.id, 'number')
    assert.ok(goal.demoContent)
    assert.ok(goal.requirementIds.length >= 5)
    assert.deepEqual(
      getChecklistPlan(goal.id).steps.map((step) => step.id),
      goal.requirementIds,
    )
    assert.deepEqual(
      getRequirementsByGoal(goal.id).map((requirement) => requirement.id),
      goal.requirementIds,
    )
    assert.equal(goal.id, index + 2)
  }
  assert.equal(goals[5].id, 6)
  assert.equal(goals[5].isSample, true)
  assert.deepEqual(getRequirementsByGoal(goals[5].id), [])
})

test('separate Davao health-card goal includes reported items and freshness windows', () => {
  const plan = getChecklistPlan(7)
  assert.equal(plan.steps.length, 8)
  assert.equal(plan.steps.find(step => step.label === 'Chest x-ray').requirement.validityMonths, 6)
  assert.equal(plan.steps.find(step => step.label === 'Urinalysis').requirement.validityMonths, 3)
  assert.equal(plan.steps.find(step => step.label === 'Fecalysis').requirement.validityMonths, 3)
  assert.ok(plan.steps.every(step => step.requirement.verification === 'unverified'))
  assert.equal(
    plan.steps.find(step => step.label === 'Hepatitis B antibody test').requirement.applicability,
    'reported-conditional',
  )
  assert.equal(
    plan.steps.find(step => step.label === 'Food safety seminar certificate').requirement.conditionKey,
    'checklist.condition.foodIndustry',
  )
})

test('conditional health-card items remain until the user says the condition does not apply', () => {
  assert.equal(getChecklistPlan(7, {}).steps.length, 8)
  assert.equal(
    getChecklistPlan(7, { healthCardFoodIndustry: 'yes', healthCardBodyFluids: 'no' }).steps.length,
    7,
  )
  assert.equal(
    getChecklistPlan(7, { healthCardFoodIndustry: 'no', healthCardBodyFluids: 'no' }).steps.length,
    6,
  )
  assert.equal(
    getChecklistPlan(7, { healthCardFoodIndustry: 'no', healthCardBodyFluids: 'yes' }).steps.length,
    7,
  )
})

test('health-card planning questions are limited to the matching goal', () => {
  assert.equal(getPlanningQuestions(7).length, 3)
  assert.deepEqual(getPlanningQuestions(7).map((question) => question.id), [
    'workLocationDavao',
    'healthCardFoodIndustry',
    'healthCardBodyFluids',
  ])
  assert.deepEqual(getPlanningQuestions(1).map(question => question.id), [
    'hasEmploymentRelationship',
    'employerRequestedBirthCertificate',
    'employerRequestedTin',
    'needsClearance',
  ])
})

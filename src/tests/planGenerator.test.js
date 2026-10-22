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
  const plan = getChecklistPlan(1, { needsClearance: 'no' })
  assert.equal(plan.steps.length, 5)
  assert.ok(plan.steps.every((step) => typeof step.id === 'number'))
  assert.ok(plan.steps.findIndex((step) => step.id === 1) < plan.steps.findIndex((step) => step.id === 2))
  assert.ok(plan.steps.findIndex((step) => step.id === 2) < plan.steps.findIndex((step) => step.id === 3))
  assert.equal(getChecklistPlan(1).steps.length, 6)
  assert.equal(getChecklistPlan(1, { needsClearance: 'yes' }).steps.length, 6)
  assert.deepEqual(getRequirementsByGoal(1), before)
  plan.steps[0].requirement.notes = 'changed'
  assert.deepEqual(getRequirementsByGoal(1), before)
})

test('unknown goal yields a visible warning and questions are isolated copies', () => {
  assert.equal(getChecklistPlan(99).ok, false)
  assert.deepEqual(getChecklistPlan(99).steps, [])
  const questions = getPlanningQuestions()
  questions[0].options[0].label = 'changed'
  assert.notEqual(getPlanningQuestions()[0].options[0].label, 'changed')
})

test('retains upstream placeholder goals without showing the First Job plan for them', () => {
  const goals = getGoals()
  assert.equal(goals.length, 6)
  assert.equal(goals[0].title, 'First Job')
  assert.equal(getSummaryCounts().goals, goals.length)
  for (const goal of goals.slice(1)) {
    assert.equal(typeof goal.id, 'number')
    assert.equal(goal.stepsCount, 0)
    assert.deepEqual(getChecklistPlan(goal.id).steps, [])
    assert.deepEqual(getRequirementsByGoal(goal.id), [])
  }
})

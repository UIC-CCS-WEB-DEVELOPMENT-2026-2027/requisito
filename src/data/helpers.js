import { goals } from './goals.js'
import { requirements } from './requirements.js'
import { documents } from './documents.js'
import { planningQuestions, planningRules } from './planningRules.js'
import { generatePlan } from '../utils/planGenerator.js'

export function getGoals() {
  return goals.map((goal) => ({ ...goal }))
}

export function getRequirementsByGoal(goalId) {
  return requirements.filter((requirement) => requirement.goalId === goalId)
    .map((requirement) => ({ ...requirement }))
}

export function getDocuments() {
  return documents.map((document) => ({ ...document }))
}

export function getSummaryCounts() {
  return {
    goals: goals.length,
    requirementsDone: requirements.filter((requirement) => requirement.status === 'done').length,
    documentsExpiring: documents.filter((document) => document.status === 'expiring').length,
  }
}

export function getPlanningQuestions() {
  return planningQuestions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({ ...option })),
  }))
}

// Adapter only: public catalog records keep numeric IDs and the Week 2 fields.
// Plan steps are a separate view model, not additional catalog fields.
export function getChecklistPlan(goalId, answers = {}) {
  const goal = goals.find((item) => item.id === goalId)
  if (!goal) {
    return { steps: [], unresolved: [], cycles: [], warnings: ['Unknown goal.'], ok: false }
  }
  const catalog = getRequirementsByGoal(goalId)
  const result = generatePlan(
    { id: String(goalId), requirements: catalog.map((item) => String(item.id)) },
    answers,
    catalog.map((item) => ({
      ...item,
      id: String(item.id),
      title: item.label,
      ...planningRules[item.id],
    })),
  )
  const records = new Map(catalog.map((item) => [String(item.id), item]))
  return {
    ...result,
    steps: result.steps.map((step) => ({
      ...step,
      id: step.kind === 'requirement' ? records.get(step.id).id : step.id,
      requirement: records.has(step.id) ? { ...records.get(step.id) } : null,
    })),
  }
}

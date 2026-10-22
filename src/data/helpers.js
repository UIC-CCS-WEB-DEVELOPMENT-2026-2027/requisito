import goals from './goals.json' with { type: 'json' }
import requirements from './requirements.json' with { type: 'json' }
import documents from './documents.json' with { type: 'json' }
import { planningQuestions, planningRules } from './planningRules.js'
import { generatePlan } from '../utils/planGenerator.js'

// Return copies so callers can use goals without changing the sample catalog.
export function getGoals() {
  return goals.map((goal) => ({ ...goal }))
}

// Return copies of matching requirements to keep the sample catalog unchanged.
export function getRequirementsByGoal(goalId) {
  return requirements.filter((requirement) => requirement.goalId === goalId)
    .map((requirement) => ({ ...requirement }))
}

// Return copies so callers can use documents without changing the sample records.
export function getDocuments() {
  return documents.map((document) => ({ ...document }))
}

// Derive dashboard counts from the catalog so totals follow the sample records.
export function getSummaryCounts() {
  return {
    goals: goals.length,
    requirementsDone: requirements.filter((requirement) => requirement.status === 'done').length,
    documentsExpiring: documents.filter((document) => document.status === 'expiring').length,
  }
}

// Copy questions and options so callers cannot change the sample choices.
export function getPlanningQuestions() {
  return planningQuestions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({ ...option })),
  }))
}

// Adapt catalog records into plan steps while preserving numeric IDs and catalog fields.
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

import { goals } from './goals.js'
import { requirements } from './requirements.js'
import { documents } from './documents.js'

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

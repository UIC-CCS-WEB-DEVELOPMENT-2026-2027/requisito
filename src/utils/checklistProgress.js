import { getChecklistPlan, getRequirementsByGoal } from '../data/helpers.js'

export const CHECKLIST_STORAGE_KEY = 'requisito.checklist-progress.v1'

export const CHECKLIST_STATUSES = [
  'not-started',
  'in-progress',
  'ready',
  'not-applicable',
]

export function getGoalProgressSummary(goalId, storage = null) {
  const definitions = getRequirementsByGoal(goalId)
  if (!definitions.length) {
    return {
      goalId,
      total: 0,
      completed: 0,
      applicable: 0,
      percent: 0,
      available: false,
      status: 'unavailable',
      statusText: 'Checklist unavailable',
      actionLabel: 'View checklist status',
    }
  }

  try {
    const progressStorage = storage ?? (
      typeof window === 'undefined' ? null : window.localStorage
    )
    const saved = readChecklistProgress(progressStorage, goalId)
    const plan = getChecklistPlan(goalId, saved.answers)
    if (!plan.ok || plan.warnings.length > 0) {
      return {
        goalId,
        total: 0,
        completed: 0,
        applicable: 0,
        percent: 0,
        available: false,
        status: 'unavailable',
        statusText: 'Checklist unavailable',
        actionLabel: 'View checklist status',
      }
    }
    const requirements = plan.steps
      .filter((step) => step.kind === 'requirement')
      .map((step) => step.requirement)
      .filter(Boolean)
    const reconciled = reconcileChecklistProgress(saved, requirements)
    const statuses = requirements.map((requirement) => reconciled.items[String(requirement.id)]?.status ?? 'not-started')
    const applicable = statuses.filter((status) => status !== 'not-applicable')
    const completed = applicable.filter((status) => status === 'ready').length
    const total = applicable.length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    let status = 'not-started'
    if (total > 0 && completed === total) status = 'completed'
    else if (total > 0 && (completed > 0 || applicable.some((itemStatus) => itemStatus === 'in-progress'))) {
      status = 'in-progress'
    }
    else if (total === 0) status = 'not-started'

    return {
      goalId,
      total,
      completed,
      applicable: total,
      percent,
      available: true,
      status,
      statusText: status,
      actionLabel: total === 0 ? 'View checklist' : (completed === total ? 'Continue checklist' : 'View checklist'),
    }
  } catch {
    return {
      goalId,
      total: 0,
      completed: 0,
      applicable: 0,
      percent: 0,
      available: false,
      status: 'unavailable',
      statusText: 'Checklist unavailable',
      actionLabel: 'View checklist status',
    }
  }
}

export function readChecklistProgress(storage, goalId) {
  if (!storage || typeof storage.getItem !== 'function') {
    throw new Error('Browser storage is unavailable.')
  }

  let raw
  try {
    raw = storage.getItem(CHECKLIST_STORAGE_KEY)
  } catch (error) {
    throw new Error('Checklist progress could not be read from browser storage.', { cause: error })
  }
  if (!raw) return { items: {}, answers: {} }

  const allProgress = JSON.parse(raw)
  if (!allProgress || typeof allProgress !== 'object' || Array.isArray(allProgress)) {
    throw new Error('Saved checklist data has an unsupported format.')
  }
  const saved = allProgress[String(goalId)] ?? { items: {}, answers: {} }
  if (
    !saved ||
    typeof saved !== 'object' ||
    !saved.items ||
    typeof saved.items !== 'object' ||
    Array.isArray(saved.items) ||
    (saved.answers != null && (
      typeof saved.answers !== 'object' ||
      Array.isArray(saved.answers)
    ))
  ) {
    throw new Error('Saved checklist progress is invalid.')
  }
  return { ...saved, answers: saved.answers ?? {} }
}

export function reconcileChecklistProgress(saved, requirements) {
  const previousItems = saved?.items ?? {}
  const currentIds = new Set(requirements.map((requirement) => String(requirement.id)))
  const items = { ...previousItems }
  let needsReview = false

  for (const requirement of requirements) {
    const id = String(requirement.id)
    const previous = previousItems[id]
    const validPrevious = previous && CHECKLIST_STATUSES.includes(previous.status)
    const revisionChanged = validPrevious && previous.revision !== requirement.revision
    if (revisionChanged) needsReview = true
    items[id] = validPrevious
      ? { ...previous, needsReview: revisionChanged }
      : { status: 'not-started', revision: requirement.revision, needsReview: false }
  }

  const obsoleteIds = Object.keys(previousItems).filter((id) => !currentIds.has(id))
  return {
    ...saved,
    items,
    obsoleteIds,
    needsReview: needsReview || obsoleteIds.length > 0,
  }
}

export function writeChecklistProgress(storage, goalId, progress) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    throw new Error('Browser storage is unavailable.')
  }
  const raw = storage.getItem(CHECKLIST_STORAGE_KEY)
  const allProgress = raw ? JSON.parse(raw) : {}
  if (!allProgress || typeof allProgress !== 'object' || Array.isArray(allProgress)) {
    throw new Error('Saved checklist data has an unsupported format.')
  }
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) {
    throw new Error('Checklist progress is invalid.')
  }
  storage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify({
    ...allProgress,
    [String(goalId)]: progress,
  }))
}

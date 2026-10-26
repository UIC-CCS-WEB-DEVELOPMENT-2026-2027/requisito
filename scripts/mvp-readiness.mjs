import { isAllowedSourceUrl } from '../server/config/sourceAllowlist.js'

const FIRST_JOB_GOAL_ID = 1
const FIRST_JOB_REQUIREMENT_COUNT = 6
const REQUIRED_DISCLAIMER_KEYS = [
  'disclaimer.banner',
  'goals.noApprovalNotice',
  'requirement.applicabilityUnknown',
  'requirement.currentDetailsNotice',
]

function includesCaveat(requirement) {
  const guidance = `${requirement.description} ${requirement.notes} ${requirement.guideInstructions}`
  return /\b(not confirmed|not verified|not established|does not establish|not a universal|confirm current|confirm .*before)\b/i.test(guidance)
}

export function assessMvpReadiness({ goals, requirements, sources, evidence, locales, governmentGate }) {
  const blockers = []
  const firstJobGoal = goals.find((goal) => goal.id === FIRST_JOB_GOAL_ID)
  const firstJobRequirements = requirements.filter((requirement) => requirement.goalId === FIRST_JOB_GOAL_ID)
  const sourcesById = new Map(sources.map((source) => [source.id, source]))
  const evidenceById = new Map(evidence.requirements.map((entry) => [entry.requirementId, entry]))

  if (!firstJobGoal) {
    blockers.push('The First Job goal is missing.')
  } else if (firstJobGoal.requirementIds.length !== FIRST_JOB_REQUIREMENT_COUNT) {
    blockers.push(`The First Job goal must link to ${FIRST_JOB_REQUIREMENT_COUNT} requirements.`)
  }
  if (firstJobRequirements.length !== FIRST_JOB_REQUIREMENT_COUNT) {
    blockers.push(`Expected ${FIRST_JOB_REQUIREMENT_COUNT} canonical First Job requirements; found ${firstJobRequirements.length}.`)
  }
  if (new Set(firstJobRequirements.map((requirement) => requirement.id)).size !== firstJobRequirements.length) {
    blockers.push('First Job requirement IDs must be unique.')
  }

  for (const requirement of firstJobRequirements) {
    const label = `${requirement.title ?? 'Untitled requirement'} (ID ${requirement.id})`
    if (!requirement.description?.trim() || !requirement.guideInstructions?.trim()) {
      blockers.push(`${label} needs a description and user guidance.`)
    }
    if (!Array.isArray(requirement.sourceIds) || requirement.sourceIds.length === 0) {
      blockers.push(`${label} needs at least one official source link.`)
    }
    for (const sourceId of requirement.sourceIds ?? []) {
      const source = sourcesById.get(sourceId)
      if (!source || !isAllowedSourceUrl(source.url)) {
        blockers.push(`${label} has a missing or non-allowlisted source: ${sourceId}.`)
      }
    }

    const evidenceEntry = evidenceById.get(requirement.id)
    if (!evidenceEntry) {
      blockers.push(`${label} has no evidence package or documented research disposition.`)
    } else {
      if (evidenceEntry.title !== requirement.title ||
          JSON.stringify(evidenceEntry.sourceIds) !== JSON.stringify(requirement.sourceIds)) {
        blockers.push(`${label} does not match its evidence package title or source relationships.`)
      }
      if (
        ['blocked', 'partial', 'insufficient'].includes(evidenceEntry.researchStatus) ||
        ['partial', 'insufficient'].includes(evidenceEntry.evidenceCompleteness)
      ) {
        if (!includesCaveat(requirement)) {
          blockers.push(`${label} has unresolved research but its public guidance lacks a clear caveat.`)
        }
      }
    }
    if (requirement.verification === 'conflicting' ||
        (requirement.sourceIds ?? []).some((sourceId) => sourcesById.get(sourceId)?.verification === 'conflicting')) {
      blockers.push(`${label} has conflicting information and cannot be used for MVP guidance.`)
    }
  }

  for (const [index, locale] of locales.entries()) {
    for (const key of REQUIRED_DISCLAIMER_KEYS) {
      if (typeof locale[key] !== 'string' || !locale[key].trim()) {
        blockers.push(`Locale ${index + 1} is missing the safety disclaimer "${key}".`)
      }
    }
  }

  const mvpStatus = blockers.length ? 'MVP_BLOCKED' : 'MVP_READY'
  const productionVerificationStatus = governmentGate.result === 'PASS'
    ? 'PASS'
    : 'PRODUCTION_VERIFICATION_PENDING'

  return {
    result: mvpStatus,
    productionVerificationStatus,
    governmentVerificationGate: governmentGate.result,
    scope: 'Demonstration and controlled MVP testing only; this is not government verification or public-release approval.',
    blockers,
    limitations: [
      'This assessment checks catalog structure and public-safety qualifications; it does not prove that agency procedures are current.',
      'HTTP integration and Playwright browser tests run separately; this assessment does not execute them or imply they passed.',
      'Passing this assessment does not authorize deployment or establish operational readiness.',
    ],
  }
}

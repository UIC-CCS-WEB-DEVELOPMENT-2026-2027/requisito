import {
  allowedSource,
  validDate,
  validHttpsUrl,
  verificationReviewIssues,
} from './audit-rules.mjs'

const REVIEW_EVIDENCE_FIELDS = [
  'reviewedById',
  'requestId',
  'reviewedAt',
  'sourceAccessedOn',
  'note',
]

function hasIndependentReview(record) {
  const review = record.verificationReview
  return record.verification === 'verified' &&
    review?.independent === true &&
    REVIEW_EVIDENCE_FIELDS.every((field) => review[field] !== undefined && review[field] !== null)
}

export function assessFirstJobRelease({ goals, requirements, sources, evidence, locales }) {
  const issues = []
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const firstJobGoal = goals.find((goal) => goal.id === 1)
  const firstJobRequirements = requirements.filter((record) => record.goalId === 1)
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const evidenceById = new Map(evidence.requirements.map((entry) => [entry.requirementId, entry]))

  if (!firstJobGoal) issues.push('First Job goal ID 1 is missing.')
  if (firstJobRequirements.length !== 6) {
    issues.push(`Expected 6 First Job requirements; found ${firstJobRequirements.length}.`)
  }
  if (evidenceById.size !== evidence.requirements.length) {
    issues.push('Evidence package contains duplicate requirement IDs.')
  }

  for (const key of ['goals.noApprovalNotice', 'requirement.applicabilityUnknown']) {
    for (const [index, locale] of locales.entries()) {
      if (typeof locale[key] !== 'string' || !locale[key].trim()) {
        issues.push(`Locale ${index + 1} is missing required disclaimer "${key}".`)
      }
    }
  }

  const requirementResults = firstJobRequirements.map((record) => {
    const entry = evidenceById.get(record.id)
    const itemIssues = []
    const blockingReasons = []
    if (!entry) {
      itemIssues.push('No evidence package exists for this requirement.')
    } else {
      if (entry.title !== record.title) itemIssues.push('Evidence title does not match the catalog.')
      if (JSON.stringify(entry.sourceIds) !== JSON.stringify(record.sourceIds)) {
        itemIssues.push('Evidence source IDs do not match the requirement catalog.')
      }
      if (!['complete_for_limited_claims', 'partial', 'insufficient'].includes(entry.evidenceCompleteness)) {
        itemIssues.push('Evidence package has an invalid completeness status.')
      }
      if (!['complete', 'pending', 'blocked'].includes(entry.researchStatus)) {
        itemIssues.push('Evidence package has an invalid research status.')
      }
      if (!['included', 'excluded'].includes(entry.releaseDisposition)) {
        itemIssues.push('Evidence package has an invalid release disposition.')
      }
      if (entry.releaseDisposition === 'excluded' &&
          (typeof entry.exclusionReason !== 'string' || !entry.exclusionReason.trim())) {
        itemIssues.push('Excluded requirement needs a documented reason.')
      }
      if (!Array.isArray(entry.claims) || entry.claims.length === 0) {
        itemIssues.push('Evidence package has no factual-claim records.')
      } else {
        for (const [claimIndex, claim] of entry.claims.entries()) {
          if (!claim.claim?.trim() || !claim.supportingPassage?.trim() ||
              !/^\d{4}-\d{2}-\d{2}$/.test(claim.accessedOn ?? '')) {
            itemIssues.push(`Claim ${claimIndex + 1} lacks a claim, evidence passage, or access date.`)
          }
          if (!Array.isArray(claim.sourceIds) || claim.sourceIds.length === 0 ||
              claim.sourceIds.some((sourceId) => !entry.sourceIds.includes(sourceId))) {
            itemIssues.push(`Claim ${claimIndex + 1} has invalid source relationships.`)
          }
        }
      }
    }

    const linkedSources = (record.sourceIds ?? []).map((sourceId) => sourceById.get(sourceId))
    if (linkedSources.some((source) => !source)) {
      itemIssues.push('A linked source record is missing.')
    }
    if (!['unverified', 'verified', 'conflicting'].includes(record.verification)) {
      itemIssues.push('Requirement has an invalid verification status.')
    } else if (record.verification === 'conflicting') {
      itemIssues.push('Requirement has conflicting verification evidence.')
    }
    if (record.verification !== 'verified' && record.verificationReview !== undefined) {
      itemIssues.push('Unverified requirement must not retain approval evidence.')
    }
    if (record.verification === 'verified') {
      itemIssues.push(...verificationReviewIssues(record, today))
    }
    for (const source of linkedSources) {
      if (source && !['unverified', 'verified', 'conflicting'].includes(source.verification)) {
        itemIssues.push('A linked source has an invalid verification status.')
      } else if (source?.verification === 'conflicting') {
        itemIssues.push('A linked source has conflicting verification evidence.')
      }
      if (source && source.verification !== 'verified' && source.verificationReview !== undefined) {
        itemIssues.push('Unverified linked source must not retain approval evidence.')
      }
      if (source?.verification === 'verified') {
        itemIssues.push(...verificationReviewIssues(source, today))
      }
    }
    const excluded = entry?.releaseDisposition === 'excluded'
    let status
    if (itemIssues.length || !entry) {
      status = 'BLOCKED'
    } else if (excluded) {
      status = 'EXCLUDED'
    } else if (
      entry.researchStatus === 'blocked' ||
      entry.evidenceCompleteness !== 'complete_for_limited_claims'
    ) {
      status = 'BLOCKED'
    } else if (
      entry.researchStatus !== 'complete' ||
      !hasIndependentReview(record) ||
      linkedSources.some((source) => !hasIndependentReview(source))
    ) {
      status = 'PENDING'
    } else {
      status = 'PASS'
    }
    if (status === 'EXCLUDED') {
      blockingReasons.push('Requirement is marked excluded but remains in the public catalog.')
    } else if (status === 'BLOCKED') {
      if (itemIssues.length) blockingReasons.push(...itemIssues)
      if (entry?.researchStatus === 'blocked') {
        blockingReasons.push('Research is blocked by unresolved evidence gaps.')
      }
      if (entry && entry.evidenceCompleteness !== 'complete_for_limited_claims') {
        blockingReasons.push(`Evidence completeness is ${entry.evidenceCompleteness}; insufficient for release.`)
      }
      if (entry?.claims?.some((claim) => claim.researchStatus === 'blocked')) {
        blockingReasons.push('At least one claim has no supporting procedural evidence.')
      }
      if (blockingReasons.length === 0) {
        blockingReasons.push('Requirement or linked source is not eligible for publication.')
      }
    } else if (status === 'PENDING') {
      if (record.verification !== 'verified') {
        blockingReasons.push('Requirement has not received independent approval.')
      }
      for (const source of linkedSources) {
        if (source && !hasIndependentReview(source)) {
          blockingReasons.push(`Source ${source.id} has not received independent approval.`)
        }
      }
    }
    return {
      requirementId: record.id,
      title: record.title,
      status,
      sourceIds: record.sourceIds ?? [],
      issues: itemIssues,
      blockingReasons,
    }
  })

  for (const entry of evidence.requirements) {
    if (!firstJobRequirements.some((record) => record.id === entry.requirementId)) {
      issues.push(`Evidence package references unknown First Job requirement ${entry.requirementId}.`)
    }
    if (requirementResults.some((item) => item.status === 'EXCLUDED')) {
      issues.push('Excluded requirements must be withheld from the public catalog before release can pass.')
    }
  }

  const linkedSourceIds = [...new Set(firstJobRequirements.flatMap((record) => record.sourceIds ?? []))]
  const sourceResults = linkedSourceIds.map((sourceId) => {
    const source = sourceById.get(sourceId)
    const sourceIssues = []
    if (source) {
      if (typeof source.title !== 'string' || !source.title.trim()) sourceIssues.push('Source title is missing.')
      if (typeof source.agency !== 'string' || !source.agency.trim()) sourceIssues.push('Source agency is missing.')
      if (!validHttpsUrl(source.url) || !allowedSource(source.url)) {
        sourceIssues.push('Source URL must be HTTPS and use an official Philippine government host.')
      }
      if (!validDate(source.lastChecked) || source.lastChecked > today) {
        sourceIssues.push('Source access date is missing, invalid, or in the future.')
      }
      if (!['unverified', 'verified', 'conflicting'].includes(source.verification)) {
        sourceIssues.push('Source has an invalid verification status.')
      } else if (source.verification === 'conflicting') {
        sourceIssues.push('Source has conflicting verification evidence.')
      }
      if (source.verification !== 'verified' && source.verificationReview !== undefined) {
        sourceIssues.push('Unverified source must not retain approval evidence.')
      }
    }
    if (source?.verification === 'verified') {
      sourceIssues.push(...verificationReviewIssues(source, today))
    }
    return {
      sourceId,
      verification: source?.verification ?? 'missing',
      status: !source || sourceIssues.length || source.verification === 'conflicting' ||
        !['unverified', 'verified'].includes(source.verification)
        ? 'BLOCKED'
        : hasIndependentReview(source) ? 'PASS' : 'PENDING',
      issues: sourceIssues,
      blockingReasons: sourceIssues.length
        ? sourceIssues
        : source && hasIndependentReview(source)
          ? []
          : [source ? 'Source has not received independent approval.' : 'Linked source record is missing.'],
    }
  })
  const blockers = [
    ...requirementResults.filter((item) => item.status !== 'PASS').map((item) => ({
      type: 'requirement',
      id: item.requirementId,
      title: item.title,
      status: item.status,
      reasons: item.blockingReasons,
    })),
    ...sourceResults.filter((item) => item.status !== 'PASS').map((item) => ({
      type: 'source',
      id: item.sourceId,
      status: item.status,
      reasons: item.blockingReasons,
    })),
    ...issues.map((issue) => ({ type: 'catalog', status: 'BLOCKED', reasons: [issue] })),
  ]

  const result = issues.length ||
    requirementResults.some((item) => item.status === 'BLOCKED') ||
    sourceResults.some((source) => source.status === 'BLOCKED')
    ? 'BLOCKED'
    : requirementResults.some((item) => item.status === 'PENDING') ||
      sourceResults.some((source) => source.status === 'PENDING')
      ? 'PENDING'
      : 'PASS'
  return { result, requirements: requirementResults, sources: sourceResults, issues, blockers }
}

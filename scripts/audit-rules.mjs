export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export const REVIEW_INTERVAL_DAYS = 365

export function reviewIsExpired(value, today, intervalDays = REVIEW_INTERVAL_DAYS) {
  if (!validDate(value) || !validDate(today)) return false
  const checkedAt = Date.parse(`${value}T00:00:00Z`)
  const currentDate = Date.parse(`${today}T00:00:00Z`)
  return currentDate - checkedAt > intervalDays * 24 * 60 * 60 * 1000
}

export function requirementSourceCheckDateIssues(source, today) {
  const attribution = source.researchAttribution
  const hasAttribution = attribution !== undefined
  const validAttribution = attribution &&
    typeof attribution === 'object' &&
    !Array.isArray(attribution) &&
    typeof attribution.documentTitle === 'string' &&
    attribution.documentTitle.trim() &&
    Array.isArray(attribution.documentPages) &&
    attribution.documentPages.length > 0 &&
    attribution.documentPages.every((page) => Number.isInteger(page) && page > 0) &&
    validDate(attribution.sourceCheckDateReported) &&
    attribution.sourceCheckDateReported <= today
  const issues = []

  if (hasAttribution && !validAttribution) {
    issues.push('invalid researchAttribution')
  }
  if (source.lastChecked === null) {
    if (source.verification !== 'unverified' || !validAttribution) {
      issues.push('missing lastChecked requires an unverified source with valid research attribution')
    }
    return issues
  }
  if (!validDate(source.lastChecked) || source.lastChecked > today) {
    issues.push('invalid or future lastChecked')
    return issues
  }
  if (reviewIsExpired(source.lastChecked, today)) {
    issues.push('source review is older than 365 days')
  }
  return issues
}

export function allowedSource(value, allowedHosts = []) {
  let source
  try {
    source = new URL(value)
  } catch {
    return false
  }
  if (source.protocol !== 'https:' || source.username || source.password) return false
  const host = source.hostname.toLowerCase()
  return host.endsWith('.gov.ph') || allowedHosts.includes(host)
}

export function validHttpsUrl(value) {
  try {
    const source = new URL(value)
    return source.protocol === 'https:' && Boolean(source.hostname) && !source.username && !source.password
  } catch {
    return false
  }
}

export function verificationReviewIssues(record, today) {
  if (record.verification !== 'verified') return []

  const review = record.verificationReview
  if (!review || typeof review !== 'object' || Array.isArray(review)) {
    return ['verified record needs independent review evidence']
  }

  const issues = []
  if (!Number.isSafeInteger(review.reviewedById) || review.reviewedById < 1) {
    issues.push('verified record needs a reviewer ID')
  }
  if (!Number.isSafeInteger(review.requestId) || review.requestId < 1) {
    issues.push('verified record needs a verification request ID')
  }
  if (review.independent !== true) {
    issues.push('verified record needs an independent reviewer decision')
  }
  if (!validDate(review.reviewedAt) || review.reviewedAt > today) {
    issues.push('verified record needs a valid review date')
  }
  if (!validDate(review.sourceAccessedOn) ||
      review.sourceAccessedOn > today ||
      (validDate(review.reviewedAt) && review.sourceAccessedOn > review.reviewedAt)) {
    issues.push('verified record needs a valid source access date no later than review')
  }
  if (typeof review.note !== 'string' || review.note.trim().length < 10) {
    issues.push('verified record needs a substantive review note')
  }
  return issues
}

export function verificationIssues(record, today, allowedHosts = []) {
  const problems = []
  if (record.demoOnly === true && record.verification === 'verified') {
    problems.push('demo-only content cannot be marked verified')
  }
  if (record.verification !== 'verified' && record.lastVerified !== null) {
    problems.push('non-verified record must not have a lastVerified date')
  }
  if (record.verification !== 'verified' && record.verificationReview !== undefined) {
    problems.push('non-verified record must not retain verification review evidence')
  }
  if (record.type === 'fact' && record.sourceUrl && !validHttpsUrl(record.sourceUrl)) {
    problems.push('fact sourceUrl must be an HTTPS URL')
  }
  if (record.sourceUrl && !allowedSource(record.sourceUrl, allowedHosts)) {
    problems.push('sourceUrl must use HTTPS and an allowed government host')
  }
  if (record.lastVerified !== null && (!validDate(record.lastVerified) || record.lastVerified > today)) {
    problems.push('invalid/future lastVerified')
  }
  if (record.verification === 'verified') {
    if (!record.sourceUrl || !allowedSource(record.sourceUrl, allowedHosts)) {
      problems.push('verified source must use HTTPS and an allowed government host')
    }
    if (!validDate(record.lastVerified) || record.lastVerified > today) {
      problems.push('verified record needs a current lastVerified date')
    } else if (reviewIsExpired(record.lastVerified, today)) {
      problems.push(`verified record review is older than ${REVIEW_INTERVAL_DAYS} days`)
    }
    if (/\b(sample|placeholder|fictional)\b/i.test(`${record.title} ${record.description} ${record.notes}`)) {
      problems.push('verified record contains fictional markers')
    }
    problems.push(...verificationReviewIssues(record, today))
  }
  return problems
}

export function requirementEvidenceIssues(requirements, sources, today) {
  const issues = []
  const sourceById = new Map(sources.map((source) => [source.id, source]))

  for (const requirement of requirements) {
    const label = `requirement ${requirement.id}`
    if (requirement.demoOnly === true) continue
    if (!Array.isArray(requirement.sourceIds) || requirement.sourceIds.length === 0) {
      issues.push(`${label}: needs at least one linked source`)
      continue
    }
    if (new Set(requirement.sourceIds).size !== requirement.sourceIds.length) {
      issues.push(`${label}: has duplicate source IDs`)
    }

    const linkedSources = requirement.sourceIds.map((sourceId) => sourceById.get(sourceId))
    for (const [index, source] of linkedSources.entries()) {
      if (!source) {
        issues.push(`${label}: unknown source ID "${requirement.sourceIds[index]}"`)
      }
    }
  }

  for (const source of sources) {
    if (source.verification === 'verified') {
      issues.push(...verificationReviewIssues(source, today)
        .map((issue) => `requirement source ${source.id}: ${issue}`))
    }
  }
  return issues
}

export function validBarangayDistrict(value, districts) {
  return districts.includes(value)
}

export const BARANGAY_DISTRICT_COUNTS = {
  Poblacion: 40,
  Talomo: 14,
  Agdao: 11,
  Buhangin: 13,
  Bunawan: 9,
  Paquibato: 13,
  Baguio: 8,
  Calinan: 19,
  Marilog: 12,
  Toril: 25,
  Tugbok: 18,
}

export const BARANGAY_LEGISLATIVE_DISTRICTS = {
  Poblacion: '1st',
  Talomo: '1st',
  Agdao: '2nd',
  Buhangin: '2nd',
  Bunawan: '2nd',
  Paquibato: '2nd',
  Baguio: '3rd',
  Calinan: '3rd',
  Marilog: '3rd',
  Toril: '3rd',
  Tugbok: '3rd',
}

export function barangayCatalogIssues(records) {
  if (!records.some((record) => record.type === 'barangay' && !record.isSample)) return []

  const issues = []
  if (records.length !== 182) issues.push(`barangays: expected 182 real records, found ${records.length}`)

  const names = new Set()
  const slugs = new Set()
  const counts = Object.fromEntries(Object.keys(BARANGAY_DISTRICT_COUNTS).map((name) => [name, 0]))
  for (const record of records) {
    if (names.has(record.title)) issues.push(`barangays: duplicate name "${record.title}"`)
    names.add(record.title)
    if (slugs.has(record.slug)) issues.push(`barangays: duplicate slug "${record.slug}"`)
    slugs.add(record.slug)
    if (Object.hasOwn(counts, record.adminDistrict)) counts[record.adminDistrict] += 1
    if (record.legislativeDistrict !== BARANGAY_LEGISLATIVE_DISTRICTS[record.adminDistrict]) {
      issues.push(`barangays: ${record.title} has a legislative district that does not match ${record.adminDistrict}`)
    }
    if (!Number.isInteger(record.population2020) && record.population2020 !== null) {
      issues.push(`barangays: ${record.title} population2020 must be a non-negative integer or null`)
    } else if (record.population2020 !== null && record.population2020 < 0) {
      issues.push(`barangays: ${record.title} population2020 must be non-negative`)
    }
    if (record.isSample || record.verification !== 'unverified' || record.lastVerified !== null) {
      issues.push(`barangays: ${record.title} must remain non-sample and unverified`)
    }
  }
  for (const [district, expected] of Object.entries(BARANGAY_DISTRICT_COUNTS)) {
    if (counts[district] !== expected) {
      issues.push(`barangays: ${district} expected ${expected} records, found ${counts[district]}`)
    }
  }
  return issues
}

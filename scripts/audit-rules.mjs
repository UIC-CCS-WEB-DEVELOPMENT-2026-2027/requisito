export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
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

export function verificationIssues(record, today, allowedHosts = []) {
  const problems = []
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
    }
    if (/\b(sample|placeholder|fictional)\b/i.test(`${record.title} ${record.description} ${record.notes}`)) {
      problems.push('verified record contains fictional markers')
    }
  }
  return problems
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

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

export function verificationIssues(record, today, allowedHosts = []) {
  const problems = []
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

export const sourceAllowlist = new Set([
  'davaocity.gov.ph',
  'www.davaocity.gov.ph',
  'hrmo.davaocity.gov.ph',
  'rsso11.psa.gov.ph',
  'psa.gov.ph',
  'comelec.gov.ph',
  'www.sss.gov.ph',
  'member.sss.gov.ph',
  'www.philhealth.gov.ph',
  'nbi.gov.ph',
  'clearance.nbi.gov.ph',
  'www.pagibigfund.gov.ph',
  'orus.bir.gov.ph',
  'www.officialgazette.gov.ph',
])

export function isAllowedSourceUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      sourceAllowlist.has(url.hostname.toLowerCase())
  } catch {
    return false
  }
}

import RecordMeta from './RecordMeta.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isDate(value) {
  if (!isText(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isSafeUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

function RequirementSourceCard({ source }) {
  const { t } = useLanguage()
  const record = source && typeof source === 'object' ? source : {}
  const claims = Array.isArray(record.supports)
    ? record.supports.filter(isText)
    : []
  const relatedSources = Array.isArray(record.relatedSources)
    ? record.relatedSources.filter(isSafeUrl)
    : []
  const verification = ['verified', 'unverified', 'conflicting'].includes(record.verification)
    ? record.verification
    : 'unverified'
  const hasDatedEvidence = [record.publishedDate, record.statementDate, record.effectiveDate]
    .some(isDate)

  return (
    <li className="guidance-card">
      <h3>{isText(record.title) ? record.title : t('goals.sourceTitleUnavailable')}</h3>
      <p>
        {isText(record.agency) ? record.agency : t('goals.agencyUnknown')}
        {' · '}
        {isText(record.evidenceType) ? record.evidenceType : t('goals.evidenceTypeUnavailable')}
      </p>
      {isDate(record.publishedDate) && (
        <p>{t('goals.publishedDate')}: <time dateTime={record.publishedDate}>{record.publishedDate}</time></p>
      )}
      {isDate(record.statementDate) && (
        <p>{t('goals.statementDate')}: <time dateTime={record.statementDate}>{record.statementDate}</time></p>
      )}
      {isDate(record.effectiveDate) && (
        <p>{t('goals.effectiveDate')}: <time dateTime={record.effectiveDate}>{record.effectiveDate}</time></p>
      )}
      {!hasDatedEvidence && <p>{t('goals.sourceDateUnavailable')}</p>}
      <p>
        {t('goals.lastChecked')}:{' '}
        {isDate(record.lastChecked)
          ? <time dateTime={record.lastChecked}>{record.lastChecked}</time>
          : t('goals.lastCheckedUnavailable')}
      </p>
      <h4>{t('goals.sourceSupports')}</h4>
      {claims.length ? (
        <ul>{claims.map((claim, index) => <li key={`${index}-${claim}`}>{claim}</li>)}</ul>
      ) : (
        <p>{t('goals.sourceClaimsUnavailable')}</p>
      )}
      <p className="verification-notice">
        {isText(record.limitations) ? record.limitations : t('goals.sourceLimitationsUnavailable')}
      </p>
      <RecordMeta record={{
        verification,
        lastVerified: null,
        sourceUrl: isSafeUrl(record.url) ? record.url : '',
        relatedSources,
      }} />
    </li>
  )
}

export default RequirementSourceCard

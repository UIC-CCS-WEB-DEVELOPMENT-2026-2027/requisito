import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getStatusReport, STALE_DAYS } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Status() {
  const { t } = useLanguage()
  const report = getStatusReport()
  const types = Object.entries(report.verificationCounts)
  return (
    <section className="page-content flow-content" aria-labelledby="status-title">
      <p className="eyebrow">Catalog transparency</p>
      <h1 id="status-title">{t('page.status')}</h1>
      <p className="page-description">Counts are calculated from the current data files. Sample barangay fixtures are excluded.</p>
      <section aria-labelledby="verification-counts-title">
        <h2 id="verification-counts-title">Verification counts</h2>
        <div className="portal-grid">
          {types.map(([type, counts]) => (
            <article className="portal-card" key={type}>
              <h3>{type}</h3>
              <p>Verified: {counts.verified}</p>
              <p>Unverified: {counts.unverified}</p>
              <p>Conflicting: {counts.conflicting}</p>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="stale-title">
        <h2 id="stale-title">Older than {STALE_DAYS} days</h2>
        {report.stale.length ? (
          <ul className="portal-grid">{report.stale.map((record) => (
            <li className="portal-card" key={`${record.dataType}-${record.id}`}>
              <h3>{record.title ?? record.label}</h3>
              <RecordMeta record={record} />
            </li>
          ))}</ul>
        ) : <EmptyState message="No verified records are older than the review window." />}
      </section>
      <section aria-labelledby="time-sensitive-title">
        <h2 id="time-sensitive-title">Time-sensitive records</h2>
        {report.timeSensitive.length ? (
          <ul className="portal-grid">{report.timeSensitive.map((record) => (
            <li className="portal-card" key={`${record.dataType}-${record.id}`}>
              <h3>{record.title ?? record.label ?? record.type}</h3>
              <p>{record.notes}</p>
              <RecordMeta record={record} />
            </li>
          ))}</ul>
        ) : <EmptyState message="No time-sensitive records are flagged." />}
      </section>
      <section aria-labelledby="known-gaps-title">
        <h2 id="known-gaps-title">Known gaps</h2>
        {report.knownGaps.length ? (
          <ul className="portal-grid">{report.knownGaps.map((record) => (
            <li className="portal-card" key={`${record.dataType}-${record.id}`}>
              <p className="eyebrow">{record.dataType}</p>
              <h3>{record.title ?? record.label ?? record.type}</h3>
              <RecordMeta record={record} />
            </li>
          ))}</ul>
        ) : <EmptyState message="No unverified records remain." />}
      </section>
    </section>
  )
}

export default Status

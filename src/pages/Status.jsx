import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getStatusReport, getSourceWatchStatus, STALE_DAYS } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Status() {
  const { t } = useLanguage()
  const report = getStatusReport()
  const types = Object.entries(report.verificationCounts)
  const sourceWatch = getSourceWatchStatus()
  const typeKeys = {
    services: 'group.services',
    barangays: 'group.barangays',
    requirements: 'group.requirements',
    officials: 'group.officials',
    cityFacts: 'group.cityFacts',
    updates: 'group.updates',
    history: 'nav.history',
    briefs: 'nav.briefs',
    budget: 'nav.budget',
    procurement: 'nav.procurement',
    elections: 'nav.elections',
    accountability: 'nav.accountability',
  }
  return (
    <section className="page-content directory-page" aria-labelledby="status-title">
      <header className="page-heading">
        <p className="eyebrow">{t('status.eyebrow')}</p>
        <h1 id="status-title">{t('page.status')}</h1>
        <p className="page-description">{t('status.description')}</p>
      </header>
      <p>{t('label.lastSourceWatch')}: {sourceWatch.lastChecked ?? t('status.notRun')}</p>
      <section aria-labelledby="verification-counts-title">
        <h2 id="verification-counts-title">{t('status.verificationCounts')}</h2>
        <div className="portal-grid">
          {types.map(([type, counts]) => (
            <article className="portal-card" key={type}>
              <h3>{t(typeKeys[type])}</h3>
              <p>{t('status.verified')}: {counts.verified}</p>
              <p>{t('status.unverified')}: {counts.unverified}</p>
              <p>{t('status.conflicting')}: {counts.conflicting}</p>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="stale-title">
        <h2 id="stale-title">{t('status.olderThan').replace('{days}', STALE_DAYS)}</h2>
        {report.stale.length ? (
          <ul className="portal-grid">{report.stale.map((record) => (
            <li className="portal-card" key={`${record.dataType}-${record.id}`}>
              <h3>{record.title ?? record.label}</h3>
              <RecordMeta record={record} />
            </li>
          ))}</ul>
        ) : <EmptyState message={t('status.noVerifiedOlder')} />}
      </section>
      <section aria-labelledby="time-sensitive-title">
        <h2 id="time-sensitive-title">{t('status.timeSensitive')}</h2>
        {report.timeSensitive.length ? (
          <ul className="portal-grid">{report.timeSensitive.map((record) => (
            <li className="portal-card" key={`${record.dataType}-${record.id}`}>
              <h3>{record.title ?? record.label ?? record.type}</h3>
              <p>{record.notes}</p>
              <RecordMeta record={record} />
            </li>
          ))}</ul>
        ) : <EmptyState message={t('status.noneTimeSensitive')} />}
      </section>
      <section aria-labelledby="known-gaps-title">
        <h2 id="known-gaps-title">{t('status.knownGaps')}</h2>
        {report.knownGaps.length ? (
          <ul className="portal-grid">{report.knownGaps.map((record) => (
            <li className="portal-card" key={`${record.dataType}-${record.id}`}>
              <p className="eyebrow">{record.dataType}</p>
              <h3>{record.title ?? record.label ?? record.type}</h3>
              <RecordMeta record={record} />
            </li>
          ))}</ul>
        ) : <EmptyState message={t('status.noUnverified')} />}
      </section>
    </section>
  )
}

export default Status

import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getCityMonitor, STALE_DAYS } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Monitor() {
  const { t } = useLanguage()
  const monitor = getCityMonitor()
  const coverage = Object.entries(monitor.verificationCounts)
  return (
    <section className="page-content flow-content" aria-labelledby="monitor-title">
      <p className="eyebrow">Catalog health</p>
      <h1 id="monitor-title">{t('page.monitor')}</h1>
      <p className="page-description">This dashboard summarizes Requisito's own local catalogs. It does not score officials or use live news feeds.</p>
      <section aria-labelledby="monitor-coverage-title">
        <h2 id="monitor-coverage-title">{t('heading.verificationCoverage')}</h2>
        <div className="portal-grid">{coverage.map(([type, count]) => {
          const typeTotal = count.verified + count.unverified + count.conflicting
          const percentage = typeTotal ? count.verified / typeTotal * 100 : 0
          return <article className="portal-card" key={type}>
            <h3>{type}</h3>
            <p>{count.verified} verified; {count.unverified} unverified; {count.conflicting} conflicting</p>
            <div className="data-bar" role="img" aria-label={`${percentage.toFixed(1)} percent of all records are verified`}><span style={{ width: `${percentage}%` }} /></div>
          </article>
        })}</div>
      </section>
      <section aria-labelledby="monitor-watch-title">
        <h2 id="monitor-watch-title">{t('heading.sourceWatch')}</h2>
        <p>{t('label.lastChecked')}: {monitor.sourceWatch.lastChecked ?? t('status.notRun')}</p>
        <p>{monitor.sourceWatch.changed} {t('label.changed')}, {monitor.sourceWatch.unreachable} {t('label.unreachable')}, {monitor.sourceWatch.unchanged} {t('label.unchanged')}.</p>
        {!monitor.sourceWatch.lastChecked && <EmptyState message={t('status.noSourceWatch')} />}
      </section>
      <section aria-labelledby="monitor-gaps-title">
        <h2 id="monitor-gaps-title">{t('heading.knownDataGaps')}</h2>
        {Object.values(monitor.gapCounts).some((count) => count > 0)
          ? <ul>{Object.entries(monitor.gapCounts).filter(([, count]) => count > 0).map(([type, count]) =>
            <li key={type}>{type}: {count} unverified or conflicting records</li>)}</ul>
          : <EmptyState message={t('status.noVerificationGaps')} />}
      </section>
      <section aria-labelledby="monitor-stale-title">
        <h2 id="monitor-stale-title">{t('heading.staleRecords')} (older than {STALE_DAYS} days)</h2>
        {monitor.stale.length
          ? <ul className="portal-grid">{monitor.stale.map((record) => <li className="portal-card" key={`${record.dataType}-${record.id}`}><h3>{record.title ?? record.label}</h3><RecordMeta record={record} /></li>)}</ul>
          : <EmptyState message={t('status.noStaleRecords')} />}
      </section>
      <section aria-labelledby="monitor-sensitive-title">
        <h2 id="monitor-sensitive-title">{t('heading.timeSensitiveRecords')}</h2>
        {monitor.timeSensitive.length
          ? <ul>{monitor.timeSensitive.map((record) => <li key={`${record.dataType}-${record.id}`}>{record.title ?? record.label}: {record.notes}</li>)}</ul>
          : <EmptyState message={t('status.noSensitiveRecords')} />}
      </section>
    </section>
  )
}

export default Monitor

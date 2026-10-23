import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getElections } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Elections() {
  const { t } = useLanguage()
  const sources = getElections()
  return (
    <section className="page-content flow-content" aria-labelledby="elections-title">
      <p className="eyebrow">{t('elections.eyebrow')}</p>
      <h1 id="elections-title">{t('page.elections')}</h1>
      <p className="page-description">{t('elections.description')}</p>
      <h2>{t('heading.electionSources')}</h2>
      {sources.length ? <div className="portal-grid">{sources.map((source) =>
        <article className="portal-card" key={source.id}>
          <h2>{source.title}</h2><p>{source.description}</p><RecordMeta record={source} />
        </article>)}</div> : <EmptyState message={t('elections.empty')} />}
      <p>{t('label.comelecOfficialSite')}: <a href="https://comelec.gov.ph" target="_blank" rel="noopener noreferrer">comelec.gov.ph</a> <span className="status-badge">{t('status.unverified')}</span></p>
    </section>
  )
}

export default Elections

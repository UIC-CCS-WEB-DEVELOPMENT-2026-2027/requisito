import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getHistory } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function History() {
  const { t } = useLanguage()
  const entries = getHistory()
  return (
    <section className="page-content flow-content" aria-labelledby="history-title">
      <p className="eyebrow">Davao City timeline</p>
      <h1 id="history-title">{t('page.history')}</h1>
      <p className="page-description">Only dated, sourced entries supplied for this project appear here.</p>
      {entries.length ? (
        <ol className="history-timeline">
          {entries.map((entry) => (
            <li className="portal-card" key={entry.id}>
              <p className="eyebrow">{entry.year ?? t('label.dateToConfirm')}</p>
              <h2>{entry.title}</h2>
              <p>{entry.description}</p>
              <RecordMeta record={entry} />
            </li>
          ))}
        </ol>
      ) : <EmptyState message={t('status.noHistory')} />}
    </section>
  )
}

export default History

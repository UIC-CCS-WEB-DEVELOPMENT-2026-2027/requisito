import CatalogEmptyState from '../components/CatalogEmptyState.jsx'
import OfficialSourceDirectory from '../components/OfficialSourceDirectory.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getHistory } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function History() {
  const { t } = useLanguage()
  const entries = getHistory()
  return (
    <section className="page-content flow-content" aria-labelledby="history-title">
      <p className="eyebrow">{t('history.eyebrow')}</p>
      <h1 id="history-title">{t('page.history')}</h1>
      <p className="page-description">{t('history.description')}</p>
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
      ) : <CatalogEmptyState
        what={t('emptyState.historyWhat')}
        how={t('emptyState.dataHow')}
        action={t('emptyState.historyAction')}
      />}
      <OfficialSourceDirectory feature="history" />
    </section>
  )
}

export default History

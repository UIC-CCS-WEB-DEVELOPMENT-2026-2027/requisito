import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getUpdates } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Updates() {
  const { t } = useLanguage()
  const updates = getUpdates().sort((left, right) => {
    if (!left.date) return right.date ? 1 : 0
    if (!right.date) return -1
    return right.date.localeCompare(left.date)
  })

  return (
    <section className="page-content flow-content" aria-labelledby="updates-title">
      <p className="eyebrow">City notices</p>
      <h1 id="updates-title">{t('page.updates')}</h1>
      <p className="page-description">Summaries are brief, source-linked, and not a substitute for a current city advisory.</p>
      {updates.length ? (
        <ul className="portal-grid">
          {updates.map((update) => (
            <li className="portal-card" key={update.id}>
              <p className="eyebrow">{update.category}</p>
              <h2>{update.title}</h2>
              <p>{update.description}</p>
              {update.date
                ? <p>Published: <time dateTime={update.date}>{update.date}</time></p>
                : <p>Date not confirmed.</p>}
              {update.timeSensitive && <p className="time-sensitive">Past announcement. Confirm the current schedule.</p>}
              <RecordMeta record={update} />
            </li>
          ))}
        </ul>
      ) : <EmptyState message="No updates are available." />}
    </section>
  )
}

export default Updates

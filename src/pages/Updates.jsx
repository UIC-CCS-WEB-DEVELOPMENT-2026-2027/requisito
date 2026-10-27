import EmptyState from '../components/EmptyState.jsx'
import OfficialSourceDirectory from '../components/OfficialSourceDirectory.jsx'
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
      <p className="eyebrow">{t('updates.eyebrow')}</p>
      <h1 id="updates-title">{t('page.updates')}</h1>
      <p className="page-description">{t('updates.description')}</p>
      {updates.length ? (
        <ul className="portal-grid">
          {updates.map((update) => (
            <li className="portal-card" key={update.id}>
              <p className="eyebrow">{update.category}</p>
              <h2>{update.title}</h2>
              <p>{update.description}</p>
              {update.date
                ? <p>{t('updates.published')} <time dateTime={update.date}>{update.date}</time></p>
                : <p>{t('updates.dateNotConfirmed')}</p>}
              {update.timeSensitive && <p className="time-sensitive">{t('updates.pastAnnouncement')}</p>}
              <RecordMeta record={update} />
            </li>
          ))}
        </ul>
      ) : <EmptyState message={t('updates.empty')} />}
      <OfficialSourceDirectory feature="updates" />
    </section>
  )
}

export default Updates

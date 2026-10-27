import { civicSourceDirectories } from '../data/civicSourceDirectories.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function OfficialSourceDirectory({ feature }) {
  const { t } = useLanguage()
  const sources = civicSourceDirectories[feature] ?? []
  if (!sources.length) return null

  return (
    <section aria-labelledby={`${feature}-official-sources-title`}>
      <h2 id={`${feature}-official-sources-title`}>{t('civicSource.heading')}</h2>
      <p>{t('civicSource.disclaimer')}</p>
      <ul className="portal-grid">
        {sources.map((source) => (
          <li className="portal-card" key={source.id}>
            <h3><a href={source.url} target="_blank" rel="noopener noreferrer">{t(source.titleKey)}</a></h3>
            <p>{t(source.descriptionKey)}</p>
            {source.checkedOn && (
              <p>{t('civicSource.linkChecked')} <time dateTime={source.checkedOn}>{source.checkedOn}</time></p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default OfficialSourceDirectory

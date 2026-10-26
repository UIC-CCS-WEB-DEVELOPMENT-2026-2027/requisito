import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: sources, the server-independent source links that need current human verification.
function OfficialSourceLeads({ sources }) {
  const { t } = useLanguage()
  const safeSources = sources.filter((source) => {
    try {
      const url = new URL(source.sourceUrl)
      return url.protocol === 'https:' &&
        url.hostname.toLowerCase().endsWith('.gov.ph') &&
        !url.username &&
        !url.password
    } catch {
      return false
    }
  })

  if (!safeSources.length) return null
  return (
    <section aria-labelledby="official-source-leads-title">
      <h2 id="official-source-leads-title">{t('feature.sources.heading')}</h2>
      <p>{t('feature.sources.disclaimer')}</p>
      <ul>
        {safeSources.map((source) => (
          <li key={source.id}>
            <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">{source.title}</a>
            {' — '}{t('status.unverified')}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default OfficialSourceLeads

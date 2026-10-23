import EmptyState from '../components/EmptyState.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Credits() {
  const { t } = useLanguage()
  return (
    <section className="page-content" aria-labelledby="credits-title">
      <p className="eyebrow">{t('credits.eyebrow')}</p>
      <h1 id="credits-title">{t('credits.title')}</h1>
      <p>{t('credits.description')}</p>
      <p>{t('credits.independent')}</p>
      <p><a href="https://github.com/migi-macati/bettermakati" target="_blank" rel="noopener noreferrer">{t('credits.reference')}</a></p>
      <p><a href="https://github.com/migi-macati/bettermakati/blob/main/STARTER-KIT-README.md" target="_blank" rel="noopener noreferrer">{t('credits.starterKit')}</a></p>
      <EmptyState message={t('credits.noFilesCopied')} />
    </section>
  )
}

export default Credits

import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: none.
function DisclaimerBanner() {
  const { t } = useLanguage()
  return (
    <aside className="disclaimer-banner" aria-label={t('a11y.projectDisclaimer')}>
      <p>{t('disclaimer.banner')}</p>
    </aside>
  )
}

export default DisclaimerBanner

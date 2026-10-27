import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function AccessibilityPage() {
  const { t } = useLanguage()

  return (
    <section className="page-content flow-content" aria-labelledby="accessibility-title">
      <p className="eyebrow">{t('accessibility.eyebrow')}</p>
      <h1 id="accessibility-title">{t('accessibility.title')}</h1>
      <p className="page-description">{t('accessibility.description')}</p>
      <h2>{t('accessibility.featuresHeading')}</h2>
      <ul>
        <li>{t('accessibility.featureSkip')}</li>
        <li>{t('accessibility.featureKeyboard')}</li>
        <li>{t('accessibility.featureLabels')}</li>
        <li>{t('accessibility.featureLanguage')}</li>
      </ul>
      <p className="sample-notice">{t('accessibility.limitations')}</p>
      <p><Link to={href('contribute')}>{t('accessibility.reportIssue')}</Link></p>
    </section>
  )
}

export default AccessibilityPage

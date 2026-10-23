import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function CatalogEmptyState({ what, how, action }) {
  const { t } = useLanguage()
  return (
    <section className="catalog-empty-state" aria-label={t('emptyState.title')}>
      <h2>{t('emptyState.title')}</h2>
      <dl>
        <div><dt>{t('emptyState.what')}</dt><dd>{what}</dd></div>
        <div><dt>{t('emptyState.how')}</dt><dd>{how}</dd></div>
        <div><dt>{t('emptyState.action')}</dt><dd>{action}</dd></div>
      </dl>
      <Link to="/status">{t('nav.sources')}</Link>
    </section>
  )
}

export default CatalogEmptyState

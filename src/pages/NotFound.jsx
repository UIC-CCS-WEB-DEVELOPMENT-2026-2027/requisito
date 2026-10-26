import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

// Props: none.
function NotFound() {
  const { t } = useLanguage()
  return (
    <section className="page-content" aria-labelledby="not-found-title">
      <p className="eyebrow">{t('notFound.eyebrow')}</p>
      <h1 id="not-found-title">{t('notFound.title')}</h1>
      <EmptyState message={t('notFound.noMatch')} />
      <Link className="return-link" to={href('home')}>
        {t('notFound.returnHome')}
      </Link>
    </section>
  )
}

export default NotFound

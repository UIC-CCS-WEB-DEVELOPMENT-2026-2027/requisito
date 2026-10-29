import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href, routeManifest } from '../routeManifest.js'

const publicRoutes = routeManifest.filter((route) =>
  !route.path.includes(':') &&
  route.path !== '*' &&
  !['login', 'notFound'].includes(route.id),
)

function Sitemap() {
  const { t } = useLanguage()

  return (
    <section className="page-content flow-content" aria-labelledby="sitemap-title">
      <p className="eyebrow">{t('sitemap.eyebrow')}</p>
      <h1 id="sitemap-title">{t('sitemap.title')}</h1>
      <p className="page-description">{t('sitemap.description')}</p>
      <nav aria-label={t('sitemap.navigation')}>
        <ul className="sitemap-links">
          {publicRoutes.map((route) => {
            const labelKey = route.labelKey ?? `feature.${route.feature}.title`
            return (
              <li key={route.id}>
                <Link to={href(route.id)}>{t(labelKey)}</Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </section>
  )
}

export default Sitemap

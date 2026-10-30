import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href, routeManifest } from '../routeManifest.js'

function Footer() {
  const { t } = useLanguage()
  const footerGroups = [
    { id: 'explore', labelKey: 'group.explore' },
    { id: 'data', labelKey: 'group.data' },
    { id: 'civic', labelKey: 'group.civic' },
    { id: 'about', labelKey: 'group.about' },
  ]
  const linkedRouteIds = new Set(
    routeManifest.filter((route) => route.nav === 'header' || route.footer).map((route) => route.id),
  )
  const additionalRoutes = routeManifest.filter((route) =>
    route.feature &&
    !linkedRouteIds.has(route.id) &&
    !['reportDetail', 'publicRecordDetail', 'notFound'].includes(route.id),
  )
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
        <div className="footer-brand">
          <p className="footer-wordmark">Requisito<span>Davao City</span></p>
          <p className="footer-description">{t('footer.disclaimer')}</p>
          <Link className="footer-contribute" to={href('contribute')}>{t('nav.contribute')} <span aria-hidden="true">→</span></Link>
        </div>
        <nav className="footer-nav footer-nav-groups" aria-label={t('a11y.secondaryNavigation')}>
          {footerGroups.map((group) => (
            <section aria-label={t(group.labelKey)} key={group.id}>
              <h2>{t(group.labelKey)}</h2>
              {routeManifest.filter((route) => route.footer === group.id).map((route) => (
                <Link key={route.id} to={href(route.id)}>{t(route.labelKey)}</Link>
              ))}
            </section>
          ))}
        </nav>
        </div>
        {additionalRoutes.length > 0 && (
          <details className="footer-feature-index">
            <summary>{t('group.portal')}</summary>
            <nav aria-label={t('group.portal')}>
              {additionalRoutes.map((route) => (
                <Link key={route.id} to={href(route.id)}>
                  {t(route.labelKey ?? `feature.${route.feature}.title`)}
                </Link>
              ))}
            </nav>
          </details>
        )}
        <p className="footer-credit">
          {t('footer.referenceCreditPrefix')}{' '}
          <a href="https://bettersolano.org/" target="_blank" rel="noopener noreferrer">BetterSolano.org</a>
          {' '}{t('footer.referenceCreditSuffix')}{' '}
          <a href="https://github.com/BetterSolano/bettersolano/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
            {t('footer.referenceLicense')}
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer

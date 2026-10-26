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
  return (
    <footer className="site-footer">
      <p>Requisito</p>
      <p className="footer-description">{t('footer.disclaimer')}</p>
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
    </footer>
  )
}

export default Footer

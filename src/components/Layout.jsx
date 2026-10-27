import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import DisclaimerBanner from './DisclaimerBanner.jsx'
import Footer from './Footer.jsx'
import ChatAssistant from './ChatAssistant.jsx'
import Breadcrumbs from './Breadcrumbs.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href, routeManifest } from '../routeManifest.js'
import { getPageContext } from '../utils/pageContext.js'
import './LoginForm.css'
import '../App.css'
import '../ui.css'

// The paperwork flow is the main navigation; city information sits under "Explore".
const PRIMARY_NAV_IDS = ['home', 'goals', 'checklist', 'documents']
const LANGUAGE_OPTIONS = [
  { code: 'en', labelKey: 'layout.english' },
  { code: 'ceb', labelKey: 'layout.bisaya' },
  { code: 'fil', labelKey: 'layout.filipino' },
]

// Props: none. Shared shell for every route.
function Layout() {
  const { isSignedIn, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const headerRoutes = routeManifest.filter((route) => route.nav === 'header')
  const primaryRoutes = headerRoutes.filter((route) => PRIMARY_NAV_IDS.includes(route.id))
  const exploreRoutes = headerRoutes.filter((route) => !PRIMARY_NAV_IDS.includes(route.id))
  const [assistantOpen, setAssistantOpen] = useState(false)
  const location = useLocation()
  const assistantContext = getPageContext(location.pathname)
  const isLoginPage = location.pathname === '/login'
  const exploreActive = exploreRoutes.some((route) =>
    location.pathname === route.path || location.pathname.startsWith(`${route.path}/`))
  useEffect(() => {
    const heading = document.querySelector('#main-content h1')
    if (!heading) return
    const title = heading.textContent.trim()
    document.title = title ? `${title} | Requisito` : 'Requisito'
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
  }, [location.pathname])
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t('a11y.skip')}</a>
      <header className="site-header">
        <div className="header-content">
          <div className="header-top">
            <Link className="brand" to={href('home')}>
              Requisito
            </Link>
            <div className="header-tools">
              <div className="language-switcher" role="group" aria-label={t('language.label')}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    lang={option.code}
                    aria-pressed={language === option.code}
                    onClick={() => setLanguage(option.code)}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
              <button
                className="assistant-open-button"
                type="button"
                aria-haspopup="dialog"
                aria-expanded={assistantOpen}
                onClick={() => setAssistantOpen(true)}
              >
                {t('assistant.open')}
              </button>
            </div>
          </div>
          <nav aria-label={t('a11y.mainNavigation')} className="site-nav">
            {primaryRoutes.map((route) => (
              <NavLink key={route.id} end={route.path === '/'} to={href(route.id)}>
                {t(route.labelKey)}
              </NavLink>
            ))}
            {/* Keyed by path so the menu closes after every navigation. */}
            <details className={`nav-explore${exploreActive ? ' is-current' : ''}`} key={location.pathname}>
              <summary>{t('group.explore')}</summary>
              <div className="nav-explore-menu">
                {exploreRoutes.map((route) => (
                  <NavLink key={route.id} to={href(route.id)}>
                    {t(route.labelKey)}
                  </NavLink>
                ))}
              </div>
            </details>
            {isSignedIn ? (
              <button className="nav-sign-out" type="button" onClick={signOut}>{t('layout.signOut')}</button>
            ) : (
              !isLoginPage && <NavLink className="nav-sign-in" to={href('login')}>{t('layout.signIn')}</NavLink>
            )}
          </nav>
        </div>
      </header>

      <DisclaimerBanner />

      <main className="main-content" id="main-content" tabIndex="-1">
        <div className="main-content-inner">
          <Breadcrumbs pathname={location.pathname} />
          <Outlet />
        </div>
      </main>

      <Footer />
      <ChatAssistant
        dialog
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        context={assistantContext}
      />
    </div>
  )
}

export default Layout

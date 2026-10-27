import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import DisclaimerBanner from './DisclaimerBanner.jsx'
import Footer from './Footer.jsx'
import ChatAssistant from './ChatAssistant.jsx'
import Breadcrumbs from './Breadcrumbs.jsx'
import InstallAppButton from './InstallAppButton.jsx'
import VerifiedHotlineTicker from './VerifiedHotlineTicker.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href, routeManifest } from '../routeManifest.js'
import { getPageContext } from '../utils/pageContext.js'
import './LoginForm.css'
import '../App.css'

// Props: none. Shared shell for every route.
function Layout() {
  const { isSignedIn, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const headerRoutes = routeManifest.filter((route) => route.nav === 'header')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const location = useLocation()
  const assistantContext = getPageContext(location.pathname)
  const isLoginPage = location.pathname === '/login'
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
          <Link className="brand" to={href('home')}>
            <span className="brand-mark" aria-hidden="true">R</span>
            <span className="brand-name">
              Requisito
              <small>Davao City</small>
            </span>
          </Link>
          <nav aria-label={t('a11y.mainNavigation')} className="site-nav">
            {headerRoutes.map((route) => (
              <NavLink key={route.id} end={route.path === '/'} to={href(route.id)}>
                {t(route.labelKey)}
              </NavLink>
            ))}
            {isSignedIn ? (
              <button className="nav-sign-out" type="button" onClick={signOut}>{t('layout.signOut')}</button>
            ) : (
              !isLoginPage && <NavLink to={href('login')}>{t('layout.signIn')}</NavLink>
            )}
          </nav>
          <div className="language-switcher">
            <label className="visually-hidden" htmlFor="language-select">{t('language.label')}</label>
            <select id="language-select" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">{t('layout.english')}</option>
              <option value="fil">{t('layout.filipino')}</option>
              <option value="ceb">{t('layout.bisaya')}</option>
            </select>
          </div>
          <InstallAppButton />
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
      </header>

      <DisclaimerBanner />
      <VerifiedHotlineTicker />

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

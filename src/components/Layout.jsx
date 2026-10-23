import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import DisclaimerBanner from './DisclaimerBanner.jsx'
import Footer from './Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './LoginForm.css'
import '../App.css'

// Props: none. Shared shell for every route.
function Layout() {
  const { isSignedIn, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t('a11y.skip')}</a>
      <header className="site-header">
        <div className="header-content">
          <Link className="brand" to="/">
            Requisito
          </Link>
          <nav aria-label="Main navigation" className="site-nav" tabIndex="0">
            <NavLink end to="/">
              {t('nav.home')}
            </NavLink>
            <NavLink to="/services">
              {t('nav.services')}
            </NavLink>
            <NavLink to="/barangays">
              {t('nav.barangays')}
            </NavLink>
            <NavLink to="/goals">
              {t('nav.goals')}
            </NavLink>
            <NavLink to="/checklist">
              {t('nav.checklist')}
            </NavLink>
            <NavLink to="/documents">
              {t('nav.documents')}
            </NavLink>
            <NavLink to="/search">
              {t('nav.search')}
            </NavLink>
            {isSignedIn ? (
              <button className="nav-sign-out" type="button" onClick={signOut}>Sign out</button>
            ) : (
              !isLoginPage && <NavLink to="/login">Sign in</NavLink>
            )}
          </nav>
          <div className="language-switcher">
            <label className="visually-hidden" htmlFor="language-select">{t('language.label')}</label>
            <select id="language-select" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">English</option>
              <option value="fil">Filipino</option>
              <option value="ceb">Bisaya</option>
            </select>
          </div>
        </div>
      </header>

      <DisclaimerBanner />

      <main className="main-content" id="main-content" tabIndex="-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout

import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href, routeManifest } from '../routeManifest.js'
import Icon from './Icon.jsx'
import InstallAppButton from './InstallAppButton.jsx'

const groups = [
  { id: 'planning', label: 'nav.planning', routes: ['checklist', 'documents'] },
  { id: 'city', label: 'nav.city', routes: ['barangays', 'districts', 'about', 'officials', 'updates', 'budget', 'status'] },
]

export default function SiteHeader({ assistantOpen, onAssistantOpen }) {
  const { isSignedIn, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { pathname, key: locationKey } = useLocation()
  const [navigation, setNavigation] = useState({ key: locationKey, menuOpen: false, openGroup: null })
  // Navigation closes immediately on route changes without remounting the install prompt.
  const menuOpen = navigation.key === locationKey && navigation.menuOpen
  const openGroup = navigation.key === locationKey ? navigation.openGroup : null
  const headerRef = useRef(null)
  const menuRef = useRef(null)
  const groupRefs = useRef({})

  useEffect(() => {
    function closeOutside(event) {
      if (event.target.closest?.('dialog')) return
      if (!headerRef.current?.contains(event.target)) {
        setNavigation({ key: locationKey, menuOpen: false, openGroup: null })
      }
    }
    function escape(event) {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return
      if (openGroup) {
        groupRefs.current[openGroup]?.focus()
        setNavigation({ key: locationKey, menuOpen, openGroup: null })
      } else if (menuOpen) {
        menuRef.current?.focus()
        setNavigation({ key: locationKey, menuOpen: false, openGroup: null })
      }
    }
    const desktop = window.matchMedia('(min-width: 1100px)')
    function resize() {
      setNavigation({ key: locationKey, menuOpen: false, openGroup: null })
      // Do not leave keyboard focus inside a newly collapsed mobile panel.
      if (!desktop.matches && headerRef.current?.querySelector('.navigation-panel')?.contains(document.activeElement)) {
        menuRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', escape)
    desktop.addEventListener('change', resize)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', escape)
      desktop.removeEventListener('change', resize)
    }
  }, [locationKey, menuOpen, openGroup])

  function routeLink(id) {
    const route = routeManifest.find((item) => item.id === id)
    return <NavLink key={id} end={route.path === '/'} to={href(route.id)}>{t(route.labelKey)}</NavLink>
  }

  return (
    <header className="site-header" ref={headerRef} onBlur={(event) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget) && !event.relatedTarget.closest('dialog')) {
        setNavigation({ key: locationKey, menuOpen: false, openGroup: null })
      }
    }}>
      <div className="header-content">
        <Link className="brand" to={href('home')}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 180 180" focusable="false">
              <path fill="currentColor" fillRule="evenodd" d="M90 14c-33 0-60 27-60 60 0 21 12 39 30 53l30 26 30-26c18-14 30-32 30-53 0-33-27-60-60-60Zm0 29a31 31 0 1 0 0 62 31 31 0 0 0 0-62Z" />
              <path d="m107 89 32 32" fill="none" stroke="white" strokeWidth="8.5" />
            </svg>
          </span>
          <span className="brand-name">Requisito<small>Davao City</small></span>
        </Link>
        <nav className="site-nav" aria-label={t('a11y.mainNavigation')}>
          <button className="mobile-menu-toggle" ref={menuRef} type="button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => {
            setNavigation({ key: locationKey, menuOpen: !menuOpen, openGroup: null })
          }}>
            <Icon name={menuOpen ? 'close' : 'menu'} /> {t(menuOpen ? 'nav.closeMenu' : 'nav.menu')}
          </button>
          <div className="navigation-panel" id="site-navigation" data-open={menuOpen}>
            <div className="navigation-links">
              {['home', 'goals', 'services'].map(routeLink)}
              {groups.map((group) => (
                <div className="nav-dropdown" key={group.id}>
                  <button ref={(node) => { groupRefs.current[group.id] = node }} className={group.routes.some((routeId) => pathname.startsWith(href(routeId))) ? 'active' : ''} type="button" aria-expanded={openGroup === group.id} aria-controls={`nav-${group.id}`} onClick={() => setNavigation({ key: locationKey, menuOpen, openGroup: openGroup === group.id ? null : group.id })}>
                    {t(group.label)} <Icon name="chevron" />
                  </button>
                  <div className="nav-dropdown-panel" id={`nav-${group.id}`} hidden={openGroup !== group.id}>
                    {group.routes.map(routeLink)}
                  </div>
                </div>
              ))}
              <NavLink className="nav-search" to={href('search')} aria-label={t('nav.search')}><Icon name="search" /><span>{t('nav.search')}</span></NavLink>
              {isSignedIn
                ? <button className="nav-sign-out" type="button" onClick={signOut}>{t('layout.signOut')}</button>
                : pathname !== '/login' && <NavLink to={href('login')}>{t('layout.signIn')}</NavLink>}
            </div>
            <div className="header-tools">
              <div className="language-switcher">
                <label className="visually-hidden" htmlFor="language-select">{t('language.label')}</label>
                <select id="language-select" value={language} onChange={(event) => setLanguage(event.target.value)}>
                  <option value="en">{t('layout.english')}</option>
                  <option value="fil">{t('layout.filipino')}</option>
                  <option value="ceb">{t('layout.bisaya')}</option>
                </select>
              </div>
              <InstallAppButton />
              <button className="assistant-open-button" type="button" aria-label={t('assistant.open')} aria-haspopup="dialog" aria-expanded={assistantOpen} onClick={onAssistantOpen}>
                <Icon name="assistant" /><span>{t('assistant.open')}</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

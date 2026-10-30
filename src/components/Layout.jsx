import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DisclaimerBanner from './DisclaimerBanner.jsx'
import Footer from './Footer.jsx'
import ChatAssistant from './ChatAssistant.jsx'
import Breadcrumbs from './Breadcrumbs.jsx'
import SiteHeader from './SiteHeader.jsx'
import VerifiedHotlineTicker from './VerifiedHotlineTicker.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { getPageContext } from '../utils/pageContext.js'
import './LoginForm.css'
import '../App.css'
import './SiteChrome.css'

// Props: none. Shared shell for every route.
function Layout() {
  const { language, t } = useLanguage()
  const [assistantOpen, setAssistantOpen] = useState(false)
  const location = useLocation()
  const assistantContext = getPageContext(location.pathname)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  useEffect(() => {
    const heading = document.querySelector('#main-content h1')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
  }, [location.pathname])
  useEffect(() => {
    const title = document.querySelector('#main-content h1')?.textContent.trim()
    document.title = title ? `${title} | Requisito` : 'Requisito'
  }, [location.pathname, language])
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t('a11y.skip')}</a>
      <VerifiedHotlineTicker />
      <SiteHeader assistantOpen={assistantOpen} onAssistantOpen={() => setAssistantOpen(true)} />
      <DisclaimerBanner />

      <main className={`main-content${location.pathname === '/' ? ' main-content-home' : ''}`} id="main-content" tabIndex="-1">
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

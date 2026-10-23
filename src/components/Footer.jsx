import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="site-footer">
      <p>Requisito</p>
      <p className="footer-description">Independent student project. Not an official website of the City Government of Davao and not affiliated with BetterGov or BetterLGU.</p>
      <nav className="footer-nav" aria-label="Secondary navigation">
        <Link to="/about-davao">{t('nav.about')}</Link>
        <Link to="/updates">{t('nav.updates')}</Link>
        <Link to="/officials">{t('nav.officials')}</Link>
        <Link to="/status">{t('nav.status')}</Link>
        <Link to="/contribute">{t('nav.contribute')}</Link>
        <Link to="/credits">{t('nav.credits')}</Link>
      </nav>
    </footer>
  )
}

export default Footer

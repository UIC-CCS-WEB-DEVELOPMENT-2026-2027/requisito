import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="site-footer">
      <p>Requisito</p>
      <p className="footer-description">Independent student project. Not an official website of the City Government of Davao and not affiliated with BetterGov or BetterLGU.</p>
      <nav className="footer-nav footer-nav-groups" aria-label="Secondary navigation">
        <section aria-label={t('group.explore')}>
          <h2>{t('group.explore')}</h2>
          <Link to="/services">{t('nav.services')}</Link>
          <Link to="/barangays">{t('nav.barangays')}</Link>
          <Link to="/about-davao">{t('nav.about')}</Link>
          <Link to="/history">{t('nav.history')}</Link>
          <Link to="/briefs">{t('nav.briefs')}</Link>
        </section>
        <section aria-label={t('group.data')}>
          <h2>{t('group.data')}</h2>
          <Link to="/budget">{t('nav.budget')}</Link>
          <Link to="/procurement">{t('nav.procurement')}</Link>
          <Link to="/status">{t('nav.status')}</Link>
          <Link to="/monitor">{t('nav.monitor')}</Link>
          <Link to="/status">{t('nav.sources')}</Link>
        </section>
        <section aria-label={t('group.civic')}>
          <h2>{t('group.civic')}</h2>
          <Link to="/officials">{t('nav.officials')}</Link>
          <Link to="/elections">{t('nav.elections')}</Link>
          <Link to="/accountability">{t('nav.accountability')}</Link>
          <Link to="/participate">{t('nav.participate')}</Link>
        </section>
        <section aria-label={t('group.about')}>
          <h2>{t('group.about')}</h2>
          <Link to="/integrity">{t('nav.integrity')}</Link>
          <Link to="/contribute">{t('nav.contribute')}</Link>
          <Link to="/credits">{t('nav.credits')}</Link>
        </section>
      </nav>
    </footer>
  )
}

export default Footer

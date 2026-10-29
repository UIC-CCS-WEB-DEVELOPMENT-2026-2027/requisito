import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

const faqItems = [
  ['help.q1', 'help.a1'],
  ['help.q2', 'help.a2'],
  ['help.q3', 'help.a3'],
  ['help.q4', 'help.a4'],
  ['help.q5', 'help.a5'],
  ['help.q6', 'help.a6'],
  ['help.q7', 'help.a7'],
  ['help.q8', 'help.a8'],
]

function Help() {
  const { t } = useLanguage()

  return (
    <section className="page-content flow-content" aria-labelledby="help-title">
      <p className="eyebrow">{t('help.eyebrow')}</p>
      <h1 id="help-title">{t('feature.help.title')}</h1>
      <p className="page-description">{t('help.description')}</p>
      <div className="help-faq">
        {faqItems.map(([questionKey, answerKey]) => (
          <details className="portal-card" key={questionKey}>
            <summary>{t(questionKey)}</summary>
            <p>{t(answerKey)}</p>
          </details>
        ))}
      </div>
      <nav aria-label={t('help.related')}>
        <h2>{t('help.related')}</h2>
        <ul>
          <li><Link to={href('goals')}>{t('nav.goals')}</Link></li>
          <li><Link to={href('services')}>{t('nav.services')}</Link></li>
          <li><Link to={href('documents')}>{t('nav.documents')}</Link></li>
          <li><Link to={href('status')}>{t('nav.status')}</Link></li>
          <li><Link to={href('contribute')}>{t('nav.contribute')}</Link></li>
        </ul>
      </nav>
    </section>
  )
}

export default Help

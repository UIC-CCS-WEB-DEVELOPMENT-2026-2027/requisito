import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

const errorDetails = {
  forbidden: {
    code: '403',
    title: 'error.forbidden.title',
    description: 'error.forbidden.description',
  },
  serverError: {
    code: '500',
    title: 'error.server.title',
    description: 'error.server.description',
  },
}

function ErrorStatus({ feature }) {
  const { t } = useLanguage()
  const details = errorDetails[feature]
  if (!details) throw new Error(`Unknown error page feature: ${feature}`)

  return (
    <section className="page-content flow-content" aria-labelledby="error-status-title">
      <p className="eyebrow">{details.code}</p>
      <h1 id="error-status-title">{t(details.title)}</h1>
      <p className="page-description">{t(details.description)}</p>
      <Link to={href('home')}>{t('error.home')}</Link>
    </section>
  )
}

export default ErrorStatus

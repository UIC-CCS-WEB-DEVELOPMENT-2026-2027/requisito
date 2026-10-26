import { Link, Navigate, useLocation } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getSignInDestination } from '../utils/authRedirect.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

// Props: none. Signed-in users are sent to the home dashboard.
function Login() {
  const { isSignedIn } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  if (isSignedIn) {
    return <Navigate to={getSignInDestination(location.state)} replace />
  }

  return (
    <section className="page-content login-page" aria-labelledby="login-title">
      <div className="login-card">
        <div className="login-heading">
          <span className="login-signature" aria-hidden="true"><span /></span>
          <p className="login-wordmark">Requisito</p>
          <h1 id="login-title">{t('page.login')}</h1>
          <p className="login-intro">{t('login.intro')}</p>
        </div>
        <LoginForm />
        <p className="login-notice"><span className="login-demo-label">{t('login.demoLabel')}</span> {t('login.demoNotice')}</p>
        <Link className="login-back-link" to={href('home')}><span aria-hidden="true">&larr;</span> {t('login.backHome')}</Link>
      </div>
    </section>
  )
}

export default Login

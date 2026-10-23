import { Link, Navigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getSignInDestination } from '../utils/authRedirect.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: none. Signed-in users are sent to the home dashboard.
function Login() {
  const { isSignedIn } = useAuth()
  const { t } = useLanguage()

  if (isSignedIn) {
    return <Navigate to={getSignInDestination()} replace />
  }

  return (
    <section className="page-content login-page" aria-labelledby="login-title">
      <div className="login-card">
        <div className="login-heading">
          <span className="login-signature" aria-hidden="true"><span /></span>
          <p className="login-wordmark">Requisito</p>
          <h1 id="login-title">{t('page.login')}</h1>
          <p className="login-intro">A clearer path through your paperwork.</p>
        </div>
        <LoginForm />
        <p className="login-notice"><span className="login-demo-label">Demo sign-in:</span> no real authentication yet. Full login arrives in Phase 2.</p>
        <Link className="login-back-link" to="/"><span aria-hidden="true">&larr;</span> Back to Home</Link>
      </div>
    </section>
  )
}

export default Login

import { Link, Navigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Props: none. Signed-in users are sent straight to the goals screen.
function Login() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Navigate to="/goals" replace />
  }

  return (
    <section className="page-content login-page" aria-labelledby="login-title">
      <div className="login-card">
        <div className="login-heading">
          <span className="login-signature" aria-hidden="true"><span /></span>
          <p className="login-wordmark">Requisito</p>
          <h1 id="login-title">Sign in to continue.</h1>
          <p className="login-intro">A clearer path through your paperwork.</p>
        </div>
        <LoginForm />
        <p className="login-notice"><span className="login-demo-label">Demo account</span>Use any valid email and a password with at least 8 characters.</p>
        <Link className="login-back-link" to="/"><span aria-hidden="true">&larr;</span> Back to Home</Link>
      </div>
    </section>
  )
}

export default Login

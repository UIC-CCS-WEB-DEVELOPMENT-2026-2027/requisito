import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'

// Props: none. Sign-in currently validates input only.
function Login() {
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
        <p className="login-notice"><span className="login-demo-label">Input validation preview</span>Account sign-in is not available yet.</p>
        <Link className="login-back-link" to="/"><span aria-hidden="true">&larr;</span> Back to Home</Link>
      </div>
    </section>
  )
}

export default Login

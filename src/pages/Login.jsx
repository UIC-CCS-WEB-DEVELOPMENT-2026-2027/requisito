import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Props: none. Phase 2 login-flow demo only.
function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(email) {
    signIn(email)
    navigate('/')
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
        <LoginForm onSubmit={handleSubmit} error="" />
        <p className="login-notice"><span className="login-demo-label">Interactive preview</span>Demo sign-in: no real authentication yet. Full login arrives in Phase 2.</p>
        <Link className="login-back-link" to="/"><span aria-hidden="true">&larr;</span> Back to Home</Link>
      </div>
    </section>
  )
}

export default Login

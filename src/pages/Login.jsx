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
        <h1 id="login-title">Sign in</h1>
        <p className="login-notice">Demo sign-in: no real authentication yet. Full login arrives in Phase 2.</p>
        <LoginForm onSubmit={handleSubmit} error="" />
      </div>
      <Link className="return-link" to="/">Back to Home</Link>
    </section>
  )
}

export default Login

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
      <div className="login-experience">
        <div className="login-brand-panel">
          <p className="login-wordmark"><span className="login-brand-mark" aria-hidden="true">r.</span> Requisito</p>
          <div className="login-brand-story">
            <p className="login-kicker">A little clarity goes a long way</p>
            <h2>Your next chapter.<br /><em>A clearer path.</em></h2>
            <p className="login-brand-description">From your first application to your next opportunity. Know the documents. Find your starting point.</p>
          </div>
          <svg className="login-illustration" viewBox="0 0 360 235" fill="none" aria-hidden="true" focusable="false">
            <circle cx="283" cy="58" r="38" className="illustration-sun" />
            <path d="M30 193C84 193 71 117 136 117S206 201 265 166S293 98 334 98" className="illustration-path" strokeWidth="2" strokeDasharray="5 7" strokeLinecap="round" />
            <g transform="translate(53 29) rotate(-9 65 85)">
              <rect width="129" height="166" rx="12" className="illustration-back-sheet" />
              <path d="M24 37H89M24 54H72M24 91H100M24 108H91M24 125H77" className="illustration-lines" strokeWidth="5" strokeLinecap="round" />
            </g>
            <g transform="translate(155 65) rotate(8 66 76)">
              <rect width="132" height="154" rx="12" className="illustration-front-sheet" />
              <rect x="22" y="24" width="34" height="34" rx="8" className="illustration-check-box" />
              <path d="M31 41L37 47L48 35" className="illustration-check" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 83H104M22 100H87M22 117H98" className="illustration-lines" strokeWidth="5" strokeLinecap="round" />
            </g>
            <circle cx="32" cy="193" r="7" className="illustration-dot" />
            <path d="M320 164V180M312 172H328" className="illustration-spark" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="login-brand-caption"><span aria-hidden="true" /> Less guesswork. One step at a time.</p>
        </div>
        <div className="login-card">
          <div className="login-heading">
            <p className="login-form-kicker">Your paperwork, with a plan</p>
            <h1 id="login-title">A place to begin.</h1>
            <p className="login-intro">Sign in to explore your next steps.</p>
          </div>
          <p className="login-notice"><span className="login-demo-label">Interactive preview</span>Demo sign-in: no real authentication yet. Full login arrives in Phase 2.</p>
          <LoginForm onSubmit={handleSubmit} error="" />
          <Link className="login-back-link" to="/"><span aria-hidden="true">&larr;</span> Back to Home</Link>
        </div>
      </div>
    </section>
  )
}

export default Login

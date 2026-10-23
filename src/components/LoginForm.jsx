import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './LoginForm.css'

// Props: none. The demo sign-in completes the app flow for protected routes.
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  function handleValidSubmit(cleanEmail) {
    signIn(cleanEmail)
    navigate('/goals', { replace: true })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const cleanEmail = email.trim()
    const newErrors = {}

    if (cleanEmail === '') {
      newErrors.email = 'Enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = 'Enter a valid email address, like name@example.com.'
    }

    if (password === '') {
      newErrors.password = 'Enter your password.'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (newErrors.email) {
        emailRef.current?.focus()
      } else {
        passwordRef.current?.focus()
      }
      return
    }

    setErrors({})
    handleValidSubmit(cleanEmail)
  }

  function clearError(field) {
    setErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  return (
    <form
      className="login-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Sign-in form"
    >
      <div className="login-field">
        <label htmlFor="login-email">Email</label>
        <input
          ref={emailRef}
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            clearError('email')
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
        />
        <div className="login-error-live" aria-live="polite">
          {errors.email && (
            <p id="login-email-error" className="login-error">
              <span className="visually-hidden">Error: </span>
              {errors.email}
            </p>
          )}
        </div>
      </div>
      <div className="login-field">
        <label htmlFor="login-password">Password</label>
        <input
          ref={passwordRef}
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            clearError('password')
          }}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
        />
        <p className="login-hint">Use at least 8 characters.</p>
        <div className="login-error-live" aria-live="polite">
          {errors.password && (
            <p id="login-password-error" className="login-error">
              <span className="visually-hidden">Error: </span>
              {errors.password}
            </p>
          )}
        </div>
      </div>
      <button className="primary-button login-submit" type="submit">
        Validate details
      </button>
    </form>
  )
}

export default LoginForm

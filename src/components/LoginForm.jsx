import { useRef, useState } from 'react'
import './LoginForm.css'

// Props: onSubmit(email), error (string). Passwords stay in this form only.
function LoginForm({ onSubmit, error = '' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (password.length < 8) {
      nextErrors.password = 'Enter at least 8 characters.'
    }
    setErrors(nextErrors)
    setSubmitError('')
    setPassword('')
    setShowPassword(false)
    if (Object.keys(nextErrors).length > 0) return

    submitting.current = true
    setIsSubmitting(true)
    try {
      await onSubmit(email.trim())
    } catch {
      setSubmitError('Demo sign-in could not finish. Please try again.')
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate aria-label="Demo sign-in" aria-busy={isSubmitting}>
      <div className="login-field">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby="login-email-error" />
        <p id="login-email-error" className="login-error" aria-live="polite">{errors.email}</p>
      </div>
      <div className="login-field">
        <label htmlFor="login-password">Password</label>
        <div className="password-input-row">
          <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby="login-password-hint login-password-error" />
          <button className="secondary-button" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} aria-controls="login-password" onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        <p id="login-password-hint" className="login-hint">Use at least 8 characters. For this demo, use made-up details, not an actual account password.</p>
        <p id="login-password-error" className="login-error" aria-live="polite">{errors.password}</p>
      </div>
      <p className="login-error" aria-live="polite">{error || submitError}</p>
      <button className="primary-button login-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting && <span className="login-spinner" aria-hidden="true" />}
        {isSubmitting ? 'Signing in...' : 'Sign in to demo'}
        {!isSubmitting && <span className="login-button-arrow" aria-hidden="true">&rarr;</span>}
      </button>
    </form>
  )
}

export default LoginForm

import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

export default function Login() {
  const { signIn, isConfigured, session, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isConfigured && !loading && session && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(email.trim(), password)
      navigate(location.state?.from?.pathname ?? '/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in. Check your email and password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-gate">
      <form className="adm-gate-card" onSubmit={submit}>
        <span className="adm-eyebrow">Admin</span>
        <h1>Sign in</h1>
        {!isConfigured ? (
          <p>
            Supabase isn&apos;t configured. Add your project URL and anon key to
            <code>.env</code> first — see <code>.env.example</code> and the README.
          </p>
        ) : (
          <>
            <p className="adm-muted">Use the email and password of your Supabase admin account.</p>
            <div className="adm-field">
              <label htmlFor="adm-email">Email</label>
              <input
                id="adm-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="adm-field">
              <label htmlFor="adm-password">Password</label>
              <input
                id="adm-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="adm-notice is-error" role="alert">{error}</div>}
            <button type="submit" className="adm-btn is-primary adm-btn-block" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </>
        )}
        <Link to="/" className="adm-back-link">← Back to site</Link>
      </form>
    </div>
  )
}

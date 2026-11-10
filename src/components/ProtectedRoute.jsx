import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function SetupRequired() {
  return (
    <div className="adm-gate">
      <div className="adm-gate-card">
        <span className="adm-eyebrow">Admin</span>
        <h1>Supabase isn&apos;t configured yet.</h1>
        <p>
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a
          local <code>.env</code> file (see <code>.env.example</code>), then restart the
          dev server.
        </p>
        <p>
          Next, run <code>db/schema.sql</code> in the Supabase SQL editor and mark your
          account as an admin. Full steps are in the README.
        </p>
        <Link to="/" className="adm-btn is-primary">Back to site</Link>
      </div>
    </div>
  )
}

function NotAuthorized() {
  const { user, signOut } = useAuth()
  return (
    <div className="adm-gate">
      <div className="adm-gate-card">
        <span className="adm-eyebrow">Admin</span>
        <h1>This account isn&apos;t an admin.</h1>
        <p>
          You are signed in as <strong>{user?.email}</strong>, but this account doesn&apos;t
          have admin access. In Supabase, run the <code>profiles</code> update shown at the
          bottom of <code>db/schema.sql</code> for this email.
        </p>
        <div className="adm-gate-actions">
          <button type="button" className="adm-btn" onClick={signOut}>Sign out</button>
          <Link to="/" className="adm-btn is-primary">Back to site</Link>
        </div>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { loading, isConfigured, session, isAdmin } = useAuth()
  const location = useLocation()

  if (!isConfigured) return <SetupRequired />
  if (loading) return <div className="adm-gate"><p className="adm-muted">Checking access…</p></div>
  if (!session) return <Navigate to="/admin/login" state={{ from: location }} replace />
  if (!isAdmin) return <NotAuthorized />
  return children
}

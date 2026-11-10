import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import ThemeToggle from '../../components/ThemeToggle'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/guestbook', label: 'Guest Book' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/skills', label: 'Skills' },
  { to: '/admin/posts', label: 'Blog Posts' },
  { to: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const logout = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <Link to="/admin" className="adm-brand">
          Elyse<span>admin</span>
        </Link>
        <nav className="adm-nav" aria-label="Admin sections">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `adm-nav-link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <span className="adm-user" title={user?.email}>{user?.email}</span>
          <button type="button" className="adm-btn" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <div className="adm-main">
        <header className="adm-topbar">
          <Link to="/" className="adm-topbar-home">← Back to site</Link>
          <ThemeToggle />
        </header>
        <div className="adm-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

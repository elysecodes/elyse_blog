import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PageHeader, Notice } from '../../components/admin/AdminUI'
import { formatDateTime } from '../../lib/format'

const CARDS = [
  { table: 'guestbook_entries', label: 'Guest book entries', to: '/admin/guestbook' },
  { table: 'contact_messages', label: 'Contact messages', to: '/admin/messages' },
  { table: 'projects', label: 'Projects', to: '/admin/projects' },
  { table: 'skills', label: 'Skills', to: '/admin/skills' },
  { table: 'posts', label: 'Blog posts', to: '/admin/posts' },
]

export default function Dashboard() {
  const [counts, setCounts] = useState({})
  const [unread, setUnread] = useState(0)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      const results = await Promise.all(
        CARDS.map(async (c) => {
          const { count, error: err } = await supabase
            .from(c.table)
            .select('*', { count: 'exact', head: true })
          return [c.table, err ? null : count ?? 0, err?.message]
        }),
      )
      if (!active) return
      const next = {}
      let firstError = ''
      for (const [table, count, err] of results) {
        next[table] = count
        if (err && !firstError) firstError = err
      }
      setCounts(next)
      setError(firstError)

      const [{ count: unreadCount }, { data: latest }] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false),
        supabase
          .from('contact_messages')
          .select('id, name, email, message, created_at, read')
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      if (!active) return
      setUnread(unreadCount ?? 0)
      setRecent(latest ?? [])
    }

    load()
    return () => { active = false }
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back."
        subtitle="Manage the content and messages behind your portfolio."
      />
      <Notice tone="error">{error}</Notice>

      <div className="adm-stats">
        {CARDS.map((c) => (
          <Link to={c.to} className="adm-stat" key={c.table}>
            <span className="adm-stat-value">{counts[c.table] ?? '—'}</span>
            <span className="adm-stat-label">{c.label}</span>
          </Link>
        ))}
      </div>

      <section className="adm-panel">
        <div className="adm-panel-head">
          <h2>Latest messages</h2>
          <Link to="/admin/messages" className="adm-back-link">View all →</Link>
        </div>
        {unread > 0 && <p className="adm-muted">{unread} unread message{unread === 1 ? '' : 's'}.</p>}
        {recent.length === 0 ? (
          <p className="adm-muted">No messages yet.</p>
        ) : (
          <ul className="adm-recent">
            {recent.map((m) => (
              <li key={m.id} className="adm-recent-item">
                <div className="adm-recent-head">
                  <strong>{m.name}</strong>
                  <span className="adm-muted">{formatDateTime(m.created_at)}</span>
                  {!m.read && <span className="adm-badge">New</span>}
                </div>
                <p className="adm-recent-body">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

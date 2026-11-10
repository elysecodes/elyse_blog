import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminCollection } from '../../lib/useAdminCollection'
import { PageHeader, Notice, Busy } from '../../components/admin/AdminUI'
import { formatDateTime } from '../../lib/format'

export default function MessagesAdmin() {
  const { rows, setRows, loading, error, refresh } = useAdminCollection('contact_messages')
  const [actionError, setActionError] = useState('')
  const [filter, setFilter] = useState('all')

  const toggleRead = async (row) => {
    setActionError('')
    const next = !row.read
    const { error: err } = await supabase
      .from('contact_messages')
      .update({ read: next })
      .eq('id', row.id)
    if (err) return setActionError(err.message)
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, read: next } : r)))
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete the message from "${row.name}"?`)) return
    setActionError('')
    const { error: err } = await supabase.from('contact_messages').delete().eq('id', row.id)
    if (err) return setActionError(err.message)
    setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  const visible = filter === 'unread' ? rows.filter((r) => !r.read) : rows
  const unreadCount = rows.filter((r) => !r.read).length

  return (
    <div>
      <PageHeader
        eyebrow="Messages"
        title="Contact inbox"
        subtitle="Messages sent through the contact form. These are private — only admins can read them."
      >
        <button type="button" className="adm-btn" onClick={refresh} disabled={loading}>Refresh</button>
      </PageHeader>

      <Notice tone="error">{error || actionError}</Notice>

      <div className="adm-toolbar">
        <div className="adm-segmented">
          <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
            All ({rows.length})
          </button>
          <button type="button" className={filter === 'unread' ? 'is-active' : ''} onClick={() => setFilter('unread')}>
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {loading ? <Busy /> : visible.length === 0 ? (
        <p className="adm-muted">Nothing here.</p>
      ) : (
        <ul className="adm-messages">
          {visible.map((row) => (
            <li key={row.id} className={`adm-message${row.read ? '' : ' is-unread'}`}>
              <div className="adm-message-head">
                <div>
                  <strong>{row.name}</strong>{' '}
                  <a className="adm-link" href={`mailto:${row.email}`}>{row.email}</a>
                  {!row.read && <span className="adm-badge">New</span>}
                </div>
                <span className="adm-muted">{formatDateTime(row.created_at)}</span>
              </div>
              <p className="adm-message-body">{row.message}</p>
              <div className="adm-message-actions">
                <button type="button" className="adm-btn is-small" onClick={() => toggleRead(row)}>
                  Mark as {row.read ? 'unread' : 'read'}
                </button>
                <a className="adm-btn is-small" href={`mailto:${row.email}?subject=Re: your message`}>Reply</a>
                <button type="button" className="adm-btn is-small is-danger" onClick={() => remove(row)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

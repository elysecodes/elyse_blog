import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminCollection } from '../../lib/useAdminCollection'
import { PageHeader, Notice, Busy } from '../../components/admin/AdminUI'
import { formatDateTime } from '../../lib/format'

export default function GuestbookAdmin() {
  const { rows, setRows, loading, error, refresh } = useAdminCollection('guestbook_entries')
  const [actionError, setActionError] = useState('')

  const toggleApproved = async (row) => {
    setActionError('')
    const next = !row.approved
    const { error: err } = await supabase
      .from('guestbook_entries')
      .update({ approved: next })
      .eq('id', row.id)
    if (err) return setActionError(err.message)
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, approved: next } : r)))
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete the entry from "${row.name}"? This cannot be undone.`)) return
    setActionError('')
    const { error: err } = await supabase.from('guestbook_entries').delete().eq('id', row.id)
    if (err) return setActionError(err.message)
    setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  return (
    <div>
      <PageHeader
        eyebrow="Guest Book"
        title="Entries"
        subtitle="Approve, hide or delete notes visitors leave on your site. Only approved entries are shown publicly."
      >
        <button type="button" className="adm-btn" onClick={refresh} disabled={loading}>Refresh</button>
      </PageHeader>

      <Notice tone="error">{error || actionError}</Notice>
      {loading ? <Busy /> : rows.length === 0 ? (
        <p className="adm-muted">No entries yet.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="adm-nowrap">{row.name}</td>
                  <td className="adm-cell-message">{row.message}</td>
                  <td className="adm-nowrap adm-muted">{formatDateTime(row.created_at)}</td>
                  <td>
                    <span className={`adm-badge${row.approved ? ' is-ok' : ' is-muted'}`}>
                      {row.approved ? 'Approved' : 'Hidden'}
                    </span>
                  </td>
                  <td className="is-right adm-nowrap">
                    <button type="button" className="adm-btn is-small" onClick={() => toggleApproved(row)}>
                      {row.approved ? 'Hide' : 'Approve'}
                    </button>
                    <button type="button" className="adm-btn is-small is-danger" onClick={() => remove(row)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

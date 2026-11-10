import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdminCollection } from '../../lib/useAdminCollection'
import { PageHeader, Notice, Busy, Modal, RecordForm } from '../../components/admin/AdminUI'
import { formatDate, slugify } from '../../lib/format'

const FIELDS = [
  { name: 'title', label: 'Title', placeholder: 'What I learned building…' },
  { name: 'slug', label: 'Slug (URL)', placeholder: 'what-i-learned-building', hint: 'Leave blank to generate from the title.' },
  { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, hint: 'Short summary shown in the blog list.' },
  { name: 'body', label: 'Body', type: 'textarea', rows: 14, hint: 'Plain text. Separate paragraphs with a blank line.' },
  { name: 'cover_url', label: 'Cover image URL', placeholder: 'https://…' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

export default function PostsAdmin() {
  const { rows, loading, error, refresh } = useAdminCollection('posts', { order: 'created_at', ascending: false })
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const startNew = () => { setEditing(null); setFormError(''); setOpen(true) }
  const startEdit = (row) => { setEditing(row); setFormError(''); setOpen(true) }
  const close = () => { if (!busy) { setOpen(false); setEditing(null) } }

  const save = async (values) => {
    if (!values.title.trim()) return setFormError('Title is required.')
    const slug = slugify(values.slug?.trim() || values.title)
    if (!slug) return setFormError('Slug is required.')
    setBusy(true)
    setFormError('')

    const wasPublished = Boolean(editing?.published)
    const publishedAt = values.published
      ? (wasPublished && editing?.published_at ? editing.published_at : new Date().toISOString())
      : editing?.published_at ?? null

    const payload = {
      ...values,
      slug,
      cover_url: values.cover_url || null,
      published_at: publishedAt,
    }

    const { error: err } = editing
      ? await supabase.from('posts').update(payload).eq('id', editing.id)
      : await supabase.from('posts').insert(payload)
    setBusy(false)
    if (err) return setFormError(err.code === '23505' ? 'That slug is already used by another post.' : err.message)
    setOpen(false)
    setEditing(null)
    refresh()
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return
    const { error: err } = await supabase.from('posts').delete().eq('id', row.id)
    if (err) return setFormError(err.message)
    refresh()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Blog"
        title="Posts"
        subtitle="Write and publish articles. Published posts appear on the public /blog page."
      >
        <button type="button" className="adm-btn is-primary" onClick={startNew}>New post</button>
      </PageHeader>

      <Notice tone="error">{error || (!open ? formError : '')}</Notice>

      {loading ? <Busy /> : rows.length === 0 ? (
        <p className="adm-muted">No posts yet.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Date</th>
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.title}</strong>
                    {row.excerpt && <div className="adm-cell-sub">{row.excerpt}</div>}
                  </td>
                  <td className="adm-cell-tags">{row.slug}</td>
                  <td>
                    <span className={`adm-badge${row.published ? ' is-ok' : ' is-muted'}`}>
                      {row.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="adm-nowrap adm-muted">{formatDate(row.published_at || row.created_at)}</td>
                  <td className="is-right adm-nowrap">
                    {row.published && (
                      <Link className="adm-btn is-small" to={`/blog/${row.slug}`}>View</Link>
                    )}
                    <button type="button" className="adm-btn is-small" onClick={() => startEdit(row)}>Edit</button>
                    <button type="button" className="adm-btn is-small is-danger" onClick={() => remove(row)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title={editing ? 'Edit post' : 'New post'} onClose={close}>
          <Notice tone="error">{formError}</Notice>
          <RecordForm
            key={editing?.id ?? 'new'}
            fields={FIELDS}
            initial={editing ?? { published: false }}
            submitLabel={editing ? 'Save changes' : 'Create post'}
            onSubmit={save}
            onCancel={close}
            busy={busy}
          />
        </Modal>
      )}
    </div>
  )
}

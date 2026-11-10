import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminCollection } from '../../lib/useAdminCollection'
import { PageHeader, Notice, Busy, Modal, RecordForm } from '../../components/admin/AdminUI'

const FIELDS = [
  { name: 'title', label: 'Title', placeholder: 'E-Commerce Platform' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
  { name: 'tags', label: 'Tags', type: 'tags', hint: 'Comma separated, e.g. react, node.js, stripe' },
  { name: 'image_url', label: 'Image URL', placeholder: 'https://…' },
  { name: 'link', label: 'Project link', placeholder: 'https://…' },
  { name: 'sort_order', label: 'Sort order', type: 'number', min: 0 },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

export default function ProjectsAdmin() {
  const { rows, loading, error, refresh } = useAdminCollection('projects', { order: 'sort_order', ascending: true })
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const startNew = () => {
    setEditing(null)
    setFormError('')
    setOpen(true)
  }

  const startEdit = (row) => {
    setEditing(row)
    setFormError('')
    setOpen(true)
  }

  const close = () => {
    if (busy) return
    setOpen(false)
    setEditing(null)
  }

  const save = async (values) => {
    if (!values.title.trim()) return setFormError('Title is required.')
    setBusy(true)
    setFormError('')
    const payload = {
      ...values,
      link: values.link || '#',
      image_url: values.image_url || null,
      sort_order: values.sort_order ?? 0,
    }
    const { error: err } = editing
      ? await supabase.from('projects').update(payload).eq('id', editing.id)
      : await supabase.from('projects').insert(payload)
    setBusy(false)
    if (err) return setFormError(err.message)
    setOpen(false)
    setEditing(null)
    refresh()
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return
    const { error: err } = await supabase.from('projects').delete().eq('id', row.id)
    if (err) return setFormError(err.message)
    refresh()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Projects"
        title="Portfolio projects"
        subtitle="These cards power the Projects page. Unpublished projects are hidden from visitors."
      >
        <button type="button" className="adm-btn is-primary" onClick={startNew}>New project</button>
      </PageHeader>

      <Notice tone="error">{error || (!open ? formError : '')}</Notice>

      {loading ? <Busy /> : rows.length === 0 ? (
        <p className="adm-muted">No projects yet. Create your first one.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Tags</th>
                <th>Status</th>
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="adm-muted">{row.sort_order}</td>
                  <td>
                    <strong>{row.title}</strong>
                    <div className="adm-cell-sub">{row.description}</div>
                  </td>
                  <td className="adm-cell-tags">{(row.tags ?? []).join(', ')}</td>
                  <td>
                    <span className={`adm-badge${row.published ? ' is-ok' : ' is-muted'}`}>
                      {row.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="is-right adm-nowrap">
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
        <Modal title={editing ? 'Edit project' : 'New project'} onClose={close}>
          <Notice tone="error">{formError}</Notice>
          <RecordForm
            key={editing?.id ?? 'new'}
            fields={FIELDS}
            initial={editing ?? { published: true, sort_order: rows.length, link: '#' }}
            submitLabel={editing ? 'Save changes' : 'Create project'}
            onSubmit={save}
            onCancel={close}
            busy={busy}
          />
        </Modal>
      )}
    </div>
  )
}

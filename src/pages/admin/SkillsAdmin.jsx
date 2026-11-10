import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminCollection } from '../../lib/useAdminCollection'
import { PageHeader, Notice, Busy, Modal, RecordForm } from '../../components/admin/AdminUI'

const FIELDS = [
  { name: 'name', label: 'Skill name', placeholder: 'React' },
  { name: 'category', label: 'Category', placeholder: 'Frontend', hint: 'e.g. Languages, Frontend, Backend, Tools' },
  { name: 'level', label: 'Proficiency (0–100)', type: 'number', min: 0, max: 100 },
  { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
  { name: 'sort_order', label: 'Sort order', type: 'number', min: 0 },
]

export default function SkillsAdmin() {
  const { rows, loading, error, refresh } = useAdminCollection('skills', { order: 'sort_order', ascending: true })
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const startNew = () => { setEditing(null); setFormError(''); setOpen(true) }
  const startEdit = (row) => { setEditing(row); setFormError(''); setOpen(true) }
  const close = () => { if (!busy) { setOpen(false); setEditing(null) } }

  const save = async (values) => {
    if (!values.name.trim()) return setFormError('Skill name is required.')
    setBusy(true)
    setFormError('')
    const payload = {
      ...values,
      category: values.category || 'Other',
      level: values.level ?? 50,
      sort_order: values.sort_order ?? 0,
    }
    const { error: err } = editing
      ? await supabase.from('skills').update(payload).eq('id', editing.id)
      : await supabase.from('skills').insert(payload)
    setBusy(false)
    if (err) return setFormError(err.message)
    setOpen(false)
    setEditing(null)
    refresh()
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete the "${row.name}" skill?`)) return
    const { error: err } = await supabase.from('skills').delete().eq('id', row.id)
    if (err) return setFormError(err.message)
    refresh()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Skills"
        title="Skills & stack"
        subtitle="These power the radar chart and the skill detail panel on the home page."
      >
        <button type="button" className="adm-btn is-primary" onClick={startNew}>New skill</button>
      </PageHeader>

      <Notice tone="error">{error || (!open ? formError : '')}</Notice>

      {loading ? <Busy /> : rows.length === 0 ? (
        <p className="adm-muted">No skills yet.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Level</th>
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="adm-muted">{row.sort_order}</td>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.category}</td>
                  <td>
                    <div className="adm-level">
                      <span>{row.level}%</span>
                      <span className="adm-level-bar"><span style={{ width: `${row.level}%` }} /></span>
                    </div>
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
        <Modal title={editing ? 'Edit skill' : 'New skill'} onClose={close}>
          <Notice tone="error">{formError}</Notice>
          <RecordForm
            key={editing?.id ?? 'new'}
            fields={FIELDS}
            initial={editing ?? { level: 50, sort_order: rows.length, category: 'Other' }}
            submitLabel={editing ? 'Save changes' : 'Create skill'}
            onSubmit={save}
            onCancel={close}
            busy={busy}
          />
        </Modal>
      )}
    </div>
  )
}

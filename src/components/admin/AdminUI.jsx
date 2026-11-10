import { useState } from 'react'

export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="adm-page-head">
      <div>
        {eyebrow && <span className="adm-eyebrow">{eyebrow}</span>}
        <h1 className="adm-title">{title}</h1>
        {subtitle && <p className="adm-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="adm-page-actions">{children}</div>}
    </div>
  )
}

export function Notice({ tone = 'info', children }) {
  if (!children) return null
  return <div className={`adm-notice is-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>
}

export function Busy() {
  return <p className="adm-muted">Loading…</p>
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="adm-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-modal-head">
          <h2>{title}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const toFormValue = (field, value) => {
  if (field.type === 'tags') return Array.isArray(value) ? value.join(', ') : (value ?? '')
  if (field.type === 'checkbox') return Boolean(value)
  if (value === null || value === undefined) return ''
  return value
}

const buildInitial = (fields, initial) => {
  const out = {}
  for (const f of fields) out[f.name] = toFormValue(f, initial[f.name])
  return out
}

const toPayload = (fields, values) => {
  const out = {}
  for (const f of fields) {
    const v = values[f.name]
    if (f.type === 'tags') {
      out[f.name] = String(v || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (f.type === 'number') {
      out[f.name] = v === '' ? null : Number(v)
    } else if (f.type === 'checkbox') {
      out[f.name] = Boolean(v)
    } else {
      out[f.name] = v
    }
  }
  return out
}

export function RecordForm({ fields, initial = {}, submitLabel = 'Save', onSubmit, onCancel, busy }) {
  const [values, setValues] = useState(() => buildInitial(fields, initial))

  const change = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit(toPayload(fields, values))
  }

  return (
    <form className="adm-form" onSubmit={submit}>
      {fields.map((f) => {
        const id = `adm-field-${f.name}`
        return (
          <div className={`adm-field${f.type === 'checkbox' ? ' is-check' : ''}`} key={f.name}>
            {f.type === 'checkbox' ? (
              <label htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={values[f.name]}
                  onChange={(e) => change(f.name, e.target.checked)}
                />
                <span>{f.label}</span>
              </label>
            ) : (
              <>
                <label htmlFor={id}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    id={id}
                    rows={f.rows ?? 5}
                    value={values[f.name]}
                    placeholder={f.placeholder}
                    onChange={(e) => change(f.name, e.target.value)}
                  />
                ) : (
                  <input
                    id={id}
                    type={f.type === 'number' ? 'number' : 'text'}
                    value={values[f.name]}
                    placeholder={f.placeholder}
                    min={f.min}
                    max={f.max}
                    onChange={(e) => change(f.name, e.target.value)}
                  />
                )}
              </>
            )}
            {f.hint && <span className="adm-hint">{f.hint}</span>}
          </div>
        )
      })}
      <div className="adm-form-actions">
        <button type="button" className="adm-btn" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="adm-btn is-primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

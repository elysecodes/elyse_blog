import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { PageHeader, Notice, RecordForm } from '../../components/admin/AdminUI'
import { SITE_DEFAULTS } from '../../lib/siteSettings'

const FIELDS = [
  { name: 'name', label: 'Display name', placeholder: 'Elyse', hint: 'Used in the hero greeting and the logo.' },
  { name: 'tagline', label: 'Tagline', type: 'textarea', rows: 2 },
  { name: 'email', label: 'Contact email' },
  { name: 'github', label: 'GitHub URL' },
  { name: 'linkedin', label: 'LinkedIn URL' },
]

export default function SettingsAdmin() {
  const [initial, setInitial] = useState(SITE_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      const { data, error: err } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site')
        .maybeSingle()
      if (!active) return
      if (err) setError(err.message)
      else setInitial({ ...SITE_DEFAULTS, ...(data?.value ?? {}) })
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const save = async (values) => {
    setBusy(true)
    setStatus('')
    setError('')
    const { error: err } = await supabase
      .from('site_settings')
      .upsert({ key: 'site', value: values, updated_at: new Date().toISOString() })
    setBusy(false)
    if (err) return setError(err.message)
    setInitial(values)
    setStatus('Saved.')
    window.setTimeout(() => setStatus(''), 3000)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Site details"
        subtitle="Contact links and the tagline shown across the public site."
      />
      <Notice tone="error">{error}</Notice>
      <Notice tone="info">{status}</Notice>
      {loading ? (
        <p className="adm-muted">Loading…</p>
      ) : (
        <div className="adm-panel">
          <RecordForm
            key={formKey}
            fields={FIELDS}
            initial={initial}
            submitLabel="Save settings"
            onSubmit={save}
            onCancel={() => setFormKey((k) => k + 1)}
            busy={busy}
          />
        </div>
      )}
    </div>
  )
}

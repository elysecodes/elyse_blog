import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { submitGuestbook, fetchGuestbook } from '../lib/api'
import { isSupabaseConfigured } from '../lib/supabase'

const Globe3D = lazy(() => import('./Globe3D'))

const STORAGE_KEY = 'elyse-guestbook'
const MAX_MESSAGE = 280

const readLocalEntries = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLocalEntries = (entries) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* storage unavailable — entries stay in memory for the session */
  }
}

const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

export default function GuestBook() {
  const [entries, setEntries] = useState(() => (isSupabaseConfigured ? [] : readLocalEntries()))
  const [values, setValues] = useState({ name: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const firstRun = useRef(true)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    fetchGuestbook()
      .then((rows) => {
        if (!active) return
        setEntries(
          (rows ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            message: r.message,
            createdAt: Date.parse(r.created_at),
          })),
        )
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (isSupabaseConfigured) return
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    writeLocalEntries(entries)
  }, [entries])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!values.message.trim()) {
      next.message = 'Please leave a message.'
    } else if (values.message.trim().length > MAX_MESSAGE) {
      next.message = `Please keep it under ${MAX_MESSAGE} characters.`
    }
    setErrors(next)
    if (Object.keys(next).some((key) => next[key])) return

    const entry = {
      id: makeId(),
      name: values.name.trim().slice(0, 80),
      message: values.message.trim(),
      createdAt: Date.now(),
    }

    setStatus('sending')
    try {
      await submitGuestbook({ name: entry.name, message: entry.message })
      setEntries((prev) => [entry, ...prev])
      setValues({ name: '', message: '' })
      setStatus('success')
      window.setTimeout(() => setStatus('idle'), 3200)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="guestbook" className="guestbook" aria-label="Guest book">
      <div className="guestbook-inner">
        <div className="guestbook-head">
          <div className="guestbook-head-text">
            <span className="section-label">Guest Book</span>
            <h2 className="section-title">Leave your mark.</h2>
            <p className="section-subtitle">
              Drop a note for anyone who visits this page. No account needed.
            </p>
          </div>
          <Suspense fallback={<div className="guestbook-hero" aria-hidden="true" />}>
            <Globe3D />
          </Suspense>
        </div>

        <form className="guestbook-form" onSubmit={handleSubmit} noValidate>
          <div className="guestbook-form-row">
            <div className="contact-form-field">
              <label htmlFor="gb-name">Name</label>
              <input
                id="gb-name"
                name="name"
                type="text"
                placeholder="Alex"
                value={values.name}
                onChange={handleChange}
                aria-invalid={!!errors.name}
                autoComplete="name"
              />
              {errors.name && <span className="contact-form-error" role="alert">{errors.name}</span>}
            </div>
            <div className="contact-form-field">
              <label htmlFor="gb-message">Message</label>
              <textarea
                id="gb-message"
                name="message"
                rows="4"
                placeholder="Loved the pixel art. Keep building!"
                value={values.message}
                onChange={handleChange}
                aria-invalid={!!errors.message}
              />
              {errors.message && <span className="contact-form-error" role="alert">{errors.message}</span>}
              <span className={`guestbook-counter${values.message.length > MAX_MESSAGE ? ' is-over' : ''}`}>
                {values.message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary guestbook-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Signing…' : 'Sign the book'}
          </button>
          {status === 'success' && (
            <p className="contact-form-status is-success" role="status">
              Thanks! Your note is signed in.
            </p>
          )}
          {status === 'error' && (
            <p className="contact-form-status is-error" role="alert">
              Something went wrong. Please try again or{' '}
              <a href="mailto:elyseirankunda813@gmail.com?subject=Website%20Guest%20Book">email me directly</a>.
            </p>
          )}
        </form>

        <div className="guestbook-entries">
          <p className="guestbook-count">
            {loading
              ? 'Loading entries…'
              : entries.length === 0
                ? 'No entries yet — be the first.'
                : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
          </p>
          {entries.length > 0 && (
            <ul className="guestbook-list" role="list">
              {entries.map((entry) => (
                <li key={entry.id} className="guestbook-entry" role="listitem">
                  <div className="guestbook-entry-head">
                    <span className="guestbook-entry-name">{entry.name}</span>
                    <time className="guestbook-entry-date" dateTime={new Date(entry.createdAt).toISOString()}>
                      {formatDate(entry.createdAt)}
                    </time>
                  </div>
                  <p className="guestbook-entry-message">{entry.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

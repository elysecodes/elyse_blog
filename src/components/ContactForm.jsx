import { useState } from 'react'
import { submitContact } from '../lib/api'

const initialValues = { name: '', email: '', message: '' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactForm() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!values.email.trim()) {
      next.email = 'Please enter your email.'
    } else if (!EMAIL_RE.test(values.email.trim())) {
      next.email = 'Please enter a valid email address.'
    }
    if (!values.message.trim()) next.message = 'Please enter a message.'
    return next
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).some((key) => next[key])) return

    setStatus('sending')
    try {
      await submitContact({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      })
      setStatus('success')
      setValues(initialValues)
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-row">
        <div className="contact-form-field">
          <label htmlFor="cf-name">Name</label>
          <input
            id="cf-name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            autoComplete="name"
          />
          {errors.name && <span className="contact-form-error" role="alert">{errors.name}</span>}
        </div>
        <div className="contact-form-field">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && <span className="contact-form-error" role="alert">{errors.email}</span>}
        </div>
      </div>
      <div className="contact-form-field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          rows="5"
          value={values.message}
          onChange={handleChange}
          aria-invalid={!!errors.message}
        />
        {errors.message && <span className="contact-form-error" role="alert">{errors.message}</span>}
      </div>
      <button type="submit" className="btn btn-primary contact-form-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
      {status === 'success' && (
        <p className="contact-form-status is-success" role="status">
          Thanks! Your message has been sent.
        </p>
      )}
      {status === 'error' && (
        <p className="contact-form-status is-error" role="alert">
          Something went wrong. Please try again or{' '}
          <a href="mailto:elyseirankunda813@gmail.com?subject=Website%20Contact%20Form">email me directly</a>.
        </p>
      )}
    </form>
  )
}

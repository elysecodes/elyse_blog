import { GitHubIcon, LinkedInIcon, EmailIcon } from './icons'
import ContactForm from './ContactForm'
import { useSiteSettings } from '../lib/siteSettings'

export default function Contact() {
  const settings = useSiteSettings()
  return (
    <section id="contact" className="contact" aria-label="Contact">
      <div className="contact-inner">
        <span className="section-label">Contact</span>
        <h2 className="contact-statement">Let's build something useful.</h2>
        <div className="contact-links" role="list" aria-label="Contact options">
          <a href={`mailto:${settings.email}`} className="contact-link" role="listitem" aria-label="Send email">
            <EmailIcon />
            {settings.email}
          </a>
          <a href={settings.github} target="_blank" rel="noreferrer" className="contact-link" role="listitem" aria-label="GitHub profile">
            <GitHubIcon size={18} />
            GitHub
          </a>
          <a href={settings.linkedin} target="_blank" rel="noreferrer" className="contact-link" role="listitem" aria-label="LinkedIn profile">
            <LinkedInIcon size={18} />
            LinkedIn
          </a>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useSiteSettings } from '../lib/siteSettings'

const links = ['About', 'Skills', 'Contact']

export default function Navbar() {
  const settings = useSiteSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const pendingScroll = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (location.pathname !== '/') return
      const scrollY = window.scrollY + 120
      const current = [...links].reverse().find((id) => {
        const el = document.getElementById(id.toLowerCase())
        return el && scrollY >= el.offsetTop
      })
      setActive(current ?? '')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    if (location.pathname !== '/' || !pendingScroll.current) return
    const id = pendingScroll.current
    pendingScroll.current = null
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    })
  }, [location])

  const scrollTo = useCallback((id) => {
    if (location.pathname !== '/') {
      pendingScroll.current = id
      navigate('/')
    } else {
      const el = document.getElementById(id.toLowerCase())
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }, [location, navigate])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="nav-content">
        <Link to="/" className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {settings.name}
        </Link>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`} role="menubar">
          {links.map((link) => (
            <li key={link} role="none">
              <a role="menuitem" onClick={() => scrollTo(link)} className={active === link ? 'active' : ''} tabIndex={0}>
                {link}
              </a>
            </li>
          ))}
          <li role="none">
            <a role="menuitem" onClick={() => { navigate('/projects'); setMenuOpen(false) }} className={location.pathname === '/projects' ? 'active' : ''} tabIndex={0}>
              Projects
            </a>
          </li>
          <li role="none">
            <a role="menuitem" onClick={() => { navigate('/blog'); setMenuOpen(false) }} className={location.pathname.startsWith('/blog') ? 'active' : ''} tabIndex={0}>
              Blog
            </a>
          </li>
          <li role="none">
            <a role="menuitem" onClick={() => { navigate('/guestbook'); setMenuOpen(false) }} className={location.pathname === '/guestbook' ? 'active' : ''} tabIndex={0}>
              Guest Book
            </a>
          </li>
          <li role="none">
            <a role="menuitem" onClick={() => { navigate('/playground'); setMenuOpen(false) }} className={location.pathname === '/playground' ? 'active' : ''} tabIndex={0}>
              Playground
            </a>
          </li>
        </ul>
        <button className="nav-cta" onClick={() => scrollTo('Contact')}>
          Let's Talk
        </button>
        <ThemeToggle />
      </div>
    </nav>
  )
}

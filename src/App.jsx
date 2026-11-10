import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Reveal from './components/Reveal'
import ProtectedRoute from './components/ProtectedRoute'
import { useSiteSettings } from './lib/siteSettings'

const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const GuestBookPage = lazy(() => import('./pages/GuestBookPage'))
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))

const Login = lazy(() => import('./pages/admin/Login'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const GuestbookAdmin = lazy(() => import('./pages/admin/GuestbookAdmin'))
const MessagesAdmin = lazy(() => import('./pages/admin/MessagesAdmin'))
const ProjectsAdmin = lazy(() => import('./pages/admin/ProjectsAdmin'))
const SkillsAdmin = lazy(() => import('./pages/admin/SkillsAdmin'))
const PostsAdmin = lazy(() => import('./pages/admin/PostsAdmin'))
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin'))

function Home() {
  return (
    <>
      <Hero />
      <Reveal><About /></Reveal>
      <Reveal><Skills /></Reveal>
      <Reveal><Contact /></Reveal>
    </>
  )
}

export default function App() {
  const location = useLocation()
  const settings = useSiteSettings()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      {!isAdmin && <Navbar />}
      <main id="main-content" className={isAdmin ? 'admin-main' : undefined}>
        <Suspense fallback={isAdmin ? <div className="adm-gate"><p className="adm-muted">Loading…</p></div> : null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/guestbook" element={<GuestBookPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
            >
              <Route index element={<Dashboard />} />
              <Route path="guestbook" element={<GuestbookAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="skills" element={<SkillsAdmin />} />
              <Route path="posts" element={<PostsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && (
        <footer>
          <div className="footer-inner">
            <p className="footer-copy">&copy; 2026 {settings.name}</p>
            <div className="footer-social" role="list" aria-label="Social links">
              <a href={settings.github} target="_blank" rel="noreferrer" role="listitem">GitHub</a>
              <a href={settings.linkedin} target="_blank" rel="noreferrer" role="listitem">LinkedIn</a>
              <a href={`mailto:${settings.email}`} role="listitem">Email</a>
            </div>
          </div>
        </footer>
      )}
    </>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './admin.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

const redirect = sessionStorage.getItem('gh-pages-redirect')
if (redirect) {
  sessionStorage.removeItem('gh-pages-redirect')
  window.history.replaceState(null, '', BASE + redirect)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={BASE}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
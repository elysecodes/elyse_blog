import { supabase, isSupabaseConfigured } from './supabase'
import { PROJECTS, SKILLS } from './fallbackData'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_KEY = '6d65e425-e9fc-4cab-a4ff-8b487eb0b17c'

const notifyByEmail = async (payload) => {
  try {
    await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...payload }),
    })
  } catch {
    /* e-mail notification is best-effort; the database is the source of truth */
  }
}

const postWeb3Forms = async (payload) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...payload }),
      signal: controller.signal,
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data || String(data.success) !== 'true') {
      throw new Error('Submit failed')
    }
  } finally {
    clearTimeout(timeout)
  }
}

// ─── Public reads ───────────────────────────────────────────────────────────
export async function fetchProjects() {
  if (!isSupabaseConfigured) return PROJECTS
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, tags, image_url, link, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })
  if (error) return PROJECTS
  return data ?? []
}

export async function fetchSkills() {
  if (!isSupabaseConfigured) return SKILLS
  const { data, error } = await supabase
    .from('skills')
    .select('id, name, category, level, description, sort_order')
    .order('sort_order', { ascending: true })
  if (error) return SKILLS
  return data ?? []
}

export async function fetchGuestbook() {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('guestbook_entries')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchPublishedPosts() {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, cover_url, published_at, created_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchPostBySlug(slug) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, body, cover_url, published_at')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) throw error
  return data
}

// ─── Public writes ──────────────────────────────────────────────────────────
export async function submitGuestbook({ name, message }) {
  if (!isSupabaseConfigured) {
    await postWeb3Forms({ name, message, subject: 'Website Guest Book Sign In' })
    return
  }
  const { error } = await supabase.from('guestbook_entries').insert({ name, message })
  if (error) throw error
  notifyByEmail({ name, message, subject: 'Website Guest Book Sign In' })
}

export async function submitContact({ name, email, message }) {
  if (!isSupabaseConfigured) {
    await postWeb3Forms({ name, email, message, subject: 'Website Contact Form' })
    return
  }
  const { error } = await supabase.from('contact_messages').insert({ name, email, message })
  if (error) throw error
  notifyByEmail({ name, email, message, subject: 'Website Contact Form' })
}

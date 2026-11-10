import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

export const SITE_DEFAULTS = {
  name: 'Elyse',
  tagline: 'Software Developer building simple, useful and reliable digital experiences.',
  email: 'elyseirankunda813@gmail.com',
  github: 'https://github.com/elyseirankunda/',
  linkedin: 'https://www.linkedin.com/in/irankunda-elyse-753156421/',
}

export async function fetchSiteSettings() {
  if (!isSupabaseConfigured) return SITE_DEFAULTS
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site')
    .maybeSingle()
  if (error || !data?.value) return SITE_DEFAULTS
  return { ...SITE_DEFAULTS, ...data.value }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(SITE_DEFAULTS)
  useEffect(() => {
    let active = true
    fetchSiteSettings().then((next) => {
      if (active) setSettings(next)
    })
    return () => { active = false }
  }, [])
  return settings
}

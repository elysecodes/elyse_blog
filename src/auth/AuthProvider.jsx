import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './context'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const checkAdmin = useCallback(async (userId) => {
    if (!userId || !supabase) return false
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle()
    if (error) return false
    return Boolean(data?.is_admin)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setIsAdmin(await checkAdmin(data.session?.user?.id))
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, next) => {
      if (!mounted) return
      setSession(next)
      setIsAdmin(await checkAdmin(next?.user?.id))
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [checkAdmin])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    isAdmin,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

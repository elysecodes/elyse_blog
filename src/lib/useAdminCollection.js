import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useAdminCollection(table, { order = 'created_at', ascending = false } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    if (!supabase) {
      setError('Supabase is not configured.')
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from(table)
      .select('*')
      .order(order, { ascending })
    if (err) {
      setError(err.message)
      setRows([])
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }, [table, order, ascending])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rows, setRows, loading, error, refresh }
}

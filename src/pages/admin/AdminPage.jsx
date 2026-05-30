import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminPage() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    // Get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Still checking session
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-deep-blue flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in, or logged in but not an admin
  const isAdmin = session?.user?.app_metadata?.role === 'admin'
  if (!session || !isAdmin) return <AdminLogin />

  return <AdminDashboard session={session} />
}

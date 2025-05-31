import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, type UserRole } from '@/lib/supabase'

interface AuthUser extends User {
  role?: UserRole
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user as AuthUser
      if (authUser) {
        authUser.role = authUser.user_metadata?.role as UserRole
      }
      setUser(authUser)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user as AuthUser
      if (authUser) {
        authUser.role = authUser.user_metadata?.role as UserRole
      }
      setUser(authUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role,
  }
}
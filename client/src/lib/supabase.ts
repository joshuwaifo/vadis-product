import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// User roles enum
export type UserRole = 'production' | 'brand' | 'financier' | 'creator'

export const roleLabels: Record<UserRole, string> = {
  production: 'Production Company',
  brand: 'Brand/Agency',
  financier: 'Financier',
  creator: 'Individual Creator'
}

// Auth helper functions
export const signInWithMagicLink = async (email: string, role: UserRole) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        role,
        full_name: email.split('@')[0] // Default name from email
      }
    }
  })
  
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For use in client components
export const createBrowserClient = () =>
  createClientComponentClient()

// For use in server components / route handlers
export const createServerClient = () =>
  createServerComponentClient({ cookies })

// Admin client (server-side only, never expose to browser)
export const createAdminClient = () =>
  createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

// Singleton for non-auth uses (public data)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

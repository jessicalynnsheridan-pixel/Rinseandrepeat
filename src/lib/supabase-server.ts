// SERVER-SIDE ONLY — never import this from a client component
import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// For use in Server Components
export const createServerClient = () =>
  createServerComponentClient({ cookies })

// For use in Route Handlers (API routes)
export const createRouteClient = () =>
  createRouteHandlerClient({ cookies })

// Admin client — uses service role, bypasses RLS. Never expose to browser.
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

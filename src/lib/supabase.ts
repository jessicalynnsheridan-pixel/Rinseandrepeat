// CLIENT-SIDE ONLY — safe to import from any client component
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For use in client components
export const createBrowserClient = () => createClientComponentClient()

// Public singleton for non-auth reads (no cookies — safe on client & server)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

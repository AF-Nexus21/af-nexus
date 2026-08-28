import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const isSupabaseAvailable = Boolean(supabaseUrl && supabaseAnonKey)

// Client-side Supabase (para sa browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'af-nexus-auth',
  }
})

// Server-side Supabase (para sa API routes)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
)
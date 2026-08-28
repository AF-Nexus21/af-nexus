import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseAvailable = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseAvailable
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storageKey: 'af-nexus-auth',
      }
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key')
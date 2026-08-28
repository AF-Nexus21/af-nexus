// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Kunin ang environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase (para sa browser)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase (para sa admin/API routes)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper function para i-check kung available ang Supabase
export const isSupabaseAvailable = !!supabaseUrl && !!supabaseAnonKey && !!supabaseServiceKey;

// Optional: Mag-log ng warning kung may kulang
if (typeof window === 'undefined' && !isSupabaseAvailable) {
  console.warn('⚠️ Supabase environment variables are missing. Some features may not work.');
}
import { createBrowserClient } from '@supabase/ssr'

// Use placeholder values if env vars are not available (for build time)
// At runtime, the app will fail gracefully if these are not real values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Create a browser client that handles cookies automatically
// This ensures that the middleware (server-side) can read the session
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
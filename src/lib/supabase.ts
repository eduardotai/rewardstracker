import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a browser client that handles cookies automatically
// This ensures that the middleware (server-side) can read the session
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
)
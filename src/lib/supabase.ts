import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a placeholder client during build time when env vars are not available
// This client will only be used in static builds and will be replaced at runtime
const createSupabaseClient = (): SupabaseClient => {
    if (!supabaseUrl || !supabaseAnonKey) {
        // Return a mock client during build - actual usage will fail gracefully
        return createClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()
'use client'

import AuthComponent from '@/components/Auth'

// Force dynamic rendering to avoid Supabase initialization at build time
export const dynamic = 'force-dynamic'

export default function AuthPage() {
  return <AuthComponent />
}
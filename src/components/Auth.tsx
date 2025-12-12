'use client'

import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function AuthComponent() {
  const [redirectTo, setRedirectTo] = useState('')

  useEffect(() => {
    setRedirectTo(`${window.location.origin}/auth/callback`)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-xbox-green">
          🎮 Rewards Tracker BR
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'azure']} // Azure for MS
          redirectTo={redirectTo}
        />
      </div>
    </div>
  )
}
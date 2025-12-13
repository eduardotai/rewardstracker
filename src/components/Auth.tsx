'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Gift, UserX, LogOut, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const GUEST_STORAGE_KEY = 'rewards_tracker_guest_mode'
const GUEST_DATA_KEY = 'rewards_tracker_guest_data'

const defaultGuestData = {
  registros: [],
  atividades: [],
  resgates: [],
  profile: {
    display_name: 'Visitante',
    tier: 'Sem',
    meta_mensal: 12000,
  }
}

export default function AuthComponent() {
  const router = useRouter()
  const { user } = useAuth()
  const [redirectTo] = useState(`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`)

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleGuestMode = () => {
    localStorage.setItem(GUEST_STORAGE_KEY, 'true')
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(defaultGuestData))
    document.cookie = 'rewards_guest_mode=true; path=/; max-age=31536000'
    router.push('/')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--xbox-green)]/10 rounded-lg mb-4">
            <Gift className="h-12 w-12 text-[var(--xbox-green)]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Rewards Tracker BR</h1>
          <p className="text-[var(--text-secondary)]">Gerencie seus pontos Microsoft Rewards</p>
        </div>

        <div className="xbox-card p-6">
          {user ? (
            <div className="text-center space-y-3">
              <p className="text-white">Você já está logado como <br /><span className="font-semibold text-[var(--xbox-green)]">{user.email}</span></p>
              <button
                onClick={() => window.location.href = '/'}
                className="xbox-btn xbox-btn-primary w-full flex items-center justify-center gap-2"
              >
                Ir para Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleLogout}
                className="xbox-btn xbox-btn-outline w-full flex items-center justify-center gap-2 text-[var(--error)] border-[var(--error)] hover:bg-[var(--error)]/10"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </button>
            </div>
          ) : (
            <>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#107C10',
                        brandAccent: '#2D9C2D',
                        brandButtonText: 'white',
                        defaultButtonBackground: '#242424',
                        inputBackground: '#242424',
                        inputText: 'white',
                      },
                    },
                  },
                  className: {
                    container: 'auth-container',
                    button: 'auth-button',
                    input: 'auth-input',
                  },
                }}
                providers={[]}
                redirectTo={redirectTo}
                localization={{
                  variables: {
                    sign_in: { email_label: 'E-mail', password_label: 'Senha', button_label: 'Entrar' },
                  }
                }}
              />
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                <span className="text-xs text-[var(--text-muted)] uppercase">ou</span>
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              </div>
              <button onClick={handleGuestMode} className="xbox-btn xbox-btn-outline w-full gap-2">
                <UserX className="h-4 w-4" />
                Entrar sem conta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
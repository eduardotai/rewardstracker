'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Gift, UserX } from 'lucide-react'

const GUEST_STORAGE_KEY = 'rewards_tracker_guest_mode'
const GUEST_DATA_KEY = 'rewards_tracker_guest_data'

const defaultGuestData = {
  registros: [],
  profile: {
    display_name: 'Visitante',
    tier: 'Sem',
    meta_mensal: 12000,
  }
}

export default function AuthComponent() {
  const router = useRouter()
  const [redirectTo, setRedirectTo] = useState('')

  useEffect(() => {
    setRedirectTo(`${window.location.origin}/auth/callback`)
  }, [])

  const handleGuestMode = () => {
    // Set localStorage for guest data
    localStorage.setItem(GUEST_STORAGE_KEY, 'true')
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(defaultGuestData))
    // Set cookie for middleware
    document.cookie = 'rewards_guest_mode=true; path=/; max-age=31536000'
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--xbox-green)]/10 rounded-lg mb-4">
            <Gift className="h-12 w-12 text-[var(--xbox-green)]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Rewards Tracker BR
          </h1>
          <p className="text-[var(--text-secondary)]">
            Gerencie seus pontos Microsoft Rewards
          </p>
        </div>

        {/* Auth Card */}
        <div className="xbox-card p-6">
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
                    defaultButtonBackgroundHover: '#333333',
                    defaultButtonBorder: '#333333',
                    defaultButtonText: 'white',
                    dividerBackground: '#333333',
                    inputBackground: '#242424',
                    inputBorder: '#333333',
                    inputBorderHover: '#107C10',
                    inputBorderFocus: '#107C10',
                    inputText: 'white',
                    inputLabelText: '#b3b3b3',
                    inputPlaceholder: '#737373',
                    messageText: 'white',
                    messageTextDanger: '#EF5350',
                    anchorTextColor: '#107C10',
                    anchorTextHoverColor: '#2D9C2D',
                  },
                  space: {
                    inputPadding: '12px',
                    buttonPadding: '12px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '2px',
                    buttonBorderRadius: '2px',
                    inputBorderRadius: '2px',
                  },
                  fonts: {
                    bodyFontFamily: 'Inter, system-ui, sans-serif',
                    buttonFontFamily: 'Inter, system-ui, sans-serif',
                    inputFontFamily: 'Inter, system-ui, sans-serif',
                    labelFontFamily: 'Inter, system-ui, sans-serif',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
                label: 'auth-label',
              },
            }}
            providers={[]}
            redirectTo={redirectTo}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  social_provider_text: 'Criar conta com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
                forgotten_password: {
                  email_label: 'E-mail',
                  button_label: 'Recuperar senha',
                  loading_button_label: 'Enviando...',
                  link_text: 'Esqueceu sua senha?',
                },
              },
            }}
          />

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)] uppercase">ou</span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          {/* Guest Mode Button */}
          <button
            onClick={handleGuestMode}
            className="xbox-btn xbox-btn-outline w-full"
          >
            <UserX className="h-4 w-4" />
            Entrar sem conta
          </button>
          <p className="text-xs text-[var(--text-muted)] text-center mt-3">
            Seus dados serão salvos apenas neste navegador
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          © 2024 Rewards Tracker BR. Não afiliado à Microsoft.
        </p>
      </div>
    </div>
  )
}
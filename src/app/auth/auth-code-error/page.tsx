'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="xbox-card p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-[var(--error)]/10 p-4 rounded-full">
            <AlertCircle className="w-8 h-8 text-[var(--error)]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Erro de Autenticação
        </h1>

        <p className="text-[var(--text-secondary)] text-center mb-8">
          Não conseguimos processar seu código de autenticação. Por favor, tente fazer login novamente.
        </p>

        <div className="bg-[var(--error)]/10 border-l-2 border-[var(--error)] p-4 rounded mb-6">
          <p className="text-sm text-[var(--text-secondary)]">
            Se o problema persistir, entre em contato com o suporte ou tente mais tarde.
          </p>
        </div>

        <Link
          href="/auth"
          className="xbox-btn xbox-btn-primary w-full"
        >
          <ArrowLeft size={18} />
          Voltar ao Login
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-xbox-red bg-opacity-10 p-4 rounded-full">
            <AlertCircle className="w-8 h-8 text-xbox-red" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Erro de Autenticação
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Não conseguimos processar seu código de autenticação. Por favor, tente fazer login novamente.
        </p>

        <div className="bg-xbox-light border-l-4 border-xbox-red p-4 rounded-lg mb-8">
          <p className="text-sm text-gray-700">
            Se o problema persistir, entre em contato com o suporte ou tente mais tarde.
          </p>
        </div>

        <Link
          href="/auth"
          className="w-full bg-xbox-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Voltar ao Login
        </Link>
      </div>
    </div>
  )
}

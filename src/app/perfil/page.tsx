'use client'

import { useState } from 'react'
import { User, Settings, Crown, Download, FileText, EyeOff } from 'lucide-react'
import jsPDF from 'jspdf'

export default function PerfilPage() {
  const [isPremium] = useState(false) // Mock
  const [tier, setTier] = useState('Sem')
  const [metaMensal, setMetaMensal] = useState(12000)

  const handleExportPDF = () => {
    if (!isPremium) {
      alert('Recurso premium! Assine por R$9,90/mês')
      return
    }
    // Generate simple PDF
    const doc = new jsPDF()
    doc.text('Relatório Rewards Tracker BR', 20, 20)
    doc.text(`Saldo Atual: 8500 pontos`, 20, 40)
    doc.text(`Streak: 5 dias`, 20, 50)
    doc.text(`Meta Mensal: ${metaMensal} pontos`, 20, 60)
    doc.save('relatorio-rewards.pdf')
  }

  const handleCustomTemplate = () => {
    if (!isPremium) {
      alert('Recurso premium! Assine por R$9,90/mês')
      return
    }
    // TODO: Open template editor
    alert('Abrindo editor de templates...')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-xbox-green">👤 Perfil</h1>
        <p className="text-gray-600">Gerencie suas configurações e conta</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-xbox-light rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-xbox-green" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">João Silva</h2>
              <p className="text-gray-700 font-medium">joao@email.com</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tier Xbox</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="Sem">Sem Xbox</option>
                <option value="Essential">Xbox Essential</option>
                <option value="Premium">Xbox Premium</option>
                <option value="Ultimate">Xbox Ultimate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Mensal (pontos)</label>
              <input
                type="number"
                value={metaMensal}
                onChange={(e) => setMetaMensal(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Crown className={`h-6 w-6 ${isPremium ? 'text-yellow-500' : 'text-gray-400'}`} />
            <h2 className="text-xl font-semibold">Premium</h2>
            {isPremium ? (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">Ativo</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">Grátis</span>
            )}
          </div>

          {!isPremium && (
            <div className="bg-gradient-to-r from-xbox-green to-xbox-blue text-white p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Assine Premium por R$9,90/mês</h3>
              <p className="text-sm mb-3">Desbloqueie export PDF, templates customizados, notificações push e remoção de anúncios.</p>
              <button className="bg-white text-xbox-green px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                Assinar Agora
              </button>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleExportPDF}
              className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${
                isPremium ? 'bg-xbox-light hover:bg-opacity-75' : 'bg-gray-50 cursor-not-allowed opacity-50'
              }`}
            >
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Exportar Relatório PDF</div>
                <div className="text-sm font-semibold text-gray-700">Baixe seu histórico completo</div>
              </div>
            </button>

            <button
              onClick={handleCustomTemplate}
              className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${
                isPremium ? 'bg-xbox-light hover:bg-opacity-75' : 'bg-gray-50 cursor-not-allowed opacity-50'
              }`}
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Templates Customizados</div>
                <div className="text-sm font-semibold text-gray-700">Crie relatórios personalizados</div>
              </div>
            </button>

            <div className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
              isPremium ? 'bg-xbox-light' : 'bg-gray-50 opacity-50'
            }`}>
              <EyeOff className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Sem Anúncios</div>
                <div className="text-sm font-semibold text-gray-700">Experiência limpa e focada</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Configurações</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notificações Push</div>
                <div className="text-sm font-semibold text-gray-700">Lembretes diários</div>
              </div>
              <input type="checkbox" className="toggle" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Tema Escuro</div>
                <div className="text-sm font-semibold text-gray-700">Modo noturno</div>
              </div>
              <input type="checkbox" className="toggle" />
            </div>

            <button className="w-full bg-xbox-red text-white py-2 rounded-md hover:bg-opacity-90 transition-colors font-semibold">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
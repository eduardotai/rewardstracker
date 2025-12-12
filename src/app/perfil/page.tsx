'use client'

import { useState } from 'react'
import { User, Crown, Download, FileText, EyeOff, LogOut, Home, Activity, BarChart3, PiggyBank, Gift, Menu, X as CloseIcon, Bell, Palette } from 'lucide-react'
import jsPDF from 'jspdf'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: false },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: false },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: false },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: false },
  { icon: User, label: 'Perfil', href: '/perfil', active: true },
]

export default function PerfilPage() {
  const [isPremium] = useState(false)
  const [tier, setTier] = useState('Sem')
  const [metaMensal, setMetaMensal] = useState(12000)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleExportPDF = () => {
    if (!isPremium) {
      alert('Recurso premium! Assine por R$9,90/mês')
      return
    }
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
    alert('Abrindo editor de templates...')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <h1 className="text-xl font-bold text-[var(--xbox-green)] flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Rewards Tracker
          </h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all relative ${item.active
                      ? 'bg-[var(--bg-tertiary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white'
                    }`}
                >
                  {item.active && <span className="xbox-nav-indicator" />}
                  <item.icon className={`h-5 w-5 ${item.active ? 'text-[var(--xbox-green)]' : ''}`} />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h1 className="text-xl font-bold text-[var(--xbox-green)]">Rewards</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium relative ${item.active ? 'bg-[var(--bg-tertiary)] text-white' : 'text-[var(--text-secondary)]'
                      }`}>
                      {item.active && <span className="xbox-nav-indicator" />}
                      <item.icon className={`h-5 w-5 ${item.active ? 'text-[var(--xbox-green)]' : ''}`} />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-[var(--xbox-green)]">Perfil</h1>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Perfil</h2>
            <p className="text-[var(--text-secondary)]">Gerencie suas configurações e conta</p>
          </header>

          <div className="space-y-6">
            {/* User Info Card */}
            <div className="xbox-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[var(--xbox-green)]/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-[var(--xbox-green)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">João Silva</h3>
                  <p className="text-[var(--text-secondary)]">joao@email.com</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="xbox-label">Tier Xbox</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="xbox-input xbox-select"
                  >
                    <option value="Sem">Sem Xbox</option>
                    <option value="Essential">Xbox Essential</option>
                    <option value="Premium">Xbox Premium</option>
                    <option value="Ultimate">Xbox Ultimate</option>
                  </select>
                </div>

                <div>
                  <label className="xbox-label">Meta Mensal (pontos)</label>
                  <input
                    type="number"
                    value={metaMensal}
                    onChange={(e) => setMetaMensal(parseInt(e.target.value))}
                    className="xbox-input"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Premium Card */}
            <div className="xbox-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className={`h-6 w-6 ${isPremium ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}`} />
                <h3 className="text-lg font-semibold text-white">Premium</h3>
                {isPremium ? (
                  <span className="xbox-badge xbox-badge-warning">Ativo</span>
                ) : (
                  <span className="xbox-badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>Grátis</span>
                )}
              </div>

              {!isPremium && (
                <div className="bg-gradient-to-r from-[var(--xbox-green)] to-[var(--xbox-green-light)] p-4 rounded mb-4">
                  <h4 className="font-semibold text-white mb-2">Assine Premium por R$9,90/mês</h4>
                  <p className="text-sm text-white/80 mb-3">Desbloqueie export PDF, templates customizados, notificações push e remoção de anúncios.</p>
                  <button className="xbox-btn bg-white text-[var(--xbox-green)] hover:bg-white/90">
                    Assinar Agora
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleExportPDF}
                  className={`w-full flex items-center gap-3 p-4 rounded transition-all ${isPremium ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)]' : 'bg-[var(--bg-tertiary)]/50 opacity-50 cursor-not-allowed'
                    }`}
                >
                  <Download className="h-5 w-5 text-[var(--xbox-green)]" />
                  <div className="text-left">
                    <div className="font-medium text-white">Exportar Relatório PDF</div>
                    <div className="text-xs text-[var(--text-muted)]">Baixe seu histórico completo</div>
                  </div>
                </button>

                <button
                  onClick={handleCustomTemplate}
                  className={`w-full flex items-center gap-3 p-4 rounded transition-all ${isPremium ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)]' : 'bg-[var(--bg-tertiary)]/50 opacity-50 cursor-not-allowed'
                    }`}
                >
                  <FileText className="h-5 w-5 text-[var(--xbox-green)]" />
                  <div className="text-left">
                    <div className="font-medium text-white">Templates Customizados</div>
                    <div className="text-xs text-[var(--text-muted)]">Crie relatórios personalizados</div>
                  </div>
                </button>

                <div className={`flex items-center gap-3 p-4 rounded ${isPremium ? 'bg-[var(--bg-tertiary)]' : 'bg-[var(--bg-tertiary)]/50 opacity-50'
                  }`}>
                  <EyeOff className="h-5 w-5 text-[var(--xbox-green)]" />
                  <div className="text-left">
                    <div className="font-medium text-white">Sem Anúncios</div>
                    <div className="text-xs text-[var(--text-muted)]">Experiência limpa e focada</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Card */}
            <div className="xbox-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Configurações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-[var(--text-muted)]" />
                    <div>
                      <div className="font-medium text-white">Notificações Push</div>
                      <div className="text-xs text-[var(--text-muted)]">Lembretes diários</div>
                    </div>
                  </div>
                  <input type="checkbox" className="xbox-checkbox" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-[var(--text-muted)]" />
                    <div>
                      <div className="font-medium text-white">Tema Escuro</div>
                      <div className="text-xs text-[var(--text-muted)]">Modo noturno</div>
                    </div>
                  </div>
                  <input type="checkbox" className="xbox-checkbox" defaultChecked />
                </div>

                <button className="w-full xbox-btn bg-[var(--error)] text-white hover:bg-[var(--error)]/90 mt-4">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
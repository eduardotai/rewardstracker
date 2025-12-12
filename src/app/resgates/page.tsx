'use client'

import { useState } from 'react'
import { Plus, Calculator, Home, Activity, BarChart3, PiggyBank, User, Gift, Menu, X as CloseIcon, CreditCard } from 'lucide-react'
import ResgateModal from '@/components/ResgateModal'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: false },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: false },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: false },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: true },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

export default function ResgatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'simulate'>('add')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const mockResgates = [
    { id: 1, data: '2024-12-10', item: 'R$5 Gift Card', pts_usados: 525, valor_brl: 5, custo_efetivo: 105 },
    { id: 2, data: '2024-12-08', item: 'R$10 Gift Card', pts_usados: 1050, valor_brl: 10, custo_efetivo: 105 },
    { id: 3, data: '2024-12-05', item: 'R$25 Xbox Gift Card', pts_usados: 2625, valor_brl: 25, custo_efetivo: 105 },
  ]

  const totalPtsUsados = mockResgates.reduce((sum, r) => sum + r.pts_usados, 0)
  const totalValor = mockResgates.reduce((sum, r) => sum + r.valor_brl, 0)

  const openAddModal = () => {
    setModalMode('add')
    setIsModalOpen(true)
  }

  const openSimulateModal = () => {
    setModalMode('simulate')
    setIsModalOpen(true)
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
          <h1 className="text-lg font-bold text-[var(--xbox-green)]">Resgates</h1>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Resgates</h2>
            <p className="text-[var(--text-secondary)]">Gerencie seus resgates de pontos</p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="xbox-card p-5">
              <p className="xbox-label">Total Resgatado</p>
              <p className="text-2xl font-bold text-[var(--xbox-green)]">{totalPtsUsados.toLocaleString()} <span className="text-sm text-[var(--text-muted)]">pts</span></p>
            </div>
            <div className="xbox-card p-5">
              <p className="xbox-label">Valor Total</p>
              <p className="text-2xl font-bold text-white">R$ {totalValor}</p>
            </div>
            <div className="xbox-card p-5">
              <p className="xbox-label">Média Custo</p>
              <p className="text-2xl font-bold text-[var(--warning)]">105 <span className="text-sm text-[var(--text-muted)]">pts/R$</span></p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={openAddModal} className="xbox-btn xbox-btn-primary">
              <Plus size={18} />
              Adicionar Resgate
            </button>
            <button onClick={openSimulateModal} className="xbox-btn xbox-btn-outline">
              <Calculator size={18} />
              Simular Resgate
            </button>
          </div>

          {/* Table */}
          <div className="xbox-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[var(--xbox-green)]" />
                Histórico de Resgates
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="xbox-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Item</th>
                    <th className="text-right">Pts Usados</th>
                    <th className="text-right">Valor BRL</th>
                    <th className="text-right">Custo Efetivo</th>
                  </tr>
                </thead>
                <tbody>
                  {mockResgates.map((resgate) => (
                    <tr key={resgate.id}>
                      <td className="text-white">{resgate.data}</td>
                      <td className="text-white">{resgate.item}</td>
                      <td className="text-right text-[var(--xbox-green)] font-semibold">{resgate.pts_usados.toLocaleString()}</td>
                      <td className="text-right text-white">R$ {resgate.valor_brl}</td>
                      <td className="text-right text-[var(--text-secondary)]">{resgate.custo_efetivo} pts/R$</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <ResgateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
      />
    </div>
  )
}
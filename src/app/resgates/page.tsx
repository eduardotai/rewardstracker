'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Calculator, Home, Activity, BarChart3, PiggyBank, User, Gift, Menu, X as CloseIcon, CreditCard, Trash2 } from 'lucide-react'
import ResgateModal from '@/components/ResgateModal'
import { useAuth } from '@/contexts/AuthContext'
import { fetchResgates, Resgate } from '@/hooks/useData'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: false },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: false },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: false },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: true },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

interface DisplayResgate {
  id: number
  data: string
  item: string
  pts_usados: number
  valor_brl: number
  custo_efetivo: number
}

export default function ResgatesPage() {
  const { isGuest, guestData, updateGuestData, user, loading: authLoading } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'simulate'>('add')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [resgates, setResgates] = useState<DisplayResgate[]>([])
  const [loading, setLoading] = useState(true)

  // Load resgates on mount
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return

      if (isGuest && guestData) {
        // Load from guest data context
        setResgates(guestData.resgates || [])
        setLoading(false)
      } else if (user) {
        // Load from Supabase for authenticated users
        const { data } = await fetchResgates(user.id)
        if (data) {
          setResgates(data.map(r => ({
            id: r.id,
            data: r.data,
            item: r.item,
            pts_usados: r.pts_usados,
            valor_brl: r.valor_brl,
            custo_efetivo: r.custo_efetivo,
          })))
        }
        setLoading(false)
      } else {
        setLoading(false)
      }
    }

    loadData()
  }, [isGuest, guestData, user, authLoading])

  const addResgate = useCallback((resgate: Omit<DisplayResgate, 'id'>) => {
    const newResgate = {
      ...resgate,
      id: Date.now(),
    }

    const newResgates = [newResgate, ...resgates]
    setResgates(newResgates)

    if (isGuest) {
      updateGuestData({
        resgates: newResgates.map(r => ({
          ...r,
          created_at: new Date().toISOString(),
        }))
      })
    }
  }, [resgates, isGuest, updateGuestData])

  const deleteResgate = useCallback((id: number) => {
    const newResgates = resgates.filter(r => r.id !== id)
    setResgates(newResgates)

    if (isGuest) {
      updateGuestData({
        resgates: newResgates.map(r => ({
          ...r,
          created_at: new Date().toISOString(),
        }))
      })
    }
  }, [resgates, isGuest, updateGuestData])

  const totalPtsUsados = resgates.reduce((sum, r) => sum + r.pts_usados, 0)
  const totalValor = resgates.reduce((sum, r) => sum + r.valor_brl, 0)
  const mediaCusto = resgates.length > 0
    ? Math.round(totalPtsUsados / totalValor)
    : 0

  const openAddModal = () => {
    setModalMode('add')
    setIsModalOpen(true)
  }

  const openSimulateModal = () => {
    setModalMode('simulate')
    setIsModalOpen(true)
  }

  const handleModalClose = (resgate?: { item: string; pts_usados: number; valor_brl: number; custo_efetivo: number }) => {
    setIsModalOpen(false)
    if (resgate && modalMode === 'add') {
      addResgate({
        data: new Date().toISOString().split('T')[0],
        ...resgate,
      })
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="xbox-shimmer w-16 h-16 rounded-full mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </div>
    )
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
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all relative ${item.active
                    ? 'bg-[var(--bg-tertiary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white'
                    }`}
                >
                  {item.active && <span className="xbox-nav-indicator" />}
                  <item.icon className={`h-5 w-5 ${item.active ? 'text-[var(--xbox-green)]' : ''}`} />
                  {item.label}
                </Link>
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
                    <Link href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium relative ${item.active ? 'bg-[var(--bg-tertiary)] text-white' : 'text-[var(--text-secondary)]'
                      }`}>
                      {item.active && <span className="xbox-nav-indicator" />}
                      <item.icon className={`h-5 w-5 ${item.active ? 'text-[var(--xbox-green)]' : ''}`} />
                      {item.label}
                    </Link>
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
              <p className="text-2xl font-bold text-[var(--warning)]">{mediaCusto || '-'} <span className="text-sm text-[var(--text-muted)]">pts/R$</span></p>
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
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {resgates.length > 0 ? (
                    resgates.map((resgate) => (
                      <tr key={resgate.id}>
                        <td className="text-white">{resgate.data}</td>
                        <td className="text-white">{resgate.item}</td>
                        <td className="text-right text-[var(--xbox-green)] font-semibold">{resgate.pts_usados.toLocaleString()}</td>
                        <td className="text-right text-white">R$ {resgate.valor_brl}</td>
                        <td className="text-right text-[var(--text-secondary)]">{resgate.custo_efetivo} pts/R$</td>
                        <td className="text-right">
                          <button
                            onClick={() => deleteResgate(resgate.id)}
                            className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-[var(--text-muted)] py-8">
                        Nenhum resgate registrado. Clique em &quot;Adicionar Resgate&quot; para começar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <ResgateModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        mode={modalMode}
      />
    </div>
  )
}
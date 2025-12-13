'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Home, Activity, BarChart3, PiggyBank, User,
  Check, Save, Monitor, Brain, Gamepad2, Gift, Menu, X as CloseIcon, Calendar, LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ACTIVITIES_LIST, REWARDS_LIMITS } from '@/lib/rewards-constants'
import { insertDailyRecord } from '@/hooks/useData'
import toast from 'react-hot-toast'

const GUEST_DATA_KEY = 'rewards_tracker_guest_data'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: false },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: true },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: false },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: false },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

export default function AtividadesPage() {
  const { isGuest, user, profile } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [activityType, setActivityType] = useState('')
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  const [metaOverride, setMetaOverride] = useState(false)

  // Logic to calculate points
  const userLevel = profile?.level || 2
  const limits = userLevel === 1 ? REWARDS_LIMITS.LEVEL_1 : REWARDS_LIMITS.LEVEL_2

  const calculateTotals = () => {
    let pc = 0, mobile = 0, xbox = 0, quiz = 0, others = 0
    ACTIVITIES_LIST.forEach(act => {
      if (checkedItems[act.id]) {
        let points: number = act.points
        if (act.id === 'pc_search') points = limits.PC_SEARCH
        if (act.id === 'mobile_search') points = limits.MOBILE_SEARCH

        if (act.type === 'search') {
          if (act.id === 'pc_search') pc += points
          else mobile += points
        } else if (act.type === 'xbox' || act.type === 'gamepass') xbox += points
        else if (act.type === 'daily') quiz += points
        else others += points
      }
    })
    return { pc, mobile, xbox, quiz: quiz + others, total: pc + mobile + xbox + quiz + others }
  }

  const totals = calculateTotals()
  const metaGoal = profile?.meta_mensal || 12000
  const metaBatida = totals.total >= metaGoal || metaOverride

  // Toggle Item
  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Pre-fill activity type based on what's checked
  useEffect(() => {
    if (totals.total > 0 && !activityType) {
      if (totals.pc > 0 || totals.mobile > 0) setActivityType('Buscas')
      else if (totals.xbox > 0) setActivityType('Xbox')
      else setActivityType('Quiz')
    }
  }, [totals, activityType])

  const handleSave = async () => {
    if (!activityType) {
      toast.error('Selecione um tipo de atividade principal.')
      return
    }

    setLoading(true)
    try {
      const recordData = {
        data: date,
        atividade: activityType,
        pc_busca: totals.pc,
        mobile_busca: totals.mobile,
        quiz: totals.quiz,
        xbox: totals.xbox,
        total_pts: totals.total,
        meta_batida: metaBatida,
        notas: notes
      }

      if (isGuest) {
        // Save to LocalStorage
        const savedData = localStorage.getItem(GUEST_DATA_KEY)
        const guestData = savedData ? JSON.parse(savedData) : { registros: [] }

        const newRecord = {
          ...recordData,
          id: Date.now(),
          created_at: new Date().toISOString()
        }

        guestData.registros.unshift(newRecord)
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(guestData))
        toast.success('Atividade registrada (Modo Visitante)!')
      } else if (user) {
        // Save to Supabase
        const { error } = await insertDailyRecord(user.id, recordData)
        if (error) throw error
        toast.success('Atividade registrada com sucesso!')
      }

      // Reset form (optional, or just navigating away?)
      // For now, let's keep it on page but clear checks? No, user might want to see what they just did.
      // Maybe play a sound or meaningful success animation?

    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar atividade.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
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

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="xbox-spinner w-12 h-12 border-4 border-[var(--xbox-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-[var(--xbox-green)]">Atividades</span>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Registrar Atividade</h1>
            <p className="text-[var(--text-secondary)]">
              Marque as tarefas concluídas hoje para acumular pontos.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Checklist */}
            <div className="lg:col-span-2 space-y-6">

              {/* Date Picker */}
              <div className="xbox-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[var(--xbox-green)]" />
                  <span className="font-semibold">Data do Registro</span>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="xbox-input w-full sm:w-auto"
                />
              </div>

              {/* Activity Groups */}
              <div className="space-y-6">
                {/* Searches */}
                <div className="xbox-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Monitor className="text-[var(--xbox-green)] h-5 w-5" />
                    Buscas e Navegação
                  </h3>
                  <div className="space-y-3">
                    {ACTIVITIES_LIST.filter(a => a.type === 'search').map(act => (
                      <div
                        key={act.id}
                        onClick={() => toggleItem(act.id)}
                        className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors border ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)] text-black' : 'border-[var(--text-muted)]'}`}>
                            {checkedItems[act.id] && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={checkedItems[act.id] ? 'text-white' : 'text-[var(--text-secondary)]'}>{act.label}</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {act.id === 'pc_search' ? limits.PC_SEARCH : limits.MOBILE_SEARCH} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Xbox & Game Pass */}
                <div className="xbox-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-[var(--xbox-green)] h-5 w-5" />
                    Xbox & Game Pass
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...ACTIVITIES_LIST.filter(a => a.type === 'xbox'), ...ACTIVITIES_LIST.filter(a => a.type === 'gamepass')].map(act => (
                      <div
                        key={act.id}
                        onClick={() => toggleItem(act.id)}
                        className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors border ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)] text-black' : 'border-[var(--text-muted)]'}`}>
                            {checkedItems[act.id] && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-sm ${checkedItems[act.id] ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{act.label}</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          +{act.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily & Extras */}
                <div className="xbox-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="text-[var(--xbox-green)] h-5 w-5" />
                    Bônus Diário
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ACTIVITIES_LIST.filter(a => a.type === 'daily' || a.type === 'other').map(act => (
                      <div
                        key={act.id}
                        onClick={() => toggleItem(act.id)}
                        className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors border ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)] text-black' : 'border-[var(--text-muted)]'}`}>
                            {checkedItems[act.id] && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-sm ${checkedItems[act.id] ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{act.label}</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          +{act.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Summary & Actions */}
            <div className="space-y-6">

              {/* Summary Card */}
              <div className="xbox-card p-6 sticky top-6">
                <h3 className="xbox-label mb-4">Resumo do Dia</h3>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[var(--text-secondary)]">Pontos Totais</span>
                  <span className="text-3xl font-bold text-white transition-all key={totals.total} animate-pulse-once">
                    {totals.total}
                  </span>
                </div>

                {/* Progress to Goal */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">Meta: {metaGoal}</span>
                    <span className={metaBatida ? 'text-[var(--xbox-green)]' : 'text-[var(--text-muted)]'}>
                      {Math.round((totals.total / metaGoal) * 100)}%
                    </span>
                  </div>
                  <div className="xbox-progress">
                    <div
                      className={`xbox-progress-bar ${metaBatida ? 'bg-[var(--xbox-green)]' : 'bg-[var(--text-muted)]'}`}
                      style={{ width: `${Math.min(100, (totals.total / metaGoal) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                  {/* Classification */}
                  <div>
                    <label className="xbox-label mb-2">Categoria Principal</label>
                    <select
                      className="xbox-input w-full"
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                    >
                      <option value="" disabled>Selecione...</option>
                      <option value="Buscas">Buscas (PC/Mobile)</option>
                      <option value="Xbox">Xbox / Game Pass</option>
                      <option value="Quiz">Quiz / Diário</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="xbox-label mb-2">Notas (Opcional)</label>
                    <textarea
                      className="xbox-input w-full resize-none"
                      rows={3}
                      placeholder="Alguma observação?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Manual Override */}
                  <label className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="xbox-checkbox"
                      checked={metaOverride}
                      onChange={(e) => setMetaOverride(e.target.checked)}
                    />
                    <span className="text-sm">Forçar &quot;Meta Batida&quot;</span>
                  </label>

                  <button
                    onClick={handleSave}
                    className="xbox-btn xbox-btn-primary w-full py-3 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : (
                      <>
                        <Save className="h-5 w-5" />
                        Registrar Dia
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]">
            {/* Sidebar content copy for mobile */}
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h1 className="text-xl font-bold text-[var(--xbox-green)] flex items-center gap-2">
                <Gift className="h-6 w-6" />
                Rewards
              </h1>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all ${item.active
                        ? 'bg-[var(--bg-tertiary)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white'
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t border-[var(--border-subtle)]">
              <Link href="/" className="xbox-btn xbox-btn-ghost w-full text-sm flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4" /> Voltar
              </Link>
            </div>
          </aside>
        </div>
      )}

    </div>
  )
}
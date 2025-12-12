'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Target, Trophy, Smartphone, Monitor, Gamepad2, Gift, Menu, X as CloseIcon, Home, Activity, BarChart3, PiggyBank, User, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ACTIVITIES_LIST, REWARDS_LIMITS, ActivityId } from '@/lib/rewards-constants'
import RegistroModal from '@/components/RegistroModal'
import toast from 'react-hot-toast'

const DAILY_CHECKLIST_KEY = 'rewards_daily_checklist'

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
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Group activities
  const searchActivities = ACTIVITIES_LIST.filter(a => a.type === 'search')
  const xboxActivities = ACTIVITIES_LIST.filter(a => a.type === 'xbox')
  const dailyActivities = ACTIVITIES_LIST.filter(a => a.type === 'daily' || a.type === 'other')

  // Load daily state
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const key = `${DAILY_CHECKLIST_KEY}_${user?.id || 'guest'}_${today}`
    const saved = localStorage.getItem(key)
    if (saved) {
      setCheckedItems(JSON.parse(saved))
    } else {
      setCheckedItems({})
    }
  }, [user])

  const toggleItem = (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    const key = `${DAILY_CHECKLIST_KEY}_${user?.id || 'guest'}_${today}`

    setCheckedItems(prev => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }

  // Determine user limits
  const userLevel = profile?.level || 2
  const limits = userLevel === 1 ? REWARDS_LIMITS.LEVEL_1 : REWARDS_LIMITS.LEVEL_2

  // Calculate totals for pre-fill
  const calculateTotals = () => {
    let pc = 0
    let mobile = 0
    let xbox = 0
    let quiz = 0 // "Daily Set" or others often count alike, but let's separate
    let others = 0

    ACTIVITIES_LIST.forEach(act => {
      if (checkedItems[act.id]) {
        let points: number = act.points
        if (act.id === 'pc_search') points = limits.PC_SEARCH
        if (act.id === 'mobile_search') points = limits.MOBILE_SEARCH

        if (act.type === 'search') {
          if (act.id === 'pc_search') pc += points
          else mobile += points
        } else if (act.type === 'xbox') {
          xbox += points
        } else if (act.type === 'daily') {
          quiz += points // Rough mapping
        } else {
          others += points
        }
      }
    })

    // Add "others" to xbox or quiz based on preference, or just return separate
    // For RegistroModal format: pc, mobile, quiz, xbox
    // Let's map "others" (like Read News) to... maybe Quiz or just add to total manually?
    // Actually RegistroModal calculates Total = sum(fields).
    // Let's map 'daily' + 'other' -> quiz for simplicity in this version, or update Modal later.
    // For now: Daily Set -> Quiz. Read News -> Xbox (since it's app based)? Or Quiz.
    // Let's put Read News in Quiz/Daily for now.

    return { pc_busca: pc, mobile_busca: mobile, xbox, quiz: quiz + others }
  }

  const totals = calculateTotals()
  const grandTotal = totals.pc_busca + totals.mobile_busca + totals.xbox + totals.quiz

  const handleConcluirDia = () => {
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
        <header className="lg:hidden sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-[var(--xbox-green)]">Lista Diária</h1>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Checklist Diário</h2>
              <p className="text-[var(--text-secondary)]">Marque o que você já completou hoje</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-muted)]">Estimativa Hoje</p>
              <p className="text-3xl font-bold text-[var(--xbox-green)]">{grandTotal} pts</p>
            </div>
          </header>

          <div className="grid gap-6">
            {/* Buscas */}
            <div className="xbox-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-[var(--xbox-green)]" />
                Buscas
              </h3>
              <div className="space-y-3">
                {searchActivities.map(act => {
                  const limit = act.id === 'pc_search' ? limits.PC_SEARCH : limits.MOBILE_SEARCH
                  if (limit === 0) return null // Hide if Level 1 has 0 mobile

                  return (
                    <div key={act.id}
                      onClick={() => toggleItem(act.id)}
                      className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)]' : 'border-[var(--text-muted)]'}`}>
                          {checkedItems[act.id] && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{act.label}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Máx. {limit} pts</p>
                        </div>
                      </div>
                      <span className="text-[var(--xbox-green)] font-bold">+{limit}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Xbox App */}
            <div className="xbox-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[var(--xbox-green)]" />
                Xbox App
              </h3>
              <div className="space-y-3">
                {xboxActivities.map(act => (
                  <div key={act.id}
                    onClick={() => toggleItem(act.id)}
                    className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)]' : 'border-[var(--text-muted)]'}`}>
                        {checkedItems[act.id] && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <p className="text-white font-medium">{act.label}</p>
                    </div>
                    <span className="text-[var(--xbox-green)] font-bold">+{act.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diárias & Outros */}
            <div className="xbox-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-[var(--xbox-green)]" />
                Diárias & Outros
              </h3>
              <div className="space-y-3">
                {dailyActivities.map(act => (
                  <div key={act.id}
                    onClick={() => toggleItem(act.id)}
                    className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)]' : 'border-[var(--text-muted)]'}`}>
                        {checkedItems[act.id] && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <p className="text-white font-medium">{act.label}</p>
                    </div>
                    <span className="text-[var(--xbox-green)] font-bold">+{act.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleConcluirDia}
              disabled={grandTotal === 0}
              className="xbox-btn xbox-btn-primary px-8 py-4 text-lg animate-pulse-glow disabled:opacity-50 disabled:animate-none">
              Concluir Dia ({grandTotal} pts)
            </button>
          </div>
        </div>
      </main>

      <RegistroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={{
          pc_busca: totals.pc_busca,
          mobile_busca: totals.mobile_busca,
          xbox: totals.xbox,
          quiz: totals.quiz,
          atividade: 'Rotina Diária',
          meta_batida: grandTotal > 150 // Auto-guess
        }}
        isGuest={isGuest}
        onSave={() => {
          // Optional: Clear checklist or show "Saved" state
          toast.success('Dia registrado com sucesso!')
        }}
      />
    </div>
  )
}
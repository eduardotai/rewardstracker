'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check, Target, Gift, Menu, X as CloseIcon, Home, Activity, BarChart3, PiggyBank, User,
  Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, BellOff, Info,
  Gamepad2, Smartphone, Cpu, Zap, Trophy, Flame
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ACTIVITIES_LIST, REWARDS_LIMITS } from '@/lib/rewards-constants'
import { fetchMonthlyStatus, DailyRecord } from '@/hooks/useData'
import RegistroModal from '@/components/RegistroModal'
import toast from 'react-hot-toast'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DAILY_CHECKLIST_KEY = 'rewards_daily_checklist'
const REMINDER_KEY = 'rewards_reminder_enabled'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: false },
  { icon: Activity, label: 'Mission Control', href: '/atividades', active: true }, // Renamed
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: false },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: false },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

export default function AtividadesPage() {
  const { isGuest, user, profile } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calendar/Streak State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthlyStatus, setMonthlyStatus] = useState<Pick<DailyRecord, 'data' | 'meta_batida' | 'total_pts'>[]>([])

  // Reminder State
  const [reminderEnabled, setReminderEnabled] = useState(false)

  // Group activities
  const searchActivities = ACTIVITIES_LIST.filter(a => a.type === 'search')
  const xboxActivities = ACTIVITIES_LIST.filter(a => a.type === 'xbox')
  const gamePassActivities = ACTIVITIES_LIST.filter(a => a.type === 'gamepass')
  const dailyActivities = ACTIVITIES_LIST.filter(a => a.type === 'daily' || a.type === 'other')

  // Load daily checklist state
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

  // Load Reminder State
  useEffect(() => {
    const savedReminder = localStorage.getItem(REMINDER_KEY)
    if (savedReminder === 'true') {
      if (Notification.permission === 'granted') {
        setReminderEnabled(true)
      }
    }
  }, [])

  // Fetch Monthly Data
  useEffect(() => {
    async function loadMonth() {
      if (!user) return
      // Fetch current and previous month to ensure we have streak data
      // For simplicity in this view, just current month + basic streak check
      const { data } = await fetchMonthlyStatus(user.id, currentDate.getMonth(), currentDate.getFullYear())
      if (data) setMonthlyStatus(data)
    }
    loadMonth()
  }, [user, currentDate])

  const toggleItem = (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    const key = `${DAILY_CHECKLIST_KEY}_${user?.id || 'guest'}_${today}`

    setCheckedItems(prev => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }

  const toggleReminder = async () => {
    if (reminderEnabled) {
      setReminderEnabled(false)
      localStorage.setItem(REMINDER_KEY, 'false')
      toast.success('Protocolo de lembrete desativado.')
      return
    }

    if (!('Notification' in window)) {
      toast.error('Sistema de notificação indisponível.')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setReminderEnabled(true)
      localStorage.setItem(REMINDER_KEY, 'true')
      new Notification('Mission Control', {
        body: 'Rastreamento ativo. Vamos bater a meta hoje, Spartan?',
        icon: '/favicon.ico'
      })
      toast.success('Protocolo de lembrete ativado!')
    } else {
      toast.error('Permissão negada.')
    }
  }

  // Calc Totals
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
    return { pc_busca: pc, mobile_busca: mobile, xbox, quiz: quiz + others }
  }

  const totals = calculateTotals()
  const grandTotal = totals.pc_busca + totals.mobile_busca + totals.xbox + totals.quiz

  // Daily Goal (Estimated)
  const DAILY_GOAL = 180 + (limits.PC_SEARCH + limits.MOBILE_SEARCH) // Approximate goal
  const progressPercent = Math.min(100, Math.round((grandTotal / DAILY_GOAL) * 100))

  return (
    <div className="min-h-screen flex bg-[#0f1115] text-white font-sans selection:bg-[var(--xbox-green)] selection:text-black">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-[#1a1c20]">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-bold text-[var(--xbox-green)] flex items-center gap-2 font-mono tracking-tighter">
            <Zap className="h-6 w-6" />
            MISSION:CONTROL
          </h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all relative group ${item.active
                    ? 'bg-[var(--xbox-green)]/10 text-[var(--xbox-green)] border-l-2 border-[var(--xbox-green)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${item.active ? 'text-[var(--xbox-green)] drop-shadow-[0_0_5px_rgba(16,124,16,0.5)]' : 'group-hover:scale-110 transition-transform'}`} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,124,16,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,124,16,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-[#0f1115]/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-mono text-[var(--xbox-green)] font-bold">MISSION:CONTROL</span>
          <div className="w-10" />
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto relative z-10">

          {/* Top Bar: Streak & Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">

            {/* Streak Strip */}
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-full border border-white/10 backdrop-blur-sm">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = subDays(new Date(), 6 - i)
                const dateStr = format(d, 'yyyy-MM-dd')
                const status = monthlyStatus.find(r => r.data.startsWith(dateStr))
                const isT = isToday(d)

                return (
                  <div key={i} className="flex flex-col items-center gap-1 group relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all cursor-default
                       ${isT ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.3)] scale-110' : 'border-transparent text-gray-500'}
                       ${status?.meta_batida ? '!bg-[var(--xbox-green)] !border-[var(--xbox-green)] !text-black' : ''}
                       ${!status?.meta_batida && !isT ? 'bg-white/5' : ''}
                     `}>
                      {format(d, 'd')}
                    </div>
                    {status?.meta_batida && <div className="w-1 h-1 rounded-full bg-[var(--xbox-green)] shadow-[0_0_5px_var(--xbox-green)]" />}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleReminder}
                className={`p-3 rounded-full border transition-all hover:scale-105 active:scale-95 ${reminderEnabled
                    ? 'bg-[var(--xbox-green)] text-black border-[var(--xbox-green)] shadow-[0_0_15px_rgba(16,124,16,0.4)]'
                    : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                  }`}
              >
                {reminderEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-16">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--xbox-green)]/10 text-[var(--xbox-green)] text-xs font-mono border border-[var(--xbox-green)]/20">
                <span className="w-2 h-2 rounded-full bg-[var(--xbox-green)] animate-pulse" />
                SYSTEM: ONLINE
              </div>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 uppercase">
                Daily Operations
              </h1>
              <p className="text-gray-400 max-w-lg text-lg">
                Execute tarefas de busca, jogos e quizzes para maximizar seus pontos de recompensa.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={grandTotal === 0}
                className="mt-4 group relative px-8 py-4 bg-[var(--xbox-green)] text-black font-bold uppercase tracking-widest clip-path-polygon hover:bg-[#159115] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
              >
                Finalizar Operação
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>

            {/* Daily Ring Hero */}
            <div className="relative flex items-center justify-center">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-[var(--xbox-green)]/20 blur-[60px] rounded-full" />

              {/* SVG Ring */}
              <div className="relative w-64 h-64">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="128" cy="128" r="120" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                  <circle
                    cx="128" cy="128" r="120"
                    stroke="var(--xbox-green)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="754"
                    strokeDashoffset={754 - (754 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-1000 ease-out shadow-[0_0_20px_var(--xbox-green)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white tracking-tight">{grandTotal}</span>
                  <span className="text-sm font-mono text-[var(--xbox-green)] uppercase">Pontos Hoje</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Network Scan (Buscas) */}
            <div className="group relative bg-[#1a1c20] border border-white/5 p-6 overflow-hidden rounded-xl hover:border-[var(--xbox-green)]/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search className="w-32 h-32 text-[var(--xbox-green)]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <Cpu className="text-[var(--xbox-green)]" />
                  NETWORK SCAN
                </h3>

                <div className="space-y-4">
                  {searchActivities.map(act => {
                    const limit = act.id === 'pc_search' ? limits.PC_SEARCH : limits.MOBILE_SEARCH
                    if (limit === 0) return null
                    const isChecked = checkedItems[act.id]

                    return (
                      <div
                        key={act.id}
                        onClick={() => toggleItem(act.id)}
                        className={`
                                cursor-pointer flex items-center justify-between p-4 bg-black/40 border-l-4 transition-all
                                ${isChecked ? 'border-l-[var(--xbox-green)] bg-[var(--xbox-green)]/5' : 'border-l-gray-700 hover:bg-white/5'}
                              `}
                      >
                        <div>
                          <p className="font-mono text-sm uppercase tracking-wide text-gray-300">{act.label}</p>
                          <p className="text-xs text-gray-500">Max: {limit}</p>
                        </div>
                        <div className={`w-6 h-6 border flex items-center justify-center transition-colors ${isChecked ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)] text-black' : 'border-gray-600'}`}>
                          {isChecked && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Card 2: Field Ops (Mobile/Xbox) */}
            <div className="group relative bg-[#1a1c20] border border-white/5 p-6 overflow-hidden rounded-xl hover:border-[var(--xbox-green)]/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Gamepad2 className="w-32 h-32 text-[var(--xbox-green)]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <Gamepad2 className="text-[var(--xbox-green)]" />
                  FIELD OPS
                </h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {[...xboxActivities, ...gamePassActivities].map(act => {
                    const isChecked = checkedItems[act.id]
                    return (
                      <div
                        key={act.id}
                        onClick={() => toggleItem(act.id)}
                        className={`
                                cursor-pointer flex items-center justify-between p-3 rounded bg-black/40 border border-transparent transition-all
                                ${isChecked ? 'border-[var(--xbox-green)]/30 bg-[var(--xbox-green)]/5 shadow-[inset_0_0_10px_rgba(16,124,16,0.1)]' : 'hover:border-white/10'}
                              `}
                      >
                        <span className="text-sm font-medium text-gray-300">{act.label}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isChecked ? 'bg-[var(--xbox-green)] text-black' : 'bg-white/10 text-gray-400'}`}>
                          +{act.points}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Card 3: Bonus Objectives */}
            <div className="group relative bg-[#1a1c20] border border-white/5 p-6 overflow-hidden rounded-xl hover:border-[var(--xbox-green)]/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-32 h-32 text-[var(--xbox-green)]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <Trophy className="text-[var(--xbox-green)]" />
                  BONUS OBJ
                </h3>

                <div className="space-y-3">
                  {dailyActivities.map(act => {
                    const isChecked = checkedItems[act.id]
                    return (
                      <div
                        key={act.id}
                        onClick={() => toggleItem(act.id)}
                        className={`
                                cursor-pointer flex items-center justify-between p-3 rounded bg-black/40 border border-transparent transition-all
                                ${isChecked ? 'border-[var(--xbox-green)]/30 bg-[var(--xbox-green)]/5' : 'hover:border-white/10'}
                              `}
                      >
                        <span className="text-sm font-medium text-gray-300">{act.label}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isChecked ? 'bg-[var(--xbox-green)] text-black' : 'bg-white/10 text-gray-400'}`}>
                          +{act.points}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-[var(--xbox-green)]/10 to-transparent border border-[var(--xbox-green)]/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="text-[var(--xbox-green)] w-5 h-5" />
                    <span className="font-bold text-sm uppercase">Streak Status</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--xbox-green)]" style={{ width: '85%' }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Mantenha a consistência para bônus máximos.</p>
                </div>
              </div>
            </div>
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
          meta_batida: grandTotal > 150
        }}
        isGuest={isGuest}
        onSave={() => {
          toast.success('Missão Cumprida! Dados registrados.', {
            icon: '🎮',
            style: { background: '#1a1c20', color: '#fff', border: '1px solid #107C10' }
          })
          if (user) fetchMonthlyStatus(user.id, currentDate.getMonth(), currentDate.getFullYear()).then(({ data }) => setMonthlyStatus(data || []))
        }}
      />
    </div>
  )
}
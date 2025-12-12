'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Target, Gift, Menu, X as CloseIcon, Home, Activity, BarChart3, PiggyBank, User, Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, BellOff, Info, Gamepad2, Monitor, Smartphone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ACTIVITIES_LIST, REWARDS_LIMITS } from '@/lib/rewards-constants'
import { fetchMonthlyStatus, DailyRecord } from '@/hooks/useData'
import RegistroModal from '@/components/RegistroModal'
import toast from 'react-hot-toast'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DAILY_CHECKLIST_KEY = 'rewards_daily_checklist'
const REMINDER_KEY = 'rewards_reminder_enabled'

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

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthlyStatus, setMonthlyStatus] = useState<Pick<DailyRecord, 'data' | 'meta_batida' | 'total_pts'>[]>([])
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)

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
      } else {
        localStorage.setItem(REMINDER_KEY, 'false')
      }
    }
  }, [])

  // Fetch Monthly Data
  useEffect(() => {
    async function loadMonth() {
      if (!user) return
      setIsLoadingCalendar(true)
      const { data } = await fetchMonthlyStatus(user.id, currentDate.getMonth(), currentDate.getFullYear())
      if (data) setMonthlyStatus(data)
      setIsLoadingCalendar(false)
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
      toast.success('Lembretes desativados')
      return
    }

    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setReminderEnabled(true)
      localStorage.setItem(REMINDER_KEY, 'true')
      new Notification('Rewards Tracker', {
        body: 'Notificações ativadas! Lembraremos você de fazer suas atividades.',
        icon: '/favicon.ico' // Assuming favicon exists
      })
      toast.success('Lembretes ativados!')
    } else {
      toast.error('Permissão de notificação negada')
    }
  }

  // Calendar Helpers
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const record = monthlyStatus.find(r => r.data.startsWith(dateStr))
    if (!record) return null
    return record
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  // Determine user limits & calc totals (Same logic as before)
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

  const handleConcluirDia = () => setIsModalOpen(true)

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
                    <Link href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium relative ${item.active ? 'bg-[var(--bg-tertiary)] text-white' : 'text-[var(--text-secondary)]'}`}>
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
      <main className="flex-1 overflow-auto bg-[var(--bg-primary)]">
        <header className="lg:hidden sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-[var(--xbox-green)]">Atividades</h1>
          <div className="w-10" />
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <CalendarIcon className="h-8 w-8 text-[var(--xbox-green)]" />
                Atividades Diárias
              </h2>
              <p className="text-[var(--text-secondary)]">Organize sua rotina e acompanhe seu progresso</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Reminders Toggle */}
              <button
                onClick={toggleReminder}
                className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors ${reminderEnabled
                  ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)] text-[var(--xbox-green)]'
                  : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white'
                  }`}
              >
                {reminderEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                <span className="text-sm font-medium">{reminderEnabled ? 'Lembretes Ativos' : 'Ativar Lembretes'}</span>
              </button>

              <div className="text-right pl-4 border-l border-[var(--border-subtle)]">
                <p className="text-sm text-[var(--text-muted)]">Estimativa Hoje</p>
                <p className="text-3xl font-bold text-[var(--xbox-green)]">{grandTotal} pts</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Calendar & History */}
            <div className="space-y-6">
              <div className="xbox-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Histórico</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-[var(--bg-elevated)] rounded"><ChevronLeft className="h-4 w-4" /></button>
                    <span className="text-sm font-medium capitalize">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-[var(--bg-elevated)] rounded"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-xs text-[var(--text-muted)] font-bold">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Empty spots for start of month */}
                  {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {daysInMonth.map(day => {
                    const status = getDayStatus(day)
                    const isTodayDate = isToday(day)

                    let bgClass = 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    if (status?.meta_batida) bgClass = 'bg-[var(--xbox-green)] text-white shadow-[0_0_10px_rgba(16,124,16,0.3)]'
                    else if (status) bgClass = 'bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/30'
                    if (isTodayDate) bgClass += ' ring-2 ring-white'

                    return (
                      <div
                        key={day.toISOString()}
                        className={`aspect-square rounded flex items-center justify-center text-xs font-medium cursor-default transition-all relative group ${bgClass}`}
                      >
                        {format(day, 'd')}
                        {status && (
                          <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                            {status.total_pts} pts
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 flex gap-4 text-xs text-[var(--text-muted)] justify-center">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[var(--xbox-green)]" /> Meta Batida</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[var(--warning)]/50" /> Parcial</div>
                </div>
              </div>

              <div className="xbox-card p-5 bg-[var(--bg-elevated)]/50 border-dashed">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  <Info className="h-4 w-4" /> Dica Rápida
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Marque as atividades ao lado conforme for completando. Ao final, clique em
                  <span className="text-white font-medium"> "Concluir Dia"</span> para salvar tudo de uma vez.
                </p>
              </div>
            </div>

            {/* Right Column: Checklist */}
            <div className="lg:col-span-2 space-y-6">
              {/* Buscas */}
              <div className="xbox-card p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-[var(--xbox-green)]" />
                  Buscas diárias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchActivities.map(act => {
                    const limit = act.id === 'pc_search' ? limits.PC_SEARCH : limits.MOBILE_SEARCH
                    if (limit === 0) return null
                    return (
                      <div key={act.id}
                        onClick={() => toggleItem(act.id)}
                        className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border select-none ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)]' : 'border-[var(--text-muted)]'}`}>
                            {checkedItems[act.id] && <Check className="h-4 w-4 text-white" />}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{act.label}</p>
                            <p className="text-xs text-[var(--text-secondary)]">Máx. {limit} pts</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Xbox & Game Pass */}
              <div className="xbox-card p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-[var(--xbox-green)]" />
                  Xbox & Game Pass
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...xboxActivities, ...gamePassActivities].map(act => (
                    <div key={act.id}
                      onClick={() => toggleItem(act.id)}
                      className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border select-none ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)]' : 'border-[var(--text-muted)]'}`}>
                          {checkedItems[act.id] && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <p className="text-white font-medium text-sm">{act.label}</p>
                      </div>
                      <span className="text-[var(--xbox-green)] font-bold text-sm">+{act.points}</span>
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
                <div className="space-y-2">
                  {dailyActivities.map(act => (
                    <div key={act.id}
                      onClick={() => toggleItem(act.id)}
                      className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border select-none ${checkedItems[act.id] ? 'bg-[var(--xbox-green)]/10 border-[var(--xbox-green)]' : 'bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-subtle)]'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${checkedItems[act.id] ? 'bg-[var(--xbox-green)] border-[var(--xbox-green)]' : 'border-[var(--text-muted)]'}`}>
                          {checkedItems[act.id] && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <p className="text-white font-medium text-sm">{act.label}</p>
                      </div>
                      <span className="text-[var(--xbox-green)] font-bold text-sm">+{act.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-4 flex justify-end">
                <button
                  onClick={handleConcluirDia}
                  disabled={grandTotal === 0}
                  className="xbox-btn xbox-btn-primary px-8 py-4 text-lg shadow-2xl animate-pulse-glow disabled:opacity-50 disabled:animate-none w-full md:w-auto">
                  Concluir Dia ({grandTotal} pts)
                </button>
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
          meta_batida: grandTotal > 150 // Auto-guess
        }}
        isGuest={isGuest}
        onSave={() => {
          // Refresh calendar if needed, but it uses strict fetch so next load is fine.
          // Auto-refresh logic for calendar could be added here if critical.
          toast.success('Dia registrado! Calendário atualizado.')
          // Reload logic for calendar
          if (user) fetchMonthlyStatus(user.id, currentDate.getMonth(), currentDate.getFullYear()).then(({ data }) => setMonthlyStatus(data || []))
        }}
      />
    </div>
  )
}
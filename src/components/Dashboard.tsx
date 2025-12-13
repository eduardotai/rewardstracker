'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Trophy, TrendingUp, Calendar, Target, Plus, Gift, BarChart3, Menu, X as CloseIcon, Home, Activity, PiggyBank, User, LogOut } from 'lucide-react'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWeeklyRecords, fetchUserStats, fetchDailyRecords, DailyRecord } from '@/hooks/useData'
import { isSupabaseConfigured } from '@/lib/supabase'
import Badges from './Badges'
import Leaderboard from './Leaderboard'
import { REWARDS_LIMITS, getLocalDateString } from '@/lib/rewards-constants'

const GUEST_DATA_KEY = 'rewards_tracker_guest_data'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: true },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: false },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: false },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: false },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

interface GuestRecord {
  id: number
  data: string
  atividade: string
  pc_busca: number
  mobile_busca: number
  quiz: number
  xbox: number
  total_pts: number
  meta_batida: boolean
  notas: string
  created_at: string
}

export default function Dashboard() {
  const { user, profile, loading, isGuest, signOut } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Dynamic data states
  const [weeklyData, setWeeklyData] = useState<{ day: string; pts: number }[]>([])
  const [recentRecords, setRecentRecords] = useState<DailyRecord[]>([])
  const [stats, setStats] = useState({ totalSaldo: 0, streak: 0, mediaDiaria: 0 })
  const [dataLoading, setDataLoading] = useState(true)

  // Track authentication state to prevent unnecessary reloads using ref
  const lastAuthStateRef = useRef({ userId: user?.id, isGuest, hasLoadedData: false })

  const metaMensal = profile?.meta_mensal || 12000
  const progress = Math.min(Math.round((stats.totalSaldo / metaMensal) * 100), 100)

  // Calculate Daily Progress based on official limits
  const today = getLocalDateString()
  const todaysRecord = recentRecords.find(r => r.data.startsWith(today))

  // Use profile level or default to 2
  const userLevel = profile?.level || 2
  const limits = userLevel === 1 ? REWARDS_LIMITS.LEVEL_1 : REWARDS_LIMITS.LEVEL_2

  // Extract points from today's record (or 0 if none)
  // Note: GuestRecord/DailyRecord types might need updating to track specific categories if they don't already
  // For now, we assume 'pc_busca' and 'mobile_busca' are tracked fields in DailyRecord
  const pcPoints = todaysRecord?.pc_busca || 0
  const mobilePoints = todaysRecord?.mobile_busca || 0

  // Total Daily Potential (Search + Bonuses) -> Simplified view
  const maxSearchPoints = limits.PC_SEARCH + limits.MOBILE_SEARCH
  const currentSearchPoints = pcPoints + mobilePoints
  const searchProgress = maxSearchPoints > 0 ? Math.min(100, Math.round((currentSearchPoints / maxSearchPoints) * 100)) : 0

  // Load guest data from localStorage
  const loadGuestData = useCallback(() => {
    // Prevent SSR issues - only access localStorage on client side
    if (typeof window === 'undefined') return

    const savedData = localStorage.getItem(GUEST_DATA_KEY)
    if (savedData) {
      try {
        const guestData = JSON.parse(savedData)
        const records: GuestRecord[] = guestData.registros || []

        // Sort records by date descending (newest first) and set recent records
        const sortedRecords = [...records].sort((a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
        )
        setRecentRecords(sortedRecords.slice(0, 10) as DailyRecord[])

        // Calculate weekly data
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const weeklyRecords = records.filter(r => new Date(r.data) >= sevenDaysAgo)
        const chartData = weeklyRecords.map(r => ({
          day: new Date(r.data).toLocaleDateString('pt-BR', { weekday: 'short' }),
          pts: r.total_pts
        }))
        setWeeklyData(chartData)

        // Calculate stats
        const totalSaldo = records.reduce((sum, r) => sum + (r.total_pts || 0), 0)
        const mediaDiaria = records.length > 0 ? Math.round(totalSaldo / records.length) : 0

        // Calculate streak
        const streakSortedRecords = records
          .filter(r => r.meta_batida)
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let lastDate: Date | null = null

        for (const record of streakSortedRecords) {
          const recordDateParts = record.data.split('T')[0].split('-')
          const recordDate = new Date(
            parseInt(recordDateParts[0]),
            parseInt(recordDateParts[1]) - 1,
            parseInt(recordDateParts[2])
          )
          recordDate.setHours(0, 0, 0, 0)

          if (lastDate === null) {
            const diffTime = today.getTime() - recordDate.getTime()
            const diffDays = Math.round(diffTime / (1000 * 3600 * 24))

            if (diffDays <= 1) {
              streak++
              lastDate = recordDate
            } else {
              break
            }
          } else {
            const diffTime = lastDate.getTime() - recordDate.getTime()
            const diffDays = Math.round(diffTime / (1000 * 3600 * 24))

            if (diffDays === 0) {
              continue // Same day, skip
            }

            if (diffDays === 1) {
              streak++
              lastDate = recordDate
            } else {
              break
            }
          }
        }

        setStats({ totalSaldo, streak, mediaDiaria })
      } catch {
        // Error loading guest data - continue with empty state
      }
    }
    setDataLoading(false)
  }, [])

  // Function to load data (extracted for reuse)
  const loadData = useCallback(async () => {
    if (typeof window === 'undefined') return

    setDataLoading(true)

    // Guest mode: load from localStorage
    if (isGuest) {
      loadGuestData()
      return
    }

    // Not logged in and not guest
    if (!user) {
      setDataLoading(false)
      return
    }

    // Check if Supabase is properly configured before making API calls
    if (!isSupabaseConfigured()) {
      setDataLoading(false)
      return
    }

    try {
      // Fetch all data in parallel
      const [weeklyRes, recentRes, userStats] = await Promise.all([
        fetchWeeklyRecords(user.id),
        fetchDailyRecords(user.id, 20),
        fetchUserStats(user.id)
      ])

      // Process Weekly (Chart)
      if (weeklyRes.data) {
        const chartData = weeklyRes.data.map(r => ({
          day: new Date(r.data).toLocaleDateString('pt-BR', { weekday: 'short' }),
          pts: r.total_pts
        }))
        setWeeklyData(chartData)
      }

      // Process Recent (Table - Slice 10)
      if (recentRes.data) {
        setRecentRecords(recentRes.data.slice(0, 10))
      }

      // Process Stats
      setStats(userStats)
    } catch {
      toast.error('Erro ao carregar dados do dashboard.')
    } finally {
      setDataLoading(false)
    }
  }, [user, isGuest, loadGuestData])

  // Fetch data when user authentication state changes
  useEffect(() => {
    // Prevent SSR issues - only run data loading on client side
    if (typeof window === 'undefined') return

    // Only reload if authentication state actually changed
    const currentAuthState = { userId: user?.id, isGuest }
    const authChanged = lastAuthStateRef.current.userId !== currentAuthState.userId ||
                       lastAuthStateRef.current.isGuest !== currentAuthState.isGuest

    // If auth state didn't change and we already have data, don't reload
    if (!authChanged && lastAuthStateRef.current.hasLoadedData) {
      return
    }

    // Update tracked auth state
    lastAuthStateRef.current = { ...currentAuthState, hasLoadedData: true }

    loadData()
  }, [user?.id, isGuest, loadData])

  // Reload data when window gains focus (user returns from another page)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleFocus = () => {
      // Only reload if we have a user/guest and already loaded data once
      if (lastAuthStateRef.current.hasLoadedData && (user || isGuest)) {
        loadData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, isGuest, loadData])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(recentRecords.length / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Get current posts
  const indexOfLastRecord = currentPage * itemsPerPage
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage
  const currentRecords = recentRecords.slice(indexOfFirstRecord, indexOfLastRecord)


  // Optimistic Update Implementation (Moved to Atividades Page mostly, but kept if needed for other updates)
  // For dashboard, we just rely on data reloading or swr/react-query in future.
  // Ideally, navigating back to dashboard triggers re-fetch or we use global state.



  const handleSignOut = async () => {
    // Clear guest cookie
    document.cookie = 'rewards_guest_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    await signOut()
    window.location.href = '/auth'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="xbox-shimmer w-16 h-16 rounded-full mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </div>
    )
  }

  const displayName = isGuest ? 'Visitante' : (profile?.display_name || user?.email || 'Usuário')
  const userTier = isGuest ? 'Modo Visitante' : (profile?.tier || 'Sem')

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <h1 className="text-xl font-bold text-[var(--xbox-green)] flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Rewards Tracker
          </h1>
        </div>

        {/* Navigation */}
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

        {/* User Info & Logout */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="xbox-card p-4 mb-3">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Usuário</p>
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-[var(--text-muted)]">{userTier}</p>
            {isGuest && (
              <p className="text-xs text-[var(--warning)] mt-1">⚠️ Dados locais</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="xbox-btn xbox-btn-ghost w-full text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]">
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
            <div className="p-4 border-t border-[var(--border-subtle)]">
              <button onClick={handleSignOut} className="xbox-btn xbox-btn-ghost w-full text-sm">
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-[var(--xbox-green)] flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards Tracker
          </h1>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Olá, {displayName}! 👋
            </h2>
            <p className="text-[var(--text-secondary)]">
              Acompanhe seu progresso no Microsoft Rewards
              {isGuest && <span className="text-[var(--warning)]"> (modo visitante)</span>}
            </p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Card Saldo Atual */}
            <div className="xbox-card p-6" data-tooltip-id="saldo-tooltip" data-tooltip-content="Seu saldo total de pontos acumulados">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
                  <Trophy className="h-5 w-5 text-[var(--xbox-green)]" />
                </div>
              </div>
              <p className="xbox-label">Saldo Atual</p>
              <p className="text-2xl font-bold text-white">
                {dataLoading ? '---' : stats.totalSaldo.toLocaleString()} <span className="text-sm text-[var(--text-muted)]">pts</span>
              </p>
            </div>

            {/* Card Progresso Meta */}
            <div className="xbox-card p-6" data-tooltip-id="progress-tooltip" data-tooltip-content={`Progresso para alcançar ${metaMensal.toLocaleString()} pontos mensais`}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
                  <Target className="h-5 w-5 text-[var(--xbox-green)]" />
                </div>
                <span className="text-sm font-semibold text-[var(--xbox-green)]">{progress}%</span>
              </div>
              <p className="xbox-label">Progresso Meta</p>
              <div className="xbox-progress mt-2">
                <div className="xbox-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">{stats.totalSaldo.toLocaleString()} / {metaMensal.toLocaleString()} pts</p>
            </div>

            {/* Card Streak */}
            <div className="xbox-card p-6" data-tooltip-id="streak-tooltip" data-tooltip-content="Dias consecutivos de atividade">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
                  <Calendar className="h-5 w-5 text-[var(--xbox-green)]" />
                </div>
              </div>
              <p className="xbox-label">Streak</p>
              <p className="text-2xl font-bold text-white">
                {dataLoading ? '---' : stats.streak} <span className="text-sm text-[var(--text-muted)]">dias</span>
              </p>
            </div>

            {/* Card Média Diária */}
            <div className="xbox-card p-6" data-tooltip-id="media-tooltip" data-tooltip-content="Média de pontos ganhos por dia">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
                  <TrendingUp className="h-5 w-5 text-[var(--xbox-green)]" />
                </div>
              </div>
              <p className="xbox-label">Média Diária</p>
              <p className="text-2xl font-bold text-white">
                {dataLoading ? '---' : stats.mediaDiaria} <span className="text-sm text-[var(--text-muted)]">pts</span>
              </p>
            </div>

            {/* Card Daily Goal (New) */}
            <div className="xbox-card p-6" data-tooltip-id="daily-tooltip" data-tooltip-content={`Buscas: ${currentSearchPoints}/${maxSearchPoints} pts`}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
                  <Activity className="h-5 w-5 text-[var(--xbox-green)]" />
                </div>
                <span className="text-sm font-semibold text-[var(--xbox-green)]">{searchProgress}%</span>
              </div>
              <p className="xbox-label">Meta Diária (Buscas)</p>
              <div className="xbox-progress mt-2">
                <div className="xbox-progress-bar" style={{ width: `${searchProgress}%` }} />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                PC: {pcPoints}/{limits.PC_SEARCH} | Mob: {mobilePoints}/{limits.MOBILE_SEARCH}
              </p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="xbox-card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--xbox-green)]" />
                Pontos Últimos 7 Dias
              </h3>
            </div>
            {dataLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="xbox-shimmer w-full h-full rounded" />
              </div>
            ) : weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <RechartsTooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pts"
                    stroke="var(--xbox-green)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--xbox-green)', stroke: 'var(--bg-secondary)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'var(--xbox-green)', fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-[var(--text-muted)]">
                Nenhum registro nos últimos 7 dias
              </div>
            )}
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Registros Recentes */}
            <div className="lg:col-span-2 xbox-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--xbox-green)]" />
                  Registros Recentes
                </h3>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="xbox-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Atividade</th>
                      <th className="text-right">Pontos</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8">
                          <div className="xbox-shimmer w-32 h-4 mx-auto" />
                        </td>
                      </tr>
                    ) : currentRecords.length > 0 ? (
                      currentRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="text-white">
                            {new Date(record.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="text-[var(--text-secondary)]">{record.atividade}</td>
                          <td className={`text-right font-semibold ${record.meta_batida ? 'text-[var(--xbox-green)]' : 'text-[var(--error)]'}`}>
                            {record.total_pts}
                          </td>
                          <td className="text-center">
                            <span className={`xbox-badge ${record.meta_batida ? 'xbox-badge-success' : 'xbox-badge-error'}`}>
                              {record.meta_batida ? '✓ Alcançada' : '✗ Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center text-[var(--text-muted)] py-8">
                          Nenhum registro encontrado. Clique em &quot;Log Hoje&quot; para começar!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {recentRecords.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4 border-t border-[var(--border-subtle)] pt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="xbox-btn xbox-btn-ghost text-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-[var(--text-muted)]">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="xbox-btn xbox-btn-ghost text-sm disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              <Badges />
              <Leaderboard />
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-8 right-8">
            <Link
              href="/atividades"
              className="xbox-btn xbox-btn-primary px-6 py-4 text-lg animate-pulse-glow flex items-center gap-2"
              data-tooltip-id="log-tooltip"
              data-tooltip-content="Registre suas atividades diárias"
            >
              <Plus className="h-5 w-5" />
              Registrar Dia
            </Link>
          </div>
        </div>
      </main>

      {/* Tooltips */}
      <ReactTooltip id="saldo-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="progress-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="streak-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="media-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="daily-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="log-tooltip" place="left" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />


    </div>
  )
}
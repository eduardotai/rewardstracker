'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Trophy, TrendingUp, Calendar, Target, Plus, Gift, BarChart3, Menu, X as CloseIcon, Home, Activity, PiggyBank, User, LogOut } from 'lucide-react'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWeeklyRecords, fetchUserStats, fetchDailyRecords, DailyRecord } from '@/hooks/useData'
import RegistroModal from './RegistroModal'
import Badges from './Badges'
import Leaderboard from './Leaderboard'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Dynamic data states
  const [weeklyData, setWeeklyData] = useState<{ day: string; pts: number }[]>([])
  const [recentRecords, setRecentRecords] = useState<DailyRecord[]>([])
  const [stats, setStats] = useState({ totalSaldo: 0, streak: 0, mediaDiaria: 0 })
  const [dataLoading, setDataLoading] = useState(true)

  const metaMensal = profile?.meta_mensal || 12000
  const progress = Math.min(Math.round((stats.totalSaldo / metaMensal) * 100), 100)

  // Load guest data from localStorage
  const loadGuestData = useCallback(() => {
    const savedData = localStorage.getItem(GUEST_DATA_KEY)
    if (savedData) {
      const guestData = JSON.parse(savedData)
      const records: GuestRecord[] = guestData.registros || []

      // Set recent records
      setRecentRecords(records.slice(0, 10) as DailyRecord[])

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
      const sortedRecords = records
        .filter(r => r.meta_batida)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

      let streak = 0
      let currentDate = new Date()
      for (const record of sortedRecords) {
        const recordDate = new Date(record.data)
        const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays <= 1) {
          streak++
          currentDate = recordDate
        } else {
          break
        }
      }

      setStats({ totalSaldo, streak, mediaDiaria })
    }
    setDataLoading(false)
  }, [])

  // Fetch data when user is available
  useEffect(() => {
    async function loadData() {
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

      try {
        // Fetch weekly records for chart
        const { data: weekly } = await fetchWeeklyRecords(user.id)
        if (weekly) {
          const chartData = weekly.map(r => ({
            day: new Date(r.data).toLocaleDateString('pt-BR', { weekday: 'short' }),
            pts: r.total_pts
          }))
          setWeeklyData(chartData)
        }

        // Fetch recent records
        const { data: recent } = await fetchDailyRecords(user.id, 10)
        if (recent) {
          setRecentRecords(recent)
        }

        // Fetch stats
        const userStats = await fetchUserStats(user.id)
        setStats(userStats)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [user, isGuest, loadGuestData])

  // Reload data when modal closes
  const handleModalClose = () => {
    setIsModalOpen(false)

    if (isGuest) {
      loadGuestData()
      return
    }

    if (user) {
      fetchWeeklyRecords(user.id).then(({ data }) => {
        if (data) {
          setWeeklyData(data.map(r => ({
            day: new Date(r.data).toLocaleDateString('pt-BR', { weekday: 'short' }),
            pts: r.total_pts
          })))
        }
      })
      fetchDailyRecords(user.id, 10).then(({ data }) => {
        if (data) setRecentRecords(data)
      })
      fetchUserStats(user.id).then(setStats)
    }
  }

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
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[var(--xbox-green)]" />
                Registros Recentes
              </h3>
              <div className="overflow-x-auto">
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
                    ) : recentRecords.length > 0 ? (
                      recentRecords.slice(0, 5).map((record) => (
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
                          Nenhum registro encontrado. Clique em "Log Hoje" para começar!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              <Badges />
              <Leaderboard />
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-8 right-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="xbox-btn xbox-btn-primary px-6 py-4 text-lg animate-pulse-glow"
              data-tooltip-id="log-tooltip"
              data-tooltip-content="Registre suas atividades diárias"
            >
              <Plus className="h-5 w-5" />
              Log Hoje
            </button>
          </div>
        </div>
      </main>

      {/* Tooltips */}
      <ReactTooltip id="saldo-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="progress-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="streak-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="media-tooltip" place="top" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />
      <ReactTooltip id="log-tooltip" place="left" className="!bg-[var(--bg-elevated)] !text-white !border !border-[var(--border-subtle)]" />

      <RegistroModal isOpen={isModalOpen} onClose={handleModalClose} isGuest={isGuest} />
    </div>
  )
}
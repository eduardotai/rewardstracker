'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts'
import { Calendar, Filter, Home, Activity, BarChart3, PiggyBank, User, Gift, Menu, X as CloseIcon, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchDailyRecords, fetchResgates, DailyRecord, Resgate } from '@/hooks/useData'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: false },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: false },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: true },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: false },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

export default function GraficosPage() {
  const { isGuest, guestData, user, loading: authLoading } = useAuth()
  const [dateRange, setDateRange] = useState('30d')
  const [categoria, setCategoria] = useState('all')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Dynamic data states
  const [registros, setRegistros] = useState<DailyRecord[]>([])
  const [resgates, setResgates] = useState<Resgate[]>([])

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return

      if (isGuest && guestData) {
        // Load from guest data context
        setRegistros(guestData.registros as unknown as DailyRecord[] || [])
        setResgates(guestData.resgates as unknown as Resgate[] || [])
        setLoading(false)
      } else if (user) {
        // Load from Supabase for authenticated users
        const [recordsRes, resgatesRes] = await Promise.all([
          fetchDailyRecords(user.id),
          fetchResgates(user.id),
        ])

        if (recordsRes.data) setRegistros(recordsRes.data)
        if (resgatesRes.data) setResgates(resgatesRes.data)
        setLoading(false)
      } else {
        setLoading(false)
      }
    }

    loadData()
  }, [isGuest, guestData, user, authLoading])

  // Calculate chart data dynamically
  const dailyData = useMemo(() => {
    if (registros.length === 0) return []

    // Get last N records based on dateRange
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
    const days = daysMap[dateRange] || 30

    const now = new Date()
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return registros
      .filter(r => new Date(r.data) >= cutoff)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map(r => ({
        date: new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        pts: r.total_pts,
      }))
  }, [registros, dateRange])

  // Calculate source distribution
  const sourceData = useMemo(() => {
    if (registros.length === 0) return []

    const totals = registros.reduce(
      (acc, r) => ({
        pc: acc.pc + (r.pc_busca || 0),
        mobile: acc.mobile + (r.mobile_busca || 0),
        quiz: acc.quiz + (r.quiz || 0),
        xbox: acc.xbox + (r.xbox || 0),
      }),
      { pc: 0, mobile: 0, quiz: 0, xbox: 0 }
    )

    const total = totals.pc + totals.mobile + totals.quiz + totals.xbox
    if (total === 0) return []

    return [
      { name: 'PC Busca', value: Math.round((totals.pc / total) * 100), color: '#0078D4' },
      { name: 'Mobile Busca', value: Math.round((totals.mobile / total) * 100), color: 'var(--xbox-green)' },
      { name: 'Quiz', value: Math.round((totals.quiz / total) * 100), color: '#F9A825' },
      { name: 'Xbox', value: Math.round((totals.xbox / total) * 100), color: '#C084FC' },
    ].filter(s => s.value > 0)
  }, [registros])

  // Calculate monthly resgate data
  const resgateData = useMemo(() => {
    if (resgates.length === 0) return []

    const monthlyTotals: Record<string, number> = {}

    resgates.forEach(r => {
      const date = new Date(r.data)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' })
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + r.pts_usados
    })

    return Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, pts]) => {
        const [year, month] = key.split('-')
        const date = new Date(parseInt(year), parseInt(month))
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          pts,
        }
      })
  }, [resgates])

  // Calculate monthly points data
  const monthlyData = useMemo(() => {
    if (registros.length === 0) return []

    const monthlyTotals: Record<string, number> = {}

    registros.forEach(r => {
      const date = new Date(r.data)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + r.total_pts
    })

    return Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, pts]) => {
        const [year, month] = key.split('-')
        const date = new Date(parseInt(year), parseInt(month))
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          pts,
        }
      })
  }, [registros])

  const chartColors = {
    line: 'var(--xbox-green)',
    bar: 'var(--xbox-green)',
    grid: 'var(--border-subtle)',
    text: 'var(--text-muted)',
  }

  const hasData = registros.length > 0 || resgates.length > 0

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
          <h1 className="text-lg font-bold text-[var(--xbox-green)]">Gráficos</h1>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Gráficos</h2>
            <p className="text-[var(--text-secondary)]">Visualize seu progresso e padrões</p>
          </header>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="xbox-input xbox-select w-auto"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--text-muted)]" />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="xbox-input xbox-select w-auto"
              >
                <option value="all">Todas as categorias</option>
                <option value="buscas">Buscas</option>
                <option value="quiz">Quiz</option>
                <option value="xbox">Xbox</option>
              </select>
            </div>
          </div>

          {!hasData ? (
            <div className="xbox-card p-12 text-center">
              <BarChart3 className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Sem dados ainda</h3>
              <p className="text-[var(--text-secondary)]">
                Comece a registrar seus pontos no Dashboard para ver os gráficos aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Daily Points */}
              <div className="xbox-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--xbox-green)]" />
                  Pontos Diários
                </h3>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={dailyData}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      />
                      <Line type="monotone" dataKey="pts" stroke={chartColors.line} strokeWidth={2} dot={{ fill: chartColors.line, r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-[var(--text-muted)]">
                    Nenhum registro diário ainda
                  </div>
                )}
              </div>

              {/* Sources Pie */}
              <div className="xbox-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Fontes de Pontos</h3>
                {sourceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'var(--text-muted)' }}
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-[var(--text-muted)]">
                    Nenhuma fonte de pontos registrada
                  </div>
                )}
              </div>

              {/* Resgates Bar */}
              <div className="xbox-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Resgates por Mês</h3>
                {resgateData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={resgateData}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      />
                      <Bar dataKey="pts" fill={chartColors.bar} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-[var(--text-muted)]">
                    Nenhum resgate registrado
                  </div>
                )}
              </div>

              {/* Monthly Line */}
              <div className="xbox-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Pontos Mensais</h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      />
                      <Line type="monotone" dataKey="pts" stroke="#F9A825" strokeWidth={2} dot={{ fill: '#F9A825', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-[var(--text-muted)]">
                    Nenhum registro mensal ainda
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
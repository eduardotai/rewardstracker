'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts'
import { Calendar, Filter, Home, Activity, BarChart3, PiggyBank, User, Gift, Menu, X as CloseIcon, TrendingUp } from 'lucide-react'

const dailyData = [
  { date: '01 Dez', pts: 120 },
  { date: '02 Dez', pts: 150 },
  { date: '03 Dez', pts: 200 },
  { date: '04 Dez', pts: 180 },
  { date: '05 Dez', pts: 220 },
  { date: '06 Dez', pts: 250 },
  { date: '07 Dez', pts: 300 },
  { date: '08 Dez', pts: 280 },
  { date: '09 Dez', pts: 320 },
  { date: '10 Dez', pts: 350 },
  { date: '11 Dez', pts: 400 },
  { date: '12 Dez', pts: 450 },
]

const sourceData = [
  { name: 'PC Busca', value: 40, color: '#0078D4' },
  { name: 'Mobile Busca', value: 30, color: 'var(--xbox-green)' },
  { name: 'Quiz', value: 20, color: '#F9A825' },
  { name: 'Xbox', value: 10, color: '#C084FC' },
]

const resgateData = [
  { month: 'Jan', pts: 12000 },
  { month: 'Fev', pts: 15000 },
  { month: 'Mar', pts: 18000 },
  { month: 'Abr', pts: 22000 },
  { month: 'Mai', pts: 25000 },
  { month: 'Jun', pts: 28000 },
]

const monthlyData = [
  { month: 'Jan', pts: 3500 },
  { month: 'Fev', pts: 4200 },
  { month: 'Mar', pts: 3800 },
  { month: 'Abr', pts: 5100 },
  { month: 'Mai', pts: 4600 },
  { month: 'Jun', pts: 5300 },
  { month: 'Jul', pts: 4800 },
  { month: 'Ago', pts: 5500 },
  { month: 'Set', pts: 4900 },
  { month: 'Out', pts: 5200 },
  { month: 'Nov', pts: 4700 },
  { month: 'Dez', pts: 5400 },
]

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: false },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: false },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: true },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: false },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

export default function GraficosPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [categoria, setCategoria] = useState('all')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const chartColors = {
    line: 'var(--xbox-green)',
    bar: 'var(--xbox-green)',
    grid: 'var(--border-subtle)',
    text: 'var(--text-muted)',
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

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Points */}
            <div className="xbox-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--xbox-green)]" />
                Pontos Diários
              </h3>
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
            </div>

            {/* Sources Pie */}
            <div className="xbox-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Fontes de Pontos</h3>
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
            </div>

            {/* Resgates Bar */}
            <div className="xbox-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resgates por Mês</h3>
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
            </div>

            {/* Monthly Line */}
            <div className="xbox-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pontos Mensais</h3>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
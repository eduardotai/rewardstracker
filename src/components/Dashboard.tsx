'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Trophy, TrendingUp, Calendar, Target, Plus, Gift, BarChart3, Menu, X as CloseIcon, Home, Activity, PiggyBank, User } from 'lucide-react'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import RegistroModal from './RegistroModal'
import Badges from './Badges'
import Leaderboard from './Leaderboard'

const mockData = [
  { day: 'Seg', pts: 120 },
  { day: 'Ter', pts: 150 },
  { day: 'Qua', pts: 200 },
  { day: 'Qui', pts: 180 },
  { day: 'Sex', pts: 220 },
  { day: 'Sab', pts: 250 },
  { day: 'Dom', pts: 300 },
]

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: true },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: false },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: false },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: false },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

export default function Dashboard() {
  const totalSaldo = mockData.reduce((sum, day) => sum + day.pts, 0)
  const mediaDiaria = Math.round(totalSaldo / mockData.length)
  const progress = Math.min(Math.round((totalSaldo / 12000) * 100), 100)
  const streak = mockData.filter(day => day.pts >= 150).length

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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

        {/* Quick Stats Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="xbox-card p-4">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-2">Saldo Total</p>
            <p className="text-2xl font-bold text-[var(--xbox-green)]">{totalSaldo.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-secondary)]">pontos</p>
          </div>
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
          <div className="w-10" /> {/* Spacer */}
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-[var(--text-secondary)]">Acompanhe seu progresso no Microsoft Rewards</p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Card Saldo Atual */}
            <div
              className="xbox-card p-6"
              data-tooltip-id="saldo-tooltip"
              data-tooltip-content="Seu saldo total de pontos acumulados"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
                  <Trophy className="h-5 w-5 text-[var(--xbox-green)]" />
                </div>
              </div>
              <p className="xbox-label">Saldo Atual</p>
              <p className="text-2xl font-bold text-white">{totalSaldo.toLocaleString()} <span className="text-sm text-[var(--text-muted)]">pts</span></p>
            </div>

            {/* Card Progresso Meta */}
            <div
              className="xbox-card p-6"
              data-tooltip-id="progress-tooltip"
              data-tooltip-content="Progresso para alcançar 12.000 pontos mensais"
            >
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
              <p className="text-xs text-[var(--text-muted)] mt-2">{totalSaldo.toLocaleString()} / 12.000 pts</p>
            </div>

            {/* Card Streak */}
            <div
              className="xbox-card p-6"
              data-tooltip-id="streak-tooltip"
              data-tooltip-content="Dias consecutivos de atividade"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
                  <Calendar className="h-5 w-5 text-[var(--xbox-green)]" />
                </div>
              </div>
              <p className="xbox-label">Streak</p>
              <p className="text-2xl font-bold text-white">{streak} <span className="text-sm text-[var(--text-muted)]">dias</span></p>
            </div>

            {/* Card Média Diária */}
            <div
              className="xbox-card p-6"
              data-tooltip-id="media-tooltip"
              data-tooltip-content="Média de pontos ganhos por dia"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
                  <TrendingUp className="h-5 w-5 text-[var(--xbox-green)]" />
                </div>
              </div>
              <p className="xbox-label">Média Diária</p>
              <p className="text-2xl font-bold text-white">{mediaDiaria} <span className="text-sm text-[var(--text-muted)]">pts</span></p>
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
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockData}>
                <RechartsTooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-secondary)' }}
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
                    <tr>
                      <td className="text-white">12 Dez 2024</td>
                      <td className="text-[var(--text-secondary)]">Buscas + Quiz</td>
                      <td className="text-right font-semibold text-[var(--xbox-green)]">150</td>
                      <td className="text-center">
                        <span className="xbox-badge xbox-badge-success">✓ Alcançada</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-white">11 Dez 2024</td>
                      <td className="text-[var(--text-secondary)]">Xbox</td>
                      <td className="text-right font-semibold text-[var(--xbox-green)]">100</td>
                      <td className="text-center">
                        <span className="xbox-badge xbox-badge-success">✓ Alcançada</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-white">10 Dez 2024</td>
                      <td className="text-[var(--text-secondary)]">Buscas</td>
                      <td className="text-right font-semibold text-[var(--error)]">50</td>
                      <td className="text-center">
                        <span className="xbox-badge xbox-badge-error">✗ Pendente</span>
                      </td>
                    </tr>
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

      <RegistroModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
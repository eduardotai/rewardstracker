'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Trophy, TrendingUp, Calendar, Target, Plus } from 'lucide-react'
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

export default function Dashboard() {
  // Dynamic calculations from mock data
  const totalSaldo = mockData.reduce((sum, day) => sum + day.pts, 0)
  const mediaDiaria = Math.round(totalSaldo / mockData.length)
  const progress = Math.min(Math.round((totalSaldo / 12000) * 100), 100)
  const streak = mockData.filter(day => day.pts >= 150).length // Assuming 150 is meta

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen p-6">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-xbox-green mb-2">🎮 Rewards Tracker BR</h1>
        <p className="text-lg text-gray-700 font-medium">Maximize seus pontos Microsoft Rewards no Brasil</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div
          className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-xbox-green"
          data-tooltip-id="saldo-tooltip"
          data-tooltip-content="Seu saldo total de pontos acumulados"
        >
          <div className="flex items-center">
            <div className="p-3 bg-xbox-green bg-opacity-10 rounded-full mr-4">
              <Trophy className="h-8 w-8 text-xbox-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 uppercase tracking-wide">Saldo Atual</p>
              <p className="text-3xl font-bold text-gray-900">{totalSaldo.toLocaleString()} pts</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-xbox-blue"
          data-tooltip-id="progress-tooltip"
          data-tooltip-content="Progresso para alcançar 12.000 pontos mensais"
        >
          <div className="flex items-center">
            <div className="p-3 bg-xbox-blue bg-opacity-10 rounded-full mr-4">
              <Target className="h-8 w-8 text-xbox-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 uppercase tracking-wide">Progresso Meta</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-xbox-green to-xbox-blue h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm font-semibold text-xbox-green mt-2">{progress}% concluído</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-xbox-yellow"
          data-tooltip-id="streak-tooltip"
          data-tooltip-content="Dias consecutivos de atividade"
        >
          <div className="flex items-center">
            <div className="p-3 bg-xbox-yellow bg-opacity-10 rounded-full mr-4">
              <Calendar className="h-8 w-8 text-xbox-yellow" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 uppercase tracking-wide">Streak</p>
              <p className="text-3xl font-bold text-gray-900">{streak} dias</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-xbox-green"
          data-tooltip-id="media-tooltip"
          data-tooltip-content="Média de pontos ganhos por dia"
        >
          <div className="flex items-center">
            <div className="p-3 bg-xbox-green bg-opacity-10 rounded-full mr-4">
              <TrendingUp className="h-8 w-8 text-xbox-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 uppercase tracking-wide">Média Diária</p>
              <p className="text-3xl font-bold text-gray-900">{mediaDiaria} pts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 text-xbox-blue mr-3" />
          Pontos Últimos 7 Dias
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={mockData}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Line
              type="monotone"
              dataKey="pts"
              stroke="#107C10"
              strokeWidth={3}
              dot={{ fill: '#107C10', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#0078D4' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-6 w-6 text-xbox-green mr-3" />
              Registros Recentes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Atividade</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Pontos</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Meta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900">12 Dez 2024</td>
                    <td className="py-4 px-4 text-gray-900">Buscas + Quiz</td>
                    <td className="py-4 px-4 text-right font-semibold text-xbox-green">150</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Alcançada
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900">11 Dez 2024</td>
                    <td className="py-4 px-4 text-gray-900">Xbox</td>
                    <td className="py-4 px-4 text-right font-semibold text-xbox-green">100</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Alcançada
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900">10 Dez 2024</td>
                    <td className="py-4 px-4 text-gray-900">Buscas</td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-600">50</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ✗ Pendente
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Badges />
          <Leaderboard />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-xbox-green hover:bg-xbox-green/90 text-white px-12 py-5 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto"
          data-tooltip-id="log-tooltip"
          data-tooltip-content="Registre suas atividades diárias para ganhar pontos"
        >
          <Plus className="h-6 w-6 mr-3" />
          Log Hoje
        </button>
      </div>

      <ReactTooltip id="saldo-tooltip" place="top" className="max-w-xs" />
      <ReactTooltip id="progress-tooltip" place="top" className="max-w-xs" />
      <ReactTooltip id="streak-tooltip" place="top" className="max-w-xs" />
      <ReactTooltip id="media-tooltip" place="top" className="max-w-xs" />
      <ReactTooltip id="log-tooltip" place="top" className="max-w-xs" />

      <RegistroModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
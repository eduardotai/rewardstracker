'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Trophy, TrendingUp, Calendar, Target } from 'lucide-react'
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
  const [saldo] = useState(8500)
  const [progress] = useState(70) // %
  const [streak] = useState(5)
  const [mediaDiaria] = useState(150)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Rewards Tracker BR</h1>
        <p className="text-gray-600">Maximize seus pontos sem esforço</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Saldo Atual</p>
              <p className="text-2xl font-bold">{saldo.toLocaleString()} pts</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Progresso Meta</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-sm mt-1">{progress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-2xl font-bold">{streak} dias</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Média Diária</p>
              <p className="text-2xl font-bold">{mediaDiaria} pts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Pontos Últimos 7 Dias</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Line type="monotone" dataKey="pts" stroke="#0078D4" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Registros Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Data</th>
                <th className="text-left py-2">Atividade</th>
                <th className="text-right py-2">Pontos</th>
                <th className="text-center py-2">Meta</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">2024-12-12</td>
                <td>Buscas + Quiz</td>
                <td className="text-right">150</td>
                <td className="text-center">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">2024-12-11</td>
                <td>Xbox</td>
                <td className="text-right">100</td>
                <td className="text-center">✓</td>
              </tr>
              <tr>
                <td className="py-2">2024-12-10</td>
                <td>Buscas</td>
                <td className="text-right">50</td>
                <td className="text-center">✗</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Badges />

      <Leaderboard />

      <div className="text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Log Hoje
        </button>
      </div>

      <RegistroModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
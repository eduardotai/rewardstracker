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

      <Badges />

      <Leaderboard />

      <RegistroModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
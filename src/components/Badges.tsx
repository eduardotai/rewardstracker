'use client'

import { Trophy, Flame, Target, Star } from 'lucide-react'

const badges = [
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: '7 dias consecutivos',
    icon: Flame,
    earned: true,
    color: 'text-orange-500',
  },
  {
    id: 'points_hunter',
    name: 'Caçador de Pontos',
    description: '5000 pontos acumulados',
    icon: Target,
    earned: true,
    color: 'text-blue-500',
  },
  {
    id: 'monthly_champion',
    name: 'Campeão Mensal',
    description: '12000 pontos em um mês',
    icon: Trophy,
    earned: false,
    color: 'text-yellow-500',
  },
  {
    id: 'consistency_star',
    name: 'Estrela da Consistência',
    description: '30 dias sem perder streak',
    icon: Star,
    earned: false,
    color: 'text-purple-500',
  },
]

export default function Badges() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Suas Conquistas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 text-center ${
                badge.earned
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              <Icon className={`h-8 w-8 mx-auto mb-2 ${badge.earned ? badge.color : 'text-gray-400'}`} />
              <h3 className="font-semibold text-sm">{badge.name}</h3>
              <p className="text-xs text-gray-600">{badge.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
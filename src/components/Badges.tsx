'use client'

import { Trophy, Flame, Target, Star } from 'lucide-react'

const calculateBadges = () => {
  const totalSaldo = [120, 150, 200, 180, 220, 250, 300].reduce((sum, pts) => sum + pts, 0)
  const streak = [120, 150, 200, 180, 220, 250, 300].filter(pts => pts >= 150).length

  return [
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: '7 dias consecutivos',
      icon: Flame,
      earned: streak >= 7,
      color: '#FB923C', // orange-400
    },
    {
      id: 'points_hunter',
      name: 'Caçador de Pontos',
      description: '5000 pontos acumulados',
      icon: Target,
      earned: totalSaldo >= 5000,
      color: 'var(--xbox-green)',
    },
    {
      id: 'monthly_champion',
      name: 'Campeão Mensal',
      description: '12000 pontos em um mês',
      icon: Trophy,
      earned: totalSaldo >= 12000,
      color: '#FACC15', // yellow-400
    },
    {
      id: 'consistency_star',
      name: 'Estrela da Consistência',
      description: '30 dias sem perder streak',
      icon: Star,
      earned: streak >= 30,
      color: '#C084FC', // purple-400
    },
  ]
}

const badges = calculateBadges()

export default function Badges() {
  return (
    <div className="xbox-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[var(--xbox-green)]" />
        Conquistas
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => {
          const Icon = badge.icon
          return (
            <div
              key={badge.id}
              className={`p-3 rounded border text-center transition-all ${badge.earned
                  ? 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)]'
                  : 'border-transparent bg-[var(--bg-tertiary)]/50 opacity-40'
                }`}
            >
              <Icon
                className="h-6 w-6 mx-auto mb-2"
                style={{ color: badge.earned ? badge.color : 'var(--text-muted)' }}
              />
              <h4 className="font-semibold text-xs text-white leading-tight">{badge.name}</h4>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{badge.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
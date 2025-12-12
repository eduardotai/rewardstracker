'use client'

import { Crown, Medal, Award } from 'lucide-react'

const leaderboard = [
  { rank: 1, name: 'Você', pts: 8500, tier: 'Essential' },
  { rank: 2, name: 'João S.', pts: 7800, tier: 'Sem' },
  { rank: 3, name: 'Maria C.', pts: 7200, tier: 'Sem' },
  { rank: 4, name: 'Pedro L.', pts: 6900, tier: 'Sem' },
  { rank: 5, name: 'Ana R.', pts: 6500, tier: 'Sem' },
]

export default function Leaderboard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Leaderboard (Anônimo)</h2>
      <div className="space-y-3">
        {leaderboard.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center justify-between p-3 rounded-lg ${
              user.rank === 1 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {user.rank === 1 && <Crown className="h-5 w-5 text-yellow-500" />}
              {user.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
              {user.rank === 3 && <Award className="h-5 w-5 text-amber-600" />}
              <span className="font-semibold">#{user.rank}</span>
               <span className="text-gray-900">{user.name}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">{user.pts.toLocaleString()} pts</div>
               <div className="text-sm text-gray-800">{user.tier}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
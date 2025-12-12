'use client'

import { useState, useEffect } from 'react'
import { Crown, Medal, Award, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchLeaderboardData } from '@/hooks/useData'

const leaderboard = [
  { rank: 1, name: 'Você', pts: 8500, tier: 'Essential', isCurrentUser: false },
  { rank: 2, name: 'João S.', pts: 7800, tier: 'Sem', isCurrentUser: false },
  { rank: 3, name: 'Maria C.', pts: 7200, tier: 'Sem', isCurrentUser: false },
  { rank: 4, name: 'Pedro L.', pts: 6900, tier: 'Sem', isCurrentUser: false },
  { rank: 5, name: 'Ana R.', pts: 6500, tier: 'Sem', isCurrentUser: false },
]

export default function Leaderboard() {
  const { user, isGuest } = useAuth()
  const [data, setData] = useState(leaderboard) // Start with mock/empty
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeaderboard() {
      if (isGuest) {
        // In guest mode, show mock data but highlight "Você" as guest
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const realData = await fetchLeaderboardData(user?.id)
        if (realData.length > 0) {
          setData(realData)
        }
      } catch (error) {
        console.error('Failed to load leaderboard', error)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [user, isGuest])

  return (
    <div className="xbox-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-[var(--xbox-green)]" />
        Top 10 Mensal
      </h3>
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 xbox-shimmer rounded" />
            ))}
          </div>
        ) : (
          data.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-3 rounded transition-all ${user.isCurrentUser
                ? 'bg-[var(--xbox-green)]/20 border border-[var(--xbox-green)]/50'
                : user.rank === 1
                  ? 'bg-[var(--warning)]/10 border border-[var(--warning)]/30'
                  : 'bg-[var(--bg-tertiary)]'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 flex justify-center">
                  {user.rank === 1 && <Crown className="h-4 w-4 text-[var(--warning)]" />}
                  {user.rank === 2 && <Medal className="h-4 w-4 text-[var(--text-muted)]" />}
                  {user.rank === 3 && <Award className="h-4 w-4 text-amber-600" />}
                  {user.rank > 3 && <span className="text-xs text-[var(--text-muted)] font-semibold">#{user.rank}</span>}
                </div>
                <span className={`text-sm ${user.rank === 1 || user.isCurrentUser ? 'font-semibold text-white' : 'text-[var(--text-secondary)]'}`}>
                  {user.name} {user.isCurrentUser && '(Você)'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[var(--xbox-green)]">{user.pts.toLocaleString()}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{user.tier}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
// components/Leaderboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GamificationEngine } from '@/lib/gamification/game-engine'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'all'>('weekly')

  useEffect(() => {
    fetchLeaderboard()
  }, [timeRange])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('leaderboard_view')
        .select('*')
        .limit(20)

      if (timeRange === 'daily') {
        query = query.order('total_points', { ascending: false })
      } else if (timeRange === 'weekly') {
        // Bu haftanın puanları için farklı bir view gerekebilir
        query = query.order('total_points', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Leaderboard yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🏆 Lider Tablosu</h2>
          <p className="text-gray-600">En aktif bulucular</p>
        </div>
        
        <div className="flex space-x-2">
          {['daily', 'weekly', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'daily' ? 'Günlük' : range === 'weekly' ? 'Haftalık' : 'Tüm Zamanlar'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const userLevel = GamificationEngine.LEVELS.find(l => l.level === user.current_level)
            
            return (
              <div 
                key={user.user_id}
                className={`flex items-center space-x-4 p-3 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' : 'hover:bg-gray-50'
                }`}
              >
                {/* Sıra */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {getRankIcon(index + 1)}
                  </div>
                </div>

                {/* Avatar ve İsim */}
                <div className="flex-1 flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.name?.[0] || 'K'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{user.name}</h4>
                        <p className="text-sm" style={{ color: userLevel?.color }}>
                          {userLevel?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{user.total_points} puan</div>
                        <div className="text-xs text-gray-500">
                          {user.total_sightings} yardım
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar (mini) */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${Math.min(100, (user.total_points / 5000) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Kendi Pozisyonun (alt kısım) */}
      <div className="mt-6 pt-6 border-t">
        <button 
          onClick={() => fetchLeaderboard()}
          className="w-full text-center text-blue-600 hover:text-blue-800 font-medium py-2"
        >
          Tam Listeyi Gör
        </button>
      </div>
    </div>
  )
}
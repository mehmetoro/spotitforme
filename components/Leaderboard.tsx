"use client";
// Kullanıcıya özel renk üretici (user_id'den hash)
function getUserColors(userId: string) {
  // Basit bir hash fonksiyonu
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Renk üret (HSL)
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 60) % 360;
  const h3 = (h1 + 180) % 360;
  return [
    `hsl(${h1}, 90%, 60%)`,
    `hsl(${h2}, 85%, 55%)`,
    `hsl(${h3}, 80%, 65%)`,
    `hsl(${(h1+120)%360}, 95%, 70%)`
  ];
}


// components/Leaderboard.tsx

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
    console.log('Leaderboard: fetchLeaderboard başladı')
    try {
      // Sighting sayılarına göre leaderboard oluştur
      const { data: sightingsData, error } = await supabase
        .from('sightings')
        .select('spotter_id')
      console.log('Leaderboard: sightingsData', sightingsData)
      console.log('Leaderboard: sightings error', error)
      
      if (error) throw error
      
      // Kullanıcı başına sighting sayısını hesapla
      const userCounts: Record<string, number> = {}
      sightingsData?.forEach(s => {
        userCounts[s.spotter_id] = (userCounts[s.spotter_id] || 0) + 1
      })
      
      // User ID'leri al
      const userIds = Object.keys(userCounts)
      if (userIds.length === 0) {
        setLeaderboard([])
        return
      }
      
      // User bilgilerini çek
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)
      console.log('Leaderboard: usersData', usersData)
      console.log('Leaderboard: usersError', usersError)
      
      // Leaderboard oluştur
      const leaderboardData = (usersData || []).map(user => ({
        user_id: user.id,
        name: user.full_name || 'Kullanıcı',
        avatar_url: user.avatar_url,
        total_sightings: userCounts[user.id],
        total_points: userCounts[user.id] * 10, // Her sighting 10 puan
        current_level: Math.min(10, Math.floor(userCounts[user.id] / 5) + 1) // Her 5 sighting'de 1 level
      }))
      
      // Puana göre sırala
      leaderboardData.sort((a, b) => b.total_points - a.total_points)
      
      setLeaderboard(leaderboardData.slice(0, 20))
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
    <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 min-w-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🏆 Lider Tablosu</h2>
          <p className="text-gray-600">En aktif bulucular</p>
        </div>
        
        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex flex-nowrap sm:flex-wrap gap-2 min-w-max sm:min-w-0">
          {['daily', 'weekly', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
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
        <div className="space-y-4">
          {leaderboard.map((user, index) => {
            const userLevel = GamificationEngine.LEVELS.find(l => l.level === user.current_level)
            return (
              <div
                key={user.user_id}
                className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl min-w-0 ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' : 'hover:bg-gray-50'
                }`}
                style={{ minWidth: 0 }}
              >
                {/* Sıra */}
                <div className="flex-shrink-0 mb-2 sm:mb-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {getRankIcon(index + 1)}
                  </div>
                </div>
                {/* Avatar ve İsim */}
                <div className="flex flex-col items-center sm:items-start flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-2">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      (() => {
                        const colors = getUserColors(user.user_id || user.id || 'default');
                        return (
                          <svg viewBox="0 0 64 64" className="w-full h-full rounded-full">
                            <defs>
                              <radialGradient id={`g${user.user_id}`} cx="50%" cy="50%" r="80%">
                                <stop offset="0%" stopColor={colors[0]} />
                                <stop offset="30%" stopColor={colors[1]} />
                                <stop offset="60%" stopColor={colors[2]} />
                                <stop offset="100%" stopColor={colors[3]} />
                              </radialGradient>
                              <linearGradient id={`l${user.user_id}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {/* Arka plan renkli küre */}
                            <circle cx="32" cy="32" r="32" fill={`url(#g${user.user_id})`} />
                            {/* Gözün beyazı */}
                            <ellipse cx="32" cy="36" rx="16" ry="12" fill="#fff" fillOpacity="0.85" />
                            {/* Göz bebeği */}
                            <circle cx="32" cy="36" r="6.5" fill="#222" fillOpacity="0.85" />
                            {/* Parlak yansıma */}
                            <ellipse cx="29" cy="33" rx="2.2" ry="1.2" fill="#fff" fillOpacity="0.7" />
                            {/* Dalgalı ışık efekti */}
                            <path d="M10,40 Q32,55 54,40 T54,24 Q32,9 10,24 T10,40 Z" fill={`url(#l${user.user_id})`} opacity="0.5" />
                            <ellipse cx="32" cy="24" rx="12" ry="6" fill="#fff" fillOpacity="0.10" />
                            <ellipse cx="20" cy="28" rx="6" ry="3" fill="#fff" fillOpacity="0.12" />
                            <ellipse cx="44" cy="36" rx="8" ry="4" fill="#fff" fillOpacity="0.09" />
                          </svg>
                        );
                      })()
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg sm:text-xl break-words text-center sm:text-left w-full">{user.name}</h4>
                  <p className="text-sm mb-1 text-center sm:text-left w-full" style={{ color: userLevel?.color }}>
                    {userLevel?.name}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full">
                    <div className="font-bold text-gray-900 text-base sm:text-lg">{user.total_points} puan</div>
                    <div className="text-xs text-gray-500">{user.total_sightings} yardım</div>
                  </div>
                  {/* Progress bar (mini) */}
                  <div className="mt-2 w-full">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${Math.min(100, (user.total_points / 5000) * 100)}%` }}
                      ></div>
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
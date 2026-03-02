'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface LeaderboardUser {
  id: string
  name: string
  avatar_url: string | null
  total_points: number
  current_streak: number
  best_streak: number
  rank: number
}

type LeaderboardTab = 'points' | 'streak' | 'weekly'

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('points')
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null)

  useEffect(() => {
    fetchLeaderboardData()
  }, [activeTab])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)

      // Mevcut kullanıcıyı al
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase
        .from('user_gamification')
        .select(`
          user_id,
          total_points,
          current_streak,
          best_streak,
          user_profiles!inner(
            id,
            name,
            avatar_url
          )
        `)

      // Sıralama kriterine göre
      switch (activeTab) {
        case 'points':
          query = query.order('total_points', { ascending: false })
          break
        case 'streak':
          query = query.order('current_streak', { ascending: false })
          break
        case 'weekly':
          // Son 7 günün challenge'larını kontrol et
          query = query
            .gt('last_challenge_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('total_points', { ascending: false })
          break
      }

      const { data: leaderboardData, error } = await query.limit(50)

      if (error) throw error

      // Verileri format et
      const formattedUsers: LeaderboardUser[] = (leaderboardData || []).map((item: any, index: number) => ({
        id: item.user_id,
        name: item.user_profiles?.name || 'Anonymous',
        avatar_url: item.user_profiles?.avatar_url || null,
        total_points: item.total_points,
        current_streak: item.current_streak,
        best_streak: item.best_streak,
        rank: index + 1
      }))

      setUsers(formattedUsers)

      // Mevcut kullanıcının sıralamasını bul
      if (user) {
        const userRank = formattedUsers.find(u => u.id === user.id)
        if (userRank) {
          setCurrentUserRank(userRank)
        } else {
          // Kullanıcı top 50'de değilse, onun data'sını ayrı getir
          const { data: userData } = await supabase
            .from('user_gamification')
            .select(`
              user_id,
              total_points,
              current_streak,
              best_streak,
              user_profiles(
                id,
                name,
                avatar_url
              )
            `)
            .eq('user_id', user.id)
            .single() as any

          if (userData) {
            setCurrentUserRank({
              id: userData.user_id,
              name: userData.user_profiles?.name || user.email,
              avatar_url: userData.user_profiles?.avatar_url || null,
              total_points: userData.total_points,
              current_streak: userData.current_streak,
              best_streak: userData.best_streak,
              rank: -1
            })
          }
        }
      }
    } catch (error) {
      console.error('Leaderboard verisi yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Sıralama Tablosu</h1>
        <p className="text-gray-600">En aktif kullanıcıları ve en iyi serilerini görüntüleyin</p>
      </div>

      {/* Tab Butonları */}
      <div className="flex gap-3 mb-8 bg-white rounded-lg p-2 shadow">
        {[
          { key: 'points' as LeaderboardTab, label: '💰 Puanlar', icon: '💰' },
          { key: 'streak' as LeaderboardTab, label: '🔥 Seri', icon: '🔥' },
          { key: 'weekly' as LeaderboardTab, label: '📅 Haftalık', icon: '📅' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mevcut Kullanıcının Sırası (Highlight) */}
      {currentUserRank && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold">
                #{currentUserRank.rank === -1 ? '50+' : currentUserRank.rank}
              </div>
              <div>
                <p className="text-lg font-semibold">{currentUserRank.name}</p>
                <p className="text-blue-100">Senin Sıraman</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{currentUserRank.total_points}</div>
              <div className="text-blue-100">Puan</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Listesi */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
          <div className="col-span-1">Sıra</div>
          <div className="col-span-6">Kullanıcı</div>
          <div className="col-span-2">Puanlar</div>
          <div className="col-span-3">Seri</div>
        </div>

        <div className="divide-y divide-gray-200">
          {users.map((user, index) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-blue-50 transition"
            >
              {/* Sıra */}
              <div className="col-span-1 flex items-center">
                <div className="flex items-center justify-center">
                  {index === 0 && <span className="text-2xl">🥇</span>}
                  {index === 1 && <span className="text-2xl">🥈</span>}
                  {index === 2 && <span className="text-2xl">🥉</span>}
                  {index > 2 && <span className="font-bold text-gray-700">#{index + 1}</span>}
                </div>
              </div>

              {/* Kullanıcı */}
              <div className="col-span-6 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">Profilini ziyaret et</p>
                </div>
              </div>

              {/* Puanlar */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">{user.total_points}</p>
                  <p className="text-xs text-gray-500">puan</p>
                </div>
              </div>

              {/* Seri */}
              <div className="col-span-3 flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-lg">🔥</span>
                    <span className="font-bold text-lg">{user.current_streak}</span>
                  </div>
                  <p className="text-xs text-gray-500">günlük</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-lg">⭐</span>
                    <span className="font-bold text-lg">{user.best_streak}</span>
                  </div>
                  <p className="text-xs text-gray-500">en iyi</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Şu an top 50'de değilsen */}
      {currentUserRank && currentUserRank.rank === -1 && (
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">
            🎯 Puan kazanarak sırlamaya gir! Şu anda {currentUserRank.total_points} puan var.
          </p>
        </div>
      )}

      {/* Boş Durum */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Henüz kullanıcı yok</p>
        </div>
      )}
    </div>
  )
}

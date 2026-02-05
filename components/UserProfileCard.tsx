// components/UserProfileCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GamificationEngine } from '@/lib/gamification/game-engine'

interface UserProfileCardProps {
  userId: string
  compact?: boolean
}

export default function UserProfileCard({ userId, compact = false }: UserProfileCardProps) {
  const [profile, setProfile] = useState<any>(null)
  const [reputation, setReputation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      const [{ data: profileData }, { data: repData }] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', userId).single(),
        supabase.from('user_reputation').select('*').eq('user_id', userId).single()
      ])

      setProfile(profileData)
      setReputation(repData)
    } catch (error) {
      console.error('Profil yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
  }

  const userLevel = GamificationEngine.LEVELS.find(l => l.level === reputation?.current_level) || GamificationEngine.LEVELS[0]
  const nextLevel = GamificationEngine.LEVELS.find(l => l.level === (reputation?.current_level || 0) + 1)

  return (
    <div className={`bg-white rounded-xl shadow-lg ${compact ? 'p-4' : 'p-6'}`}>
      {/* Üst Kısım - Avatar ve Temel Bilgiler */}
      <div className="flex items-start space-x-4">
        <div className="relative">
          <div className={`w-${compact ? '12' : '16'} h-${compact ? '12' : '16'} rounded-full border-4`} 
               style={{ borderColor: userLevel.color }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full" />
            ) : (
              <div className={`w-full h-full rounded-full bg-gradient-to-br from-${userLevel.color}-400 to-${userLevel.color}-600 flex items-center justify-center text-white font-bold text-${compact ? 'lg' : 'xl'}`}>
                {profile?.name?.[0] || 'K'}
              </div>
            )}
          </div>
          
          {/* Seviye Göstergesi */}
          {!compact && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-${userLevel.color}-400 to-${userLevel.color}-600 flex items-center justify-center text-white text-xs font-bold`}>
                {userLevel.level}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold ${compact ? 'text-lg' : 'text-xl'}`}>
                {profile?.name || 'Kullanıcı'}
              </h3>
              <p className={`text-${userLevel.color}-600 font-medium ${compact ? 'text-sm' : ''}`}>
                {userLevel.name}
              </p>
            </div>
            
            {!compact && (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {reputation?.total_points || 0}
                </div>
                <div className="text-sm text-gray-500">Toplam Puan</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!compact && nextLevel && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Seviye {userLevel.level}</span>
                <span className="font-medium">
                  {reputation?.total_points || 0} / {nextLevel.minPoints} puan
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ 
                    width: `${Math.min(100, ((reputation?.total_points || 0) / nextLevel.minPoints) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {nextLevel.minPoints - (reputation?.total_points || 0)} puan kaldı: <strong>{nextLevel.name}</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rozetler */}
      {!compact && reputation?.badges && reputation.badges.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">Kazanılan Rozetler</h4>
          <div className="flex flex-wrap gap-2">
            {reputation.badges.slice(0, 6).map((badgeId: string) => {
              const badge = Object.values(GamificationEngine.BADGES).find(b => b.id === badgeId)
              return badge ? (
                <div key={badge.id} className="tooltip" data-tip={badge.name}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300 flex items-center justify-center text-lg">
                    {badge.icon}
                  </div>
                </div>
              ) : null
            })}
            {reputation.badges.length > 6 && (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                +{reputation.badges.length - 6}
              </div>
            )}
          </div>
        </div>
      )}

      {/* İstatistikler (Compact modda gizle) */}
      {!compact && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reputation?.total_sightings || 0}</div>
            <div className="text-sm text-gray-600">Yardım</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{reputation?.total_photos || 0}</div>
            <div className="text-sm text-gray-600">Fotoğraf</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{reputation?.total_rare_finds || 0}</div>
            <div className="text-sm text-gray-600">Nadir Buluş</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{reputation?.daily_streak || 0}</div>
            <div className="text-sm text-gray-600">Gün Streak</div>
          </div>
        </div>
      )}
    </div>
  )
}
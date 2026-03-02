'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Badge {
  type: string
  name: string
  description: string
  icon: string
  condition: string
  earned_at?: string
}

interface UserBadges {
  earned: {
    type: string
    name: string
    description: string
    icon: string
    earned_at: string
  }[]
  available: {
    type: string
    name: string
    description: string
    icon: string
    condition: string
  }[]
}

const BADGE_DEFINITIONS: { [key: string]: Badge } = {
  challenge_master: {
    type: 'challenge_master',
    name: '🏆 Challenge Ustası',
    description: '100 challenge tamamladı',
    icon: '🏆',
    condition: '100 challenge tamamla'
  },
  social_butterfly: {
    type: 'social_butterfly',
    name: '🦋 Sosyal Kelebek',
    description: '50 paylaşım yaptı',
    icon: '🦋',
    condition: '50 sosyal paylaşım yap'
  },
  spot_finder: {
    type: 'spot_finder',
    name: '🎯 Spot Bulucu',
    description: '10 spot buldu',
    icon: '🎯',
    condition: '10 spotu bul'
  },
  streak_7: {
    type: 'streak_7',
    name: '🔥 7 Gün Seri',
    description: '7 gün arka arkaya aktif',
    icon: '🔥',
    condition: '7 gün arka arkaya meşgul ol'
  },
  streak_30: {
    type: 'streak_30',
    name: '⭐ 30 Gün Seri',
    description: '30 gün arka arkaya aktif',
    icon: '⭐',
    condition: '30 gün arka arkaya meşgul ol'
  },
  early_adopter: {
    type: 'early_adopter',
    name: '🚀 Erken Adopter',
    description: 'İlk 1000 kullanıcı arasında',
    icon: '🚀',
    condition: 'İlk kullanıcılar arasında ol'
  },
  shop_owner: {
    type: 'shop_owner',
    name: '🏪 Mağaza Sahibi',
    description: 'Kendi mağazasını kurdu',
    icon: '🏪',
    condition: 'Bir mağaza kur'
  },
  verified: {
    type: 'verified',
    name: '✅ Doğrulanmış',
    description: 'Hesap doğrulandı',
    icon: '✅',
    condition: 'Hesabını doğrula'
  }
}

export default function BadgesPage() {
  const [userBadges, setUserBadges] = useState<UserBadges>({ earned: [], available: [] })
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // Kazanılan rozetler
      const { data: earnedBadgesData } = await supabase
        .from('user_badges')
        .select('badge_type, earned_at')
        .eq('user_id', user.id)

      const earnedBadges = (earnedBadgesData || []).map(b => ({
        type: b.badge_type,
        name: BADGE_DEFINITIONS[b.badge_type]?.name || b.badge_type,
        description: BADGE_DEFINITIONS[b.badge_type]?.description || '',
        icon: BADGE_DEFINITIONS[b.badge_type]?.icon || '🎖️',
        earned_at: b.earned_at
      }))

      // Elde edilebilir rozetler
      const availableBadges = Object.values(BADGE_DEFINITIONS)
        .filter(badge => !earnedBadges.some(e => e.type === badge.type))
        .map(badge => ({
          type: badge.type,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          condition: badge.condition
        }))

      setUserBadges({
        earned: earnedBadges,
        available: availableBadges
      })
    } catch (error) {
      console.error('Rozetler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="h-40 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Başlık */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🎖️ Rozetlerim</h1>
        <p className="text-gray-600">
          Zorlukları tamamlayarak rozetler kazanın ve topluluğta gösterin
        </p>
      </div>

      {/* Kazanılan Rozetler */}
      {userBadges.earned.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Kazanılan Rozetler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userBadges.earned.map(badge => (
              <div
                key={badge.type}
                className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                <div className="text-5xl mb-2">{badge.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-white opacity-90 mb-3">{badge.description}</p>
                <p className="text-xs text-white opacity-75">
                  Kazanıldı: {new Date(badge.earned_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elde Edilebilir Rozetler */}
      {userBadges.available.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔒 Elde Edilebilir Rozetler ({userBadges.available.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userBadges.available.map(badge => (
              <div
                key={badge.type}
                className="bg-gray-100 rounded-xl p-6 text-center opacity-60 hover:opacity-80 transition"
              >
                <div className="text-5xl mb-2 grayscale">{badge.icon}</div>
                <h3 className="font-bold text-gray-700 text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{badge.description}</p>
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-xs text-blue-700 font-medium">{badge.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hiç rozet yoksa */}
      {userBadges.earned.length === 0 && userBadges.available.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎖️</div>
          <p className="text-gray-600 mb-6">Henüz rozetiniz yok</p>
          <Link
            href="/leaderboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Sírala katıl ve rozetler kazan
          </Link>
        </div>
      )}

      {/* İlerleme Tipsinden */}
      {userBadges.available.length > 0 && (
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">💡 Rozet Kazanma İpuçları</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Günlük görevleri tamamlayarak puan ve seri kazanın</li>
            <li>✓ Sosyal paylaşımlar yaparak topluluğa katılın</li>
            <li>✓ Spot'ları bularak keşif görevlerini tamamlayın</li>
            <li>✓ 7+ gün arka arkaya aktif kalarak seri rozeti kazanın</li>
          </ul>
        </div>
      )}
    </div>
  )
}

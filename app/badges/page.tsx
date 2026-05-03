'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const badgesText = {
  tr: { title: '🎖️ Rozetlerim', subtitle: 'Zorlukları tamamlayarak rozetler kazanın ve topluluğta gösterin', earned: '✨ Kazanılan Rozetler', available: (n: number) => `🔒 Elde Edilebilir Rozetler (${n})`, earnedAt: 'Kazanıldı', noTitle: 'Henüz rozetiniz yok', noBtn: 'Listeye katıl ve rozetler kazan', tips: '💡 Rozet Kazanma İpuçları', tipsList: ['Günlük görevleri tamamlayarak puan ve seri kazanın', 'Sosyal paylaşımlar yaparak topluluğa katılın', 'Spot\'ları bularak keşif görevlerini tamamlayın', '7+ gün arka arkaya aktif kalarak seri rozeti kazanın'] },
  en: { title: '🎖️ My Badges', subtitle: 'Complete challenges to earn badges and show them in the community', earned: '✨ Earned Badges', available: (n: number) => `🔒 Available Badges (${n})`, earnedAt: 'Earned', noTitle: 'No badges yet', noBtn: 'Join the leaderboard and earn badges', tips: '💡 Tips to Earn Badges', tipsList: ['Complete daily tasks to earn points and streaks', 'Join the community with social posts', 'Complete discovery missions by finding spots', 'Stay active 7+ days in a row to earn streak badges'] },
  de: { title: '🎖️ Meine Abzeichen', subtitle: 'Schließe Herausforderungen ab, um Abzeichen zu verdienen', earned: '✨ Verdiente Abzeichen', available: (n: number) => `🔒 Verfügbare Abzeichen (${n})`, earnedAt: 'Verdient', noTitle: 'Noch keine Abzeichen', noBtn: 'Rangliste beitreten und Abzeichen verdienen', tips: '💡 Tipps zum Verdienen von Abzeichen', tipsList: ['Tägliche Aufgaben abschließen', 'Mit sozialen Beiträgen der Community beitreten', 'Entdeckungsmissionen durch das Finden von Spots abschließen', '7+ Tage hintereinander aktiv bleiben'] },
  fr: { title: '🎖️ Mes Badges', subtitle: 'Complétez des défis pour gagner des badges et les montrer dans la communauté', earned: '✨ Badges Obtenus', available: (n: number) => `🔒 Badges Disponibles (${n})`, earnedAt: 'Obtenu', noTitle: 'Pas encore de badges', noBtn: 'Rejoindre le classement et gagner des badges', tips: '💡 Conseils pour gagner des badges', tipsList: ['Complétez les tâches quotidiennes', 'Participez à la communauté avec des publications', 'Complétez les missions de découverte', 'Restez actif 7+ jours de suite'] },
  es: { title: '🎖️ Mis Insignias', subtitle: 'Completa desafíos para ganar insignias y mostrarlas en la comunidad', earned: '✨ Insignias Ganadas', available: (n: number) => `🔒 Insignias Disponibles (${n})`, earnedAt: 'Ganada', noTitle: 'Aún no hay insignias', noBtn: 'Únete a la tabla de líderes y gana insignias', tips: '💡 Consejos para ganar insignias', tipsList: ['Completa tareas diarias para ganar puntos', 'Únete a la comunidad con publicaciones sociales', 'Completa misiones de descubrimiento', 'Mantente activo 7+ días seguidos'] },
  ru: { title: '🎖️ Мои Значки', subtitle: 'Выполняйте испытания, чтобы зарабатывать значки и показывать их в сообществе', earned: '✨ Полученные Значки', available: (n: number) => `🔒 Доступные Значки (${n})`, earnedAt: 'Получен', noTitle: 'Значков пока нет', noBtn: 'Присоединяйтесь к рейтингу и зарабатывайте значки', tips: '💡 Советы по получению значков', tipsList: ['Выполняйте ежедневные задания для очков', 'Присоединяйтесь к сообществу через публикации', 'Завершайте миссии открытий', 'Оставайтесь активными 7+ дней подряд'] },
} as const

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
  const locale = useCurrentLocale()
  const t = badgesText[locale as keyof typeof badgesText] ?? badgesText.tr
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
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      {/* Kazanılan Rozetler */}
      {userBadges.earned.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.earned}</h2>
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
                  {t.earnedAt}: {new Date(badge.earned_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'ru' ? 'ru-RU' : 'en-US')}
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
            {t.available(userBadges.available.length)}
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
          <p className="text-gray-600 mb-6">{t.noTitle}</p>
          <Link
            href="/leaderboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {t.noBtn}
          </Link>
        </div>
      )}

      {/* İpuçları */}
      {userBadges.available.length > 0 && (
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">{t.tips}</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {t.tipsList.map((tip, i) => <li key={i}>✓ {tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

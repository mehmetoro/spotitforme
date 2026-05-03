// app/notifications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const notifText = {
  tr: { title: 'Bildirimler', unread: (n: number) => `${n} okunmamış bildirim`, markAll: 'Tümünü Okundu İşaretle', emptyTitle: 'Henüz bildiriminiz yok', emptyDesc: 'Başkalarının gönderilerinize beğeni, yorum yapması için takip etmeye başlayın!', unknownUser: 'Bilinmeyen kullanıcı', msgs: { spot_sighting: 'spotunuz için "Ben Gördüm" bildirimi gönderdi', spot_found: 'spotuna "Ben Gördüm" yazıldı', post_liked: 'gönderinizi beğendi', post_commented: 'gönderinize yorum yaptı', post_shared: 'gönderinizi paylaştı', default: 'Yeni bildirim' }, timeAgo: (m: number, h: number, d: number) => m < 1 ? 'az önce' : m < 60 ? `${m} dakika önce` : h < 24 ? `${h} saat önce` : d < 7 ? `${d} gün önce` : '' },
  en: { title: 'Notifications', unread: (n: number) => `${n} unread notification${n > 1 ? 's' : ''}`, markAll: 'Mark All as Read', emptyTitle: 'No notifications yet', emptyDesc: 'Start following people so they can like and comment on your posts!', unknownUser: 'Unknown user', msgs: { spot_sighting: 'sent a "I Saw It" notification for your spot', spot_found: '"I Saw It" was sent for your spot', post_liked: 'liked your post', post_commented: 'commented on your post', post_shared: 'shared your post', default: 'New notification' }, timeAgo: (m: number, h: number, d: number) => m < 1 ? 'just now' : m < 60 ? `${m} min ago` : h < 24 ? `${h}h ago` : d < 7 ? `${d}d ago` : '' },
  de: { title: 'Benachrichtigungen', unread: (n: number) => `${n} ungelesene Benachrichtigung${n > 1 ? 'en' : ''}`, markAll: 'Alle als gelesen markieren', emptyTitle: 'Noch keine Benachrichtigungen', emptyDesc: 'Folge anderen, damit sie deine Beiträge liken und kommentieren können!', unknownUser: 'Unbekannter Benutzer', msgs: { spot_sighting: 'hat eine "Ich habe es gesehen"-Benachrichtigung für deinen Spot gesendet', spot_found: '"Ich habe es gesehen" wurde für deinen Spot gesendet', post_liked: 'hat deinen Beitrag geliked', post_commented: 'hat deinen Beitrag kommentiert', post_shared: 'hat deinen Beitrag geteilt', default: 'Neue Benachrichtigung' }, timeAgo: (m: number, h: number, d: number) => m < 1 ? 'gerade eben' : m < 60 ? `vor ${m} Min.` : h < 24 ? `vor ${h} Std.` : d < 7 ? `vor ${d} Tagen` : '' },
  fr: { title: 'Notifications', unread: (n: number) => `${n} notification${n > 1 ? 's' : ''} non lue${n > 1 ? 's' : ''}`, markAll: 'Tout marquer comme lu', emptyTitle: 'Pas encore de notifications', emptyDesc: 'Suivez des personnes pour que vos publications reçoivent des likes et des commentaires!', unknownUser: 'Utilisateur inconnu', msgs: { spot_sighting: 'a envoyé une notification "Je l\'ai vu" pour votre spot', spot_found: '"Je l\'ai vu" a été envoyé pour votre spot', post_liked: 'a aimé votre publication', post_commented: 'a commenté votre publication', post_shared: 'a partagé votre publication', default: 'Nouvelle notification' }, timeAgo: (m: number, h: number, d: number) => m < 1 ? 'à l\'instant' : m < 60 ? `il y a ${m} min` : h < 24 ? `il y a ${h}h` : d < 7 ? `il y a ${d}j` : '' },
  es: { title: 'Notificaciones', unread: (n: number) => `${n} notificación${n > 1 ? 'es' : ''} sin leer`, markAll: 'Marcar todo como leído', emptyTitle: 'Aún no hay notificaciones', emptyDesc: '¡Empieza a seguir personas para que puedan dar like y comentar tus publicaciones!', unknownUser: 'Usuario desconocido', msgs: { spot_sighting: 'envió una notificación "Lo vi" para tu spot', spot_found: 'Se envió "Lo vi" para tu spot', post_liked: 'le gustó tu publicación', post_commented: 'comentó tu publicación', post_shared: 'compartió tu publicación', default: 'Nueva notificación' }, timeAgo: (m: number, h: number, d: number) => m < 1 ? 'ahora mismo' : m < 60 ? `hace ${m} min` : h < 24 ? `hace ${h}h` : d < 7 ? `hace ${d}d` : '' },
  ru: { title: 'Уведомления', unread: (n: number) => `${n} непрочитанных уведомлений`, markAll: 'Отметить все как прочитанные', emptyTitle: 'Уведомлений пока нет', emptyDesc: 'Начните подписываться на людей, чтобы они могли лайкать и комментировать ваши публикации!', unknownUser: 'Неизвестный пользователь', msgs: { spot_sighting: 'отправил уведомление "Я видел это" для вашего спота', spot_found: '"Я видел это" было отправлено для вашего спота', post_liked: 'понравилась ваша публикация', post_commented: 'прокомментировал вашу публикацию', post_shared: 'поделился вашей публикацией', default: 'Новое уведомление' }, timeAgo: (m: number, h: number, d: number) => m < 1 ? 'только что' : m < 60 ? `${m} мин. назад` : h < 24 ? `${h} ч. назад` : d < 7 ? `${d} дн. назад` : '' },
} as const

export default function NotificationsPage() {
  const router = useRouter()
  const locale = useCurrentLocale()
  const t = notifText[locale as keyof typeof notifText] ?? notifText.tr
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setCurrentUserId(user.id)
      fetchNotifications(user.id)
    }

    checkAuth()
  }, [router])

  const fetchNotifications = async (userId: string) => {
    try {
      setLoading(true)
      // Bildirim'leri fetch et (actor relationship'i skip et)
      const { data, error } = await supabase
        .from('social_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Notifications loading error:', error)
        setNotifications([])
        return
      }

      // Actor bilgilerini fetch et
      if (data && data.length > 0) {
        const actorIds = Array.from(new Set(data.map(n => n.actor_id).filter((id: string) => id)))
        
        let actors: any[] = []
        if (actorIds.length > 0) {
          const result = await supabase
            .from('user_profiles')
            .select('id, name, avatar_url')
            .in('id', actorIds)
          actors = result.data || []
        }
        
        const actorMap = actors?.reduce((acc: any, a: any) => ({ ...acc, [a.id]: a }), {}) || {}
        
        const enrichedData = data.map(notif => ({
          ...notif,
          actor: actorMap[notif.actor_id] || null
        }))
        
        setNotifications(enrichedData)
      } else {
        setNotifications([])
      }
    } catch (err: any) {
      console.error('Notifications loading error:', err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('social_notifications')
        .update({ read: true })
        .eq('id', notificationId)

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return
    try {
      await supabase
        .from('social_notifications')
        .update({ read: true })
        .eq('user_id', currentUserId)
        .eq('read', false)

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const getNotificationMessage = (notif: any) => {
    switch (notif.type) {
      case 'spot_sighting': return t.msgs.spot_sighting
      case 'spot_found': return t.msgs.spot_found
      case 'post_liked': return t.msgs.post_liked
      case 'post_commented': return t.msgs.post_commented
      case 'post_shared': return t.msgs.post_shared
      default: return notif.message || t.msgs.default
    }
  }

  const getNotificationUrl = (notif: any) => {
    console.log('📌 Notification:', notif)
    console.log('📌 post_id:', notif.post_id)
    
    if (typeof notif.post_id === 'string') {
      if (notif.post_id.startsWith('sighting-')) {
        const url = `/sightings/${notif.post_id.replace('sighting-', '')}`
        console.log('✅ Sighting URL:', url)
        return url
      }
      if (notif.post_id.startsWith('spot-')) {
        const url = `/spots/${notif.post_id.replace('spot-', '')}`
        console.log('✅ Spot URL:', url)
        return url
      }
      if (notif.post_id.startsWith('shop-')) {
        const url = `/shop/${notif.post_id.replace('shop-', '')}`
        console.log('✅ Shop URL:', url)
        return url
      }
    }
    console.log('⚠️ Default social URL:', `/social/${notif.post_id}`)
    return `/social/${notif.post_id}`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t.timeAgo(0, 0, 0)
    if (minutes < 60) return t.timeAgo(minutes, 0, 0)
    if (hours < 24) return t.timeAgo(0, hours, 0)
    if (days < 7) return t.timeAgo(0, 0, days)
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'ru' ? 'ru-RU' : 'en-US')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <main className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">
                {t.unread(unreadCount)}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {t.markAll}
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t.emptyTitle}
            </h2>
            <p className="text-gray-600">
              {t.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                href={getNotificationUrl(notif)}
                className={`block p-4 rounded-lg border transition ${
                  notif.read
                    ? 'bg-white border-gray-200 hover:bg-gray-50'
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {notif.actor?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {notif.actor?.name || t.unknownUser}{' '}
                      <span className="font-normal text-gray-700">
                        {getNotificationMessage(notif)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(notif.created_at)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

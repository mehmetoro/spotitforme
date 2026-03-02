// app/notifications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function NotificationsPage() {
  const router = useRouter()
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
      const { data, error } = await supabase
        .from('social_notifications')
        .select('*, actor:actor_id(id, name, avatar_url)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error && error.code !== 'PGRST116') throw error

      setNotifications(data || [])
    } catch (err: any) {
      console.error('Notifications loading error:', err)
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
      case 'spot_found':
        return 'spotuna "Ben Gördüm" yazıldı'
      case 'post_liked':
        return 'gönderinizi beğendi'
      case 'post_commented':
        return 'gönderinize yorum yaptı'
      case 'post_shared':
        return 'gönderinizi paylaştı'
      default:
        return notif.message || 'Yeni bildirim'
    }
  }

  const getNotificationUrl = (notif: any) => {
    if (notif.post_id?.startsWith('shop-')) {
      return `/shop/${notif.post_id.replace('shop-', '')}`
    }
    return `/social/${notif.post_id}`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'az önce'
    if (minutes < 60) return `${minutes} dakika önce`
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Bildirimler</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">
                {unreadCount} okunmamış bildirim
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Henüz bildiriminiz yok
            </h2>
            <p className="text-gray-600">
              Başkalarının gönderilerinize beğeni, yorum yapması ve daha fazlası
              için takip etmeye başlayın!
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
                      {notif.actor?.name || 'Bilinmeyen kullanıcı'}{' '}
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
    </div>
  )
}

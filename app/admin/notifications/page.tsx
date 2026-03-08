// app/admin/notifications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  created_at: string
  is_read: boolean
}

export default function AdminNotificationsPage() {
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    readCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all')
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    userIds: '',
  })

  useEffect(() => {
    fetchNotificationStats()
  }, [])

  const fetchNotificationStats = async () => {
    try {
      const [totalCount, unreadCount] = await Promise.all([
        supabase.from('notifications').select('count', { count: 'exact', head: true }),
        supabase.from('notifications').select('count', { count: 'exact', head: true }).eq('is_read', false),
      ])

      setStats({
        totalNotifications: totalCount.count || 0,
        unreadCount: unreadCount.count || 0,
        readCount: (totalCount.count || 0) - (unreadCount.count || 0),
      })
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!notification.title || !notification.message) {
      alert('Lütfen tüm alanları doldurun')
      return
    }

    try {
      if (recipientType === 'all') {
        // Tüm kullanıcılara gönder
        const { data: users } = await supabase
          .from('user_profiles')
          .select('id')

        if (!users) throw new Error('Kullanıcılar bulunamadı')

        const notifications = users.map(user => ({
          user_id: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false,
        }))

        const { error } = await supabase
          .from('notifications')
          .insert(notifications)

        if (error) throw error

        alert(`${users.length} kullanıcıya bildirim gönderildi`)
      } else {
        // Belirli kullanıcılara gönder
        const userIds = notification.userIds.split(',').map(id => id.trim())
        
        const notifications = userIds.map(userId => ({
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false,
        }))

        const { error } = await supabase
          .from('notifications')
          .insert(notifications)

        if (error) throw error

        alert(`${userIds.length} kullanıcıya bildirim gönderildi`)
      }

      setNotification({ title: '', message: '', type: 'info', userIds: '' })
      fetchNotificationStats()
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error)
      alert('Bir hata oluştu')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bildirim Yönetimi</h1>
        <p className="text-gray-600">Kullanıcılara bildirim gönderin ve yönetin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Bildirim</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalNotifications}</p>
            </div>
            <div className="text-4xl">🔔</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Okunmamış</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.unreadCount}</p>
            </div>
            <div className="text-4xl">📬</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Okunmuş</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.readCount}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* Bildirim Gönderme Formu */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Yeni Bildirim Gönder</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alıcılar</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={recipientType === 'all'}
                  onChange={(e) => setRecipientType(e.target.value as 'all')}
                  className="mr-2"
                />
                Tüm Kullanıcılar
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="specific"
                  checked={recipientType === 'specific'}
                  onChange={(e) => setRecipientType(e.target.value as 'specific')}
                  className="mr-2"
                />
                Belirli Kullanıcılar
              </label>
            </div>
          </div>

          {recipientType === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı ID'leri (virgülle ayırarak)
              </label>
              <input
                type="text"
                value={notification.userIds}
                onChange={(e) => setNotification({ ...notification, userIds: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="user_id_1, user_id_2, user_id_3"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bildirim Tipi</label>
            <select
              value={notification.type}
              onChange={(e) => setNotification({ ...notification, type: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="info">Bilgi</option>
              <option value="success">Başarılı</option>
              <option value="warning">Uyarı</option>
              <option value="error">Hata</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
            <input
              type="text"
              value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Bildirim başlığı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
            <textarea
              value={notification.message}
              onChange={(e) => setNotification({ ...notification, message: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 min-h-[100px]"
              placeholder="Bildirim mesajı"
            />
          </div>

          <button
            onClick={sendNotification}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Bildirim Gönder
          </button>
        </div>
      </div>
    </div>
  )
}

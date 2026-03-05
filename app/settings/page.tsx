'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  publicProfile: boolean
  showActivity: boolean
  allowMessages: boolean
  newsletter: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    showActivity: true,
    allowMessages: true,
    newsletter: true
  })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/')
      return
    }

    setUser(authUser)
    loadSettings(authUser.id)
  }

  const loadSettings = async (userId: string) => {
    try {
      // User metadata'sından ayarları kontrol et
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata) {
        setSettings(prev => ({
          ...prev,
          ...user.user_metadata.settings
        }))
      }
    } catch (error) {
      console.error('Ayarlar ylenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof UserSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setSaved(false)
  }

  const handleSaveSettings = async () => {
    try {
      if (!user) return

      // Ayarları user metadata'sına kaydet
      const { error } = await supabase.auth.updateUser({
        data: {
          settings
        }
      })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error)
    }
  }

  const handleChangePassword = async () => {
    const newPassword = prompt('Lütfen yeni şifreni gir (en az 8 karakter):')
    if (!newPassword || newPassword.length < 8) {
      alert('Şifre en az 8 karakter olmalıdır')
      return
    }

    try {
      // Supabase Admin API aracılığıyla doğrudan şifre güncelle
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          newPassword 
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Şifre değişikliği başarısız')
      }

      alert('✅ Şifreni başarıyla değiştirdim')
    } catch (error: any) {
      console.error('Şifre değişikliği hatası:', error)
      alert(`❌ Hata: ${error.message}`)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Hesabını silmek istediğine emin misin? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      // Hesap silme - admin API gerekli
      alert('Hesap silme işlemi için destek ekibine başvur')
    } catch (error) {
      console.error('Hesap silme hatası:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Ayarlar</h1>
        <p className="text-gray-600 mt-2">Hesep ve gizlilik ayarlarını yönetin</p>
      </div>

      {/* Kaydedildi Mesajı */}
      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ Ayarlarınız kaydedildi
        </div>
      )}

      {/* Bildirim Ayarları */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">🔔 Bildirim Ayarları</h2>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
              <p className="text-sm text-gray-600">Beğeni, yorum ve önemli güncelleme e-postaları</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Push Bildirimleri</p>
              <p className="text-sm text-gray-600">Tarayıcı push bildirimleri</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Newsletter */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Bültene Abone Ol</p>
              <p className="text-sm text-gray-600">Haftalık haberler ve ipuçları</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.newsletter}
                onChange={() => handleToggle('newsletter')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Gizlilik Ayarları */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">🔒 Gizlilik Ayarları</h2>

        <div className="space-y-4">
          {/* Public Profile */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Genel Profil</p>
              <p className="text-sm text-gray-600">Diğer kullanıcılar seni bulabilir</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.publicProfile}
                onChange={() => handleToggle('publicProfile')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Activity */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Aktiviteyi Göster</p>
              <p className="text-sm text-gray-600">Paylaşımlarını ve aktiviteni herkese göster</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showActivity}
                onChange={() => handleToggle('showActivity')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Allow Messages */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Mesaj Al</p>
              <p className="text-sm text-gray-600">Diğer kullanıcılardan özel mesaj al</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowMessages}
                onChange={() => handleToggle('allowMessages')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Güvenlik Ayarları */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">🔐 Güvenlik Ayarları</h2>

        <div className="space-y-3">
          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            🔑 Şifreyi Değiştir
          </button>
          <p className="text-sm text-gray-600">
            Hesabını korumak için düzenli olarak şifreni değiştir.
          </p>
        </div>
      </div>

      {/* Tehlikeli İşlemler */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-red-900 mb-6">⚠️ Tehlikeli İşlemler</h2>

        <button
          onClick={handleDeleteAccount}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition"
        >
          🗑️ Hesabı Sil
        </button>
        <p className="text-sm text-red-700 mt-3">
          Hesabın kalıcı olarak silinecek. Verilerin kurtarılamayacak.
        </p>
      </div>

      {/* Kaydet Butonu */}
      <button
        onClick={handleSaveSettings}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        ✅ Ayarları Kaydet
      </button>
    </div>
  )
}

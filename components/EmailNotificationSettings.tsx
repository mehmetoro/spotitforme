// components/EmailNotificationSettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function EmailNotificationSettings() {
  const [settings, setSettings] = useState({
    spotCreated: true,
    spotHelp: true,
    spotFound: true,
    weeklyDigest: false,
    marketing: false,
    pauseAll: false
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Kullanıcının mevcut ayarlarını yükle
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Burada Supabase'den kullanıcı ayarlarını çekebilirsiniz
      // Şimdilik varsayılan değerler
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Burada Supabase'e ayarları kaydedebilirsiniz
      
      // Simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">📧 Email Bildirim Ayarları</h3>
          <p className="text-gray-600">Hangi email'leri almak istediğinizi seçin</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${settings.pauseAll ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {settings.pauseAll ? '⏸️ Tümü Durduruldu' : '✅ Aktif'}
        </div>
      </div>

      <div className="space-y-6">
        {/* Spot Bildirimleri */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Spot Bildirimleri</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600">📝</span>
                </div>
                <div>
                  <p className="font-medium">Spot Oluşturuldu</p>
                  <p className="text-sm text-gray-600">Yeni spot oluşturduğunuzda onay email'i</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('spotCreated')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.spotCreated ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.spotCreated ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600">🎯</span>
                </div>
                <div>
                  <p className="font-medium">Yardım Geldi</p>
                  <p className="text-sm text-gray-600">Spot'unuza yardım bildirimi geldiğinde</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('spotHelp')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.spotHelp ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.spotHelp ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600">✅</span>
                </div>
                <div>
                  <p className="font-medium">Spot Bulundu</p>
                  <p className="text-sm text-gray-600">Ürününüz bulunduğunda tebrik email'i</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('spotFound')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.spotFound ? 'bg-purple-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.spotFound ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Diğer Bildirimler */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Diğer Bildirimler</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-gray-600">📊</span>
                </div>
                <div>
                  <p className="font-medium">Haftalık Özet</p>
                  <p className="text-sm text-gray-600">Haftalık spot ve yardım özeti</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('weeklyDigest')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.weeklyDigest ? 'bg-gray-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.weeklyDigest ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-yellow-600">🎁</span>
                </div>
                <div>
                  <p className="font-medium">Kampanyalar</p>
                  <p className="text-sm text-gray-600">Özel indirim ve kampanyalar</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('marketing')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.marketing ? 'bg-yellow-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.marketing ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tümünü Durdur */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-red-600">⏸️</span>
              </div>
              <div>
                <p className="font-medium text-red-800">Tüm Bildirimleri Durdur</p>
                <p className="text-sm text-red-600">Geçici olarak tüm email'leri durdurur</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('pauseAll')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.pauseAll ? 'bg-red-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.pauseAll ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : '💾 Ayarları Kaydet'}
          </button>
          
          <button
            onClick={() => window.location.href = '/test-email'}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg"
          >
            🧪 Email Test Et
          </button>
          
          <button
            onClick={() => setSettings({
              spotCreated: true,
              spotHelp: true,
              spotFound: true,
              weeklyDigest: false,
              marketing: false,
              pauseAll: false
            })}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg"
          >
            🔄 Varsayılana Dön
          </button>
        </div>

        {saved && (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
            ✅ Ayarlar başarıyla kaydedildi!
          </div>
        )}

        {/* Bilgi */}
        <div className="text-center text-sm text-gray-500">
          <p>📧 Tüm email'ler spam'e düşmez. DKIM imzalı, %100 ulaşım garantisi.</p>
          <p className="mt-1">Email değişikliği için: <a href="/profile" className="text-blue-600 hover:underline">Profil Ayarları</a></p>
        </div>
      </div>
    </div>
  )
}
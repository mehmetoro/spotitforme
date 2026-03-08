// app/admin/settings/page.tsx
'use client'

import { useState } from 'react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'SpotItForMe',
    siteDescription: 'Keşfet, Paylaş, Kazan',
    contactEmail: 'support@spotitforme.com',
    maintenanceMode: false,
    registrationEnabled: true,
    verificationRequired: false,
    maxUploadSize: '10',
    defaultLanguage: 'tr',
    timezone: 'Europe/Istanbul',
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Ayarları kaydet
    console.log('Saving settings:', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
        <p className="text-gray-600">Platform ayarlarını yapılandırın</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✅ Ayarlar başarıyla kaydedildi
        </div>
      )}

      {/* Genel Ayarlar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Genel Ayarlar</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Adı</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Açıklaması</label>
            <input
              type="text"
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İletişim E-postası</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Dil</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zaman Dilimi</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Güvenlik Ayarları */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Güvenlik & Kullanıcı Ayarları</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Bakım Modu</p>
              <p className="text-sm text-gray-600">Site ziyaretçilere kapatılır, sadece adminler erişebilir</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Yeni Kayıt</p>
              <p className="text-sm text-gray-600">Yeni kullanıcı kaydına izin ver</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">E-posta Doğrulama</p>
              <p className="text-sm text-gray-600">Kayıt sırasında e-posta doğrulama zorunlu olsun</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.verificationRequired}
                onChange={(e) => setSettings({ ...settings, verificationRequired: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Dosya Yükleme Ayarları */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Dosya Yükleme</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maksimum Dosya Boyutu (MB)
            </label>
            <input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              min="1"
              max="100"
            />
            <p className="text-sm text-gray-600 mt-1">
              Kullanıcıların yükleyebileceği maksimum dosya boyutu
            </p>
          </div>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Ayarları Kaydet
        </button>
      </div>
    </div>
  )
}

// app/admin/adsense/page.tsx - DÜZELTMİŞ VERSİYON
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdUnitManager from '@/components/admin/AdUnitManager'
import AdPerformance from '@/components/admin/AdPerformance'
import Link from 'next/link'

// AdUnit tipi
interface AdUnit {
  id: string
  name: string
  type: 'display' | 'in-article' | 'in-feed'
  size: string
  position: string
  status: 'active' | 'paused'
  revenue: number
}

// AdSense Config tipi
interface AdSenseConfig {
  clientId: string
  isActive: boolean
  autoAds: boolean
  adUnits: AdUnit[]
  lastSync?: string
}

export default function AdSensePage() {
  const [config, setConfig] = useState<AdSenseConfig>({
    clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
    isActive: false,
    autoAds: true,
    adUnits: [
      {
        id: 'ad-header-001',
        name: 'Header Banner',
        type: 'display',
        size: '728x90',
        position: 'header',
        status: 'active',
        revenue: 45.50
      },
      {
        id: 'ad-sidebar-001',
        name: 'Sidebar Rectangle',
        type: 'display',
        size: '300x250',
        position: 'sidebar',
        status: 'active',
        revenue: 32.75
      },
      {
        id: 'ad-article-001',
        name: 'Article Inline',
        type: 'in-article',
        size: '336x280',
        position: 'content-middle',
        status: 'paused',
        revenue: 18.20
      }
    ]
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // DÜZELTME: 'code' tab'ını da ekle
  const [activeTab, setActiveTab] = useState<'settings' | 'units' | 'performance' | 'code'>('settings')

  useEffect(() => {
    fetchAdSenseConfig()
  }, [])

  const fetchAdSenseConfig = async () => {
    try {
      setLoading(true)
      
      // Database'den config'i çek
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'adsense_config')
        .single()

      if (data && data.value) {
        const savedConfig = JSON.parse(data.value)
        setConfig(prev => ({
          ...prev,
          ...savedConfig,
          // Database'de yoksa varsayılan değerleri koru
          clientId: savedConfig.clientId || prev.clientId,
          isActive: savedConfig.isActive !== undefined ? savedConfig.isActive : prev.isActive,
          autoAds: savedConfig.autoAds !== undefined ? savedConfig.autoAds : prev.autoAds,
          adUnits: savedConfig.adUnits || prev.adUnits,
          lastSync: savedConfig.lastSync
        }))
      }
    } catch (error) {
      console.error('AdSense config yüklenemedi:', error)
      // Hata durumunda varsayılan config ile devam et
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const configToSave = {
        ...config,
        lastSync: new Date().toISOString()
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'adsense_config',
          value: JSON.stringify(configToSave),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (error) throw error

      // Admin log'a kaydet
      await supabase
        .from('admin_logs')
        .insert({
          action: 'adsense_config_updated',
          details: { 
            config: configToSave,
            timestamp: new Date().toISOString()
          }
        })

      alert('✅ AdSense ayarları başarıyla kaydedildi!')
      
    } catch (error) {
      console.error('AdSense config kaydedilemedi:', error)
      alert('❌ Kayıt sırasında hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  const handleAdUnitsUpdate = (updatedUnits: AdUnit[]) => {
    setConfig(prev => ({
      ...prev,
      adUnits: updatedUnits
    }))
  }

  const generateAdCode = (type: 'header' | 'auto' | 'unit') => {
    switch (type) {
      case 'header':
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}"></script>`
      
      case 'auto':
        return `<script>
  (adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "${config.clientId}",
    enable_page_level_ads: true,
    overlays: {bottom: true}
  });
</script>`
      
      case 'unit':
        return `<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="${config.clientId}"
  data-ad-slot="1234567890"
  data-ad-format="auto"
  data-full-width-responsive="true"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
      
      default:
        return ''
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Kopyalandı!')
  }

  const testAdSense = async () => {
    if (!config.clientId) {
      alert('Önce AdSense Client ID girin')
      return
    }

    try {
      const response = await fetch('/api/adsense/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: config.clientId })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('✅ AdSense bağlantısı başarılı!')
      } else {
        alert('❌ AdSense bağlantısı başarısız: ' + data.message)
      }
    } catch (error) {
      alert('❌ Test sırasında hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">AdSense ayarları yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Navigasyon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google AdSense Yönetimi</h1>
          <p className="text-gray-600">Reklam ayarlarınızı buradan yönetin ve takip edin</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={testAdSense}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            🔗 Bağlantıyı Test Et
          </button>
          <Link
            href="https://adsense.google.com"
            target="_blank"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center"
          >
            🌐 AdSense'e Git
          </Link>
        </div>
      </div>

      {/* Durum Göstergesi */}
      <div className={`p-4 rounded-lg ${config.isActive ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${config.isActive ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <div>
              <p className="font-medium">
                AdSense {config.isActive ? 'Aktif' : 'Devre Dışı'}
              </p>
              <p className="text-sm text-gray-600">
                {config.isActive 
                  ? 'Reklamlar sitenizde gösteriliyor' 
                  : 'Reklamlar şu anda gösterilmiyor'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfig({...config, isActive: !config.isActive})}
            className={`px-4 py-2 rounded-lg font-medium ${
              config.isActive
                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                : 'bg-green-100 hover:bg-green-200 text-green-700'
            }`}
          >
            {config.isActive ? 'Reklamları Durdur' : 'Reklamları Başlat'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { id: 'settings' as const, name: 'Temel Ayarlar', icon: '⚙️' },
              { id: 'units' as const, name: 'Reklam Üniteleri', icon: '📺' },
              { id: 'performance' as const, name: 'Performans', icon: '📊' },
              { id: 'code' as const, name: 'Kodlar', icon: '💻' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-center font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* AYARLAR TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">AdSense Kimlik Bilgileri</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AdSense Client ID *
                    </label>
                    <input
                      type="text"
                      value={config.clientId}
                      onChange={(e) => setConfig({...config, clientId: e.target.value})}
                      placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Google AdSense hesabınızdaki Publisher ID
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Reklam Ayarları</h3>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.autoAds}
                          onChange={(e) => setConfig({...config, autoAds: e.target.checked})}
                          className="w-4 h-4 text-blue-600"
                          id="autoAds"
                        />
                        <label htmlFor="autoAds" className="text-sm font-medium text-gray-700">
                          Otomatik Reklamlar
                        </label>
                        <span className="text-xs text-gray-500">
                          (Google en iyi yerlere reklam yerleştirir)
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.isActive}
                          onChange={(e) => setConfig({...config, isActive: e.target.checked})}
                          className="w-4 h-4 text-blue-600"
                          id="isActive"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                          Reklamları Aktif Et
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Gelişmiş Ayarlar</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GDPR Uyumluluğu
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                          <option>Kullanıcı onayı iste</option>
                          <option>Otomatik kabul et</option>
                          <option>Sadece AB dışı</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reklam Frekansı
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                          <option>Normal</option>
                          <option>Düşük (daha az reklam)</option>
                          <option>Yüksek (maksimum gelir)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kaydet Butonu */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={saveConfig}
                  disabled={saving || !config.clientId}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </button>
              </div>
            </div>
          )}

          {/* REKLAM ÜNİTELERİ TAB */}
          {activeTab === 'units' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Reklam Ünite Yönetimi</h2>
                <p className="text-gray-600">
                  Reklam ünitelerinizi ekleyin, düzenleyin ve yönetin
                </p>
              </div>
              
              <AdUnitManager 
                adUnits={config.adUnits}
                onUpdate={handleAdUnitsUpdate}
                clientId={config.clientId}
              />
              
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">💡 İpuçları</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "Display" reklamlar genel amaçlıdır, her yerde kullanılabilir</li>
                  <li>• "In-article" reklamlar makale içeriğine göre optimize edilir</li>
                  <li>• "In-feed" reklamlar haber akışına entegre olur</li>
                  <li>• 300x250 boyutu (Medium Rectangle) en yüksek tıklama oranına sahiptir</li>
                </ul>
              </div>
            </div>
          )}

          {/* PERFORMANS TAB */}
          {activeTab === 'performance' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Reklam Performansı</h2>
                <p className="text-gray-600">
                  Reklamlarınızın performansını takip edin ve optimize edin
                </p>
              </div>
              
              <AdPerformance />
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">📈 Performans İpuçları</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• CTR %1'in altındaysa reklam pozisyonunu değiştirin</li>
                    <li>• RPM ₺5'in altındaysa reklam formatını gözden geçirin</li>
                    <li>• Mobile trafik genellikle daha yüksek tıklama oranına sahiptir</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">🎯 Optimizasyon</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• En çok tıklanan reklam boyutu: 300x250</li>
                    <li>• En yüksek RPM: 970x250 (Leaderboard)</li>
                    <li>• En iyi pozisyon: İçerik sonu</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">⚠️ Dikkat Edilecekler</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Sayfa başına 3'ten fazla reklam koymayın</li>
                    <li>• Pop-up reklamlar kullanıcı deneyimini bozar</li>
                    <li>• Reklam ile içerik oranı %30'u geçmemeli</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* KODLAR TAB - HATA DÜZELTİLDİ */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">AdSense Kodları</h2>
                <p className="text-gray-600 mb-6">
                  Aşağıdaki kodları ilgili yerlere ekleyerek AdSense'i aktif edin
                </p>
              </div>

              {/* Head Script */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">Head Script</h3>
                    <p className="text-gray-400 text-sm">HTML &lt;head&gt; tag'i içine ekleyin</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateAdCode('header'))}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Kopyala
                  </button>
                </div>
                <pre className="p-4 text-gray-300 text-sm overflow-x-auto">
                  {generateAdCode('header')}
                </pre>
              </div>

              {/* Auto Ads Script */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">Auto Ads Script</h3>
                    <p className="text-gray-400 text-sm">&lt;body&gt; tag'inin hemen altına ekleyin</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateAdCode('auto'))}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Kopyala
                  </button>
                </div>
                <pre className="p-4 text-gray-300 text-sm overflow-x-auto">
                  {generateAdCode('auto')}
                </pre>
              </div>

              {/* Manual Ad Unit */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">Manual Ad Unit</h3>
                    <p className="text-gray-400 text-sm">İçerik içinde kullanmak için</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateAdCode('unit'))}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Kopyala
                  </button>
                </div>
                <pre className="p-4 text-gray-300 text-sm overflow-x-auto">
                  {generateAdCode('unit')}
                </pre>
              </div>

              {/* Kurulum Talimatları */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-3">📋 Kurulum Talimatları</h3>
                <ol className="space-y-3 text-blue-800">
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">1</span>
                    <span>Yukarıdaki "Head Script" kodunu <code className="bg-white px-2 py-1 rounded">app/layout.tsx</code> dosyasındaki &lt;head&gt; içine ekleyin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">2</span>
                    <span>"Auto Ads Script" kodunu &lt;body&gt; tag'inin hemen altına ekleyin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">3</span>
                    <span>Manual ad unit kodunu istediğiniz sayfalara ekleyin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">4</span>
                    <span>Google AdSense'den siteyi doğrulayın (24-48 saat sürebilir)</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hızlı İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Aktif Reklam</p>
          <p className="text-2xl font-bold text-gray-900">
            {config.adUnits.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Toplam Gelir</p>
          <p className="text-2xl font-bold text-gray-900">
            {config.adUnits.reduce((sum, unit) => sum + unit.revenue, 0).toFixed(2)} ₺
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Ort. RPM</p>
          <p className="text-2xl font-bold text-gray-900">
            {(config.adUnits.reduce((sum, unit) => sum + unit.revenue, 0) / config.adUnits.length || 0).toFixed(2)} ₺
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Durum</p>
          <p className={`text-2xl font-bold ${config.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {config.isActive ? 'Aktif' : 'Pasif'}
          </p>
        </div>
      </div>

      {/* Son Güncelleme */}
      {config.lastSync && (
        <div className="text-center text-sm text-gray-500">
          Son güncelleme: {new Date(config.lastSync).toLocaleString('tr-TR')}
        </div>
      )}
    </div>
  )
}
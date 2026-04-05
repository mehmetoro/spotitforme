// app/test-geolocation/page.tsx - EN BASİT TEST
'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TestGeolocationPage() {
  const [status, setStatus] = useState('Teste hazır')
  const [permissionState, setPermissionState] = useState('unknown')
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)
  const [browserInfo, setBrowserInfo] = useState('')

  // 1. ADIM: Tarayıcı desteği kontrolü
  const checkBrowserSupport = () => {
    setBrowserInfo(navigator.userAgent)
    
    if (!navigator.geolocation) {
      setStatus('❌ Tarayıcınız konum servisini DESTEKLEMİYOR')
      return false
    }
    
    setStatus('✅ Tarayıcı konum servisini destekliyor')
    return true
  }

  // 2. ADIM: İzin durumu kontrolü
  const checkPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        setPermissionState(permission.state)
        
        permission.onchange = () => {
          setPermissionState(permission.state)
          setStatus(`İzin durumu değişti: ${permission.state}`)
        }
        
        setStatus(`İzin durumu: ${permission.state}`)
        return permission.state
      } catch (err) {
        setStatus(`İzin sorgulama hatası: ${err}`)
        return 'error'
      }
    } else {
      setStatus('⚠️ Tarayıcı izin API"sini desteklemiyor')
      return 'not_supported'
    }
  }

  // 3. ADIM: Konum alma (SADECE BU KISIM İZİN İSTER!)
  const getLocation = () => {
    setStatus('⏳ Konum isteniyor... (Tarayıcı izin isteyecek)')
    
    // BU FONKSİYON TARAYICIDAN İZİN İSTER!
    navigator.geolocation.getCurrentPosition(
      // Başarılı
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        setStatus(`✅ Konum alındı! Doğruluk: ${accuracy}m`)
        setPermissionState('granted')
      },
      // Hata
      (error) => {
        let errorMessage = ''
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '❌ Kullanıcı konum iznini REDDETTİ'
            setPermissionState('denied')
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '❌ Konum bilgisi ULAŞILAMIYOR'
            break
          case error.TIMEOUT:
            errorMessage = '⏱️ Konum alımı ZAMAN AŞIMINA uğradı'
            break
          default:
            errorMessage = `❌ Bilinmeyen hata: ${error.message}`
        }
        setStatus(errorMessage)
      },
      // Seçenekler
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // 4. ADIM: Tüm testleri çalıştır
  const runAllTests = () => {
    setStatus('Testler başlıyor...')
    setCoords(null)
    
    if (checkBrowserSupport()) {
      setTimeout(() => {
        checkPermission().then(() => {
          setTimeout(() => {
            getLocation()
          }, 1000)
        })
      }, 500)
    }
  }

  // 5. ADIM: İzin sıfırlama (geliştirici için)
  const resetPermissions = () => {
    if ('permissions' in navigator) {
      // Not: Bu sadece geliştirici modunda çalışır
      setStatus('İzin durumu sıfırlanıyor... sayfayı yenileyin')
      setPermissionState('prompt')
      setCoords(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            Konum İzin Testi
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Nerede takıldığımızı görelim
          </p>

          {/* TEST KONTROL PANELİ */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={checkBrowserSupport}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                1. Tarayıcı Desteği
              </button>
              <button
                onClick={checkPermission}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
              >
                2. İzin Durumu
              </button>
              <button
                onClick={getLocation}
                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
              >
                3. Konum Al (İZİN İSTER!)
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={runAllTests}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg mb-4"
              >
                TÜM TESTLERİ ÇALIŞTIR
              </button>
              <p className="text-sm text-gray-600">
                Bu buton tüm testleri sırayla çalıştırır
              </p>
            </div>
          </div>

          {/* SONUÇLAR */}
          <div className="space-y-6">
            {/* DURUM */}
            <div className={`p-6 rounded-xl ${
              status.includes('✅') ? 'bg-green-50 border border-green-200' :
              status.includes('❌') ? 'bg-red-50 border border-red-200' :
              status.includes('⚠️') ? 'bg-yellow-50 border border-yellow-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <h3 className="font-bold text-gray-900 mb-2">Durum</h3>
              <p className={`
                ${status.includes('✅') ? 'text-green-800' : ''}
                ${status.includes('❌') ? 'text-red-800' : ''}
                ${status.includes('⚠️') ? 'text-yellow-800' : ''}
                ${status.includes('⏳') ? 'text-blue-800' : ''}
              `}>
                {status}
              </p>
            </div>

            {/* İZİN DURUMU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">İzin Durumu</h3>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  permissionState === 'granted' ? 'bg-green-100 text-green-800' :
                  permissionState === 'denied' ? 'bg-red-100 text-red-800' :
                  permissionState === 'prompt' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {permissionState === 'granted' && '✅ İZİN VERİLDİ'}
                  {permissionState === 'denied' && '❌ İZİN REDDEDİLDİ'}
                  {permissionState === 'prompt' && '📍 İZİN BEKLENİYOR'}
                  {permissionState === 'unknown' && '❓ BİLİNMİYOR'}
                </div>
                
                {permissionState === 'denied' && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      İzin verilmedi. Tarayıcı ayarlarından şu site için konum izni açın:
                    </p>
                    <p className="font-mono text-xs mt-1">spotitforme.vercel.app</p>
                  </div>
                )}
              </div>

              {/* KOORDİNATLAR */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">Koordinatlar</h3>
                {coords ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Enlem</p>
                      <p className="font-mono">{coords.lat}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Boylam</p>
                      <p className="font-mono">{coords.lng}</p>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                      target="_blank"
                      rel="nofollow ugc noopener noreferrer"
                      className="inline-block text-blue-600 hover:text-blue-800"
                    >
                      Haritada göster →
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">Henüz koordinat alınmadı</p>
                )}
              </div>
            </div>

            {/* TARAYICI BİLGİSİ */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tarayıcı Bilgisi</h3>
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-gray-700">
                  {browserInfo || 'Tarayıcı bilgisi henüz alınmadı'}
                </code>
              </div>
            </div>

            {/* TELEFON TESTİ TALİMATLARI */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-bold text-yellow-800 mb-4">📱 Telefon Testi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Adım 1: Telefon Ayarları</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Ayarlar → Konum → Açık</li>
                    <li>• Tarayıcı için konum izni ver</li>
                    <li>• GPS/Hızlı konum açık olsun</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Adım 2: Tarayıcı İzni</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• "3. Konum Al" butonuna tıkla</li>
                    <li>• Ekran üstünde izin isteği çıkacak</li>
                    <li>• "İzin Ver" veya "Allow" seç</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HATA AYIKLAMA */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">🔧 Hata Ayıklama</h3>
              
              <div className="space-y-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-lg">
                    <span className="font-medium">Sık Karşılaşılan Sorunlar</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="mt-3 space-y-3 p-3 bg-white rounded-lg">
                    <div>
                      <h5 className="font-medium text-red-600 mb-1">1. HTTPS Gerekli</h5>
                      <p className="text-sm text-gray-600">
                        Telefonlarda konum servisi sadece HTTPS sitelerde çalışır.
                        Vercel'de HTTPS otomatik.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-600 mb-1">2. Tarayıcı Engel</h5>
                      <p className="text-sm text-gray-600">
                        Safari'de bazı güvenlik kısıtlamaları olabilir.
                        Chrome veya Firefox kullanın.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-600 mb-1">3. İzin Önbelleği</h5>
                      <p className="text-sm text-gray-600">
                        Daha önce izin reddedilmişse tarayıcı tekrar sormaz.
                        Ayarlardan izni sıfırlayın.
                      </p>
                    </div>
                  </div>
                </details>

                <button
                  onClick={resetPermissions}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg"
                >
                  İzin Durumunu Sıfırla (Sayfayı Yenileyin)
                </button>
              </div>
            </div>

            {/* VERCEL LINK */}
            <div className="text-center">
              <a
                href="https://spotitforme.vercel.app/test-geolocation"
                target="_blank"
                rel="nofollow ugc noopener noreferrer"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                🔗 Vercel'de Test Et
              </a>
              <p className="text-sm text-gray-600 mt-2">
                Telefonunuzdan bu linki açın ve test edin
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
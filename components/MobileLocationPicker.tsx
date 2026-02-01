// components/MobileLocationPicker.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect } from 'react'
import useGeolocation from '@/hooks/useGeolocation'

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number | null
    longitude: number | null
    city: string
    address: string
    accuracy: number
  }) => void
  initialCity?: string
}

export default function MobileLocationPicker({ onLocationSelect, initialCity = '' }: LocationPickerProps) {
  const { 
    position, 
    error, 
    isLoading, 
    getLocation, 
    city, 
    address, 
    isSupported,
    permissionStatus 
  } = useGeolocation()
  
  const [manualCity, setManualCity] = useState(initialCity)
  const [useGPS, setUseGPS] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobile(mobile)
      
      // Mobilse GPS'ı varsayılan yap
      if (mobile) {
        setUseGPS(true)
      }
    }
    
    checkMobile()
  }, [])

  useEffect(() => {
    if (position && city && address && useGPS) {
      onLocationSelect({
        latitude: position.latitude,
        longitude: position.longitude,
        city: city,
        address: address,
        accuracy: position.accuracy
      })
    }
  }, [position, city, address, useGPS, onLocationSelect])

  useEffect(() => {
    if (!useGPS && manualCity) {
      onLocationSelect({
        latitude: null,
        longitude: null,
        city: manualCity,
        address: manualCity,
        accuracy: 0
      })
    }
  }, [manualCity, useGPS, onLocationSelect])

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Trabzon', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır',
    'Samsun', 'Denizli', 'İzmit', 'Manisa', 'Balıkesir', 'Van', 'Malatya',
    'Türkiye Geneli', 'Yurt Dışı'
  ]

  const handleGetLocation = async () => {
    setUseGPS(true)
    const result = await getLocation()
    
    if (!result && isMobile) {
      setShowHelp(true)
    }
  }

  const handleManualSelect = () => {
    setUseGPS(false)
    setManualCity('')
  }

  // MOBİL KONUM İZNI YÖNLENDİRME
  const openLocationSettings = () => {
    if (isMobile) {
      // iOS için
      if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
        // @ts-ignore
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.openSettings) {
          // @ts-ignore
          window.webkit.messageHandlers.openSettings.postMessage({})
        } else {
          window.location.href = 'app-settings:'
        }
      } 
      // Android için
      else if (/android/i.test(navigator.userAgent)) {
        window.location.href = 'android-app://com.android.settings'
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobil Uyarı Banner */}
      {isMobile && permissionStatus === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-2xl mr-3">📍</span>
            <div>
              <p className="font-medium text-red-800">Konum İzni Gerekli</p>
              <p className="text-sm text-red-700">
                Telefonunuzda konum izni vermeniz gerekiyor.
              </p>
              <button
                onClick={openLocationSettings}
                className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Ayarlara Git
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konum Tipi Seçimi */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={!isSupported}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            useGPS
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-3xl mb-3">📍</div>
          <h4 className="font-bold text-gray-900 mb-2">
            {isMobile ? 'Telefon Konumunu Kullan' : 'Otomatik Konum'}
          </h4>
          <p className="text-sm text-gray-600">
            {isMobile ? 'Telefonunuzun GPS\'ini kullanın' : 'Tarayıcınızın konum servisini kullanın'}
          </p>
          {isMobile && (
            <div className="mt-3 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              📱 Mobil için
            </div>
          )}
        </button>

        {!isMobile && (
          <button
            type="button"
            onClick={handleManualSelect}
            className={`p-6 rounded-xl border-2 text-center transition-all ${
              !useGPS
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-3">🏙️</div>
            <h4 className="font-bold text-gray-900 mb-2">Manuel Seçim</h4>
            <p className="text-sm text-gray-600">Şehir listesinden seçin</p>
          </button>
        )}
      </div>

      {/* GPS Konum Bilgisi */}
      {useGPS && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-blue-800 font-medium">Konumunuz alınıyor...</p>
              <p className="text-sm text-blue-600 mt-2">
                {isMobile 
                  ? 'Telefonunuzda "Konuma İzin Ver" seçeneğini tıklayın'
                  : 'Tarayıcınız konum izni isteyecek'
                }
              </p>
              {isMobile && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    📱 Telefonunuz izin isterse "İzin Ver" veya "Allow" seçin
                  </p>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-3xl mb-3 text-red-500">❌</div>
              <p className="text-red-700 font-medium mb-2">Konum alınamadı</p>
              <p className="text-sm text-red-600 mb-4">{error.message}</p>
              
              {isMobile && error.code === 1 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Telefonunuzda şu adımları izleyin:</p>
                  <ol className="text-sm text-gray-700 space-y-2 text-left">
                    <li>1. Tarayıcı ayarlarına gidin</li>
                    <li>2. "Site ayarları" veya "İzinler" bölümünü bulun</li>
                    <li>3. "Konum" iznini açın</li>
                    <li>4. Sayfayı yenileyin ve tekrar deneyin</li>
                  </ol>
                  <button
                    onClick={openLocationSettings}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Ayarlara Git
                  </button>
                </div>
              )}
              
              <button
                onClick={() => getLocation()}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
              >
                Tekrar dene
              </button>
            </div>
          ) : position && city ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center">
                    <span className="text-green-600 text-2xl mr-3">✅</span>
                    <div>
                      <h4 className="font-bold text-gray-900">Konumunuz alındı</h4>
                      <p className="text-sm text-gray-600">
                        {isMobile ? 'Telefon GPS aktif' : 'Konum servisi aktif'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Doğruluk</div>
                  <div className="font-bold text-green-600">
                    %{Math.max(80, 100 - Math.round(position.accuracy / 10))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Şehir</p>
                  <p className="font-medium">{city}</p>
                </div>
                
                {address && address !== city && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Adres</p>
                    <p className="font-medium text-sm">{address}</p>
                  </div>
                )}
                
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Koordinatlar</p>
                  <p className="font-mono text-sm">
                    {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hassasiyet: ±{position.accuracy.toFixed(0)} metre
                  </p>
                </div>
              </div>

              {isMobile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">📱</span>
                    <p className="text-sm text-green-800">
                      Telefon konumunuz başarıyla alındı! Spot'unuz bu konumda aranacak.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-3">📍</div>
              <p className="font-medium text-gray-900 mb-2">
                {isMobile ? 'Telefon Konumunuzu Alalım' : 'Konumunuzu Alalım'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {isMobile 
                  ? 'Daha doğru sonuçlar için telefonunuzun GPS\'ini kullanabiliriz'
                  : 'Daha doğru sonuçlar için konumunuzu kullanabiliriz'
                }
              </p>
              
              {isMobile && (
                <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📱 Telefonunuzda "Konuma İzin Ver" penceresi çıkacak. Lütfen izin verin.
                  </p>
                </div>
              )}
              
              <button
                onClick={handleGetLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
              >
                Konumumu Al
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manuel Şehir Seçimi (Sadece masaüstü) */}
      {!isMobile && !useGPS && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Şehir Seçin *
          </label>
          <select
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required={!useGPS}
          >
            <option value="">Şehir seçin</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}

      {/* Mobil Yardım Modal'ı */}
      {showHelp && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📱 Telefon Konum Ayarları</h3>
            <p className="text-gray-600 mb-6">
              Telefonunuzda konum izni vermeniz gerekiyor. Şu adımları izleyin:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Tarayıcı Ayarlarına Gidin</p>
                  <p className="text-sm text-gray-600">Sağ üstteki üç noktaya tıklayın</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">"Site Ayarları"nı Bulun</p>
                  <p className="text-sm text-gray-600">"Konum" veya "Location" seçeneğini arayın</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">İzni "İzin Ver" Yapın</p>
                  <p className="text-sm text-gray-600">"Allow" veya "İzin Ver" seçin</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowHelp(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg"
              >
                Kapat
              </button>
              <button
                onClick={openLocationSettings}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Ayarlara Git
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konum Gizlilik Bilgisi */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-gray-500 mr-3">🔒</span>
          <div>
            <p className="text-sm font-medium text-gray-900">Konum Gizliliği</p>
            <p className="text-xs text-gray-600">
              • Konumunuz sadece bu spot için kullanılır
              • Tam adresiniz asla paylaşılmaz
              • GPS koordinatları şifrelenerek saklanır
              • İstediğiniz zaman konum paylaşımını durdurabilirsiniz
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
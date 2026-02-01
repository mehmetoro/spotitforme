// components/LocationPickerWithPermission.tsx
'use client'

import { useState, useEffect } from 'react'
import useGeolocationWithPermission from '@/hooks/useGeolocationWithPermission'

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number | null
    longitude: number | null
    city: string
  }) => void
}

export default function LocationPickerWithPermission({ onLocationSelect }: LocationPickerProps) {
  const { 
    latitude, 
    longitude, 
    city, 
    error, 
    loading, 
    permission,
    requestPermissionAndGetLocation,
    clearLocation 
  } = useGeolocationWithPermission()

  const [manualCity, setManualCity] = useState('')
  const [useGPS, setUseGPS] = useState(false)
  const [showPermissionInfo, setShowPermissionInfo] = useState(false)

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Trabzon', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır',
    'Samsun', 'Denizli', 'İzmit', 'Manisa', 'Balıkesir', 'Van', 'Malatya',
    'Türkiye Geneli', 'Yurt Dışı'
  ]

  // Konum değiştiğinde parent'a bildir
  useEffect(() => {
    if (useGPS && latitude && city && city !== 'Konum izni bekleniyor') {
      onLocationSelect({ latitude, longitude, city })
    }
  }, [latitude, city, useGPS])

  const handleGetLocation = async () => {
    setUseGPS(true)
    clearLocation() // Önceki konumu temizle
    
    // Kullanıcıya izin isteği hakkında bilgi göster
    setShowPermissionInfo(true)
    
    const location = await requestPermissionAndGetLocation()
    
    if (location.latitude) {
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city
      })
    }
  }

  const handleManualSelect = () => {
    setUseGPS(false)
    setManualCity('')
    setShowPermissionInfo(false)
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value
    setManualCity(selectedCity)
    if (selectedCity) {
      onLocationSelect({
        latitude: null,
        longitude: null,
        city: selectedCity
      })
    }
  }

  // İzin durumuna göre mesaj
  const getPermissionMessage = () => {
    switch(permission) {
      case 'granted':
        return '✅ Konum izniniz var'
      case 'denied':
        return '❌ Konum izni verilmedi'
      case 'prompt':
        return '📍 Konum izni istenecek'
      default:
        return 'Konum durumu belirsiz'
    }
  }

  return (
    <div className="space-y-6">
      {/* İzin Durumu Göstergesi */}
      <div className={`p-4 rounded-lg border ${
        permission === 'granted' ? 'bg-green-50 border-green-200' :
        permission === 'denied' ? 'bg-red-50 border-red-200' :
        'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {permission === 'granted' && <span className="text-green-600 text-xl mr-2">✅</span>}
            {permission === 'denied' && <span className="text-red-600 text-xl mr-2">❌</span>}
            {permission === 'prompt' && <span className="text-blue-600 text-xl mr-2">📍</span>}
            <div>
              <p className="font-medium">
                {getPermissionMessage()}
              </p>
              <p className="text-sm opacity-75">
                {permission === 'denied' 
                  ? 'Tarayıcı ayarlarından izin verebilirsiniz' 
                  : 'Daha doğru sonuçlar için konumunuzu kullanabiliriz'}
              </p>
            </div>
          </div>
          {permission === 'denied' && (
            <button
              onClick={() => window.open('https://support.google.com/chrome/answer/142065?hl=tr', '_blank')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Nasıl açılır?
            </button>
          )}
        </div>
      </div>

      {/* Konum Tipi Seçimi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loading || permission === 'denied'}
          className={`p-6 rounded-xl border-2 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            useGPS
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-blue-600">Konumunuz alınıyor...</p>
              <p className="text-xs text-blue-500">Tarayıcı izin isteyecek</p>
            </div>
          ) : (
            <>
              <div className="text-3xl mb-3">📍</div>
              <h4 className="font-bold text-gray-900 mb-2">
                {permission === 'granted' ? 'Konumumu Kullan' : 'Konum İzni İste'}
              </h4>
              <p className="text-sm text-gray-600">
                {permission === 'denied' 
                  ? 'İzin verilmedi. Manuel seçin.' 
                  : 'Tarayıcıdan konum izni istenir'}
              </p>
            </>
          )}
        </button>

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
          <h4 className="font-bold text-gray-900 mb-2">Şehir Seç</h4>
          <p className="text-sm text-gray-600">Listeden şehir seçin</p>
        </button>
      </div>

      {/* İzin İsteği Bilgilendirmesi */}
      {showPermissionInfo && permission === 'prompt' && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-start">
            <span className="text-yellow-600 text-xl mr-3">📱</span>
            <div>
              <p className="font-medium text-yellow-800 mb-2">Tarayıcı İzin İsteği!</p>
              <p className="text-sm text-yellow-700">
                Ekranın üstünde tarayıcının konum izni isteği belirecek. 
                <strong> Lütfen "İzin Ver" veya "Allow" seçeneğini tıklayın.</strong>
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>Doğru konum için izin vermeniz gerekir</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span>İzin vermezseniz manuel şehir seçebilirsiniz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Sonucu */}
      {useGPS && (
        <div className={`p-4 rounded-lg border ${
          error ? 'bg-red-50 border-red-200' : 
          latitude ? 'bg-green-50 border border-green-200' : 
          'bg-blue-50 border border-blue-200'
        }`}>
          {loading ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-700">Konumunuz alınıyor...</p>
              </div>
              <p className="text-sm text-blue-600">
                Tarayıcının izin isteğini bekleyin
              </p>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-2">❌</span>
                <div>
                  <p className="font-medium text-red-800">Konum alınamadı</p>
                  <p className="text-sm text-red-600">{city}</p>
                </div>
              </div>
              
              {permission === 'denied' ? (
                <div className="bg-white p-3 rounded border border-red-100">
                  <p className="text-sm font-medium mb-2">İzin nasıl verilir?</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>1. Tarayıcı ayarlarını açın</li>
                    <li>2. "Site izinleri" veya "Gizlilik" bölümüne gidin</li>
                    <li>3. "Konum" seçeneğini bulun</li>
                    <li>4. spotitforme.com için izin verin</li>
                    <li>5. Sayfayı yenileyin ve tekrar deneyin</li>
                  </ul>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleGetLocation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Tekrar Dene
                  </button>
                  <button
                    onClick={handleManualSelect}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
                  >
                    Şehir Seç
                  </button>
                </div>
              )}
            </div>
          ) : latitude ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-green-500 text-2xl mr-3">✅</span>
                  <div>
                    <p className="font-bold text-green-800">Konumunuz alındı!</p>
                    <p className="text-green-700">{city}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  GPS Aktif
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-600 mb-1">Enlem</p>
                  <p className="font-mono">{latitude?.toFixed(6)}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-600 mb-1">Boylam</p>
                  <p className="font-mono">{longitude?.toFixed(6)}</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleGetLocation}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Konumu Yenile
                </button>
                <button
                  onClick={() => {
                    if (latitude && longitude) {
                      window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank')
                    }
                  }}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Haritada Göster
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-3">📍</div>
              <p className="font-medium text-gray-900 mb-2">Konumunuzu alalım</p>
              <p className="text-sm text-gray-600 mb-4">
                Daha doğru sonuçlar için konumunuzu kullanabiliriz
              </p>
              <button
                onClick={handleGetLocation}
                disabled={permission === 'denied'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {permission === 'denied' ? 'İzin Verilmedi' : 'Konumumu Al'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manuel Şehir Seçimi */}
      {!useGPS && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Şehir Seçin *
            </label>
            {manualCity && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Seçildi: {manualCity}
              </span>
            )}
          </div>
          
          <select
            value={manualCity}
            onChange={handleCityChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={!useGPS}
          >
            <option value="">Şehir seçin</option>
            <option value="Türkiye Geneli">🌍 Türkiye Geneli</option>
            <optgroup label="Büyük Şehirler">
              {cities.filter(c => !['Türkiye Geneli', 'Yurt Dışı'].includes(c)).map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </optgroup>
            <option value="Yurt Dışı">✈️ Yurt Dışı</option>
          </select>
          
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <span className="mr-2">💡</span>
            <p>
              Konum izni vermek istemiyorsanız, şehir listesinden seçebilirsiniz
            </p>
          </div>
        </div>
      )}

      {/* İzin Seçenekleri Bilgisi */}
      <div className="bg-gray-50 rounded-lg p-4">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="font-medium text-gray-900">Konum İzin Seçenekleri</span>
            <span className="transition group-open:rotate-180">▼</span>
          </summary>
          <div className="mt-3 space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <div>
                <p className="font-medium">Bir Kereliğine İzin Ver</p>
                <p>Sadece bu seferlik konumunuzu kullanmamıza izin verir</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">🔒</span>
              <div>
                <p className="font-medium">Her Zaman İzin Ver</p>
                <p>Gelecekteki ziyaretlerinizde tekrar sormaz</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-red-600 mr-2">❌</span>
              <div>
                <p className="font-medium">İzin Verme</p>
                <p>Manuel olarak şehir seçmeniz gerekir</p>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
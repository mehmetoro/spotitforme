// components/SimpleLocationPicker.tsx
'use client'

import { useState } from 'react'
import useSimpleGeolocation from '@/hooks/useSimpleGeolocation'

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number | null
    longitude: number | null
    city: string
  }) => void
}

export default function SimpleLocationPicker({ onLocationSelect }: LocationPickerProps) {
  const { latitude, longitude, city, error, loading, getCurrentLocation } = useSimpleGeolocation()
  const [manualCity, setManualCity] = useState('')
  const [useGPS, setUseGPS] = useState(false)

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Trabzon', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır',
    'Samsun', 'Denizli', 'İzmit', 'Manisa', 'Balıkesir', 'Van', 'Malatya',
    'Türkiye Geneli', 'Yurt Dışı'
  ]

  const handleGetLocation = async () => {
    setUseGPS(true)
    const location = await getCurrentLocation()
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

  return (
    <div className="space-y-6">
      {/* Konum Tipi Seçimi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loading}
          className={`p-6 rounded-xl border-2 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            useGPS
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {loading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-blue-600">Konumunuz alınıyor...</p>
            </div>
          ) : (
            <>
              <div className="text-3xl mb-3">📍</div>
              <h4 className="font-bold text-gray-900 mb-2">Otomatik Konum Al</h4>
              <p className="text-sm text-gray-600">Telefonunuzdan konum izni istenir</p>
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

      {/* GPS Sonucu */}
      {useGPS && (
        <div className={`p-4 rounded-lg ${
          error ? 'bg-red-50 border border-red-200' : 
          city === 'Konum alındı' ? 'bg-green-50 border border-green-200' : 
          'bg-blue-50 border border-blue-200'
        }`}>
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-700">Konumunuz alınıyor...</p>
            </div>
          ) : error ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-2">❌</span>
                <p className="font-medium text-red-800">{city}</p>
              </div>
              <p className="text-sm text-red-600">
                Lütfen tarayıcınızın konum iznini açın veya manuel şehir seçin.
              </p>
              <button
                onClick={handleGetLocation}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Tekrar dene
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-2">✅</span>
                <div>
                  <p className="font-medium text-green-800">Konumunuz alındı!</p>
                  <p className="text-sm text-green-700">{city}</p>
                </div>
              </div>
              {latitude && longitude && (
                <div className="bg-white p-3 rounded border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">Koordinatlar:</p>
                  <p className="font-mono text-sm">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
              )}
              <button
                onClick={handleGetLocation}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Konumu yenile
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manuel Şehir Seçimi */}
      {!useGPS && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Şehir Seçin *
          </label>
          <select
            value={manualCity}
            onChange={handleCityChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={!useGPS}
          >
            <option value="">Şehir seçin</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Daha doğru sonuç için "Otomatik Konum Al" butonunu kullanın
          </p>
        </div>
      )}

      {/* Telefon için Özel Talimatlar */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-yellow-600 text-xl mr-3">📱</span>
          <div>
            <p className="font-medium text-yellow-800 mb-2">Telefon Kullanıcıları İçin:</p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• "Otomatik Konum Al" butonuna tıklayın</li>
              <li>• Tarayıcının konum izni isteğini kabul edin</li>
              <li>• Eğer izin vermezseniz, şehir listesinden seçin</li>
              <li>• <strong>Telefon ayarlarınızdan konum servisinin açık olduğundan emin olun</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
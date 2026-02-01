// components/LocationPicker.tsx
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

export default function LocationPicker({ onLocationSelect, initialCity = '' }: LocationPickerProps) {
  const { position, error, isLoading, getLocation, city, address } = useGeolocation()
  const [manualCity, setManualCity] = useState(initialCity)
  const [useGPS, setUseGPS] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (position && city && address) {
      onLocationSelect({
        latitude: position.latitude,
        longitude: position.longitude,
        city: city,
        address: address,
        accuracy: position.accuracy
      })
    }
  }, [position, city, address])

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
  }, [manualCity, useGPS])

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Trabzon', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır',
    'Samsun', 'Denizli', 'İzmit', 'Manisa', 'Balıkesir', 'Van', 'Malatya',
    'Türkiye Geneli', 'Yurt Dışı'
  ]

  const handleGetLocation = () => {
    setUseGPS(true)
    getLocation()
  }

  const handleManualSelect = () => {
    setUseGPS(false)
    setManualCity('')
  }

  return (
    <div className="space-y-6">
      {/* Konum Tipi Seçimi */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGetLocation}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            useGPS
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-3xl mb-3">📍</div>
          <h4 className="font-bold text-gray-900 mb-2">Otomatik Konum</h4>
          <p className="text-sm text-gray-600">Telefonunuzun konum servisini kullanın</p>
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
          <h4 className="font-bold text-gray-900 mb-2">Manuel Seçim</h4>
          <p className="text-sm text-gray-600">Şehir listesinden seçin</p>
        </button>
      </div>

      {/* GPS Konum Bilgisi */}
      {useGPS && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-blue-800">Konumunuz alınıyor...</p>
              <p className="text-sm text-blue-600 mt-2">
                Tarayıcınız konum izni isteyecek. Lütfen izin verin.
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-3xl mb-3 text-red-500">❌</div>
              <p className="text-red-700 font-medium mb-2">Konum alınamadı</p>
              <p className="text-sm text-red-600">{error.message}</p>
              <button
                onClick={getLocation}
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
                      <p className="text-sm text-gray-600">%{Math.round(100 - position.accuracy)} doğruluk</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showMap ? 'Haritayı gizle' : 'Haritada göster'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Şehir</p>
                  <p className="font-medium">{city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Adres</p>
                  <p className="font-medium">{address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Koordinatlar</p>
                  <p className="font-mono text-sm">
                    {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              {showMap && (
                <div className="mt-4">
                  <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                    <iframe
                      src={`https://maps.google.com/maps?q=${position.latitude},${position.longitude}&z=15&output=embed`}
                      className="w-full h-full border-0"
                      title="Konumunuz"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Konumunuz haritada işaretlendi. Hassasiyet: ±{position.accuracy.toFixed(0)} metre
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-3">📍</div>
              <p className="font-medium text-gray-900 mb-2">Konumunuzu alalım</p>
              <p className="text-sm text-gray-600 mb-4">
                Daha doğru sonuçlar için konumunuzu kullanabiliriz
              </p>
              <button
                onClick={getLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
              >
                Konumumu Al
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
            onChange={(e) => setManualCity(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={!useGPS}
          >
            <option value="">Şehir seçin</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Konumunuzu otomatik almak için "Otomatik Konum" seçeneğini kullanın
          </p>
        </div>
      )}

      {/* Konum İzinleri Bilgisi */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-gray-500 mr-3">🔒</span>
          <div>
            <p className="text-sm font-medium text-gray-900">Konum Gizliliği</p>
            <p className="text-xs text-gray-600">
              • Konumunuz sadece spot detayında görüntülenir
              • Tam adresiniz asla paylaşılmaz
              • İstediğiniz zaman konum paylaşımını durdurabilirsiniz
              • GPS konumu şehir seviyesinde paylaşılır
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
// components/LocationPicker.tsx
'use client'

import { useState } from 'react'
import useLocation from '@/hooks/useLocation'

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number | null
    longitude: number | null
    city: string
  }) => void
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const { latitude, longitude, city, error, isLoading, getLocation, resetLocation } = useLocation()
  const [manualCity, setManualCity] = useState('')
  const [mode, setMode] = useState<'gps' | 'manual' | null>(null)

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Trabzon', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır',
    'Samsun', 'Denizli', 'İzmit', 'Manisa', 'Balıkesir', 'Van', 'Malatya',
    'Türkiye Geneli', 'Yurt Dışı'
  ]

  const handleGetLocationClick = async () => {
    setMode('gps')
    resetLocation()
    const success = await getLocation()
    
    if (success && latitude && longitude) {
      onLocationSelect({
        latitude,
        longitude,
        city: city || 'Konum alındı'
      })
    }
  }

  const handleManualSelect = () => {
    setMode('manual')
    resetLocation()
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
      {/* Başlık */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Konum Seçin *</h3>
        <p className="text-sm text-gray-600">
          Konum, size yardım edecek kişilerin bulunması için çok önemli
        </p>
      </div>

      {/* Seçenekler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GPS Butonu */}
        <button
          type="button"
          onClick={handleGetLocationClick}
          disabled={isLoading && mode === 'gps'}
          className={`p-6 rounded-xl border-2 text-center transition-all disabled:opacity-50 ${
            mode === 'gps' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-3xl mb-3">📍</div>
          <h4 className="font-bold text-gray-900 mb-2">Otomatik Konum</h4>
          <p className="text-sm text-gray-600">
            {isLoading && mode === 'gps' ? 'Konumunuz alınıyor...' : 'Telefonunuzdan konum alın'}
          </p>
        </button>

        {/* Manuel Seçim Butonu */}
        <button
          type="button"
          onClick={handleManualSelect}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            mode === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-3xl mb-3">🏙️</div>
          <h4 className="font-bold text-gray-900 mb-2">Şehir Seç</h4>
          <p className="text-sm text-gray-600">Listeden şehir seçin</p>
        </button>
      </div>

      {/* GPS Yükleniyor/Error/Success */}
      {mode === 'gps' && (
        <div className={`p-4 rounded-lg ${
          isLoading ? 'bg-blue-50 border border-blue-200' :
          error ? 'bg-red-50 border border-red-200' :
          city ? 'bg-green-50 border border-green-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium text-blue-800">Konumunuz alınıyor...</p>
                <p className="text-sm text-blue-600">
                  Tarayıcınız konum izni isteyecek. Lütfen izin verin.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">⚠️</span>
                <div>
                  <p className="font-medium text-red-800">Konum alınamadı</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border border-red-100">
                <p className="text-sm font-medium text-gray-900 mb-2">Telefon Kullanıcıları:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>1. "Ayarlar" → "Konum" → Açık olmalı</li>
                  <li>2. Tarayıcı ayarlarından konum izni verin</li>
                  <li>3. Yukarıdaki "Şehir Seç" butonuna tıklayın</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleGetLocationClick}
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
            </div>
          ) : city ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-green-500 text-2xl mr-3">✅</span>
                  <div>
                    <p className="font-medium text-green-800">Konumunuz alındı!</p>
                    <p className="text-green-700">{city}</p>
                  </div>
                </div>
                <button
                  onClick={handleGetLocationClick}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Yenile
                </button>
              </div>

              {latitude && longitude && (
                <div className="bg-white p-3 rounded border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">Koordinatlar:</p>
                  <p className="font-mono text-sm">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Konum almak için yukarıdaki butona tıklayın</p>
            </div>
          )}
        </div>
      )}

      {/* Manuel Şehir Seçimi */}
      {mode === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şehir Seçin *
            </label>
            <select
              value={manualCity}
              onChange={handleCityChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Şehir seçin</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              💡 <strong>Öneri:</strong> Otomatik konum daha doğru sonuç verir. 
              GPS çalışmıyorsa "Otomatik Konum" butonuna tekrar tıklayın.
            </p>
          </div>
        </div>
      )}

      {/* Hiçbir şey seçilmediyse */}
      {!mode && (
        <div className="text-center p-8 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-4">📍</div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">Konum Seçimi</h4>
          <p className="text-gray-600 mb-6">
            Lütfen yukarıdaki seçeneklerden birini seçin
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGetLocationClick}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Otomatik Konum
            </button>
            <button
              onClick={handleManualSelect}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
            >
              Şehir Seç
            </button>
          </div>
        </div>
      )}

      {/* Konum Gizlilik Bilgisi */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-gray-500 mr-3">🔒</span>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Konum Gizliliği</p>
            <p className="text-xs text-gray-600">
              • Konumunuz sadece spot detayında görünür
              • Tam adresiniz asla paylaşılmaz
              • GPS koordinatları sadece harita için kullanılır
              • İstediğiniz zaman konum paylaşımını durdurabilirsiniz
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
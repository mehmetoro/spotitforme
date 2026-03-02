// components/SimpleLocationPicker.tsx
'use client'

import { useState } from 'react'

interface SimpleLocationPickerProps {
  onLocationSelect: (location: {
    lat: number | null
    lon: number | null
    city: string
  }) => void
}

export default function SimpleLocationPicker({ onLocationSelect }: SimpleLocationPickerProps) {
  const [mode, setMode] = useState<'gps' | 'manual'>('gps')
  const [selectedCity, setSelectedCity] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Trabzon', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır',
    'Samsun', 'Denizli', 'İzmit', 'Manisa', 'Balıkesir', 'Van', 'Malatya',
    'Türkiye Geneli', 'Yurt Dışı'
  ]

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Tarayıcınız konum servisini desteklemiyor')
      return
    }

    setIsGettingLocation(true)
    setGpsError(null)

    // BURASI KRİTİK: Direkt çağırıyoruz, tarayıcı otomatik izin isteyecek
    navigator.geolocation.getCurrentPosition(
      // Başarılı
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        
        let city = 'Konum alındı'
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=tr`
          )
          const data = await response.json()
          if (data.address) {
            city = data.address.city || data.address.town || data.address.county || 'Konum alındı'
          }
        } catch {
          city = `${lat.toFixed(2)}, ${lon.toFixed(2)}`
        }

        onLocationSelect({ lat, lon, city })
        setIsGettingLocation(false)
      },
      // Hata
      (error) => {
        setIsGettingLocation(false)
        if (error.code === 1) {
          setGpsError('📍 Konum izni verilmedi. Lütfen tarayıcınızın izin isteğini kabul edin veya şehir seçin.')
        } else {
          setGpsError('Konum alınamadı: ' + error.message)
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value
    setSelectedCity(city)
    if (city) {
      onLocationSelect({ lat: null, lon: null, city })
    }
  }

  return (
    <div className="space-y-6">
      {/* Mod Seçimi */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode('gps')}
          className={`p-4 rounded-lg border-2 ${mode === 'gps' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
        >
          <div className="text-2xl mb-2">📍</div>
          <p className="font-medium">Konumumu Kullan</p>
          <p className="text-sm text-gray-600 mt-1">Tarayıcı izin isteyecek</p>
        </button>

        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`p-4 rounded-lg border-2 ${mode === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
        >
          <div className="text-2xl mb-2">🏙️</div>
          <p className="font-medium">Şehir Seç</p>
          <p className="text-sm text-gray-600 mt-1">Listeden şehir seçin</p>
        </button>
      </div>

      {/* GPS Modu */}
      {mode === 'gps' && (
        <div className="space-y-4">
          <button
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                Konum alınıyor...
              </>
            ) : (
              <>
                <span className="mr-2">📍</span>
                Konum İzni İste
              </>
            )}
          </button>

          {gpsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{gpsError}</p>
              <button
                onClick={() => setMode('manual')}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Şehir seçmek için tıklayın
              </button>
            </div>
          )}

          {/* Bilgi */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>📱 Telefon kullanıcıları:</strong> Ekranın üst kısmında "spotitforme.com konumunuza erişmek istiyor" şeklinde bir izin isteği belirecek. Lütfen <strong>"İzin Ver"</strong> seçeneğini tıklayın.
            </p>
          </div>
        </div>
      )}

      {/* Manuel Mod */}
      {mode === 'manual' && (
        <div>
          <select
            value={selectedCity}
            onChange={handleCitySelect}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Şehir seçin *</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Konum izni vermek istemiyorsanız şehir seçebilirsiniz
          </p>
        </div>
      )}
    </div>
  )
}
// components/SimpleMap.tsx
'use client'

import { useState } from 'react'

interface SimpleMapProps {
  location: string
  height?: string
}

export default function SimpleMap({ location, height = '400px' }: SimpleMapProps) {
  const [showMap, setShowMap] = useState(false)

  // Türkiye şehir koordinatları
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'İstanbul': { lat: 41.0082, lng: 28.9784 },
    'Ankara': { lat: 39.9334, lng: 32.8597 },
    'İzmir': { lat: 38.4237, lng: 27.1428 },
    'Bursa': { lat: 40.1885, lng: 29.0610 },
    'Antalya': { lat: 36.8969, lng: 30.7133 },
    'Adana': { lat: 37.0000, lng: 35.3213 },
    'Konya': { lat: 37.8667, lng: 32.4833 },
    'Trabzon': { lat: 41.0015, lng: 39.7178 },
    'Gaziantep': { lat: 37.0662, lng: 37.3833 },
    'Kayseri': { lat: 38.7312, lng: 35.4787 },
    'Türkiye Geneli': { lat: 39.9334, lng: 32.8597 }, // Ankara
    'Yurt Dışı': { lat: 48.8566, lng: 2.3522 } // Paris
  }

  const getCoordinates = () => {
    for (const city in cityCoordinates) {
      if (location.includes(city)) {
        return cityCoordinates[city]
      }
    }
    return cityCoordinates['İstanbul'] // Varsayılan
  }

  const coordinates = getCoordinates()

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📍</span>
            <div>
              <h3 className="font-bold text-gray-900">{location}</h3>
              <p className="text-sm text-gray-600">Spot konumu</p>
            </div>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            {showMap ? 'Haritayı Kapat' : 'Haritayı Aç'}
          </button>
        </div>
      </div>

      {showMap && (
        <div className="p-4">
          <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
            <iframe
              src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=12&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              title={`${location} haritası`}
              allowFullScreen
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              <span>Spot konumu: {location}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Google Maps'te aç →
            </a>
          </div>
        </div>
      )}

      {!showMap && (
        <div className="p-6 text-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-4xl mb-4">🗺️</div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">Bu spot {location} konumunda aranıyor</h4>
          <p className="text-gray-600 mb-4">
            {location.includes('Türkiye Geneli') 
              ? 'Tüm Türkiye\'de bu ürünü arayanlar size yardım edebilir'
              : `${location} bölgesindeki kullanıcılar size yardım edecek`
            }
          </p>
          <p className="text-sm text-gray-500">
            Haritayı açarak konumu tam olarak görebilirsiniz
          </p>
        </div>
      )}
    </div>
  )
}
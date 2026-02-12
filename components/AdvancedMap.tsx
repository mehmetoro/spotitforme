// components/AdvancedMap.tsx
'use client'

import { useState } from 'react'

interface AdvancedMapProps {
  latitude?: number | null
  longitude?: number | null
  location: string
  address?: string
  accuracy?: number
}

export default function AdvancedMap({ 
  latitude, 
  longitude, 
  location, 
  address,
  accuracy = 100 
}: AdvancedMapProps) {
  const [showMap, setShowMap] = useState(false)
  const [viewMode, setViewMode] = useState<'street' | 'satellite'>('street')

  // Koordinat varsa onu kullan, yoksa şehir adıyla
  const mapQuery = latitude && longitude 
    ? `${latitude},${longitude}`
    : encodeURIComponent(location)

  const mapUrl = viewMode === 'street'
    ? `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`
    : `https://maps.google.com/maps?q=${mapQuery}&z=14&t=k&output=embed`

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">📍 Konum</h3>
            <p className="text-gray-600">{address || location}</p>
            {latitude && longitude && (
              <p className="text-sm text-gray-500 mt-1">
                Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {showMap ? 'Haritayı Kapat' : 'Haritayı Aç'}
          </button>
        </div>

        {showMap && (
          <div className="space-y-4">
            {/* Harita Görünüm Seçici */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('street')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'street' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
              >
                Harita
              </button>
              <button
                onClick={() => setViewMode('satellite')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'satellite' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
              >
                Uydu
              </button>
            </div>

            {/* Harita */}
            <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
              <iframe
                src={mapUrl}
                className="w-full h-full border-0"
                title="Spot konumu"
                loading="lazy"
                allowFullScreen
              />
            </div>

            {/* Konum Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Konum</p>
                <p className="font-medium">{location}</p>
              </div>
              {address && address !== location && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Adres</p>
                  <p className="font-medium">{address}</p>
                </div>
              )}
              {latitude && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Doğruluk</p>
                  <p className="font-medium">±{accuracy} metre</p>
                </div>
              )}
            </div>

            {/* Google Maps Link */}
            <div className="flex justify-between items-center pt-4 border-t">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-2">🗺️</span>
                Google Maps'te aç
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(googleMapsUrl)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Linki kopyala
              </button>
            </div>
          </div>
        )}

        {!showMap && latitude && longitude && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Bu spot tam konumuyla işaretlendi. Haritayı açarak kesin konumu görebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
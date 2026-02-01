// components/SimpleMap.tsx
'use client'

import { useState } from 'react'

interface SimpleMapProps {
  location: string
  height?: string
}

export default function SimpleMap({ location, height = '300px' }: SimpleMapProps) {
  const [showMap, setShowMap] = useState(false)

  // Şehir görselleri (placeholder)
  const cityImages: Record<string, string> = {
    'İstanbul': 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&auto=format&fit=crop',
    'Ankara': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w-800&auto=format&fit=crop',
    'İzmir': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
    'Bursa': 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800&auto=format&fit=crop',
    'Antalya': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop',
    'Diğer': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop'
  }

  const getCityImage = () => {
    for (const city in cityImages) {
      if (location.includes(city)) {
        return cityImages[city]
      }
    }
    return cityImages['Diğer']
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div 
        className="relative bg-gray-100" 
        style={{ height }}
      >
        {showMap ? (
          // Google Maps iframe (basit)
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
            className="w-full h-full border-0"
            loading="lazy"
            title={`${location} haritası`}
          />
        ) : (
          // Görsel preview
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center p-8">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Konum: {location}</h3>
              <p className="text-gray-600 mb-6">Bu spot {location} konumunda aranıyor</p>
              <button
                onClick={() => setShowMap(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
              >
                Haritada Göster
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">📍</span>
            <span className="font-medium">{location}</span>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showMap ? 'Görsel Göster' : 'Harita Göster'}
          </button>
        </div>
      </div>
    </div>
  )
}
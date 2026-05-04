'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCurrentLocale, type SupportedLocale } from '@/hooks/useCurrentLocale'

const LOCATION_TEXT: Record<SupportedLocale, Record<string, string>> = {
  tr: {
    label: '📍 Konum',
    placeholder: 'Orn: Istiklal Caddesi, Kadikoy Carsi...',
    useCurrent: 'Mevcut konumumu kullan',
    currentLocationName: 'Mevcut Konumum',
    permissionRequired: 'Konum izni vermeniz gerekiyor',
    tip1: '✓ Konum bilgisi urunun daha hizli bulunmasini saglar',
    tip2: '✓ Detayli adres (sokak, bina no) daha iyi sonuc verir',
    locationSearchError: 'Konum arama hatasi:',
    reverseGeocodeError: 'Reverse geocoding hatasi:',
    locationUnavailable: 'Konum alinamadi:',
  },
  en: {
    label: '📍 Location',
    placeholder: 'Ex: Istiklal Street, Kadikoy Bazaar...',
    useCurrent: 'Use my current location',
    currentLocationName: 'My Current Location',
    permissionRequired: 'Location permission is required',
    tip1: '✓ Location helps your post get discovered faster',
    tip2: '✓ Detailed address (street, building no) gives better results',
    locationSearchError: 'Location search error:',
    reverseGeocodeError: 'Reverse geocoding error:',
    locationUnavailable: 'Location could not be retrieved:',
  },
  de: {
    label: '📍 Standort',
    placeholder: 'Bsp: Istiklal-StraBe, Kadikoy-Basar...',
    useCurrent: 'Meinen aktuellen Standort verwenden',
    currentLocationName: 'Mein aktueller Standort',
    permissionRequired: 'Standortberechtigung ist erforderlich',
    tip1: '✓ Standortdaten helfen, den Beitrag schneller zu finden',
    tip2: '✓ Detaillierte Adresse liefert bessere Ergebnisse',
    locationSearchError: 'Standortsuche-Fehler:',
    reverseGeocodeError: 'Reverse-Geocoding-Fehler:',
    locationUnavailable: 'Standort konnte nicht ermittelt werden:',
  },
  fr: {
    label: '📍 Localisation',
    placeholder: 'Ex: Rue Istiklal, Bazar de Kadikoy...',
    useCurrent: 'Utiliser ma position actuelle',
    currentLocationName: 'Ma position actuelle',
    permissionRequired: 'Autorisation de localisation requise',
    tip1: '✓ La localisation aide a trouver votre publication plus vite',
    tip2: '✓ Une adresse detaillee donne de meilleurs resultats',
    locationSearchError: 'Erreur de recherche de localisation:',
    reverseGeocodeError: 'Erreur de geocodage inverse:',
    locationUnavailable: 'Impossible de recuperer la localisation:',
  },
  es: {
    label: '📍 Ubicacion',
    placeholder: 'Ej: Calle Istiklal, Bazar Kadikoy...',
    useCurrent: 'Usar mi ubicacion actual',
    currentLocationName: 'Mi ubicacion actual',
    permissionRequired: 'Se requiere permiso de ubicacion',
    tip1: '✓ La ubicacion ayuda a encontrar tu publicacion mas rapido',
    tip2: '✓ Una direccion detallada da mejores resultados',
    locationSearchError: 'Error de busqueda de ubicacion:',
    reverseGeocodeError: 'Error de geocodificacion inversa:',
    locationUnavailable: 'No se pudo obtener la ubicacion:',
  },
  ru: {
    label: '📍 Местоположение',
    placeholder: 'Напр: Улица Истикляль, Рынок Кадыкёй...',
    useCurrent: 'Использовать мое текущее местоположение',
    currentLocationName: 'Мое текущее местоположение',
    permissionRequired: 'Требуется доступ к геолокации',
    tip1: '✓ Местоположение помогает быстрее находить публикацию',
    tip2: '✓ Подробный адрес дает лучшие результаты',
    locationSearchError: 'Ошибка поиска местоположения:',
    reverseGeocodeError: 'Ошибка обратного геокодирования:',
    locationUnavailable: 'Не удалось получить местоположение:',
  },
}

// Tip tanımları
interface LocationSuggestion {
  type: 'database' | 'osm'
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  city: string
  district: string
}

interface SelectedLocation {
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  city: string
  district: string
}

interface LocationSelectorProps {
  onLocationSelect: (location: SelectedLocation) => void
  initialLocation?: string
  required?: boolean
  showCurrentLocation?: boolean
  showQuickLocations?: boolean
}

interface DatabaseLocation {
  name: string
  full_address: string
  latitude: number | null
  longitude: number | null
  city: string
  district: string
}

interface OSMResult {
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    suburb?: string
    county?: string
    [key: string]: any
  }
}

export default function LocationSelector({ 
  onLocationSelect, 
  initialLocation = '',
  required = true,
  showCurrentLocation = true,
  showQuickLocations = true
}: LocationSelectorProps) {
  const locale = useCurrentLocale()
  const t = LOCATION_TEXT[locale] ?? LOCATION_TEXT.tr
  const [location, setLocation] = useState(initialLocation)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const searchTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // İlk konum varsa trigger et
    if (initialLocation) {
      handleLocationSelect({ 
        name: initialLocation, 
        address: initialLocation,
        latitude: null,
        longitude: null,
        city: '',
        district: ''
      })
    }
  }, [initialLocation])

  const searchLocation = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // 1. Veritabanından ara
      const { data: dbResults } = await supabase
        .from('locations')
        .select('*')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%,district.ilike.%${query}%`)
        .limit(5)

      // 2. OpenStreetMap API
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' Türkiye')}&format=json&addressdetails=1&limit=5`
      )
      const osmResults: OSMResult[] = await osmResponse.json()

      const dbSuggestions: LocationSuggestion[] = (dbResults as DatabaseLocation[] || []).map(loc => ({
        type: 'database' as const,
        name: loc.name,
        address: loc.full_address,
        latitude: loc.latitude,
        longitude: loc.longitude,
        city: loc.city,
        district: loc.district
      }))

      const osmSuggestions: LocationSuggestion[] = osmResults.map((place: OSMResult) => ({
        type: 'osm' as const,
        name: place.display_name.split(',')[0],
        address: place.display_name,
        latitude: place.lat ? parseFloat(place.lat) : null,
        longitude: place.lon ? parseFloat(place.lon) : null,
        city: place.address?.city || place.address?.town || '',
        district: place.address?.suburb || place.address?.county || ''
      }))

      const allSuggestions = [...dbSuggestions, ...osmSuggestions]
      setSuggestions(allSuggestions.slice(0, 8))
    } catch (error) {
      console.error(t.locationSearchError, error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    searchTimeout.current = setTimeout(() => {
      searchLocation(value)
    }, 300)
  }

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.address || suggestion.name)
    setSuggestions([])
    handleLocationSelect(suggestion)
  }

  const handleLocationSelect = (locationData: SelectedLocation) => {
    // city boşsa address'ten şehir bul
    let city = locationData.city || ''
    if (!city && locationData.address) {
      // Adres virgülle ayrılmış, Türkiye'den önceki son şehir adını al
      const parts = locationData.address.split(',').map(s => s.trim())
      // Türkiye'den önceki ilk şehir adını bul
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i]
        if (
          part &&
          part !== 'Türkiye' &&
          !/^(\d{5,}|Marmara Bölgesi|Ege Bölgesi|Akdeniz Bölgesi|Karadeniz Bölgesi|İç Anadolu Bölgesi|Doğu Anadolu Bölgesi|Güneydoğu Anadolu Bölgesi)$/i.test(part)
        ) {
          city = part
          break
        }
      }
    }
    onLocationSelect({
      name: locationData.name,
      address: locationData.address || locationData.name,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      city,
      district: locationData.district || ''
    })
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            )
            const data: OSMResult = await response.json()
            
            const locationObj: SelectedLocation = {
              name: t.currentLocationName,
              address: data.display_name,
              latitude,
              longitude,
              city: data.address?.city || data.address?.town || '',
              district: data.address?.suburb || data.address?.county || ''
            }
            
            setLocation(data.display_name)
            handleLocationSelect(locationObj)
          } catch (error) {
            console.error(t.reverseGeocodeError, error)
          }
        },
        (error) => {
          console.error(t.locationUnavailable, error)
          alert(t.permissionRequired)
        }
      )
    }
  }

  const quickLocations = [
    'İstiklal Caddesi, Beyoğlu',
    'Kadıköy Çarşı, Kadıköy',
    'Bağdat Caddesi, Kadıköy',
    'Nişantaşı, Şişli',
    'Akmerkez, Beşiktaş',
    'Kanyon, Şişli',
    'İzmir Alsancak',
    'Ankara Kızılay'
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t.label} {required && '*'}
      </label>
      
      <div className="relative">
        <div className="flex items-center">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={location}
              onChange={handleInputChange}
              placeholder={t.placeholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={required}
            />
          </div>
          
          {showCurrentLocation && (
            <button
              type="button"
              onClick={useCurrentLocation}
              className="ml-2 p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
              title={t.useCurrent}
            >
              <Navigation className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Öneriler */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="font-medium">{suggestion.name}</div>
                <div className="text-sm text-gray-600 truncate">
                  {suggestion.address}
                </div>
                {suggestion.city && (
                  <div className="text-xs text-gray-500 mt-1">
                    {suggestion.district ? `${suggestion.district}, ` : ''}
                    {suggestion.city}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Hızlı konum butonları */}
      {showQuickLocations && (
        <div className="flex flex-wrap gap-2">
          {quickLocations.map((quickLocation) => (
            <button
              key={quickLocation}
              type="button"
              onClick={() => {
                setLocation(quickLocation)
                searchLocation(quickLocation)
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition"
            >
              {quickLocation}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {t.tip1}<br />
        {t.tip2}
      </p>
    </div>
  )
}
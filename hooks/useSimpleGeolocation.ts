// hooks/useSimpleGeolocation.ts
'use client'

import { useState } from 'react'

interface LocationData {
  latitude: number | null
  longitude: number | null
  city: string
  error: string | null
  loading: boolean
}

export default function useSimpleGeolocation() {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    city: 'Konum belirlenemedi',
    error: null,
    loading: false
  })

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const errorData: LocationData = {
          latitude: null,
          longitude: null,
          city: 'Tarayıcınız konum servisini desteklemiyor',
          error: 'Geolocation not supported',
          loading: false
        }
        setLocation(errorData)
        resolve(errorData)
        return
      }

      setLocation(prev => ({ ...prev, loading: true, error: null }))

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Basit şehir tahmini (OpenStreetMap API)
          let city = 'Konum alındı'
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=tr`
            )
            const data = await response.json()
            if (data.address) {
              city = data.address.city || 
                    data.address.town || 
                    data.address.village || 
                    data.address.county ||
                    'Konum alındı'
            }
          } catch {
            // Şehir bulunamazsa koordinatları kullan
            city = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }

          const successData: LocationData = {
            latitude,
            longitude,
            city,
            error: null,
            loading: false
          }
          
          setLocation(successData)
          resolve(successData)
        },
        (error) => {
          let errorMessage = 'Konum alınamadı'
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Konum izni verilmedi'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Konum bilgisi alınamıyor'
              break
            case error.TIMEOUT:
              errorMessage = 'Konum alımı zaman aşımına uğradı'
              break
          }

          const errorData: LocationData = {
            latitude: null,
            longitude: null,
            city: errorMessage,
            error: error.message,
            loading: false
          }
          
          setLocation(errorData)
          resolve(errorData)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  return {
    ...location,
    getCurrentLocation
  }
}
// hooks/useGeolocationWithPermission.ts
'use client'

import { useState, useEffect } from 'react'

interface LocationData {
  latitude: number | null
  longitude: number | null
  city: string
  error: string | null
  loading: boolean
  permission: 'granted' | 'denied' | 'prompt' | 'unknown'
}

export default function useGeolocationWithPermission() {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    city: 'Konum izni bekleniyor',
    error: null,
    loading: false,
    permission: 'prompt'
  })

  // İzin durumunu kontrol et
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocation(prev => ({ ...prev, permission: result.state as any }))
        
        result.onchange = () => {
          setLocation(prev => ({ ...prev, permission: result.state as any }))
        }
      })
    }
  }, [])

  const requestPermissionAndGetLocation = (): Promise<LocationData> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const errorData: LocationData = {
          latitude: null,
          longitude: null,
          city: 'Tarayıcınız konum servisini desteklemiyor',
          error: 'Geolocation not supported',
          loading: false,
          permission: 'denied'
        }
        setLocation(errorData)
        resolve(errorData)
        return
      }

      setLocation(prev => ({ ...prev, loading: true, error: null }))

      // TARAYICIDAN İZİN İSTİYORUZ
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Şehir bilgisini al
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
            city = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }

          const successData: LocationData = {
            latitude,
            longitude,
            city,
            error: null,
            loading: false,
            permission: 'granted'
          }
          
          setLocation(successData)
          resolve(successData)
        },
        (error) => {
          let errorMessage = 'Konum alınamadı'
          let permissionStatus: 'granted' | 'denied' | 'prompt' = 'denied'
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Konum izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.'
              permissionStatus = 'denied'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Konum bilgisi alınamıyor'
              permissionStatus = 'prompt'
              break
            case error.TIMEOUT:
              errorMessage = 'Konum alımı zaman aşımına uğradı'
              permissionStatus = 'prompt'
              break
          }

          const errorData: LocationData = {
            latitude: null,
            longitude: null,
            city: errorMessage,
            error: error.message,
            loading: false,
            permission: permissionStatus
          }
          
          setLocation(errorData)
          resolve(errorData)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      )
    })
  }

  const clearLocation = () => {
    setLocation({
      latitude: null,
      longitude: null,
      city: 'Konum izni bekleniyor',
      error: null,
      loading: false,
      permission: 'prompt'
    })
  }

  return {
    ...location,
    requestPermissionAndGetLocation,
    clearLocation
  }
}
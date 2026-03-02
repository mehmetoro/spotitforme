// hooks/useGeolocation.ts
'use client'

import { useState, useCallback } from 'react'

interface LocationData {
  latitude: number | null
  longitude: number | null
  city: string
  error: string | null
  isLoading: boolean
  hasPermission: boolean
}

export default function useGeolocation() {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    city: '',
    error: null,
    isLoading: false,
    hasPermission: false
  })

  // 1. ADIM: Tarayıcıdan izin iste
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Tarayıcınız konum servisini desteklemiyor'
      }))
      return false
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Bu sadece izin durumunu kontrol eder, konumu almaz
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      
      if (permissionStatus.state === 'granted') {
        setLocation(prev => ({ ...prev, hasPermission: true, isLoading: false }))
        return true
      } else if (permissionStatus.state === 'prompt') {
        // Kullanıcıya izin sorulacak, şimdi sadece bekle
        setLocation(prev => ({ ...prev, isLoading: false }))
        return false
      } else {
        setLocation(prev => ({
          ...prev,
          error: 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.',
          isLoading: false,
          hasPermission: false
        }))
        return false
      }
    } catch (error) {
      // permissions API desteklenmiyorsa eski yöntem
      setLocation(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [])

  // 2. ADIM: İzin verildikten sonra konumu al
  const getLocation = useCallback(async (): Promise<LocationData> => {
    return new Promise((resolve) => {
      setLocation(prev => ({ ...prev, isLoading: true, error: null }))

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Şehir adını al
          let city = ''
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=tr`
            )
            const data = await response.json()
            city = data.address?.city || 
                   data.address?.town || 
                   data.address?.county || 
                   `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
          } catch {
            city = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
          }

          const newLocation: LocationData = {
            latitude,
            longitude,
            city,
            error: null,
            isLoading: false,
            hasPermission: true
          }

          setLocation(newLocation)
          resolve(newLocation)
        },
        (error) => {
          let errorMessage = ''
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Konum izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Konum bilgisi alınamıyor. Lütfen konum servisinizin açık olduğundan emin olun.'
              break
            case error.TIMEOUT:
              errorMessage = 'Konum alımı zaman aşımına uğradı. Lütfen tekrar deneyin.'
              break
            default:
              errorMessage = 'Konum alınamadı'
          }

          const errorLocation: LocationData = {
            latitude: null,
            longitude: null,
            city: '',
            error: errorMessage,
            isLoading: false,
            hasPermission: false
          }

          setLocation(errorLocation)
          resolve(errorLocation)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }, [])

  return {
    ...location,
    requestPermission,
    getLocation
  }
}
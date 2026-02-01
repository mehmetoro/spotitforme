// hooks/useLocation.ts
'use client'

import { useState, useCallback } from 'react'

export default function useLocation() {
  const [location, setLocation] = useState<{
    latitude: number | null
    longitude: number | null
    city: string
    error: string | null
    isLoading: boolean
  }>({
    latitude: null,
    longitude: null,
    city: '',
    error: null,
    isLoading: false
  })

  const getLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Tarayıcınız konum servisini desteklemiyor',
        isLoading: false
      }))
      return false
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }))

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            
            // Şehir bilgisini al
            let city = ''
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`
              )
              const data = await response.json()
              city = data.city || data.locality || data.principalSubdivision || 'Konum alındı'
            } catch {
              city = 'Konum alındı'
            }

            setLocation({
              latitude,
              longitude,
              city,
              error: null,
              isLoading: false
            })
            resolve(true)
          } catch {
            setLocation({
              latitude: null,
              longitude: null,
              city: 'Konum alındı',
              error: null,
              isLoading: false
            })
            resolve(true)
          }
        },
        (error) => {
          let errorMessage = 'Konum alınamadı'
          
          switch(error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = 'Konum izni verilmedi. Lütfen tarayıcı ayarlarınızdan izin verin.'
              break
            case 2: // POSITION_UNAVAILABLE
              errorMessage = 'Konum bilgisi alınamıyor. GPS veya internet bağlantınızı kontrol edin.'
              break
            case 3: // TIMEOUT
              errorMessage = 'Konum alımı zaman aşımına uğradı. Lütfen tekrar deneyin.'
              break
          }

          setLocation({
            latitude: null,
            longitude: null,
            city: '',
            error: errorMessage,
            isLoading: false
          })
          resolve(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      )
    })
  }, [])

  const resetLocation = useCallback(() => {
    setLocation({
      latitude: null,
      longitude: null,
      city: '',
      error: null,
      isLoading: false
    })
  }, [])

  return {
    ...location,
    getLocation,
    resetLocation
  }
}
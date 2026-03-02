// hooks/useGeolocationSimple.ts
'use client'

import { useState } from 'react'

export default function useGeolocationSimple() {
  const [location, setLocation] = useState<{
    lat: number | null
    lon: number | null
    city: string
    loading: boolean
    error: string | null
  }>({
    lat: null,
    lon: null,
    city: 'Konum izni istenecek',
    loading: false,
    error: null
  })

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Tarayıcınız konum servisini desteklemiyor',
        city: 'Tarayıcınız konum desteklemiyor'
      }))
      return
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }))

    // BURASI ÖNEMLİ: Direkt çağır, tarayıcı otomatik izin isteyecek
    navigator.geolocation.getCurrentPosition(
      // Başarılı
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        
        // Şehir bilgisi al (opsiyonel)
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

        setLocation({
          lat,
          lon,
          city,
          loading: false,
          error: null
        })
      },
      // Hata
      (error) => {
        let message = 'Konum alınamadı'
        if (error.code === 1) {
          message = 'Konum izni verilmedi. Lütfen izin verin veya şehir seçin.'
        }
        
        setLocation({
          lat: null,
          lon: null,
          city: message,
          loading: false,
          error: message
        })
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return { ...location, getLocation }
}
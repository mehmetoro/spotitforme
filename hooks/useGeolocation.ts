// hooks/useGeolocation.ts
'use client'

import { useState, useEffect } from 'react'

interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface GeolocationError {
  code: number
  message: string
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null
  error: GeolocationError | null
  isLoading: boolean
  getLocation: () => void
  city: string | null
  address: string | null
}

export default function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [city, setCity] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=tr`
      )
      const data = await response.json()
      
      if (data.address) {
        // Şehir bilgisini al
        const cityName = data.address.city || 
                        data.address.town || 
                        data.address.village ||
                        data.address.county ||
                        data.address.state
        setCity(cityName)
        
        // Adres bilgisini oluştur
        const addressParts = [
          data.address.road,
          data.address.neighbourhood,
          data.address.suburb,
          data.address.city_district
        ].filter(Boolean)
        
        setAddress(addressParts.join(', ') || data.display_name)
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Tarayıcınız konum servisini desteklemiyor'
      })
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        }
        
        setPosition(newPosition)
        
        // Koordinattan şehir ve adres bilgisini al
        await reverseGeocode(newPosition.latitude, newPosition.longitude)
        
        setIsLoading(false)
      },
      (err) => {
        setError({
          code: err.code,
          message: err.message
        })
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  useEffect(() => {
    // İlk yüklemede konum almayalım, kullanıcı izni ile alalım
  }, [])

  return { position, error, isLoading, getLocation, city, address }
}
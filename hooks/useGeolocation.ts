// hooks/useGeolocation.ts - TYPE FIXED
'use client'

import { useState, useEffect, useCallback } from 'react'

// Browser'ın native GeolocationPosition interface'ini kullan
interface GeolocationCoordinates {
  readonly latitude: number
  readonly longitude: number
  readonly accuracy: number
  readonly altitude: number | null
  readonly altitudeAccuracy: number | null
  readonly heading: number | null
  readonly speed: number | null
}

interface GeolocationPosition {
  readonly coords: GeolocationCoordinates
  readonly timestamp: number
}

// Özelleştirilmiş interface'lerimiz
interface CustomGeolocationPosition {
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
  position: CustomGeolocationPosition | null
  error: GeolocationError | null
  isLoading: boolean
  getLocation: () => Promise<CustomGeolocationPosition | null>
  city: string | null
  address: string | null
  isSupported: boolean
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown'
}

export default function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<CustomGeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [city, setCity] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')

  // Tarayıcı konum desteğini kontrol et
  useEffect(() => {
    if (!navigator.geolocation) {
      setIsSupported(false)
      setError({
        code: 0,
        message: 'Tarayıcınız konum servisini desteklemiyor'
      })
    }
  }, [])

  // Konum izni durumunu kontrol et
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as any })
        .then((permissionStatus) => {
          setPermissionStatus(permissionStatus.state as any)
          
          permissionStatus.onchange = () => {
            setPermissionStatus(permissionStatus.state as any)
          }
        })
        .catch(() => {
          setPermissionStatus('unknown')
        })
    }
  }, [])

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      // Basit şehir tespiti - Google API olmadan
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=tr`
      )
      const data = await response.json()
      
      if (data.address) {
        const cityName = data.address.city || 
                        data.address.town || 
                        data.address.village ||
                        data.address.county ||
                        data.address.state ||
                        'Bilinmeyen Konum'
        setCity(cityName)
        setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      } else {
        // Fallback: Koordinatları göster
        setCity(`Konum (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
        setAddress(`GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      // Türkiye şehir koordinatları (basit yaklaşım)
      const cities = [
        { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
        { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
        { name: 'İzmir', lat: 38.4237, lng: 27.1428 },
        { name: 'Bursa', lat: 40.1885, lng: 29.0610 },
        { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
        { name: 'Adana', lat: 37.0000, lng: 35.3213 },
        { name: 'Konya', lat: 37.8667, lng: 32.4833 },
        { name: 'Trabzon', lat: 41.0015, lng: 39.7178 },
      ]
      
      let nearestCity = 'Türkiye Geneli'
      let minDistance = Infinity
      
      cities.forEach(({ name, lat: cityLat, lng: cityLng }) => {
        const distance = Math.sqrt(
          Math.pow(lat - cityLat, 2) + Math.pow(lng - cityLng, 2)
        )
        if (distance < minDistance && distance < 0.5) { // ~50km içindeyse
          minDistance = distance
          nearestCity = name
        }
      })
      
      setCity(nearestCity)
      setAddress(`GPS Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }, [])

  const getLocation = useCallback(async (): Promise<CustomGeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError({
          code: 0,
          message: 'Tarayıcınız konum servisini desteklemiyor'
        })
        resolve(null)
        return
      }

      setIsLoading(true)
      setError(null)

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }

      const successCallback = (pos: GeolocationPosition) => {
        const newPosition: CustomGeolocationPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        }
        
        setPosition(newPosition)
        reverseGeocode(newPosition.latitude, newPosition.longitude)
        
        setIsLoading(false)
        setPermissionStatus('granted')
        resolve(newPosition)
      }

      const errorCallback = (err: GeolocationPositionError) => {
        let errorMessage = 'Konum alınamadı'
        
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.'
            setPermissionStatus('denied')
            break
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Konum bilgisi alınamıyor. GPS\'inizin açık olduğundan emin olun.'
            break
          case 3: // TIMEOUT
            errorMessage = 'Konum alımı zaman aşımına uğradı. Lütfen tekrar deneyin.'
            break
          default:
            errorMessage = 'Bilinmeyen bir hata oluştu'
        }

        setError({
          code: err.code,
          message: errorMessage
        })
        setIsLoading(false)
        resolve(null)
      }

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      )
    })
  }, [reverseGeocode])

  // İlk yüklemede otomatik konum al
  useEffect(() => {
    const checkAndGetLocation = async () => {
      if (permissionStatus === 'granted' && !position) {
        await getLocation()
      }
    }
    
    checkAndGetLocation()
  }, [permissionStatus, getLocation, position])

  return { 
    position, 
    error, 
    isLoading, 
    getLocation, 
    city, 
    address, 
    isSupported,
    permissionStatus 
  }
}

// TypeScript için GeolocationPositionError interface'i
interface GeolocationPositionError {
  readonly code: number
  readonly message: string
  readonly PERMISSION_DENIED: number
  readonly POSITION_UNAVAILABLE: number
  readonly TIMEOUT: number
}
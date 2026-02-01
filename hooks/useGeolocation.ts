// hooks/useSimpleLocation.ts
'use client'

import { useState, useCallback } from 'react'

export default function useSimpleLocation() {
  const [isLoading, setIsLoading] = useState(false)
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)

  const getLocation = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Tarayıcınız konum servisini desteklemiyor')
        resolve(null)
        return
      }

      setIsLoading(true)
      setError('')

      const success = async (position: GeolocationPosition) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setCoordinates({ lat, lng })
        
        // Basit şehir tespiti
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=tr`
          )
          const data = await response.json()
          
          if (data.city) {
            setCity(data.city)
            resolve(data.city)
          } else if (data.locality) {
            setCity(data.locality)
            resolve(data.locality)
          } else {
            // Türkiye şehir yaklaşımı
            const cities = [
              { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
              { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
              { name: 'İzmir', lat: 38.4237, lng: 27.1428 },
              { name: 'Bursa', lat: 40.1885, lng: 29.0610 },
              { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
            ]
            
            let nearestCity = 'Türkiye Geneli'
            let minDistance = Infinity
            
            cities.forEach(({ name, lat: cityLat, lng: cityLng }) => {
              const distance = Math.sqrt(
                Math.pow(lat - cityLat, 2) + Math.pow(lng - cityLng, 2)
              )
              if (distance < minDistance && distance < 0.3) {
                minDistance = distance
                nearestCity = name
              }
            })
            
            setCity(nearestCity)
            resolve(nearestCity)
          }
        } catch (err) {
          // API hatasında koordinat göster
          setCity(`${lat.toFixed(2)}, ${lng.toFixed(2)}`)
          resolve(`${lat.toFixed(2)}, ${lng.toFixed(2)}`)
        } finally {
          setIsLoading(false)
        }
      }

      const failure = (err: GeolocationPositionError) => {
        let errorMsg = 'Konum alınamadı'
        
        if (err.code === 1) {
          errorMsg = 'Konum izni reddedildi. Lütfen telefonunuzun konumunu açın ve sayfayı yenileyin.'
        } else if (err.code === 2) {
          errorMsg = 'Konum bilgisi alınamıyor. Lütfen telefonunuzun konum servisini açın.'
        } else if (err.code === 3) {
          errorMsg = 'Konum alımı zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.'
        }
        
        setError(errorMsg)
        setIsLoading(false)
        resolve(null)
      }

      navigator.geolocation.getCurrentPosition(success, failure, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })
  }, [])

  return {
    city,
    coordinates,
    isLoading,
    error,
    getLocation,
    isSupported: typeof navigator !== 'undefined' && !!navigator.geolocation
  }
}
// app/sightings/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Sighting {
  id: string
  spot_id: string
  spotter_id: string
  image_url: string | null
  location_description: string
  price: string | null
  notes: string | null
  category: string | null
  hashtags: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  spotter: { id: string; full_name: string; avatar_url: string | null } | null
  spot: { id: string; title: string; description: string } | null
}

export default function SightingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [sighting, setSighting] = useState<Sighting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    console.log('🔄 useEffect params.id:', { id, paramsId: params.id })
    
    if (id) {
      console.log('📍 Fetching sighting with id:', id)
      fetchSighting(id)
    } else {
      console.warn('useEffect: params.id not ready yet', params)
      setError('Sighting ID not found')
      setLoading(false)
    }
  }, [params.id])

  const fetchSighting = async (sightingId: string) => {
    try {
      // Check if id is available
      if (!sightingId) {
        console.error('sightingId missing:', sightingId)
        setError('Sighting ID not found')
        setLoading(false)
        return
      }

      // Validate that sightingId is not empty
      if (sightingId === 'undefined' || sightingId.trim() === '') {
        console.error('sightingId invalid:', sightingId)
        setError('Sighting ID invalid')
        setLoading(false)
        return
      }

      console.log('API call starting. Sighting ID:', sightingId)

      // API endpoint'ini çağır (service role ile protected queries'ler bypass edecek)
      const response = await fetch(`/api/sightings/${sightingId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error response:', {
          status: response.status,
          error: errorData.error
        })
        setError(errorData.error || 'Failed to load sighting')
        setLoading(false)
        return
      }

      const sightingData = await response.json()

      if (!sightingData) {
        console.error('API sighting data empty:', sightingId)
        setError('Sighting not found')
        setLoading(false)
        return
      }

      console.log('✅ Sighting API dan basarili sekilde alindi:', sightingData)

      let spotter = null
      let spot = null

      // API'den dönen spotter ve spot bilgilerini al
      if (sightingData.spotter) {
        console.log('Spotter data from API:', sightingData.spotter)
        spotter = sightingData.spotter
      } else if (sightingData.spotter_id) {
        console.log('Spotter ID exists but no data:', sightingData.spotter_id)
      }

      if (sightingData.spot) {
        console.log('Spot data from API:', sightingData.spot)
        spot = sightingData.spot
      } else if (sightingData.spot_id) {
        console.log('Spot ID exists but no data:', sightingData.spot_id)
      }

      // Combine all data
      const fullSighting = {
        ...sightingData,
        spotter,
        spot
      }

      setSighting(fullSighting)
      console.log('Setting sighting completed')
    } catch (err: any) {
      console.error('Catch block - Sighting fetch error:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        stack: err?.stack,
        fullError: err
      })
      setError(err?.message || 'Failed to load sighting')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openGoogleMaps = () => {
    if (sighting?.latitude && sighting?.longitude) {
      window.open(
        `https://www.google.com/maps?q=${sighting.latitude},${sighting.longitude}`,
        '_blank'
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !sighting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Yardım bulunamadı'}</h1>
          <Link href="/sightings" className="text-blue-600 hover:text-blue-700">
            Geri Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        {/* Back Button */}
        <Link href="/sightings" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Yardımlara Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Image */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {sighting.image_url ? (
                <img
                  src={sighting.image_url}
                  alt="Sighting"
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400 text-5xl">
                  📷
                </div>
              )}
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            {/* Spotter Card */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold text-gray-900 mb-3">👤 Kim Buldu?</h3>
              <div className="flex items-center space-x-3">
                {sighting.spotter?.avatar_url && (
                  <img
                    src={sighting.spotter.avatar_url}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {sighting.spotter?.full_name || 'Kullanıcı'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(sighting.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Price */}
            {sighting.price && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Fiyat</p>
                <p className="text-2xl font-bold text-green-600">₺{sighting.price}</p>
              </div>
            )}

            {/* Location */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">📍 Nerede Bulundu?</p>
              <p className="font-medium text-gray-900 mb-3">
                {sighting.location_description}
              </p>
              {sighting.latitude && sighting.longitude && (
                <button
                  onClick={openGoogleMaps}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  🗺️ Haritada Gör
                </button>
              )}
            </div>

            {/* Category */}
            {sighting.category && (
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-600 mb-2">Kategori</p>
                <p className="font-medium text-gray-900">{sighting.category}</p>
              </div>
            )}

            {/* Hashtags */}
            {sighting.hashtags && (
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-600 mb-2">Hashtag'ler</p>
                <div className="flex flex-wrap gap-2">
                  {sighting.hashtags.split(' ').filter(h => h.startsWith('#')).map((tag, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {sighting.notes && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="font-bold text-gray-900 mb-3">📝 Ek Bilgiler</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{sighting.notes}</p>
          </div>
        )}

        {/* Spot Info */}
        {sighting.spot && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="font-bold text-gray-900 mb-3">🎯 Aranan Ürün Hakkında</h2>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{sighting.spot.title}</h3>
            <p className="text-gray-600 mb-4">{sighting.spot.description}</p>
            <Link
              href={`/spots/${sighting.spot.id}`}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Spotu Aç
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

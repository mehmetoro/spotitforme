// app/sightings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ResponsiveAd from '@/components/ResponsiveAd'

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
  spotter: { full_name: string; avatar_url: string | null } | null
  spot: { title: string } | null
}

export default function SightingsPage() {
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    hasLocation: 'all', // all, with, without
    hasPrice: 'all',
    category: '',
    searchText: '',
    hashtag: ''
  })

  useEffect(() => {
    fetchSightings()
  }, [])

  const fetchSightings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.hasLocation !== 'all') params.append('hasLocation', filters.hasLocation)
      if (filters.hasPrice !== 'all') params.append('hasPrice', filters.hasPrice)
      if (filters.searchText) params.append('search', filters.searchText)
      if (filters.hashtag) params.append('hashtag', filters.hashtag)

      const response = await fetch(`/api/sightings?${params.toString()}`)
      if (!response.ok) throw new Error('Sightings fetch failed')
      
      const data = await response.json()
      console.log('✅ Fetched sightings:', data.length)
      
      // Map data to Sighting type (handle arrays from relations)
      const mappedData = data.map((item: any) => ({
        ...item,
        spotter: Array.isArray(item.spotter) ? item.spotter[0] : item.spotter,
        spot: Array.isArray(item.spot) ? item.spot[0] : item.spot
      }))

      setSightings(mappedData)
    } catch (error) {
      console.error('Sightings fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  // Filtreler değişince refetch et
  useEffect(() => {
    fetchSightings()
  }, [filters])

  const getCategories = () => {
    return ['Elektronik', 'Giyim', 'Ev Eşyaları', 'Spor', 'Kitap', 'Oyuncak', 'Diğer']
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <main className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📍 Yardımlar</h1>
          <p className="text-gray-600 mt-2">Kullanıcıların bulduğu ürünleri ve konumlarını gör</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">🔍 Filtreler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ara (Konum, Not, Ürün)
              </label>
              <input
                type="text"
                placeholder="Örn: Kadıköy, iPhone"
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Kategoriler</option>
                {getCategories().map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Has Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konum
              </label>
              <select
                value={filters.hasLocation}
                onChange={(e) => handleFilterChange('hasLocation', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Yardımlar</option>
                <option value="with">📍 Konum İçeren</option>
                <option value="without">Konum İçermeyenler</option>
              </select>
            </div>

            {/* Has Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat Bilgisi
              </label>
              <select
                value={filters.hasPrice}
                onChange={(e) => handleFilterChange('hasPrice', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Yardımlar</option>
                <option value="with">💰 Fiyat İçeren</option>
                <option value="without">Fiyat İçermeyenler</option>
              </select>
            </div>

            {/* Hashtag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtag
              </label>
              <input
                type="text"
                placeholder="Örn: stokta (# işareti olmadan)"
                value={filters.hashtag}
                onChange={(e) => handleFilterChange('hashtag', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {sightings.length} yardım bulundu
          </p>
        </div>

        {/* Promotion Banner */}
        <div className="mb-8">
          <ResponsiveAd placement="inline" />
        </div>

        {/* Sightings Grid */}
        {sightings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Yardım bulunamadı
            </h2>
            <p className="text-gray-600">
              Filtrelerinizi değiştirip tekrar deneyin
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sightings.map((sighting) => (
              <Link
                key={sighting.id}
                href={`/sightings/${sighting.id}`}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {sighting.image_url ? (
                    <img
                      src={sighting.image_url}
                      alt="Sighting"
                      className="w-full h-full object-cover hover:scale-110 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                      📷
                    </div>
                  )}
                  {sighting.latitude && sighting.longitude && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      📍 GPS
                    </div>
                  )}
                  {sighting.price && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                      ₺{sighting.price}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Spot Title */}
                  <h3 className="font-bold text-gray-900 truncate mb-2">
                    {sighting.spot?.title || 'Bilinmeyen Ürün'}
                  </h3>

                  {/* Location */}
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    📍 {sighting.location_description}
                  </p>

                  {/* Notes */}
                  {sighting.notes && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {sighting.notes}
                    </p>
                  )}

                  {/* Hashtags */}
                  {sighting.hashtags && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {sighting.hashtags.split(' ').filter(h => h.startsWith('#')).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {sighting.spotter?.avatar_url && (
                        <img
                          src={sighting.spotter.avatar_url}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-xs text-gray-600">
                        {sighting.spotter?.full_name || 'Kullanıcı'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(sighting.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

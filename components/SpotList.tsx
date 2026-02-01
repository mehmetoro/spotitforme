// components/SpotList.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SpotCard from './SpotCard'

interface Spot {
  id: string
  title: string
  description: string
  category: string | null
  location: string | null
  image_url: string | null
  status: string
  created_at: string
  user_id: string
  views: number
  helps: number
  user?: {
    name: string | null
  }
}

export default function SpotList() {
  const searchParams = useSearchParams()
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // URL parametrelerini al
  const category = searchParams.get('category') || 'all'
  const location = searchParams.get('location') || 'all'
  const status = searchParams.get('status') || 'all'
  const searchQuery = searchParams.get('search') || ''
  const sortBy = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const dateRange = searchParams.get('dateRange') || 'all'

  const fetchSpots = useCallback(async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('spots')
        .select('*', { count: 'exact' })

      // 🔍 ARAMA FİLTRESİ
      if (searchQuery && searchQuery.trim() !== '') {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // 📂 KATEGORİ FİLTRESİ
      if (category !== 'all') {
        query = query.eq('category', category)
      }

      // 📍 KONUM FİLTRESİ
      if (location !== 'all') {
        query = query.eq('location', location)
      }

      // 🟢 DURUM FİLTRESİ
      if (status !== 'all') {
        if (status === 'urgent') {
          query = query.eq('status', 'active').eq('is_urgent', true)
        } else {
          query = query.eq('status', status)
        }
      }

      // 💰 FİYAT FİLTRESİ (eğer sightings tablosunda fiyat varsa)
      if (minPrice || maxPrice) {
        // Önce price range'i olan spot id'lerini bul
        const { data: pricedSpots } = await supabase
          .from('sightings')
          .select('spot_id, price')
          .not('price', 'is', null)
          
        if (pricedSpots && pricedSpots.length > 0) {
          const spotIds = pricedSpots
            .filter(sighting => {
              const price = sighting.price
              if (minPrice && maxPrice) {
                return price >= parseFloat(minPrice) && price <= parseFloat(maxPrice)
              } else if (minPrice) {
                return price >= parseFloat(minPrice)
              } else if (maxPrice) {
                return price <= parseFloat(maxPrice)
              }
              return true
            })
            .map(s => s.spot_id)
          
          if (spotIds.length > 0) {
            query = query.in('id', spotIds)
          } else {
            // Eşleşen fiyat yoksa boş array döndür
            query = query.in('id', [])
          }
        }
      }

      // 📅 TARİH FİLTRESİ
      if (dateRange !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case '3months':
            startDate.setMonth(now.getMonth() - 3)
            break
        }
        
        if (dateRange !== 'all') {
          query = query.gte('created_at', startDate.toISOString())
        }
      }

      // 📊 SIRALAMA
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'most_viewed':
          query = query.order('views', { ascending: false })
          break
        case 'most_helped':
          query = query.order('helps', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // LIMIT
      query = query.limit(30)

      const { data, error, count } = await query

      if (error) {
        console.error('Spot yükleme hatası:', error)
        // TEST VERİSİ - Gerçekte bu kısmı kaldırabilirsiniz
        setSpots(getFilteredTestSpots())
        setTotalCount(getFilteredTestSpots().length)
      } else {
        // RESİM URL'LERİNİ TEMİZLE
        const cleanedSpots = cleanImageUrls(data || [])
        setSpots(cleanedSpots)
        setTotalCount(count || 0)
        
        console.log(`📊 Filtrelenmiş: ${cleanedSpots.length} spot`)
        console.log('Filtreler:', { category, location, status, searchQuery })
      }
    } catch (err) {
      console.error('Beklenmeyen hata:', err)
      setSpots([])
    } finally {
      setLoading(false)
    }
  }, [category, location, status, searchQuery, sortBy, minPrice, maxPrice, dateRange])

  useEffect(() => {
    fetchSpots()
  }, [fetchSpots])

  const cleanImageUrls = (spots: any[]): Spot[] => {
    return spots.map(spot => {
      let image_url = spot.image_url
      
      if (image_url && typeof image_url === 'string') {
        image_url = image_url.trim()
        image_url = image_url.replace(/["']/g, '')
        
        if (image_url.startsWith('http://')) {
          image_url = image_url.replace('http://', 'https://')
        }
        
        if (image_url.startsWith('//')) {
          image_url = 'https:' + image_url
        }
        
        if (image_url.includes('supabase.co')) {
          if (image_url.includes('/storage/v1/object/') && !image_url.includes('/public/')) {
            image_url = image_url.replace('/object/', '/object/public/')
          }
        }
        
        try {
          new URL(image_url)
        } catch {
          image_url = null
        }
      } else {
        image_url = null
      }
      
      return {
        ...spot,
        image_url
      }
    })
  }

  // TEST VERİSİ (geçici)
  const getFilteredTestSpots = (): Spot[] => {
    const testSpots = [
      {
        id: '1',
        title: 'Vintage Nikon F2 Kamera Lens 50mm f/1.4',
        description: 'Orijinal 50mm f/1.4 lens arıyorum. 1970lerden kalma.',
        category: 'Elektronik',
        location: 'İstanbul',
        image_url: 'https://gobzxreumkbgaohvzoef.supabase.co/storage/v1/object/public/spot-images/7f4b4b19-992c-47b6-a1ba-29d339dade1b/1769311004662.png',
        status: 'active',
        created_at: new Date().toISOString(),
        user_id: 'test',
        views: 10,
        helps: 2
      },
      {
        id: '2',
        title: 'Eski Arçelik Çay Makinesi Cam Kapağı',
        description: 'Arçelik K 2712 modeli için cam kapak arıyorum.',
        category: 'Ev & Bahçe',
        location: 'İzmir',
        image_url: null,
        status: 'active',
        created_at: new Date().toISOString(),
        user_id: 'test',
        views: 5,
        helps: 1
      },
      {
        id: '3',
        title: 'Retro PlayStation 1 Oyun Koleksiyonu',
        description: 'Crash Bandicoot, Tekken 3 orijinal CDleri.',
        category: 'Oyuncak & Oyun',
        location: 'Ankara',
        image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
        status: 'found',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'test',
        views: 25,
        helps: 7
      }
    ]

    // Filtre uygula
    return testSpots.filter(spot => {
      if (category !== 'all' && spot.category !== category) return false
      if (location !== 'all' && spot.location !== location) return false
      if (status !== 'all' && spot.status !== status) return false
      if (searchQuery && !spot.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }

  const categories = [
    'Tümü', 'Elektronik', 'Giyim & Aksesuar', 'Ev & Bahçe',
    'Koleksiyon', 'Kitap & Müzik', 'Oyuncak & Oyun',
    'Spor & Outdoor', 'Araç & Parça', 'Diğer'
  ]

  const locations = [
    'Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
    'Adana', 'Konya', 'Trabzon', 'Türkiye Geneli', 'Yurt Dışı'
  ]

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Spot'lar yükleniyor...</p>
      </div>
    )
  }

  return (
    <div>
      {/* AKTİF FİLTRELER GÖSTERİMİ */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-0">
            <span className="text-sm text-gray-700">Aktif filtreler:</span>
            
            {category !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Kategori: {category}
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('category')
                    window.location.href = `/spots?${params.toString()}`
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {location !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Konum: {location}
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('location')
                    window.location.href = `/spots?${params.toString()}`
                  }}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {status !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Durum: {status === 'active' ? 'Aktif' : status === 'found' ? 'Bulundu' : 'Acil'}
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('status')
                    window.location.href = `/spots?${params.toString()}`
                  }}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                Arama: "{searchQuery}"
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('search')
                    window.location.href = `/spots?${params.toString()}`
                  }}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {(category !== 'all' || location !== 'all' || status !== 'all' || searchQuery) && (
              <button
                onClick={() => window.location.href = '/spots'}
                className="text-sm text-red-600 hover:text-red-800 ml-2"
              >
                Tümünü Temizle
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {totalCount} spot bulundu
          </div>
        </div>
      </div>

      {/* SPOT LİSTESİ */}
      {spots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <div className="text-5xl mb-6">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Filtrelere uygun spot bulunamadı
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Filtrelerinizi değiştirmeyi deneyin veya ilk spot'u oluşturun!
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/spots'}
              className="btn-primary inline-block"
            >
              Filtreleri Temizle
            </button>
            <a
              href="/create-spot"
              className="btn-secondary inline-block"
            >
              İlk Spot'u Oluşturun
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
          
          {/* SAYFALAMA (Basit versiyon) */}
          {spots.length >= 30 && (
            <div className="mt-8 text-center">
              <div className="inline-flex space-x-2 bg-white rounded-xl shadow p-2">
                <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200">
                  ← Önceki
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200">
                  2
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200">
                  3
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200">
                  Sonraki →
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Daha fazla spot için filtrelerinizi daraltın
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
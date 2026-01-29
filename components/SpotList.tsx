'use client'

import { useEffect, useState } from 'react'
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
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [category, setCategory] = useState('all')
  const [location, setLocation] = useState('all')

  // RESİM URL'LERİNİ TEMİZLE
  const cleanImageUrls = (spots: any[]): Spot[] => {
    return spots.map(spot => {
      let image_url = spot.image_url
      
      if (image_url && typeof image_url === 'string') {
        // Temizleme işlemleri
        image_url = image_url.trim()
        image_url = image_url.replace(/["']/g, '')
        
        // http -> https
        if (image_url.startsWith('http://')) {
          image_url = image_url.replace('http://', 'https://')
        }
        
        // // -> https://
        if (image_url.startsWith('//')) {
          image_url = 'https:' + image_url
        }
        
        // Supabase URL formatı
        if (image_url.includes('supabase.co')) {
          if (image_url.includes('/storage/v1/object/') && !image_url.includes('/public/')) {
            image_url = image_url.replace('/object/', '/object/public/')
          }
        }
        
        // URL geçerli mi?
        try {
          new URL(image_url)
        } catch {
          console.warn('Geçersiz URL, null yapılıyor:', image_url)
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

  useEffect(() => {
    fetchSpots()
  }, [filter, category, location])

  const fetchSpots = async () => {
    setLoading(true)
    
    try {
      // BASE QUERY
      let query = supabase
        .from('spots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)

      // FİLTRELER
      if (filter !== 'all') {
        query = query.eq('status', filter)
      }
      
      if (category !== 'all') {
        query = query.eq('category', category)
      }
      
      if (location !== 'all') {
        query = query.eq('location', location)
      }

      const { data, error } = await query

      if (error) {
        console.error('Spot yükleme hatası:', error)
        // TEST VERİSİ
        setSpots([
          {
            id: 'test-1',
            title: 'Vintage Nikon Kamera Lens',
            description: 'Test açıklaması - resimli',
            category: 'Fotoğraf Makineleri',
            location: 'İstanbul',
            image_url: 'https://gobzxreumkbgaohvzoef.supabase.co/storage/v1/object/public/spot-images/7f4b4b19-992c-47b6-a1ba-29d339dade1b/1769311004662.png',
            status: 'active',
            created_at: new Date().toISOString(),
            user_id: 'test',
            views: 10,
            helps: 2
          },
          {
            id: 'test-2',
            title: 'Eski Çay Makinesi Parçası',
            description: 'Test açıklaması - resimsiz',
            category: 'Ev Eşyaları',
            location: 'İzmir',
            image_url: null,
            status: 'active',
            created_at: new Date().toISOString(),
            user_id: 'test',
            views: 5,
            helps: 1
          }
        ])
      } else {
        // RESİM URL'LERİNİ TEMİZLE
        const cleanedSpots = cleanImageUrls(data || [])
        setSpots(cleanedSpots)
        
        // DEBUG: Resimli spot sayısı
        const spotsWithImages = cleanedSpots.filter(s => s.image_url)
        console.log(`📊 ${cleanedSpots.length} spot, ${spotsWithImages.length} resimli`)
      }
    } catch (err) {
      console.error('Beklenmeyen hata:', err)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Tümü', 'Elektronik', 'Fotoğraf Makineleri', 'Giyim & Aksesuar', 
    'Ev & Bahçe', 'Koleksiyon', 'Oyunlar', 'Spor & Outdoor', 'Diğer'
  ]

  const locations = [
    'Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 
    'Türkiye Geneli', 'Yurt Dışı'
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
      {/* FİLTRELER */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <div className="flex space-x-2">
              {['all', 'active', 'found'].map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {value === 'all' ? 'Tümü' : value === 'active' ? 'Aktif' : 'Bulundu'}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'Tümü' ? 'all' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Konum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konum
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc === 'Tümü' ? 'all' : loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* İSTATİSTİK */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {spots.length} spot • {
              spots.filter(s => s.image_url).length
            } resimli
          </div>
          <button
            onClick={fetchSpots}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ↻ Yenile
          </button>
        </div>
      </div>

      {/* SPOT LİSTESİ */}
      {spots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Spot bulunamadı
          </h3>
          <p className="text-gray-600 mb-6">
            Filtrelerinizi değiştirin veya ilk spot'u oluşturun!
          </p>
          <a
            href="/create-spot"
            className="btn-primary inline-block"
          >
            İlk Spot'u Oluşturun
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  )
}
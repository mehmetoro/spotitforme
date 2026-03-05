// components/RecentSightings.tsx - GÜNCELLENMİŞ
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' // ESKİ VERSİYONU KULLAN
import { MapPin, Camera, Award } from 'lucide-react'

interface RecentSightingsProps {
  initialSightings?: any[] // Opsiyonel: Server'dan gelebilir
}

export default function RecentSightings({ initialSightings = [] }: RecentSightingsProps) {
  const router = useRouter()
  const [sightings, setSightings] = useState<any[]>(initialSightings)
  const [loading, setLoading] = useState(!initialSightings.length)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!initialSightings.length) {
      fetchSightings()
    }
  }, [])

  const fetchSightings = async () => {
    try {
      const { data } = await supabase
        .from('quick_sightings')
        .select(`
          *,
          user:user_profiles(full_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)
      
      setSightings(data || [])
    } catch (error) {
      console.error('Sightings yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const displaySightings = showAll ? sightings : sightings.slice(0, 4)

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">👁️ Son Görülenler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (sightings.length === 0) {
    return null // Hiç sighting yoksa gözükmesin
  }

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              👁️ Son Görülenler
            </h2>
            <p className="text-gray-600">
              Topluluğumuzun en son gördüğü nadir ürünler
            </p>
          </div>
          
          {sightings.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAll ? 'Daha Az Göster' : `Tümünü Gör (${sightings.length})`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displaySightings.map((sighting) => (
            <div
              key={sighting.id}
              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => router.push(`/sightings/${sighting.id}`)}
            >
              {/* Fotoğraf */}
              <div className="h-48 relative bg-gray-100">
                {sighting.photo_url ? (
                  <img
                    src={sighting.photo_url}
                    alt={sighting.description}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Fotoğraf Yok</p>
                    </div>
                  </div>
                )}
                
                {/* Puan badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    +{sighting.points_earned}
                  </div>
                </div>
              </div>

              {/* İçerik */}
              <div className="p-4">
                <p className="font-medium text-gray-900 line-clamp-2 mb-3">
                  {sighting.description}
                </p>
                
                {/* Konum */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{sighting.location_name}</span>
                </div>
                
                {/* Kullanıcı */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2">
                      {sighting.user?.full_name?.[0] || 'K'}
                    </div>
                    <span className="text-sm text-gray-700">
                      {sighting.user?.full_name || 'Kullanıcı'}
                    </span>
                  </div>
                  
                  <span className="text-blue-600 text-sm font-medium">
                    Detay →
                  </span>
                </div>
                
                {/* Kategori */}
                {sighting.category && (
                  <div className="mt-3">
                    <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                      {sighting.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ben de arıyorum CTA */}
        <div className="mt-10 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Bu ürünlerden birini siz de mi arıyorsunuz?
          </h3>
          <p className="text-gray-700 mb-6">
            "Ben de arıyorum" deyin, spot oluşturalım ve bulalım!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/create-spot')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Spot Oluştur
            </button>
            <button
              onClick={() => router.push('/recent-sightings')}
              className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-8 rounded-lg border"
            >
              Tüm Görülenleri İncele
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
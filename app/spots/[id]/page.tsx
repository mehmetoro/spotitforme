// app/spots/[id]/page.tsx - DÜZELTMİŞ HALİ
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SimpleMap from '@/components/SimpleMap'
import SimpleShareButtons from '@/components/SimpleShareButtons'
import SightingModal from '@/components/SightingModal'

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
  total_helps: number
  user?: {
    full_name: string | null
  }
}

export default function SpotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const spotId = params.id as string
  
  const [spot, setSpot] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSightingModal, setShowSightingModal] = useState(false)

  useEffect(() => {
    if (spotId) {
      fetchSpotDetails()
    }
  }, [spotId])

  const fetchSpotDetails = async () => {
    try {
      // Spot bilgilerini getir
      const { data: spotData, error: spotError } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spotId)
        .single()

      if (spotError) {
        console.error('Spot bulunamadı:', spotError)
        return
      }

      // Kullanıcı bilgilerini getir
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', spotData.user_id)
        .single()

      // Görüntüleme sayısını artır
      await supabase
        .from('spots')
        .update({ views: (spotData.views || 0) + 1 })
        .eq('id', spotId)

      setSpot({
        ...spotData,
        user: userData || { full_name: null }
      })
    } catch (error) {
      console.error('Spot detayları yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHelpClick = () => {
    setShowSightingModal(true)
  }

  const handleMessageRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Mesaj talebi için giriş yapmanız gerekir')
        router.push('/auth/login')
        return
      }

      if (!spot?.user_id) {
        alert('Spot sahibi bilgisi bulunamadı')
        return
      }

      if (spot.user_id === user.id) {
        alert('Kendi spotunuza mesaj talebi gönderemezsiniz.')
        return
      }

      const draft = `Merhaba, \"${spot.title}\" spot paylaşımınız için yardımcı olmak istiyorum. Müsait olduğunuzda dönüş yapabilir misiniz?`
      const params = new URLSearchParams({
        receiver: spot.user_id,
        type: 'spot',
        draft,
      })

      router.push(`/messages?${params.toString()}`)
    } catch (error) {
      console.error('Spot message request navigation error:', error)
      alert('Mesaj talebi başlatılamadı')
    }
  }

  const handleSightingSuccess = () => {
    setShowSightingModal(false)
    // Spot verilerini yeniden yükle
    fetchSpotDetails()
    // Başarı mesajı göster (opsiyonel)
    alert('Teşekkürler! Yardım bildiriminiz inceleme için gönderildi. Onaylandığında Spot ödülü işlenecek. 🎉')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </main>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Spot bulunamadı</h1>
          <p className="text-gray-600 mb-8">Bu spot silinmiş veya mevcut değil.</p>
          <button
            onClick={() => router.push('/spots')}
            className="btn-primary"
          >
            Tüm Spot'lara Dön
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        {/* Üst Navigasyon */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/spots')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Tüm Spot'lara Dön
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Spot Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* Spot Başlığı */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      spot.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {spot.status === 'active' ? 'Aktif' : 'Bulundu'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {spot.title}
                  </h1>
                </div>
              </div>

              {/* Spot Resmi */}
              {spot.image_url && (
                <div className="mb-6">
                  <div className="relative h-96 w-full rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={spot.image_url}
                      alt={spot.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Açıklama */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Açıklama</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {spot.description}
                </p>
              </div>

              {/* Detaylar */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Kategori</h3>
                  <p className="font-medium">{spot.category || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Konum</h3>
                  <p className="font-medium">{spot.location || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Görüntülenme</h3>
                  <p className="font-medium">{spot.views} kez</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Yardım</h3>
                  <p className="font-medium">{spot.total_helps} kişi yardım etti</p>
                </div>
              </div>
            </div>

            {/* Harita Bölümü */}
            {spot.location && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  📍 Konum Bilgisi
                </h2>
                <SimpleMap location={spot.location} />
              </div>
            )}

            {/* Yardım Butonu */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Bu ürünü gördünüz mü?</h3>
              <p className="mb-6 opacity-90">Topluluğa yardım edin, başkalarını mutlu edin</p>
              <button
                onClick={handleHelpClick}
                className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg"
              >
                Evet, Ben Gördüm!
              </button>
            </div>
          </div>

          {/* Sağ Kolon - Yan Bilgiler */}
          <div className="space-y-6">
            {/* Paylaşım */}
            <SimpleShareButtons 
              url={`/spots/${spot.id}`} 
              title={spot.title} 
            />

            {/* Spot Sahibi */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Spot Sahibi
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {spot.user?.full_name?.[0]?.toUpperCase() || 'K'}
                </div>
                <div>
                  <p className="font-medium">{spot.user?.full_name || 'Kullanıcı'}</p>
                  <p className="text-sm text-gray-500">
                    Topluluk üyesi
                  </p>
                </div>
              </div>
              <button
                onClick={handleMessageRequest}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl"
              >
                Mesaj Talebi Gönder
              </button>
            </div>

            {/* İstatistikler */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                İstatistikler
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Görüntülenme:</span>
                  <span className="font-bold">{spot.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yardım Edenler:</span>
                  <span className="font-bold">{spot.total_helps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Oluşturulma:</span>
                  <span className="font-bold">
                    {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Kategori Bilgisi */}
            {spot.category && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Kategori
                </h3>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {spot.category === 'Elektronik' && '🔌'}
                    {spot.category === 'Fotoğraf Makineleri' && '📷'}
                    {spot.category === 'Giyim & Aksesuar' && '👕'}
                    {spot.category === 'Ev & Bahçe' && '🏠'}
                    {spot.category === 'Koleksiyon' && '🎨'}
                    {spot.category === 'Kitap & Müzik' && '📚'}
                    {spot.category === 'Diğer' && '📦'}
                  </span>
                  <span className="font-medium">{spot.category}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SIGHTING MODAL */}
      {showSightingModal && (
        <SightingModal
          spotId={spotId as string}
          spotTitle={spot.title}
          onClose={() => setShowSightingModal(false)}
          onSuccess={handleSightingSuccess}
        />
      )}
    </div>
  )
}
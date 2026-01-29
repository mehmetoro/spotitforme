// app/spots/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

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
    email: string
  }
}

interface Sighting {
  id: string
  spot_id: string
  spotter_id: string
  image_url: string | null
  location_description: string
  price: number | null
  notes: string | null
  created_at: string
  spotter?: {
    name: string | null
  }
}

export default function SpotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const spotId = params.id as string
  
  const [spot, setSpot] = useState<Spot | null>(null)
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [loading, setLoading] = useState(true)
  const [showSightingForm, setShowSightingForm] = useState(false)
  const [sightingForm, setSightingForm] = useState({
    image: null as File | null,
    location: '',
    price: '',
    notes: ''
  })

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

      if (spotError) throw spotError

      // Kullanıcı bilgilerini getir
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', spotData.user_id)
        .single()

      // Görüntüleme sayısını artır
      await supabase
        .from('spots')
        .update({ views: (spotData.views || 0) + 1 })
        .eq('id', spotId)

      // Sightings'leri getir
      const { data: sightingsData } = await supabase
        .from('sightings')
        .select('*')
        .eq('spot_id', spotId)
        .order('created_at', { ascending: false })

      setSpot({
        ...spotData,
        user: userData || { name: null, email: spotData.user_id }
      })
      setSightings(sightingsData || [])
    } catch (error) {
      console.error('Spot detayları yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSightingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Lütfen önce giriş yapın')
      return
    }

    try {
      let imageUrl = null
      
      // Resim yükle
      if (sightingForm.image) {
        const fileExt = sightingForm.image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, sightingForm.image)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }

      // Sightings tablosuna ekle
      const { error } = await supabase
        .from('sightings')
        .insert({
          spot_id: spotId,
          spotter_id: user.id,
          image_url: imageUrl,
          location_description: sightingForm.location,
          price: sightingForm.price ? parseFloat(sightingForm.price) : null,
          notes: sightingForm.notes
        })

      if (error) throw error

      // Spot'un helps sayısını artır
      await supabase.rpc('increment_helps', { spot_id: spotId })

      alert('Teşekkürler! Yardımınız başarıyla kaydedildi.')
      setShowSightingForm(false)
      setSightingForm({ image: null, location: '', price: '', notes: '' })
      fetchSpotDetails() // Sayfayı yenile
    } catch (error) {
      console.error('Yardım kaydedilemedi:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
          <div className="lg:col-span-2">
            {/* Spot Başlığı */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
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
                      className="w-full h-full object-contain"
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
                  <p className="font-medium">{spot.helps} kişi yardım etti</p>
                </div>
              </div>
            </div>

            {/* Yardım Edenler */}
            {sightings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Yardım Edenler ({sightings.length})
                </h2>
                <div className="space-y-6">
                  {sightings.map((sighting) => (
                    <div key={sighting.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                            {sighting.spotter?.name?.[0] || 'K'}
                          </div>
                          <div>
                            <p className="font-medium">
                              {sighting.spotter?.name || 'Anonim'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(sighting.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        {sighting.price && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {sighting.price} TL
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{sighting.notes}</p>
                      
                      {sighting.location_description && (
                        <p className="text-gray-600 text-sm mb-3">
                          📍 {sighting.location_description}
                        </p>
                      )}
                      
                      {sighting.image_url && (
                        <div className="mt-3">
                          <img
                            src={sighting.image_url}
                            alt="Yardım fotoğrafı"
                            className="max-w-xs rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sağ Kolon - İşlemler */}
          <div className="space-y-6">
            {/* "Ben Gördüm" Butonu */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
                  👁️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Bu ürünü gördünüz mü?
                </h3>
                <p className="text-gray-600 text-sm">
                  Topluluğa yardım edin, başkalarını mutlu edin
                </p>
              </div>
              
              {!showSightingForm ? (
                <button
                  onClick={() => setShowSightingForm(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition duration-300"
                >
                  Evet, Ben Gördüm!
                </button>
              ) : (
                <form onSubmit={handleSightingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nerede gördünüz? *
                    </label>
                    <input
                      type="text"
                      value={sightingForm.location}
                      onChange={(e) => setSightingForm({...sightingForm, location: e.target.value})}
                      placeholder="Örn: İstiklal Caddesi'ndeki antikacıda, şu mağazada"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      value={sightingForm.price}
                      onChange={(e) => setSightingForm({...sightingForm, price: e.target.value})}
                      placeholder="Gördüğünüz fiyat"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notlar
                    </label>
                    <textarea
                      value={sightingForm.notes}
                      onChange={(e) => setSightingForm({...sightingForm, notes: e.target.value})}
                      placeholder="Ek bilgiler, durumu, iletişim bilgileri..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fotoğraf (opsiyonel)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSightingForm({
                        ...sightingForm,
                        image: e.target.files?.[0] || null
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
                    >
                      Gönder
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSightingForm(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Spot Sahibi */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Spot Sahibi
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {spot.user?.name?.[0]?.toUpperCase() || 'K'}
                </div>
                <div>
                  <p className="font-medium">{spot.user?.name || 'Kullanıcı'}</p>
                  <p className="text-sm text-gray-500">
                    {spot.user?.email ? spot.user.email.substring(0, 20) + '...' : 'Spot sahibi'}
                  </p>
                </div>
              </div>
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
                  <span className="font-bold">{spot.helps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Oluşturulma:</span>
                  <span className="font-bold">
                    {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
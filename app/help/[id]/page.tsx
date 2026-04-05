// app/help/[id]/page.tsx - BASİT ÇALIŞAN VERSİYON
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { buildSpotPath } from '@/lib/sighting-slug'

interface SpotInfo {
  id: string
  title: string
  description: string
  location: string | null
  image_url: string | null
  user_id: string
}

export default function HelpPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const spotId = params.id as string
  
  const [spot, setSpot] = useState<SpotInfo | null>(null)
  const [formData, setFormData] = useState({
    location: '',
    price: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchSpotDetails()
  }, [spotId])

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
    }

    loadCurrentUser()
  }, [])

  const fetchSpotDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('id, title, description, location, image_url, user_id')
        .eq('id', spotId)
        .single()

      if (error) throw error
      setSpot(data)
    } catch (error) {
      console.error('Spot bilgileri yüklenemedi:', error)
      setError('Spot bulunamadı')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Kullanıcı kontrolü
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Lütfen önce giriş yapın')
        setLoading(false)
        return
      }

      // 2. Validasyon
      if (!formData.location.trim()) {
        setError('Lütfen konum bilgisi girin')
        setLoading(false)
        return
      }

      console.log('Form data:', formData)
      console.log('User:', user.id)
      console.log('Spot ID:', spotId)

      // 3. sightings tablosuna ekle (BASİT VERSİYON)
      const { data, error: insertError } = await supabase
        .from('sightings')
        .insert([
          {
            spot_id: spotId,
            spotter_id: user.id,
            location_description: formData.location,
            price: formData.price ? parseFloat(formData.price) : null,
            notes: formData.notes || null
          }
        ])
        .select()

      console.log('Insert response:', { data, error: insertError })

      if (insertError) {
        console.error('Insert error details:', insertError)
        
        // Eğer tablo yoksa oluştur
        if (insertError.message.includes('relation "sightings" does not exist')) {
          setError('Tablo bulunamadı. Lütfen database schema oluşturun.')
        } else {
          throw insertError
        }
      }

      // 4. Spot'un helps sayısını artır
      const { error: updateError } = await supabase
        .from('spots')
        .update({ helps: (await getCurrentHelps()) + 1 })
        .eq('id', spotId)

      if (updateError) {
        console.error('Update error:', updateError)
        // Hata olsa bile devam et
      }

      // 5. Başarılı
      setSubmitted(true)

    } catch (err: any) {
      console.error('Yardım kaydedilemedi:', err)
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentHelps = async (): Promise<number> => {
    const { data } = await supabase
      .from('spots')
      .select('helps')
      .eq('id', spotId)
      .single()
    
    return data?.helps || 0
  }

  const handleMessageRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Mesaj talebi için giriş yapmanız gerekir')
        router.push('/auth/login')
        return
      }

      if (!spot?.user_id) {
        toast.error('Spot sahibi bilgisi bulunamadı')
        return
      }

      if (spot.user_id === user.id) {
        toast.error('Kendi spotunuz için mesaj talebi gönderemezsiniz.')
        return
      }

      const draft = `Merhaba, \"${spot.title}\" için yardım süreci hakkında konuşmak istiyorum. Uygun olunca dönüş yapabilir misiniz?`
      const params = new URLSearchParams({
        receiver: spot.user_id,
        type: 'help',
        draft,
      })

      router.push(`/messages?${params.toString()}`)
    } catch (err) {
      console.error('Help message request navigation error:', err)
      toast.error('Mesaj talebi başlatılamadı')
    }
  }

  if (!spot && error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button
            onClick={() => router.push('/spots')}
            className="btn-primary"
          >
            Spot'lara Dön
          </button>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ✅
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Teşekkürler!</h1>
              <p className="text-gray-600 mb-6">
                Yardımınız başarıyla kaydedildi. Spot sahibi bilgilendirilecek.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => router.push(buildSpotPath(spotId, spot?.title || 'spot'))}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
                >
                  Spot'a Dön
                </button>
                <button
                  onClick={() => router.push('/spots')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
                >
                  Diğer Spot'lara Göz At
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const canSendMessageRequest = !!spot?.user_id && spot.user_id !== currentUserId

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* Geri Dön Butonu */}
          <button
            onClick={() => router.push(buildSpotPath(spotId, spot?.title || 'spot'))}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Spot'a Geri Dön
          </button>

          {/* Başlık */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Yardım Et: {spot.title}
            </h1>
            <p className="text-gray-600">
              Bu ürünü gördüyseniz, spot sahibine yardımcı olun.
            </p>
            {canSendMessageRequest && (
              <button
                onClick={handleMessageRequest}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Mesaj Talebi Gönder
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Spot Önizleme */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                {spot.image_url && (
                  <img
                    src={spot.image_url}
                    alt={spot.title}
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{spot.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {spot.description}
                  </p>
                  {spot.location && (
                    <p className="text-sm text-gray-500 mt-2">
                      📍 {spot.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Konum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nerede gördünüz? *
                </label>
                <textarea
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Örn: İstiklal Caddesi'ndeki Retro Antika mağazasında, Kadıköy Çarşı'da bir sokak satıcısında..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Mümkün olduğunca detaylı yazın: Mağaza adı, adres, kat, raf vs.
                </p>
              </div>

              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (TL)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="Gördüğünüz fiyat"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ek Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Ürün durumu, mağaza çalışma saatleri, iletişim bilgileri, diğer detaylar..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Hata Mesajı */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-2">❌</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Buton */}
              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                      Gönderiliyor...
                    </div>
                  ) : (
                    'Yardımı Gönder'
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Bilgiler spot sahibi ile paylaşılacak
                </p>
              </div>
            </form>

            {/* Yardım İpuçları */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-3">💡 Yardım İpuçları</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Mağaza adı ve tam adres yazın</li>
                <li>• Fiyat bilgisi çok değerli</li>
                <li>• Ürün durumunu belirtin (yeni/ikinci el/hasarlı)</li>
                <li>• Mümkünse fotoğraf çekin ve spot sahibine gönderin</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
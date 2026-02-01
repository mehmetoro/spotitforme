// app/create-spot/page.tsx - MOBİL UYUMLU
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileLocationPicker from '@/components/MobileLocationPicker'
import useMobileDetection from '@/hooks/useMobileDetection'

interface SpotLocation {
  latitude: number | null
  longitude: number | null
  city: string
  address: string
  accuracy: number
}

export default function CreateSpotPage() {
  const router = useRouter()
  const { isMobile } = useMobileDetection()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState<SpotLocation>({
    latitude: null,
    longitude: null,
    city: '',
    address: '',
    accuracy: 0
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Elektronik', 'Giyim & Aksesuar', 'Ev & Bahçe', 'Koleksiyon',
    'Kitap & Müzik', 'Oyuncak & Oyun', 'Spor & Outdoor', 'Araç & Parça', 'Diğer'
  ]

  const handleLocationSelect = (loc: SpotLocation) => {
    setLocation(loc)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validasyon
      if (!location.city) {
        throw new Error('Lütfen konum seçin')
      }
      
      if (!title.trim()) {
        throw new Error('Lütfen başlık girin')
      }
      
      if (!description.trim()) {
        throw new Error('Lütfen açıklama girin')
      }

      // Kullanıcı kontrolü
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Lütfen önce giriş yapın')
      }

      let imageUrl = ''

      // Resim yükleme
      if (imageFile) {
        const timestamp = Date.now()
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${timestamp}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }

      // Spot'u database'e kaydet
      const { data: spotData, error: spotError } = await supabase
        .from('spots')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: description.trim(),
            category: category || null,
            location: location.city,
            location_address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            location_accuracy: location.accuracy,
            image_url: imageUrl || null,
            status: 'active'
          }
        ])
        .select()

      if (spotError) throw spotError

      // Başarı mesajı
      if (isMobile) {
        alert('✅ Spot başarıyla oluşturuldu! Telefon konumunuz ile daha hızlı yardım alacaksınız.')
      } else {
        alert('🎉 Spot başarıyla oluşturuldu!')
      }
      
      router.push(`/spots/${spotData[0].id}`)

    } catch (err: any) {
      setError(err.message || 'Spot oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* Mobil Banner */}
          {isMobile && (
            <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">📱</div>
              <h2 className="text-xl font-bold mb-2">Telefon Konumunuzu Kullanın</h2>
              <p className="opacity-90">
                Spot oluştururken telefonunuzun GPS'i ile tam konumunuzu alın, daha hızlı yardım edin!
              </p>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Yeni Spot Oluştur
            </h1>
            <p className="text-gray-600">
              {isMobile 
                ? 'Telefon konumunuz ile anında yardım alın'
                : 'Konumunuz ile daha hızlı yardım alın'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-8">
            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ne arıyorsunuz? *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={isMobile ? "Aradığınız ürünü yazın..." : "Örnek: Vintage Nikon F2 kamera lensi"}
                required
                maxLength={100}
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı Açıklama *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={isMobile ? "Ürün detaylarını yazın..." : "Marka, model, renk, durum, özel notlar..."}
                rows={isMobile ? 3 : 4}
                required
                maxLength={1000}
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kategori Seçin (Opsiyonel)</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* KONUM PICKER - MOBİL UYUMLU */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Konum *
                  </label>
                  <p className="text-sm text-gray-500">
                    {isMobile 
                      ? 'Telefon konumunuzu kullanarak tam konumunuzu alın'
                      : 'Konumunuz ile daha doğru sonuç alın'
                    }
                  </p>
                </div>
                {location.city && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✓ {isMobile ? 'GPS Aktif' : location.city}
                  </span>
                )}
              </div>
              
              <MobileLocationPicker 
                onLocationSelect={handleLocationSelect}
                initialCity=""
              />
            </div>

            {/* Resim Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ürün Fotoğrafı (Opsiyonel)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                capture={isMobile ? "environment" : undefined}
              />
              <p className="text-sm text-gray-500 mt-2">
                {isMobile 
                  ? '📷 Telefonunuzla direkt fotoğraf çekin'
                  : 'Resimli spot\'lar %70 daha hızlı bulunur'
                }
              </p>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Butonlar */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading || !location.city}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Oluşturuluyor...
                  </div>
                ) : isMobile ? (
                  '📱 Spot\'u Oluştur'
                ) : (
                  'Spot\'u Oluştur'
                )}
              </button>
              
              {!location.city && (
                <p className="text-center text-sm text-red-600 mt-4">
                  ⚠️ Konum seçmeden spot oluşturamazsınız
                </p>
              )}
            </div>
          </form>

          {/* Mobil İpuçları */}
          {isMobile && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">📱 Telefon İpuçları</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">✅</span>
                  <p className="text-sm">Konum izni verirken "Her Zaman İzin Ver" seçin</p>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">✅</span>
                  <p className="text-sm">GPS'inizin açık olduğundan emin olun</p>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">✅</span>
                  <p className="text-sm">Dış mekandaysanız konum daha doğru olur</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
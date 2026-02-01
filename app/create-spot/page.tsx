// app/create-spot/page.tsx - TELEFON UYUMLU
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SimpleLocationPicker from '@/components/SimpleLocationPicker'

export default function CreateSpotPage() {
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState<{
    latitude: number | null
    longitude: number | null
    city: string
  }>({
    latitude: null,
    longitude: null,
    city: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Elektronik', 'Giyim & Aksesuar', 'Ev & Bahçe', 'Koleksiyon',
    'Kitap & Müzik', 'Oyuncak & Oyun', 'Spor & Outdoor', 'Araç & Parça', 'Diğer'
  ]

  const handleLocationSelect = (loc: { latitude: number | null; longitude: number | null; city: string }) => {
    setLocation(loc)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validasyon
      if (!location.city || location.city === 'Konum belirlenemedi') {
        throw new Error('Lütfen geçerli bir konum seçin')
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
            latitude: location.latitude,
            longitude: location.longitude,
            image_url: imageUrl || null,
            status: 'active'
          }
        ])
        .select()

      if (spotError) throw spotError

      alert('🎉 Spot başarıyla oluşturuldu!')
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
          {/* Mobil Uyarı */}
          <div className="mb-6 md:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <span className="text-blue-600 text-2xl mr-3">📱</span>
                <div>
                  <p className="font-medium text-blue-800">Mobil Kullanıcılar</p>
                  <p className="text-sm text-blue-700">
                    Konum almak için "Otomatik Konum Al" butonuna tıklayın ve izin verin
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Yeni Spot Oluştur
            </h1>
            <p className="text-gray-600">
              Konumunuzu kullanarak daha hızlı yardım alın
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
                placeholder="Örnek: Vintage Nikon F2 kamera lensi"
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
                placeholder="Marka, model, renk, durum, özel notlar..."
                rows={4}
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

            {/* KONUM SEÇİCİ */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Konum *
                  </label>
                  <p className="text-sm text-gray-500">
                    Telefonunuzdan konum izni isteyeceğiz
                  </p>
                </div>
                {location.city && location.city !== 'Konum belirlenemedi' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✓ {location.city}
                  </span>
                )}
              </div>
              
              <SimpleLocationPicker onLocationSelect={handleLocationSelect} />
              
              {location.city && location.latitude && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    📍 Konumunuz alındı: {location.city} ({location.latitude.toFixed(4)}, {location.longitude?.toFixed(4)})
                  </p>
                </div>
              )}
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
              />
              <p className="text-sm text-gray-500 mt-2">
                Resimli spot'lar daha hızlı bulunur
              </p>
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

            {/* Butonlar */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading || !location.city || location.city === 'Konum belirlenemedi'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  'Spot\'u Oluştur'
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                {!location.city ? 'Konum seçmeden spot oluşturamazsınız' : ''}
              </p>
            </div>
          </form>

          {/* İstatistikler */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-xl font-bold text-blue-600">%94</div>
              <div className="text-sm text-gray-600">Konumlu spot bulunma</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-xl font-bold text-green-600">3x</div>
              <div className="text-sm text-gray-600">Daha hızlı</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
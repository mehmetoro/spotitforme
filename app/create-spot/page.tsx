// app/create-spot/page.tsx - DÜZELTİLMİŞ
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LocationPicker from '@/components/LocationPicker'

export default function CreateSpotPage() {
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState<{
    latitude: number | null
    longitude: number | null
    city: string
  } | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Elektronik', 'Giyim & Aksesuar', 'Ev & Bahçe', 'Koleksiyon',
    'Kitap & Müzik', 'Oyuncak & Oyun', 'Spor & Outdoor', 'Araç & Parça', 'Diğer'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validasyon
      if (!location?.city) {
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
          {/* Mobil İpucu */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-blue-600 text-2xl mr-3">📱</span>
              <div>
                <p className="font-medium text-blue-800">Telefon Kullanıcıları</p>
                <p className="text-sm text-blue-700">
                  "Otomatik Konum" butonuna tıklayın → Tarayıcı izin isteyecek → İzin verin
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Spot Oluştur</h1>
            <p className="text-gray-600">Konumunuzu kullanarak daha hızlı yardım alın</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-8">
            {/* Form Alanları */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ne arıyorsunuz? *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Örnek: Vintage Nikon F2 kamera lensi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı Açıklama *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Marka, model, renk, durum, özel notlar..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Kategori Seçin (Opsiyonel)</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* KONUM PICKER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Konum *</h3>
                  <p className="text-sm text-gray-600">Konum, yardım almanızı kolaylaştırır</p>
                </div>
                {location && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✓ {location.city}
                  </span>
                )}
              </div>
              
              <LocationPicker 
                onLocationSelect={(loc) => setLocation(loc)}
              />
            </div>

            {/* Resim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Fotoğrafı (Opsiyonel)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Hata */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Butonu */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading || !location}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Oluşturuluyor...' : 'Spot\'u Oluştur'}
              </button>
              {!location && (
                <p className="text-center text-sm text-red-600 mt-2">
                  Konum seçmeden spot oluşturamazsınız
                </p>
              )}
            </div>
          </form>

          {/* İstatistikler */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-xl font-bold text-blue-600">%94</div>
              <div className="text-sm text-gray-600">Başarı</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-xl font-bold text-green-600">3x</div>
              <div className="text-sm text-gray-600">Hızlı</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-xl font-bold text-purple-600">50+</div>
              <div className="text-sm text-gray-600">Şehir</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
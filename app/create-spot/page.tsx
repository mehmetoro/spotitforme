// app/create-spot/page.tsx - KONUM GÜNCELLEMESİ
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LocationPicker from '@/components/LocationPicker'

interface SpotLocation {
  latitude: number | null
  longitude: number | null
  city: string
  address: string
  accuracy: number
}

export default function CreateSpotPage() {
  const router = useRouter()
  
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

      // Spot'u database'e kaydet (YENİ ALANLAR)
      const { data: spotData, error: spotError } = await supabase
        .from('spots')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: description.trim(),
            category: category || null,
            // YENİ KONUM ALANLARI
            location: location.city,
            location_address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            location_accuracy: location.accuracy,
            //
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
      
      <main className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Yeni Spot Oluştur
            </h1>
            <p className="text-gray-600">
              Telefonunuzun konumunu kullanarak daha hızlı yardım alın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
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

            {/* KONUM PICKER - YENİ */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Konum *
                  </label>
                  <p className="text-sm text-gray-500">
                    Telefonunuzun konum servisini kullanarak daha doğru sonuç alın
                  </p>
                </div>
                {location.city && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✓ {location.city}
                  </span>
                )}
              </div>
              
              <LocationPicker 
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
              />
              <p className="text-sm text-gray-500 mt-2">
                Resimli spot'lar %70 daha hızlı bulunur
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Oluşturuluyor...' : 'Spot\'u Oluştur'}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Konum seçmeden spot oluşturamazsınız
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
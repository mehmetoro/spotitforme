// app/create-spot/page.tsx - İZİN İSTEYEN
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LocationPickerWithPermission from '@/components/LocationPickerWithPermission'

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
      if (!location.city || location.city.includes('Konum')) {
        throw new Error('Lütfen geçerli bir konum seçin')
      }
      
      if (!title.trim()) {
        throw new Error('Lütfen başlık girin')
      }
      
      if (!description.trim()) {
        throw new Error('Lütfen açıklama girin')
      }

      // Kullanıcı kontrolü
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Lütfen önce giriş yapın')
      }

      // Spot'u kaydet
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
            status: 'active'
          }
        ])
        .select()

      if (spotError) throw spotError

      alert('🎉 Spot başarıyla oluşturuldu!')
      router.push(`/spots/${spotData[0].id}`)

    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Yeni Spot Oluştur
            </h1>
            <p className="text-gray-600">
              Konum izni vererek daha hızlı yardım alın
            </p>
          </div>

          {/* Konum Uyarısı */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-blue-600 text-2xl mr-3">📍</span>
              <div>
                <p className="font-medium text-blue-800">Konum İzni Gerekiyor</p>
                <p className="text-sm text-blue-700">
                  Spot oluşturmak için konum izni vermeniz gerekecek. 
                  Tarayıcınızın izin isteğini kabul edin.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-8">
            {/* Temel Bilgiler */}
            <div className="space-y-6">
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
                  placeholder="Marka, model, renk, durum..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori (Opsiyonel)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* KONUM SEÇİCİ */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  📍 Konum Bilgisi *
                </h3>
                <p className="text-gray-600">
                  Konum izni vererek daha doğru sonuç alırsınız
                </p>
              </div>
              
              <LocationPickerWithPermission onLocationSelect={setLocation} />
              
              {/* Seçilen Konum */}
              {location.city && !location.city.includes('Konum') && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-green-600 text-xl mr-3">✅</span>
                      <div>
                        <p className="font-medium text-green-800">Konum seçildi</p>
                        <p className="text-green-700">{location.city}</p>
                        {location.latitude && (
                          <p className="text-sm text-green-600">
                            GPS: {location.latitude.toFixed(4)}, {location.longitude?.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {location.latitude ? 'GPS Aktif' : 'Manuel Seçim'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Hata */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-2">❌</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading || !location.city || location.city.includes('Konum')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                    Oluşturuluyor...
                  </div>
                ) : (
                  'Spot\'u Oluştur'
                )}
              </button>
              
              {!location.city && (
                <p className="text-center text-sm text-red-600 mt-3">
                  ⚠️ Lütfen konum seçin
                </p>
              )}
            </div>
          </form>

          {/* Bilgi */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Konum izni vermek, size yardım edecek kişilerin sizi bulmasını kolaylaştırır
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
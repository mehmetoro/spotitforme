// app/create-spot/page.tsx - GÜNCELLENMİŞ
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TrueLocationPicker from '@/components/TrueLocationPicker' // BU SATIRI EKLEYİN

export default function CreateSpotPage() {
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState<{
    city: string
    lat?: number
    lng?: number
  } | null>(null) // DEĞİŞTİRİLDİ
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
            location: location.city, // Şehir adı
            latitude: location.lat || null, // Koordinatlar (varsa)
            longitude: location.lng || null,
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
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">📱</span>
              <div>
                <h3 className="text-xl font-bold mb-2">Telefon Kullanıcıları!</h3>
                <p className="opacity-90">
                  "Telefon Konumu Kullan" butonuna tıklayın → Tarayıcı izin isteyecek → <strong>İzin Ver</strong>'e tıklayın
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Spot Oluştur</h1>
            <p className="text-gray-600">Konumunuzu kullanarak daha hızlı yardım alın</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örnek: Vintage Nikon F2 kamera lensi"
                required
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-1">
                Açık ve net bir başlık yazın ({title.length}/100)
              </p>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı Açıklama *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Marka, model, renk, durum, özel notlar..."
                rows={4}
                required
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                Ne kadar detaylı olursa o kadar iyi! ({description.length}/1000)
              </p>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kategori Seçin (Opsiyonel)</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Kategori seçmek daha hızlı yardım almanızı sağlar
              </p>
            </div>

            {/* KONUM PICKER - TRUEVERSION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Konum Seçin *</h3>
                  <p className="text-sm text-gray-600">
                    Konum, size yardım edecek kişilerin bulunması için çok önemli
                  </p>
                </div>
                {location && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✓ {location.city}
                  </span>
                )}
              </div>
              
              <TrueLocationPicker 
                onLocationSelect={(loc) => setLocation(loc)}
              />
              
              {!location && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Konum seçmeden spot oluşturamazsınız. Lütfen yukarıdan seçim yapın.
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
                📸 Resimli spot'lar %70 daha hızlı bulunur
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
                disabled={loading || !location}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                    Oluşturuluyor...
                  </div>
                ) : (
                  'Spot\'u Oluştur ve Paylaş'
                )}
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                {!location 
                  ? 'Lütfen önce konum seçin' 
                  : `📍 ${location.city} konumunda spot oluşturulacak`
                }
              </p>
            </div>
          </form>

          {/* İstatistikler */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-blue-600">%94</div>
              <div className="text-sm text-gray-600">Konumlu spot bulunma</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-green-600">3x</div>
              <div className="text-sm text-gray-600">Daha hızlı yardım</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-purple-600">24s</div>
              <div className="text-sm text-gray-600">Ort. ilk yanıt</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-orange-600">50+</div>
              <div className="text-sm text-gray-600">Aktif şehir</div>
            </div>
          </div>

          {/* Güvenlik Bilgisi */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
              <span className="text-blue-600 mr-2">🔒</span>
              Konum Gizliliğiniz Güvende
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Konumunuz sadece spot detay sayfasında görünür</li>
              <li>• Tam adresiniz asla paylaşılmaz</li>
              <li>• GPS koordinatları sadece harita için kullanılır</li>
              <li>• İstediğiniz zaman konum paylaşımını durdurabilirsiniz</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
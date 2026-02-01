// app/create-spot/page.tsx - ÇALIŞAN VERSİYON
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SimpleLocationPicker from '@/components/SimpleLocationPicker'

export default function CreateSpotPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  })
  const [location, setLocation] = useState<{
    lat: number | null
    lon: number | null
    city: string
  } | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validasyon
      if (!location?.city || location.city.includes('seçin')) {
        throw new Error('Lütfen konum seçin')
      }

      // Kullanıcı kontrolü
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Lütfen önce giriş yapın')
      }

      // Resim yükle
      let imageUrl = ''
      if (image) {
        const timestamp = Date.now()
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}/${timestamp}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, image)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('spot-images')
            .getPublicUrl(fileName)
          imageUrl = publicUrl
        }
      }

      // Spot'u kaydet
      const { data: spotData, error: spotError } = await supabase
        .from('spots')
        .insert([
          {
            user_id: user.id,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category || null,
            location: location.city,
            latitude: location.lat,
            longitude: location.lon,
            image_url: imageUrl || null,
            status: 'active'
          }
        ])
        .select()

      if (spotError) throw spotError

      alert('✅ Spot başarıyla oluşturuldu!')
      router.push(`/spots/${spotData[0].id}`)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            Yeni Spot Oluştur
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Konum izni vererek daha hızlı yardım alın
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ne arıyorsunuz? *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Örnek: Vintage Nikon kamera lensi"
                required
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Detaylı açıklama *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg"
                rows={4}
                placeholder="Marka, model, renk, durum, özel notlar..."
                required
              />
            </div>

            {/* KONUM - EN ÖNEMLİ KISIM */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Konum *
              </label>
              <SimpleLocationPicker onLocationSelect={setLocation} />
              
              {location && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <span className="text-green-600 text-xl mr-3">✅</span>
                    <div>
                      <p className="font-medium">Konum seçildi</p>
                      <p className="text-green-700">{location.city}</p>
                      {location.lat && (
                        <p className="text-sm text-green-600">
                          Koordinat: {location.lat.toFixed(4)}, {location.lon?.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="">Kategori seçin</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Giyim & Aksesuar">Giyim & Aksesuar</option>
                <option value="Ev & Bahçe">Ev & Bahçe</option>
                <option value="Koleksiyon">Koleksiyon</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            {/* Resim */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fotoğraf (opsiyonel)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Hata */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !location}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Oluşturuluyor...' : 'Spot\'u Oluştur'}
            </button>
          </form>

          {/* Bilgi */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="font-bold text-blue-800 mb-3">📱 Telefon Kullanıcıları İçin:</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>1. "Konum İzni İste" butonuna tıklayın</li>
              <li>2. Ekranın <strong>üst kısmında</strong> tarayıcı izin isteği belirecek</li>
              <li>3. <strong>"İzin Ver"</strong> veya <strong>"Allow"</strong> seçeneğini tıklayın</li>
              <li>4. Konumunuz otomatik olarak alınacak</li>
              <li>5. İzin vermek istemezseniz "Şehir Seç" moduna geçin</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
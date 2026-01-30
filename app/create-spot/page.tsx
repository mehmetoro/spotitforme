// app/create-spot/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EmailSuccessModal from '@/components/EmailSuccessModal'

export default function CreateSpotPage() {
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdSpotId, setCreatedSpotId] = useState<string | null>(null)

  const categories = [
    'Elektronik',
    'Giyim & Aksesuar',
    'Ev & Bahçe',
    'Koleksiyon',
    'Kitap & Müzik',
    'Oyuncak & Oyun',
    'Spor & Outdoor',
    'Araç & Parça',
    'Diğer'
  ]

  const locations = [
    'İstanbul',
    'Ankara',
    'İzmir',
    'Bursa',
    'Antalya',
    'Adana',
    'Konya',
    'Türkiye Geneli',
    'Yurt Dışı'
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Resim boyutu 5MB\'dan küçük olmalıdır')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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
        throw new Error('Lütfen önce giriş yapın')
      }

      let imageUrl = ''

      // 2. Resim yükleme
      if (imageFile) {
        const timestamp = Date.now()
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${timestamp}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, imageFile)

        if (uploadError) {
          console.error('Resim yükleme hatası:', uploadError)
          // Resim yüklenemezse devam et (opsiyonel)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('spot-images')
            .getPublicUrl(fileName)
          imageUrl = publicUrl
        }
      }

      // 3. Spot'u database'e kaydet
      const { data: spotData, error: spotError } = await supabase
        .from('spots')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            category: category || null,
            location: location || null,
            image_url: imageUrl || null,
            status: 'active'
          }
        ])
        .select()
        .single()

      if (spotError) throw spotError

      // 4. EMAİL GÖNDER - YENİ SİSTEM
      try {
        // Kullanıcı email'ini al
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser?.email) {
          const emailResult = await emailService.sendSpotCreatedEmail(
            authUser.email,
            title,
            spotData.id
          )
          
          if (emailResult.success) {
            console.log('📧 Spot oluşturma emaili gönderildi')
          } else {
            console.warn('Email gönderilemedi:', emailResult.error)
            // Email hatası spot oluşturmayı engellemesin
          }
        }
      } catch (emailError) {
        console.error('Email gönderme hatası:', emailError)
        // Email hatası ana işlemi engellemesin
      }

      // 5. Başarılı - Modal göster
      setCreatedSpotId(spotData.id)
      setShowSuccessModal(true)

    } catch (err: any) {
      console.error('❌ Spot oluşturma hatası:', err)
      setError(err.message || 'Spot oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    router.push('/spots')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Yeni Spot Oluştur
            </h1>
            <p className="text-gray-600">
              Aradığınız ürünü paylaşın, email bildirimleriyle anında haberdar olun
            </p>
            
            {/* Email bilgi kartı */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white">📧</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-blue-800">Email Bildirim Aktif</p>
                  <p className="text-sm text-blue-600">
                    Spot oluşturulunca ve yardım gelince email alacaksınız
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {/* Resim Yükleme */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ürün Fotoğrafı (Opsiyonel)
                <span className="text-blue-600 ml-2">📸 Email'de görünecek</span>
              </label>
              
              {imagePreview ? (
                <div className="mb-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-64 object-cover rounded-lg mx-auto border-2 border-green-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center"
                  >
                    <span className="mr-1">🗑️</span> Resmi Kaldır
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition duration-200 bg-gray-50 hover:bg-blue-50">
                    <div className="text-4xl mb-4 text-gray-400">📷</div>
                    <p className="text-gray-600 mb-2 font-medium">
                      Resim yüklemek için tıklayın
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Email bildirimlerinde görünecek • Maksimum 5MB
                    </p>
                    <div className="btn-primary inline-block">
                      Resim Seç
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </label>
              )}
            </div>

            {/* Başlık */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ne arıyorsunuz? *
                <span className="text-gray-500 text-sm ml-2">(Email başlığında görünecek)</span>
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
            </div>

            {/* Açıklama */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı Açıklama *
                <span className="text-gray-500 text-sm ml-2">(Email içeriğinde görünecek)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Marka, model, renk, özellikler, nerede gördünüz? Yardımcı olacak tüm detayları yazın..."
                rows={5}
                required
                maxLength={1000}
              />
            </div>

            {/* Kategori ve Konum */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum
                  <span className="text-gray-500 text-sm ml-2">(Email'de belirtilecek)</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Konum Seçin</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Bilgi Kartı */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white text-lg">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-800 mb-2">Email Bildirim Sistemi Aktif</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Spot oluşturulunca onay email'i alacaksınız</li>
                    <li>• Birisi yardım edince anında haberdar olacaksınız</li>
                    <li>• Ürün bulununca tebrik email'i gelecek</li>
                    <li>• Tüm email'ler spam'e düşmez, direkt gelen kutusuna gider</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></span>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Spot'u Oluştur ve Email Al
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {/* Başarı Modalı */}
      <EmailSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        spotId={createdSpotId || ''}
        spotTitle={title}
      />
    </div>
  )
}
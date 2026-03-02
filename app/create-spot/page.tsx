// app/create-spot/page.tsx - DÜZELTMİŞ VERSİYON
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
// Header ve Footer import'larını KALDIRIYORUZ - Layout'ta zaten var

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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

      console.log('👤 Kullanıcı:', user.id)

      let imageUrl = ''

      // 2. Resim yükleme
      if (imageFile) {
        console.log('📸 Resim yükleniyor:', imageFile.name)
        
        try {
          const timestamp = Date.now()
          const fileExt = imageFile.name.split('.').pop()
          const fileName = `${user.id}/${timestamp}.${fileExt}`
          
          console.log('📁 Dosya adı:', fileName)
          
          // Bucket kontrolü
          const { data: buckets } = await supabase.storage.listBuckets()
          console.log('📦 Bucket\'lar:', buckets)
          
          // Resim yükle
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('spot-images')
            .upload(fileName, imageFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: imageFile.type
            })

          if (uploadError) {
            console.error('❌ Yükleme hatası:', uploadError)
            throw new Error(`Resim yüklenemedi: ${uploadError.message}`)
          }

          console.log('✅ Resim yüklendi!')

          // Public URL al
          const { data: { publicUrl } } = supabase.storage
            .from('spot-images')
            .getPublicUrl(fileName)
          
          console.log('🔗 Public URL:', publicUrl)
          imageUrl = publicUrl
          
          if (!publicUrl) {
            throw new Error('Resim URLsi alınamadı')
          }
          
        } catch (uploadErr: any) {
          console.error('❌ Resim yükleme hatası:', uploadErr)
          setError(`❌ Resim yüklenemedi: ${uploadErr.message}`)
          setLoading(false)
          return
        }
      } else {
        console.log('ℹ️ Resim seçilmedi')
      }

      // 3. Spot'u database'e kaydet - SADECE VAR OLAN KOLONLARI KULLAN
      console.log('💾 Database\'e kaydediliyor...')
      
      const spotData = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category: category || null,
        location: location || null,
        image_url: imageUrl || null,
        status: 'active',
        views: 0,
        helps: 0,
        created_at: new Date().toISOString()
      }

      console.log('📝 Spot verisi:', spotData)

      const { data: spotDataResult, error: spotError } = await supabase
        .from('spots')
        .insert([spotData])
        .select()

      console.log('📊 Database yanıtı:', { spotDataResult, spotError })

      if (spotError) {
        console.error('❌ Database hatası:', spotError)
        throw new Error(`Spot kaydedilemedi: ${spotError.message}`)
      }

      // 4. BAŞARILI
      console.log('🎉 Spot başarıyla oluşturuldu!')
      
      if (imageUrl) {
        alert('✅ Spot başarıyla oluşturuldu! Resim de yüklendi.')
      } else {
        alert('✅ Spot başarıyla oluşturuldu!')
      }
      
      // Yeni oluşturulan spot'a yönlendir
      if (spotDataResult && spotDataResult[0]) {
        router.push(`/spots/${spotDataResult[0].id}`)
      } else {
        router.push('/spots')
      }

    } catch (err: any) {
      console.error('❌ Spot oluşturma hatası:', err)
      setError(err.message || 'Spot oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER'ı KALDIRIYORUZ - Layout'ta zaten var */}
      
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Yeni Spot Oluştur
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Aradığınız ürünü topluluğumuzla paylaşın, binlerce göz sizin için arasın
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8">
            {/* Resim Yükleme */}
            <div className="mb-6 md:mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ürün Fotoğrafı (Opsiyonel)
                <span className="text-gray-500 ml-1 text-xs md:text-sm">- Daha hızlı bulunmasını sağlar</span>
              </label>
              
              {imagePreview ? (
                <div className="mb-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 md:h-64 object-cover rounded-lg mx-auto border-2 border-green-200"
                    />
                    <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      ✓ Hazır
                    </div>
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
                  <div className="border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl p-4 md:p-8 text-center hover:border-blue-400 transition duration-200 bg-gray-50 hover:bg-blue-50">
                    <div className="text-3xl md:text-4xl mb-3 md:mb-4 text-gray-400">📷</div>
                    <p className="text-gray-600 mb-2 font-medium text-sm md:text-base">
                      Resim yüklemek için tıklayın veya sürükleyin
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                      PNG, JPG, GIF • Maksimum 5MB
                    </p>
                    <div className="btn-primary inline-block !py-2 !px-3 md:!py-2 md:!px-4 text-sm md:text-base">
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
              
              {/* Resim Bilgisi */}
              {imageFile && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">📦</span>
                      <span className="font-medium truncate max-w-xs">{imageFile.name}</span>
                    </div>
                    <div className="text-gray-600">
                      {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Başlık */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ne arıyorsunuz? *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                placeholder="Örnek: Vintage Nikon F2 kamera lensi"
                required
                maxLength={100}
              />
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {title.length}/100 karakter
              </p>
            </div>

            {/* Açıklama */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı Açıklama *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                placeholder="Marka, model, renk, boyut, özel notlar... Ne kadar detaylı olursa o kadar iyi!"
                rows={4}
                required
                maxLength={1000}
              />
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {description.length}/1000 karakter
              </p>
            </div>

            {/* Kategori ve Konum */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
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
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                >
                  <option value="">Konum Seçin</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 md:p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-2">❌</span>
                  <span className="text-sm md:text-base">{error}</span>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:py-3 rounded-lg disabled:opacity-50 flex items-center justify-center text-sm md:text-base"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Oluşturuluyor...
                  </>
                ) : (
                  'Spot\'u Oluştur ve Paylaş'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 md:py-3 rounded-lg text-sm md:text-base"
              >
                İptal
              </button>
            </div>

            {/* Bilgi Notu */}
            <div className="mt-6 md:mt-8 p-3 md:p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2 md:mr-3 text-lg">💡</span>
                <div>
                  <p className="font-medium text-blue-800 mb-1 text-sm md:text-base">Spot Oluşturma İpuçları</p>
                  <ul className="text-xs md:text-sm text-blue-700 space-y-1">
                    <li>• Net fotoğraf eklemek bulunma şansını %70 artırır</li>
                    <li>• Marka ve model bilgisi çok önemli</li>
                    <li>• Bütçe aralığı belirtirseniz daha hızlı yardım alırsınız</li>
                    <li>• Spot'unuz 30 gün aktif kalacak</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>

          {/* Debug Info - Sadece development'da */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
              <p className="font-medium mb-2">🛠️ Development Bilgileri:</p>
              <p>• Tablo: <code>spots</code></p>
              <p>• Kolonlar: id, user_id, title, description, category, location, image_url, status, views, helps</p>
              <p>• RLS: Aktif</p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER'ı KALDIRIYORUZ - Layout'ta zaten var */}
    </div>
  )
}
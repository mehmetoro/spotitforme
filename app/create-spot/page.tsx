// app/create-spot/page.tsx - GÜNCELLENMİŞ
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { sendSpotCreatedEmail } from '@/lib/email'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
  const [successMessage, setSuccessMessage] = useState('')

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
    setSuccessMessage('')

    try {
      // 1. Kullanıcı kontrolü
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Lütfen önce giriş yapın')
      }

      console.log('👤 User authenticated:', user.email)

      let imageUrl = ''

      // 2. RESİM YÜKLEME
      if (imageFile) {
        console.log('🖼️ Image file selected:', imageFile.name)
        
        try {
          // Dosya adını oluştur
          const timestamp = Date.now()
          const fileExt = imageFile.name.split('.').pop()
          const fileName = `${user.id}/${timestamp}.${fileExt}`
          
          console.log('📤 Uploading to spot-images bucket:', fileName)
          
          // Resmi yükle
          const { error: uploadError } = await supabase.storage
            .from('spot-images')
            .upload(fileName, imageFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: imageFile.type
            })

          if (uploadError) {
            console.error('❌ Upload error:', uploadError)
            
            if (uploadError.message.includes('bucket')) {
              throw new Error('Resim deposu bulunamadı. Lütfen Supabase Storage ayarlarını kontrol edin.')
            } else if (uploadError.message.includes('policy')) {
              throw new Error('Yükleme izni yok. Storage politikalarını kontrol edin.')
            } else {
              throw new Error(`Resim yüklenemedi: ${uploadError.message}`)
            }
          }

          console.log('✅ Image uploaded successfully!')

          // Yüklenen resmin PUBLIC URL'sini al
          const { data: { publicUrl } } = supabase.storage
            .from('spot-images')
            .getPublicUrl(fileName)
          
          console.log('📷 Public URL alındı')
          imageUrl = publicUrl
          
        } catch (uploadErr: any) {
          console.error('❌ Image upload failed:', uploadErr)
          setError(`❌ Resim yüklenemedi: ${uploadErr.message}. Resimsiz devam edebilirsiniz.`)
          // Resim hatası işlemi durdurmuyor, devam ediyoruz
        }
      } else {
        console.log('ℹ️ No image selected, proceeding without image')
      }

      // 3. Spot'u database'e kaydet
      console.log('💾 Saving spot to database...')
      
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

      console.log('Database response:', { spotData, spotError })

      if (spotError) {
        console.error('❌ Database error:', spotError)
        throw spotError
      }

      // 4. ✅ EMAIL GÖNDER - SPOT OLUŞTURMA BİLDİRİMİ
      if (spotData?.[0]?.id && user.email) {
        console.log('📧 Sending spot creation email...')
        try {
          const emailSent = await sendSpotCreatedEmail(
            user.email,
            title,
            spotData[0].id
          )
          
          if (emailSent) {
            console.log('✅ Spot oluşturma emaili gönderildi')
            setSuccessMessage(`
              🎉 Spot başarıyla oluşturuldu!
              
              • Spot'unuz topluluğumuzla paylaşıldı
              • Binlerce kullanıcı sizin için arayacak
              • Email adresinize bilgi gönderildi
              • Spot detay sayfasına yönlendiriliyorsunuz...
            `)
          } else {
            console.warn('⚠️ Spot oluşturma emaili gönderilemedi')
            setSuccessMessage(`
              ✅ Spot başarıyla oluşturuldu!
              
              • Spot'unuz topluluğumuzla paylaşıldı
              • Email gönderilemedi (teknik nedenler)
              • Spot detay sayfasına yönlendiriliyorsunuz...
            `)
          }
        } catch (emailError) {
          console.error('❌ Email gönderme hatası:', emailError)
          // Email hatası spot oluşturmayı engellemesin
          setSuccessMessage(`
            ✅ Spot başarıyla oluşturuldu!
            
            • Spot'unuz topluluğumuzla paylaşıldı
            • Spot detay sayfasına yönlendiriliyorsunuz...
          `)
        }
      }

      // 5. 3 saniye sonra spot detay sayfasına yönlendir
      setTimeout(() => {
        if (spotData?.[0]?.id) {
          router.push(`/spots/${spotData[0].id}`)
        } else {
          router.push('/spots')
        }
        router.refresh()
      }, 3000)

    } catch (err: any) {
      console.error('❌ Create spot error:', err)
      
      // Hata mesajlarını Türkçe'ye çevir
      let errorMessage = err.message || 'Spot oluşturulurken bir hata oluştu'
      
      if (errorMessage.includes('row-level security')) {
        errorMessage = 'Güvenlik hatası. Lütfen tekrar giriş yapın.'
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.'
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('')
    setLocation('')
    setImageFile(null)
    setImagePreview('')
    setError('')
    setSuccessMessage('')
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
              Aradığınız ürünü topluluğumuzla paylaşın, binlerce göz sizin için arasın
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {/* Başarı Mesajı */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg whitespace-pre-line">
                {successMessage}
              </div>
            )}

            {/* Resim Yükleme */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ürün Fotoğrafı (Opsiyonel ama tavsiye edilir)
              </label>
              
              {imagePreview ? (
                <div className="mb-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-64 object-cover rounded-lg mx-auto border-2 border-green-200"
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
                    disabled={loading}
                  >
                    <span className="mr-1">🗑️</span> Resmi Kaldır
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className={`border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center transition duration-200 bg-gray-50 hover:bg-blue-50 ${loading ? 'opacity-50' : 'hover:border-blue-400'}`}>
                    <div className="text-4xl mb-4 text-gray-400">📷</div>
                    <p className="text-gray-600 mb-2 font-medium">
                      Resim yüklemek için tıklayın veya sürükleyin
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      PNG, JPG, GIF • Maksimum 5MB • Ürünü daha hızlı buldurun
                    </p>
                    <div className={`btn-primary inline-block ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Resim Seç
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={loading}
                    />
                  </div>
                </label>
              )}
              
              {/* Resim Yükleme İstatistikleri */}
              {imageFile && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">📦</span>
                      <span className="font-medium">{imageFile.name}</span>
                    </div>
                    <div className="text-gray-600">
                      {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: loading ? '50%' : '100%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {loading ? '⏳ Yükleniyor...' : '✓ Resim yüklemeye hazır'}
                  </p>
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
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loading ? 'bg-gray-100' : ''}`}
                placeholder="Örnek: Vintage Nikon F2 kamera lensi, eski çay makinesi cam kapağı"
                required
                maxLength={100}
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">
                  Açık ve net bir başlık yazın ({title.length}/100)
                </p>
                {title.length > 80 && (
                  <p className="text-sm text-yellow-600">
                    {100 - title.length} karakter kaldı
                  </p>
                )}
              </div>
            </div>

            {/* Açıklama */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı Açıklama *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loading ? 'bg-gray-100' : ''}`}
                placeholder="Ürünle ilgili tüm detayları yazın. Marka, model, renk, boyut, özel notlar..."
                rows={5}
                required
                maxLength={1000}
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">
                  Ne kadar detaylı olursa o kadar iyi! ({description.length}/1000)
                </p>
                {description.length > 800 && (
                  <p className="text-sm text-yellow-600">
                    {1000 - description.length} karakter kaldı
                  </p>
                )}
              </div>
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
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loading ? 'bg-gray-100' : ''}`}
                  disabled={loading}
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
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loading ? 'bg-gray-100' : ''}`}
                  disabled={loading}
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
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-2">❌</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Oluşturuluyor...
                  </>
                ) : (
                  'Spot\'u Oluştur ve Paylaş'
                )}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg disabled:opacity-50"
              >
                Formu Temizle
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/spots')}
                disabled={loading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg disabled:opacity-50"
              >
                İptal
              </button>
            </div>

            {/* Email Sistem Bilgisi */}
            {!loading && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">📧</span>
                  <div>
                    <p className="font-medium text-blue-800 mb-1">Email Bildirim Sistemi Aktif</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Spot oluşturulunca size email gönderilecek</li>
                      <li>• Biri yardım ettiğinde anında bildirim alacaksınız</li>
                      <li>• Email adresiniz: Gmail SMTP ile güvenli</li>
                      <li>• Spam klasörünü kontrol etmeyi unutmayın</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Bilgi Notu */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                <span className="text-gray-600 mr-3">💡</span>
                <div>
                  <p className="font-medium text-gray-800 mb-1">İpuçları</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Net ve kaliteli fotoğraf eklemek bulunma şansını %70 artırır</li>
                    <li>• Marka ve model bilgisi çok önemli</li>
                    <li>• Bütçe aralığı belirtirseniz daha hızlı yardım alırsınız</li>
                    <li>• Spot'unuz 30 gün aktif kalacak, dilerseniz uzatabilirsiniz</li>
                    <li>• Email bildirimlerini kapatmak için profil ayarlarından düzenleyin</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>

          {/* Development Debug */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>🔧 Development Mode:</strong> Email gönderimi test ediliyor. 
                App Password: <code className="bg-yellow-100 px-1 rounded">ahfd vrzy kuen opmj</code>
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
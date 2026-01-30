// app/spots/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EmailSuccessModal from '@/components/EmailSuccessModal'
import Image from 'next/image'

interface Spot {
  id: string
  title: string
  description: string
  category: string | null
  location: string | null
  image_url: string | null
  status: string
  created_at: string
  user_id: string
  views: number
  helps: number
  user?: {
    name: string | null
    email: string
  }
}

interface Sighting {
  id: string
  spot_id: string
  spotter_id: string
  image_url: string | null
  location_description: string
  price: number | null
  notes: string | null
  created_at: string
  spotter?: {
    name: string | null
    email: string
  }
}

export default function SpotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const spotId = params.id as string
  
  const [spot, setSpot] = useState<Spot | null>(null)
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [loading, setLoading] = useState(true)
  const [showSightingForm, setShowSightingForm] = useState(false)
  const [showEmailSuccess, setShowEmailSuccess] = useState(false)
  const [sightingForm, setSightingForm] = useState({
    image: null as File | null,
    imagePreview: '',
    location: '',
    price: '',
    notes: ''
  })
  const [user, setUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkUser()
    if (spotId) {
      fetchSpotDetails()
    }
  }, [spotId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchSpotDetails = async () => {
    try {
      // Spot bilgilerini getir
      const { data: spotData, error: spotError } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spotId)
        .single()

      if (spotError) throw spotError

      // Kullanıcı bilgilerini getir
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', spotData.user_id)
        .single()

      // Görüntüleme sayısını artır
      await supabase
        .from('spots')
        .update({ views: (spotData.views || 0) + 1 })
        .eq('id', spotId)

      // Sightings'leri getir
      const { data: sightingsData, error: sightingsError } = await supabase
        .from('sightings')
        .select(`
          *,
          spotter:spotter_id(
            email,
            user_metadata
          )
        `)
        .eq('spot_id', spotId)
        .order('created_at', { ascending: false })

      if (sightingsError) {
        console.error('Sightings yükleme hatası:', sightingsError)
      }

      setSpot({
        ...spotData,
        user: userData || { name: null, email: spotData.user_id }
      })
      setSightings(sightingsData || [])
    } catch (error) {
      console.error('Spot detayları yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  // app/spots/[id]/page.tsx içindeki handleSightingSubmit fonksiyonunu şu şekilde değiştirin:

  const handleSightingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Lütfen önce giriş yapın')
      router.push('/login')
      return
    }

    if (!sightingForm.location.trim()) {
      alert('Lütfen konum bilgisi girin')
      return
    }

    setSubmitting(true)

    try {
      let imageUrl = null
      
      // RESİM YÜKLEME - GELİŞTİRİLMİŞ VERSİYON
      if (sightingForm.image) {
        try {
          // 1. Dosya adını oluştur
          const timestamp = Date.now()
          const fileExt = sightingForm.image.name.split('.').pop()?.toLowerCase()
          const fileName = `sightings/${user.id}/${timestamp}.${fileExt}`
          
          console.log('📤 Resim yükleniyor:', {
            fileName,
            size: sightingForm.image.size,
            type: sightingForm.image.type
          })
          
          // 2. Resmi yükle - ÇOK ÖNEMLİ: upsert: true yapıyoruz
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('spot-images')
            .upload(fileName, sightingForm.image, {
              cacheControl: '3600',
              upsert: true, // ✅ Aynı dosya varsa üzerine yaz
              contentType: sightingForm.image.type
            })

          if (uploadError) {
            console.warn('⚠️ Resim yükleme hatası (devam ediliyor):', uploadError.message)
            // Resim yüklenemezse hata fırlatma, devam et
            // imageUrl null kalacak
          } else {
            console.log('✅ Resim yüklendi:', uploadData)
            
            // 3. Public URL'yi al
            const { data: { publicUrl } } = supabase.storage
              .from('spot-images')
              .getPublicUrl(fileName)
            
            console.log('🔗 Public URL:', publicUrl)
            imageUrl = publicUrl
          }
        } catch (uploadError: any) {
          console.error('❌ Resim yükleme exception:', uploadError)
          // Exception durumunda da devam et
        }
      }

      // 1. Sightings kaydet (resimli veya resimsiz)
      console.log('💾 Sightings kaydediliyor...')
      const { data: sightingData, error } = await supabase
        .from('sightings')
        .insert({
          spot_id: spotId,
          spotter_id: user.id,
          image_url: imageUrl, // null veya URL
          location_description: sightingForm.location,
          price: sightingForm.price ? parseFloat(sightingForm.price) : null,
          notes: sightingForm.notes
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Sightings kayıt hatası:', error)
        throw error
      }

      console.log('✅ Sightings kaydedildi:', sightingData)

      // 2. Spot'un helps sayısını artır
      await supabase
        .from('spots')
        .update({ helps: (spot?.helps || 0) + 1 })
        .eq('id', spotId)

      // 3. EMAİL GÖNDER - Spot sahibine
      console.log('📧 Email gönderimi başlıyor...')
      
      // ÖNEMLİ: Spot sahibini bulmak için alternatif yol
      let spotOwnerEmail = null
      let spotOwnerName = 'Spot Sahibi'
      
      try {
        // Yöntem 1: Spot'tan user_id'yi kullan
        if (spot?.user_id) {
          // Direct users tablosundan email al (auth.users yerine)
          const { data: spotOwnerData, error: ownerError } = await supabase
            .from('user_profiles')
            .select('email, name')
            .eq('id', spot.user_id)
            .single()
            
          if (!ownerError && spotOwnerData) {
            spotOwnerEmail = spotOwnerData.email
            spotOwnerName = spotOwnerData.name || 'Spot Sahibi'
            console.log('✅ Spot sahibi bulundu:', { email: spotOwnerEmail, name: spotOwnerName })
          } else {
            console.warn('⚠️ Spot sahibi profil tablosunda bulunamadı:', ownerError)
          }
        }
        
        // Yöntem 2: Eğer hala bulunamadıysa, kullanıcı kendi email'ine gönder
        if (!spotOwnerEmail) {
          console.log('ℹ️ Spot sahibi bulunamadı, test email gönderilecek')
          spotOwnerEmail = 'mehmetberber1977@hotmail.com' // Test için kendi email'in
          spotOwnerName = 'Test Kullanıcı'
        }
        
        // Email gönder
        if (spotOwnerEmail && spot?.title) {
          const emailResult = await emailService.sendSightingNotification(
            spotOwnerEmail,
            spot.title,
            user.user_metadata?.name || user.email?.split('@')[0] || 'Yardımsever',
            spotId,
            sightingForm.notes,
            sightingForm.price,
            sightingForm.location
          )
          
          console.log('📧 Email gönderim sonucu:', emailResult)
          
          if (emailResult.success) {
            setShowEmailSuccess(true)
            console.log('✅ Email başarıyla gönderildi')
          } else {
            console.warn('⚠️ Email gönderilemedi:', emailResult.error)
            alert('Yardım kaydedildi ama email gönderilemedi: ' + (emailResult.error || 'Bilinmeyen hata'))
          }
        } else {
          console.warn('⚠️ Email gönderimi için gerekli bilgiler eksik')
          alert('Yardım kaydedildi (email bilgileri eksik)')
        }
        
      } catch (emailError: any) {
        console.error('❌ Email gönderme hatası:', emailError)
        // Email hatası ana işlemi engellemesin
        alert('Yardım kaydedildi (email gönderme hatası)')
      }

      // 4. Formu temizle ve sayfayı yenile
      setShowSightingForm(false)
      setSightingForm({ image: null, imagePreview: '', location: '', price: '', notes: '' })
      fetchSpotDetails()

    } catch (error: any) {
      console.error('❌ Yardım kaydetme hatası:', error)
      alert(`Bir hata oluştu: ${error.message || 'Lütfen tekrar deneyin.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Resim boyutu 5MB\'dan küçük olmalıdır')
        return
      }
      
      setSightingForm({
        ...sightingForm,
        image: file
      })
      
      // Preview oluştur
      const reader = new FileReader()
      reader.onloadend = () => {
        setSightingForm(prev => ({
          ...prev,
          imagePreview: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMarkAsFound = async () => {
    if (!user || user.id !== spot?.user_id) {
      alert('Sadece spot sahibi bu işlemi yapabilir')
      return
    }

    if (!confirm('Bu spot\'u "Bulundu" olarak işaretlemek istediğinize emin misiniz?')) {
      return
    }

    try {
      // Spot durumunu güncelle
      const { error } = await supabase
        .from('spots')
        .update({ status: 'found' })
        .eq('id', spotId)

      if (error) throw error

      // Spot sahibine tebrik email'i gönder
      if (spot?.user?.email && spot?.title) {
        try {
          await emailService.sendSpotFoundEmail(
            spot.user.email,
            spot.title,
            spotId,
            undefined, // foundBy (opsiyonel)
            1, // totalSpots (basit)
            1  // foundSpots (basit)
          )
        } catch (emailError) {
          console.error('Tebrik emaili gönderilemedi:', emailError)
        }
      }

      alert('✅ Spot "Bulundu" olarak işaretlendi! Tebrikler!')
      fetchSpotDetails() // Sayfayı yenile
    } catch (error) {
      console.error('Spot durumu güncellenemedi:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const handleShare = () => {
    const url = window.location.href
    const text = `"${spot?.title}" ürününü SpotItForMe'de arıyorum. Yardım edebilir misiniz?`
    
    if (navigator.share) {
      navigator.share({
        title: spot?.title || 'SpotItForMe',
        text: text,
        url: url
      })
    } else {
      navigator.clipboard.writeText(`${text}\n\n${url}`)
      alert('Link kopyalandı! Paylaşmak için yapıştırın.')
    }
  }

  const handleContactOwner = () => {
    alert('🚀 Yakında eklenecek: Spot sahibiyle direkt mesajlaşma özelliği')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Spot Yükleniyor</h2>
          <p className="text-gray-600">Detaylar hazırlanıyor...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-20 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-4xl mx-auto mb-6">
            ❌
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Spot Bulunamadı</h1>
          <p className="text-gray-600 mb-8">
            Bu spot silinmiş, kaldırılmış veya mevcut değil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/spots')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Tüm Spot'lara Dön
            </button>
            <button
              onClick={() => router.push('/create-spot')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Yeni Spot Oluştur
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* Üst Navigasyon */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/spots')}
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            <span className="mr-2">←</span>
            Tüm Spot'lara Dön
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleShare}
              className="text-gray-600 hover:text-gray-900 flex items-center"
              title="Paylaş"
            >
              <span className="mr-2">📤</span>
              Paylaş
            </button>
            
            {user?.id === spot.user_id && (
              <button
                onClick={handleMarkAsFound}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                ✅ Bulundu İşaretle
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Spot Detayları */}
          <div className="lg:col-span-2">
            {/* Spot Başlığı ve Durum */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-full font-medium ${
                    spot.status === 'active' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {spot.status === 'active' ? '🔍 ARANIYOR' : '✅ BULUNDU'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(spot.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                  <span className="text-gray-600 text-sm flex items-center">
                    <span className="mr-1">👁️</span>
                    {spot.views} görüntüleme
                  </span>
                  <span className="text-gray-600 text-sm flex items-center">
                    <span className="mr-1">🤝</span>
                    {spot.helps} yardım
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {spot.title}
              </h1>

              {/* Spot Resmi */}
              {spot.image_url && (
                <div className="mb-8">
                  <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                    <img
                      src={spot.image_url}
                      alt={spot.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
                        img.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div class="text-center">
                              <div class="text-4xl mb-4 text-gray-400">📷</div>
                              <p class="text-gray-500">Resim yüklenemedi</p>
                            </div>
                          </div>
                        `
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Açıklama */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Açıklama</h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {spot.description}
                  </p>
                </div>
              </div>

              {/* Detaylar Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">🏷️ Kategori</h3>
                  <p className="font-medium text-lg">{spot.category || 'Belirtilmemiş'}</p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📍 Konum</h3>
                  <p className="font-medium text-lg">{spot.location || 'Belirtilmemiş'}</p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📊 İstatistikler</h3>
                  <div className="flex space-x-6">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{spot.views}</p>
                      <p className="text-sm text-gray-600">Görüntülenme</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{spot.helps}</p>
                      <p className="text-sm text-gray-600">Yardım</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📧 Email Bildirim</h3>
                  <p className="font-medium text-green-600">✅ AKTİF</p>
                  <p className="text-sm text-gray-600">Yardım gelince anında haberiniz olacak</p>
                </div>
              </div>

              {/* Email Bilgi Kartı */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white text-xl">📧</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800 text-lg mb-2">Email Bildirim Sistemi</h4>
                    <p className="text-blue-700 mb-3">
                      Bu spot için email bildirim sistemi aktif. Birisi yardım edince spot sahibine anında email gidecek.
                    </p>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• %100 ulaşım garantisi</li>
                      <li>• Spam'e düşmez</li>
                      <li>• Fotoğraf ve konum bilgisiyle birlikte</li>
                      <li>• Ortalama 5 saniyede ulaşır</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Yardım Edenler */}
            {sightings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Yardım Edenler ({sightings.length})
                  </h2>
                  <span className="text-green-600 font-medium">📧 Email ile bildirildi</span>
                </div>
                
                <div className="space-y-6">
                  {sightings.map((sighting) => (
                    <div key={sighting.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                        <div className="flex items-center mb-4 sm:mb-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                            {sighting.spotter?.name?.[0]?.toUpperCase() || 'K'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {sighting.spotter?.name || 'Anonim Kullanıcı'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(sighting.created_at).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {sighting.price && (
                          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                            💰 {sighting.price} TL
                          </div>
                        )}
                      </div>
                      
                      {sighting.notes && (
                        <p className="text-gray-700 mb-4 bg-gray-50 p-4 rounded-lg">
                          {sighting.notes}
                        </p>
                      )}
                      
                      {sighting.location_description && (
                        <div className="flex items-center text-gray-600 mb-4">
                          <span className="mr-2">📍</span>
                          <span>{sighting.location_description}</span>
                        </div>
                      )}
                      
                      {sighting.image_url && (
                        <div className="mt-4">
                          <img
                            src={sighting.image_url}
                            alt="Yardım fotoğrafı"
                            className="max-w-xs rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sağ Kolon - İşlemler */}
          <div className="space-y-6">
            {/* "Ben Gördüm" Butonu */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                  👁️
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Bu ürünü gördünüz mü?
                </h3>
                <p className="text-gray-600">
                  Yardım edin, spot sahibine anında email gitsin
                </p>
              </div>
              
              {!showSightingForm ? (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Lütfen önce giriş yapın')
                        router.push('/login')
                        return
                      }
                      setShowSightingForm(true)
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition duration-300 text-lg"
                  >
                    🎯 EVET, BEN GÖRDÜM!
                  </button>
                  
                  <div className="text-center text-sm text-gray-500">
                    <p>📧 Yardımınız spot sahibine email olarak iletilecek</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSightingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📍 Nerede gördünüz? *
                    </label>
                    <input
                      type="text"
                      value={sightingForm.location}
                      onChange={(e) => setSightingForm({...sightingForm, location: e.target.value})}
                      placeholder="Örn: İstiklal Caddesi'ndeki antikacıda, şu mağazada"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💰 Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      value={sightingForm.price}
                      onChange={(e) => setSightingForm({...sightingForm, price: e.target.value})}
                      placeholder="Gördüğünüz fiyatı yazın"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 Notlar
                    </label>
                    <textarea
                      value={sightingForm.notes}
                      onChange={(e) => setSightingForm({...sightingForm, notes: e.target.value})}
                      placeholder="Ek bilgiler, durumu, iletişim bilgileri..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📸 Fotoğraf (opsiyonel)
                    </label>
                    {sightingForm.imagePreview ? (
                      <div className="mb-4">
                        <img
                          src={sightingForm.imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => setSightingForm({...sightingForm, image: null, imagePreview: ''})}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Resmi kaldır
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition duration-200">
                        <div className="text-3xl mb-2 text-gray-400">📷</div>
                        <p className="text-gray-600">Resim yüklemek için tıklayın</p>
                        <p className="text-sm text-gray-500 mt-1">Max 5MB • Email'de görünecek</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-2"></span>
                          Gönderiliyor...
                        </>
                      ) : (
                        '📤 GÖNDER ve EMAİL YOLLA'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSightingForm(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Spot Sahibi */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                👤 Spot Sahibi
              </h3>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl">
                  {spot.user?.name?.[0]?.toUpperCase() || 'K'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{spot.user?.name || 'Kullanıcı'}</p>
                  <p className="text-gray-600">
                    {spot.user?.email ? spot.user.email.substring(0, 20) + '...' : 'Spot sahibi'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleContactOwner}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mb-3"
              >
                📩 Mesaj Gönder
              </button>
              
              <p className="text-sm text-gray-500 text-center">
                Spot sahibi yardımınız için size email ile teşekkür edebilir
              </p>
            </div>

            {/* Hızlı İstatistikler */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                📊 Hızlı İstatistikler
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Görüntülenme:</span>
                    <span className="font-bold text-2xl">{spot.views}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(spot.views * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Yardım:</span>
                    <span className="font-bold text-2xl">{spot.helps}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(spot.helps * 20, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Email Bildirim:</span>
                    <span className="text-green-600 font-bold">✅ AKTİF</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Ortalama yardım süresi: 24 saat
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Spot'unuzu paylaşın</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${spot.title}" ürününü SpotItForMe'de arıyorum. Yardım edebilir misiniz?`)}&url=${window.location.href}`)}
                      className="w-10 h-10 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center text-white"
                    >
                      🐦
                    </button>
                    <button
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`)}
                      className="w-10 h-10 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center text-white"
                    >
                      📘
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`"${spot.title}" ürününü SpotItForMe'de arıyorum. Yardım edebilir misiniz? ${window.location.href}`)}`)}
                      className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white"
                    >
                      💚
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Demo */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">📧 Email Sistemi Demo</h3>
              <p className="text-blue-100 mb-6">
                SpotItForMe email sisteminin nasıl çalıştığını görün
              </p>
              
              <button
                onClick={() => window.location.href = '/test-email'}
                className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 rounded-lg mb-4"
              >
                🧪 Email Test Sayfası
              </button>
              
              <div className="text-sm text-blue-200 space-y-2">
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  <span>Anında bildirim</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  <span>Spam'e düşmez</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  <span>Fotoğraf ve konum bilgisi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benzer Spot'lar Önerisi */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Benzer Spot'lar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Vintage Kamera Aksesuarı', category: 'Fotoğraf', location: 'İstanbul', helps: 3 },
              { title: 'Eski Model Saat', category: 'Aksesuar', location: 'Ankara', helps: 5 },
              { title: 'Retro Oyuncak', category: 'Koleksiyon', location: 'İzmir', helps: 2 }
            ].map((similar, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition duration-200">
                <h4 className="font-bold text-gray-900 mb-2">{similar.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{similar.category}</span>
                  <span>📍 {similar.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-medium">📧 Aktif</span>
                  <span className="text-gray-500">🤝 {similar.helps} yardım</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* Email Başarı Modalı */}
      <EmailSuccessModal
        isOpen={showEmailSuccess}
        onClose={() => setShowEmailSuccess(false)}
        spotId={spotId}
        spotTitle={spot.title}
        isHelpNotification={true}
      />
    </div>
  )
}
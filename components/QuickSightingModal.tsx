'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import LocationSelector from './LocationSelector'

interface QuickSightingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function QuickSightingModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: QuickSightingModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState<any>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentNoktaBalance, setCurrentNoktaBalance] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    price: '',
    addToMuseum: false,
    hasPhoto: false
  })

  const handleLocationSelect = (location: any) => {
    setLocationData(location)
  }

  const handlePhotoToggle = (checked: boolean) => {
    setFormData({...formData, hasPhoto: checked})
    if (!checked) {
      setPhotoFile(null)
      setPhotoPreview(null)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Max 5MB kontrolü
      if (file.size > 5 * 1024 * 1024) {
        alert('Resim boyutu 5MB\'dan küçük olmalıdır')
        return
      }
      
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const calculatePoints = () => {
    let points = 5 // Temel puan
    
    if (formData.hasPhoto) points += 10
    if (locationData) points += 5
    if (formData.category) points += 3
    
    return points
  }

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const fetchNoktaBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!isMounted) return

        if (!user) {
          setCurrentNoktaBalance(0)
          return
        }

        const { data: walletData } = await supabase
          .from('spot_wallets')
          .select('nokta_balance')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!isMounted) return
        setCurrentNoktaBalance(walletData?.nokta_balance || 0)
      } catch {
        if (isMounted) setCurrentNoktaBalance(0)
      }
    }

    fetchNoktaBalance()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  const noktaBefore = currentNoktaBalance ?? 0
  const noktaProgressBefore = noktaBefore % 10
  const willConvertToSpot = noktaProgressBefore === 9
  const noktaProgressAfter = willConvertToSpot ? 0 : noktaProgressBefore + 1
  const progressFillPercent = willConvertToSpot ? 100 : (noktaProgressAfter / 10) * 100

  const handleSubmit = async () => {
    if (!locationData) {
      alert('Lütfen konum seçin')
      return
    }

    if (!formData.description.trim()) {
      alert('Lütfen ne gördüğünüzü yazın')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/')
        return
      }

      let photoUrl = null
      
      // 1. Fotoğraf yükle
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${user.id}/sightings/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, photoFile)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)
        
        photoUrl = publicUrl
      }

      // 2. Quick sighting oluştur
      const basePayload: Record<string, any> = {
        user_id: user.id,
        description: formData.description,
        category: formData.category,
        has_photo: formData.hasPhoto,
        is_in_museum: formData.addToMuseum,
        helper_commission_rate: 15,
        photo_url: photoUrl,
        location_name: locationData.name,
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city,
        district: locationData.district,
        points_earned: calculatePoints(),
        status: 'active'
      }

      // Fiyat varsa ekle; kolon henüz yoksa hata vermesin diye ayrı dene
      if (formData.price) {
        basePayload.price = parseFloat(formData.price)
      }

      let { data: sighting, error: sightingError } = await supabase
        .from('quick_sightings')
        .insert(basePayload)
        .select()
        .single()

      // bazı kolonlar henüz migration almamış olabilir; uyumlu tekrar dene
      if (sightingError && (sightingError.message?.includes('price') || sightingError.message?.includes('is_in_museum') || sightingError.message?.includes('helper_commission_rate'))) {
        delete basePayload.price
        delete basePayload.is_in_museum
        delete basePayload.helper_commission_rate
        const retry = await supabase
          .from('quick_sightings')
          .insert(basePayload)
          .select()
          .single()
        sighting = retry.data
        sightingError = retry.error
      }

      if (sightingError) throw sightingError

      // 3. Puan ekle (gamification)
      await supabase.rpc('add_user_points', {
        user_id: user.id,
        points_to_add: calculatePoints(),
        activity_type: 'quick_sighting'
      })

      // 4. Badge kontrolü (ilk sighting)
      const { data: reputation } = await supabase
        .from('user_reputation')
        .select('total_sightings')
        .eq('user_id', user.id)
        .single()

      if (reputation?.total_sightings === 1) {
        await supabase.rpc('award_badge', {
          user_id: user.id,
          badge_id: 'first_sighting'
        })
      }

      // 5. Ana sayfada gösterilmek üzere global state'e ekle
      // (Real-time için Supabase Realtime kullanılabilir)
      
      // 6. Social feed'e ekle (opsiyonel)
      if (process.env.NEXT_PUBLIC_ENABLE_SOCIAL === 'true') {
        await supabase.from('social_posts').insert({
          user_id: user.id,
          post_type: 'rare_sight',
          content: `"${formData.description}" gördüm!`,
          location: locationData.name,
          image_urls: photoUrl ? [photoUrl] : [],
          hashtags: ['#nadirgördüm', '#spotitforme']
        })
      }

      // Başarı mesajı
      alert(`🎉 Bildiriminiz kaydedildi! +1 Nokta kazandınız. Her 10 Nokta otomatik olarak 1 Spot'a dönüşür. Ayrıca ${calculatePoints()} puan kazandınız.${formData.addToMuseum ? ' Paylaşımınız nadir müzenize eklendi.' : ''}`)
      
      // Formu sıfırla
      setFormData({ description: '', category: '', price: '', addToMuseum: false, hasPhoto: false })
      setLocationData(null)
      setPhotoFile(null)
      setPhotoPreview(null)
      
      onClose()
      if (onSuccess) onSuccess()
      
      // Sayfayı yenile
      router.refresh()

    } catch (error: any) {
      console.error('Bildirim hatası:', error)
      alert(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">👁️ Nadir Gördüm!</h2>
              <p className="text-gray-600">Hızlıca bildirim gönder, puan kazan</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ne gördünüz? *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Örn: Vintage Nikon F2 kamera, eski Rolex saat, antika Hereke halısı..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          {/* FİYAT ALANI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Gördüğünüz Fiyat <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm">
                ₺
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="Örn: 2500"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Etikette veya satıcıdan öğrendiğiniz fiyatı yazın</p>
          </div>

          {/* KONUM SEÇİCİ */}
          <LocationSelector 
            onLocationSelect={handleLocationSelect}
            initialLocation=""
          />

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">Kategori seçin (opsiyonel)</option>
              <option value="electronics">Elektronik</option>
              <option value="fashion">Giyim & Aksesuar</option>
              <option value="home">Ev & Bahçe</option>
              <option value="collectible">Koleksiyon</option>
              <option value="vehicle">Araç & Parça</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          {/* FOTOĞRAF BÖLÜMÜ */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.hasPhoto}
                onChange={(e) => handlePhotoToggle(e.target.checked)}
                className="w-4 h-4 text-green-600"
                id="hasPhoto"
              />
              <label htmlFor="hasPhoto" className="text-sm font-medium text-gray-700">
                📸 Fotoğrafım var (+10 ekstra puan!)
              </label>
            </div>

            {formData.hasPhoto && (
              <div className="mt-3">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null)
                        setPhotoPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition"
                  >
                    <div className="text-4xl mb-2">📸</div>
                    <p className="font-medium">Fotoğraf yüklemek için tıkla</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Ürünün net fotoğrafını çek, daha hızlı bulunsun
                    </p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  capture="environment"
                />

                <p className="text-xs text-gray-500 mt-2">
                  ✓ Fotoğraflı bildirimler 2x daha hızlı bulunuyor<br />
                  ✓ Max 5MB • PNG, JPG, JPEG, WebP
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.addToMuseum}
                onChange={(e) => setFormData({ ...formData, addToMuseum: e.target.checked })}
                className="mt-1 w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-purple-900">
                <span className="font-semibold">🏛️ Nadir müzeme ekle</span>
                <span className="block text-purple-700 mt-1">
                  Bu paylaşım müze vitrininizde de yayınlanır. Sonradan profilinizden kaldırabilirsiniz.
                </span>
              </span>
            </label>
          </div>

          {/* PUAN HESAPLA */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">🎯 Toplam Kazanacağınız Puan:</p>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {calculatePoints()} PUAN
                </div>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
            <div className="text-sm text-green-700 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Temel bildirim:</span>
                <span className="font-medium">5 puan</span>
              </div>
              {formData.hasPhoto && (
                <div className="flex justify-between">
                  <span>Fotoğraf:</span>
                  <span className="font-medium">+10 puan</span>
                </div>
              )}
              {locationData && (
                <div className="flex justify-between">
                  <span>Detaylı konum:</span>
                  <span className="font-medium">+5 puan</span>
                </div>
              )}
              {formData.category && (
                <div className="flex justify-between">
                  <span>Kategori:</span>
                  <span className="font-medium">+3 puan</span>
                </div>
              )}
            </div>
          </div>

          {/* NOKTA İLERLEME */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-blue-900">💠 Nokta İlerlemesi</p>
              <span className="text-sm font-semibold text-blue-700">10 Nokta = 1 Spot</span>
            </div>

            {currentNoktaBalance === null ? (
              <p className="text-sm text-blue-700">Nokta durumu yükleniyor...</p>
            ) : (
              <>
                <div className="text-sm text-blue-800 mb-2">
                  Bu paylaşım sonrası: <span className="font-semibold">{noktaProgressAfter}/10 Nokta</span>
                  {willConvertToSpot && <span className="font-semibold"> +1 Spot</span>}
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progressFillPercent}%` }}
                  />
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  {willConvertToSpot
                    ? 'Tebrikler! Bu paylaşımda 10 Nokta tamamlanacak ve otomatik 1 Spot kazanacaksınız.'
                    : `Bir sonraki Spot için ${10 - noktaProgressAfter} Nokta kaldı.`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !locationData || !formData.description.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Gönderiliyor...
              </span>
            ) : !locationData ? (
              '📍 Konum Seçin'
            ) : (
              `Bildir, +1 Nokta ve ${calculatePoints()} Puan Kazan!`
            )}
          </button>
          
          <p className="text-center text-gray-500 text-sm mt-3">
            Bildiriminiz profil sayfanızda ve ana sayfada görünecek
          </p>
        </div>
      </div>
    </div>
  )
}
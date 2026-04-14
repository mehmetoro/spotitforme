// components/social/CreatePostModal.tsx - SON VERSİYON
'use client'

import { useState, useRef, useEffect } from 'react'
import { buildSeoImageFileName, suggestHashtagsFromText } from '@/lib/content-seo'
import { supabase } from '@/lib/supabase'
import LocationSelector from '../LocationSelector'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: () => void
  initialType?: 'rare_sight' | 'spot' | 'found' | 'product'
  parentSpotId?: string
}


// Kategoriler
const CATEGORIES = [
  { id: 'Antika ve Koleksiyon', name: 'Antika ve Koleksiyon', icon: '🗝️' },
  { id: 'Vintage ve Retro', name: 'Vintage ve Retro', icon: '📻' },
  { id: 'Kitap ve Plak', name: 'Kitap ve Plak', icon: '📚' },
  { id: 'Oyuncak ve Figür', name: 'Oyuncak ve Figür', icon: '🧸' },
  { id: 'Saat ve Takı', name: 'Saat ve Takı', icon: '⌚' },
  { id: 'Dekorasyon ve Ev', name: 'Dekorasyon ve Ev', icon: '🏺' },
  { id: 'Mutfak ve Zanaat', name: 'Mutfak ve Zanaat', icon: '🍽️' },
  { id: 'Giyim ve Aksesuar', name: 'Giyim ve Aksesuar', icon: '🧥' },
  { id: 'Pazar ve Bit Pazarı', name: 'Pazar ve Bit Pazarı', icon: '🛒' },
  { id: 'Sahaf ve Plakçı', name: 'Sahaf ve Plakçı', icon: '📖' },
  { id: 'Müzayede ve Mezat', name: 'Müzayede ve Mezat', icon: '🏛️' },
  { id: 'Müze ve Sergi', name: 'Müze ve Sergi', icon: '🖼️' },
  { id: 'Tarihi Çarşı ve Han', name: 'Tarihi Çarşı ve Han', icon: '🏚️' },
  { id: 'Yerel Dükkan ve Atölye', name: 'Yerel Dükkan ve Atölye', icon: '🧰' },
  { id: 'Rota Üstü Durak', name: 'Rota Üstü Durak', icon: '🧭' },
  { id: 'Gizli Mekan', name: 'Gizli Mekan', icon: '🕵️' },
  { id: 'Fotoğraflık Nokta', name: 'Fotoğraflık Nokta', icon: '📸' },
  { id: 'Etkinlik ve Festival', name: 'Etkinlik ve Festival', icon: '🎪' },
  { id: 'Kafe ve Mola Noktası', name: 'Kafe ve Mola Noktası', icon: '☕' },
  { id: 'Diğer', name: 'Diğer', icon: '🔍' }
]


export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPostCreated,
  initialType,
  parentSpotId
}: CreatePostModalProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const CITY_LIST = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Trabzon'
  ];
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('')
  const [locationData, setLocationData] = useState<any>(null)
  const [category, setCategory] = useState<string>('') // Kategori
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [images, setImages] = useState<File[]>([])
  // Yeni tipler: rare_sight | spot | found | product
  const [postType, setPostType] = useState<'rare_sight' | 'spot' | 'found' | 'product'>(initialType || 'rare_sight')
  const [rewardAmount, setRewardAmount] = useState<number | ''>('')
  const [isPublicPost, setIsPublicPost] = useState(true) // yalnızca "found" tipi için geçerli
  const [hasIsPublicColumn, setHasIsPublicColumn] = useState<boolean>(true)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const normalizedTitle = title.trim()
  const normalizedContent = content.trim()
  const isTitleDetailedEnough = normalizedTitle.length >= 12
  const isContentDetailedEnough = normalizedContent.length >= 40
  const suggestedHashtags = suggestHashtagsFromText([title, content, category, location, city]).filter(
    (tag) => !hashtags.includes(tag.replace('#', ''))
  )
  // Konum seçildiğinde şehir bilgisini otomatik doldur
  const handleLocationSelect = (loc: any) => {
    setLocation(loc.address || loc.name || '')
    // city, town, county sırasıyla kontrol et
    let cityValue = loc.city || loc.town || loc.county || ''
    // normalize: küçük harf, trimli
    cityValue = (cityValue || '').trim().toLocaleLowerCase('tr-TR')
    setCity(cityValue)
    setLocationData(loc)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace('#', '')
    if (tag && !hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag])
      setHashtagInput('')
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag))
  }

  const addSuggestedHashtag = (tag: string) => {
    const normalizedTag = tag.replace('#', '')
    if (!hashtags.includes(normalizedTag)) {
      setHashtags(prev => [...prev, normalizedTag])
    }
  }

  const uploadImages = async (userId: string): Promise<string[]> => {
    const urls: string[] = []
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileName = buildSeoImageFileName({
        folder: 'social',
        userId,
        title: title || content,
        originalName: file.name,
        index: i,
      })
      
      const { error: uploadError } = await supabase.storage
        .from('spot-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('spot-images')
        .getPublicUrl(fileName)

      urls.push(publicUrl)
    }
    
    return urls
  }

  const handleSubmit = async () => {

    if (!isTitleDetailedEnough) {
      alert('Başlık en az 12 karakter olmalı. Ürün adı, seri veya ayırt edici ifade ekleyin.')
      return
    }

    if (!isContentDetailedEnough) {
      alert('Açıklama en az 40 karakter olmalı. Neyi, nerede ve neden paylaştığınızı daha detaylı yazın.')
      return
    }

    if (hashtags.length === 0) {
      alert('En az 1 etiket ekleyin. Etiketler paylaşımınızın keşfedilmesini kolaylaştırır.')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Giriş yapmalısınız')

      // user_profiles tablosunda user.id var mı kontrol et, yoksa ekle
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      if (!profile) {
        // Kullanıcı profilini ekle (minimum id ile)
        const { error: insertProfileError } = await supabase.from('user_profiles').insert({ id: user.id }).single();
        if (insertProfileError) {
          console.error('user_profiles insert hatası:', insertProfileError, 'user.id:', user.id);
        } else {
          console.log('user_profiles insert başarılı, user.id:', user.id);
        }
      } else {
        console.log('user_profiles zaten var, user.id:', user.id);
      }

      // 1. Resimleri yükle
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadImages(user.id)
        console.log('Yüklenen resim URLleri:', imageUrls)
      }

      // 2. Post verilerini hazırla
      const postData: any = {
        user_id: user.id,
        title: normalizedTitle,
        content: content || 'Paylaşım',
        post_type: postType
      }
      if (parentSpotId) {
        postData.parent_spot_id = parentSpotId
      }

      // türe özel alanlar
      if (postType === 'spot' && rewardAmount !== '' && rewardAmount > 0) {
        postData.reward = rewardAmount
      }
      if (postType === 'found' && hasIsPublicColumn) {
        postData.is_public = isPublicPost
      }

      // Array alanlarını ekle (boş array göndermemeye dikkat et)
      if (imageUrls.length > 0) {
        postData.images = imageUrls
      }

      if (hashtags.length > 0) {
        postData.hashtags = hashtags
      }

      // Opsiyonel alanları ekle

      if (location && location.trim() !== '') {
        postData.location = location
      }
      if (locationData?.latitude != null && locationData?.longitude != null) {
        postData.latitude = Number(locationData.latitude)
        postData.longitude = Number(locationData.longitude)
      }
      if (city && city.trim() !== '') {
        // normalize: küçük harf, trimli
        postData.city = city.trim().toLocaleLowerCase('tr-TR')
      }
      if (category && category.trim() !== '') {
        postData.category = category
      }

      console.log('Gönderilecek veri:', JSON.stringify(postData, null, 2))

      // 3. Post'u oluştur
      const insertPayload: any = { ...postData }
      let { data: newPost, error: postError } = await supabase
        .from('social_posts')
        .insert(insertPayload)
        .select()
        .single()

      // Eski şema uyumu: title kolonu yoksa title'sız tekrar dene
      if (postError?.message?.includes('title')) {
        delete insertPayload.title
        const retry = await supabase
          .from('social_posts')
          .insert(insertPayload)
          .select()
          .single()
        newPost = retry.data
        postError = retry.error
      }

      // Eski şema uyumu: koordinat kolonları yoksa kaldırıp tekrar dene
      if (postError && (postError.message?.includes('latitude') || postError.message?.includes('longitude'))) {
        delete insertPayload.latitude
        delete insertPayload.longitude
        const retryWithoutCoords = await supabase
          .from('social_posts')
          .insert(insertPayload)
          .select()
          .single()
        newPost = retryWithoutCoords.data
        postError = retryWithoutCoords.error
      }

      if (postError) {
        console.error('social_posts insert hatası:', postError, 'user_id:', postData.user_id);
        throw postError
      } else {
        console.log('social_posts insert başarılı, user_id:', postData.user_id);
      }

      // 3b. spot bulunan postunu bildirim gönder (sadece 'found' tipi ve parent_spot_id varsa)
      if (postType === 'found' && parentSpotId) {
        try {
          const { data: parent } = await supabase
            .from('social_posts')
            .select('user_id')
            .eq('id', parentSpotId)
            .maybeSingle()
          const spotOwner = parent?.user_id
          if (spotOwner && spotOwner !== user.id) {
            await supabase.from('social_notifications').insert({
              user_id: spotOwner,
              type: 'spot_found',
              actor_id: user.id,
              post_id: parentSpotId,
              message: 'spotunuz için "Ben Gördüm" paylaşımı yapıldı'
            })
          }
        } catch (e) {
          console.warn('Spot owner notification failed', e)
        }
      }

      // 4. Başarılı
      alert('✅ Paylaşımınız yayınlandı!')
      
      // 5. Formu temizle
      setTitle('')
      setContent('')
      setLocation('')
      setCategory('')
      setHashtags([])
      setHashtagInput('')
      setImages([])
      setUploadedImageUrls([])
      setPostType('rare_sight')
      setRewardAmount('')
      setIsPublicPost(true)
      setCity('')
      setLocationData(null)
      
      // 6. Parent'i bilgilendir ve kapat
      onPostCreated()
      onClose()

    } catch (error: any) {
      console.error('Hata:', error)
      alert(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const check = async () => {
      try {
        await supabase.from('social_posts').select('is_public').limit(1)
        setHasIsPublicColumn(true)
      } catch (e) {
        console.warn('is_public column not found:', e)
        setHasIsPublicColumn(false)
      }
    }
    check()
  }, [])

  useEffect(() => {
    if (initialType) setPostType(initialType)
    if (parentSpotId) {
      setContent('Bu spotu buldum!')
    }
  }, [initialType, parentSpotId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Nadir Paylaş</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Paylaşım Türü kaldırıldı, sadece discovery için tekli form */}

          {/* Fotoğraf Yükleme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotoğraflar {images.length > 0 && `(${images.length} seçildi)`}
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 transition"
              >
                <span className="text-2xl text-gray-400">+</span>
                <span className="text-xs text-gray-500 mt-1">Fotoğraf Ekle</span>
              </button>
            </div>
          </div>




          {/* Konum Seçimi kaldırıldı, sadece şehir zorunlu */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 1980'ler Sony Walkman kutulu bulundu"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={120}
            />
            <div className="flex items-center justify-between text-xs mt-1">
              <span className={isTitleDetailedEnough ? 'text-emerald-600' : 'text-amber-600'}>
                Başlıkta ürün adı, marka veya seri bilgisi geçsin.
              </span>
              <span className="text-gray-500">{title.length}/120</span>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ne gördün? Anlat..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length}/500
            </div>
            {!isContentDetailedEnough && content.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Yer, kondisyon, fiyat ipucu veya neden önemli olduğunu yazmanız keşfi güçlendirir.
              </p>
            )}
          </div>

          {/* Hashtagler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtag'ler
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder="#vintage #kamera"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addHashtag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Ekle
              </button>
            </div>
            
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {hashtags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeHashtag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {hashtags.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">
                En az bir etiket ekleyin: örn. vintage, saat, koleksiyon, walkman.
              </p>
            )}
            {suggestedHashtags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Otomatik etiket önerileri</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addSuggestedHashtag(tag)}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Konum Seçici (şehir otomatik) */}
          <div>
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              initialLocation={location}
              required={true}
            />
            {city && (
              <div className="text-xs text-gray-500 mt-1">Şehir: <b>{city}</b></div>
            )}
          </div>


          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  type="button"
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    category === cat.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium text-gray-700 truncate">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>


          {/* Spot için ödül alanı kaldırıldı */}

          {/* Ben Gördüm için gizlilik */}
          {postType === 'found' && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isPublicPost}
                onChange={(e) => setIsPublicPost(e.target.checked)}
                className="w-4 h-4 text-blue-600"
                id="isPublicPost"
              />
              <label htmlFor="isPublicPost" className="text-sm font-medium text-gray-700">
                Herkese açık paylaş
              </label>
              <span className="text-xs text-gray-500">
                Kapalıysa sadece arayanın görebilir. Gizli ben gördüm için
                ödeme/iletişim platform dışında olmalıdır.
              </span>
            </div>
          )}

          {/* Puan Bilgisi */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">🎉 Kazanacağın Puan</p>
                <p className="text-sm text-green-600">
                  • Paylaşım: 10 puan<br />
                  • Fotoğraf: +{images.length * 5} puan<br />
                  • Hashtag: +{hashtags.length * 2} puan
                </p>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {10 + (images.length * 5) + (hashtags.length * 2)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Paylaşılıyor...
                </span>
              ) : (
                'Paylaş'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
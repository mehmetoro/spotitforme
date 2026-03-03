// components/social/CreatePostModal.tsx - SON VERSİYON
'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: () => void
  initialType?: 'rare_sight' | 'spot' | 'found' | 'product'
  parentSpotId?: string
}

// Kategoriler
const CATEGORIES = [
  { id: 'elektronik', name: 'Elektronik', icon: '📱' },
  { id: 'giyim', name: 'Giyim & Aksesuar', icon: '👕' },
  { id: 'ev', name: 'Ev & Dekorasyon', icon: '🏠' },
  { id: 'koleksiyon', name: 'Koleksiyon', icon: '🎨' },
  { id: 'kitap', name: 'Kitap & Müzik', icon: '📚' },
  { id: 'oyuncak', name: 'Oyuncak & Oyun', icon: '🎮' },
  { id: 'spor', name: 'Spor & Outdoor', icon: '⚽' },
  { id: 'arac', name: 'Araç & Parça', icon: '🚗' },
  { id: 'saat', name: 'Saat & Aksesuar', icon: '⌚' },
  { id: 'mutfak', name: 'Mutfak & Sofra', icon: '🍽️' },
  { id: 'bahce', name: 'Bahçe & Dış Mekan', icon: '🌿' },
  { id: 'diger', name: 'Diğer', icon: '🔍' }
]

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPostCreated,
  initialType,
  parentSpotId
}: CreatePostModalProps) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [location, setLocation] = useState('')
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

  const uploadImages = async (userId: string): Promise<string[]> => {
    const urls: string[] = []
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileName = `${userId}/${Date.now()}-${i}.${file.name.split('.').pop()}`
      
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
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Giriş yapmalısınız')

      console.log('1. Kullanıcı:', user.id)
      console.log('2. İçerik:', content)
      console.log('3. Fotoğraflar:', images.length)
      console.log('4. Hashtagler:', hashtags)
      console.log('5. Konum:', location)

      // 1. Resimleri yükle
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadImages(user.id)
        console.log('Yüklenen resim URLleri:', imageUrls)
      }

      // 2. Post verilerini hazırla
      const postData: any = {
        user_id: user.id,
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

      if (category && category.trim() !== '') {
        postData.category = category
      }

      console.log('Gönderilecek veri:', JSON.stringify(postData, null, 2))

      // 3. Post'u oluştur
      const { data: newPost, error: postError } = await supabase
        .from('social_posts')
        .insert(postData)
        .select()
        .single()

      if (postError) {
        console.error('Post hatası:', postError)
        throw postError
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
            <h2 className="text-2xl font-bold text-gray-900">Yeni Paylaşım</h2>
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
          {/* Paylaşım Türü */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paylaşım Türü
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPostType('rare_sight')}
                className={`p-4 rounded-xl border-2 text-center ${
                  postType === 'rare_sight'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">👁️</div>
                <div className="font-medium">Nadir Gördüm</div>
              </button>
              <button
                onClick={() => setPostType('spot')}
                className={`p-4 rounded-xl border-2 text-center ${
                  postType === 'spot'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📍</div>
                <div className="font-medium">Spot</div>
              </button>
              <button
                onClick={() => setPostType('found')}
                className={`p-4 rounded-xl border-2 text-center ${
                  postType === 'found'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium">Ben Gördüm</div>
              </button>
              <button
                onClick={() => setPostType('product')}
                className={`p-4 rounded-xl border-2 text-center ${
                  postType === 'product'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🛍️</div>
                <div className="font-medium">Ürün</div>
              </button>
            </div>
          </div>

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

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
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
          </div>

          {/* Konum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konum
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="İstanbul, Kadıköy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
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

          {/* Spot için ödül */}
          {postType === 'spot' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödül (₺)
              </label>
              <input
                type="number"
                value={rewardAmount === '' ? '' : rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                placeholder="Örn: 100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min={0}
              />
              <p className="text-xs text-gray-500 mt-1">
                Eğer aranan ürün için bir ödül koyduysanız buraya girebilirsiniz.
                Ödül ödemesi platform dışında yapılmalıdır.
              </p>
            </div>
          )}

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
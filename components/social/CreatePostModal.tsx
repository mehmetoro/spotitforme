// components/social/CreatePostModal.tsx
'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import ImageUpload from '../ImageUpload'
import HashtagInput from './HashtagInput'
import LocationPicker from './LocationPicker'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: () => void
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPostCreated 
}: CreatePostModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [postData, setPostData] = useState({
    type: 'sighting',
    caption: '',
    location: '',
    category: '',
    hashtags: [] as string[],
    isPublic: true,
    images: [] as File[]
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (files: File[]) => {
    setPostData({ ...postData, images: [...postData.images, ...files] })
  }

  const removeImage = (index: number) => {
    setPostData({
      ...postData,
      images: postData.images.filter((_, i) => i !== index)
    })
  }

  const handleHashtagAdd = (hashtag: string) => {
    if (!postData.hashtags.includes(hashtag)) {
      setPostData({
        ...postData,
        hashtags: [...postData.hashtags, hashtag]
      })
    }
  }

  const handleHashtagRemove = (hashtag: string) => {
    setPostData({
      ...postData,
      hashtags: postData.hashtags.filter(h => h !== hashtag)
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı girişi gerekli')

      // 1. Resimleri yükle
      const imageUrls: string[] = []
      for (const file of postData.images) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/social/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }

      // 2. Post'u oluştur
      const { error: postError } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          type: postData.type,
          caption: postData.caption,
          location: postData.location,
          category: postData.category,
          image_urls: imageUrls,
          hashtags: postData.hashtags.map(tag => `#${tag.replace('#', '')}`),
          is_public: postData.isPublic
        })

      if (postError) throw postError

      // 3. Puan ver (gamification)
      await supabase.rpc('add_user_points', {
        user_id: user.id,
        points_to_add: 10 + (postData.images.length * 5), // 10 puan + resim başına 5 puan
        activity_type: 'social_post'
      })

      // 4. Başarılı
      alert('🎉 Paylaşımınız yayınlandı! Puan kazandınız.')
      onPostCreated()
      onClose()
      
      // Formu temizle
      setPostData({
        type: 'sighting',
        caption: '',
        location: '',
        category: '',
        hashtags: [],
        isPublic: true,
        images: []
      })
      setStep(1)

    } catch (error) {
      console.error('Post oluşturma hatası:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Yeni Paylaşım</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Step indicator */}
          <div className="flex mt-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex-1">
                <div className={`h-1 rounded-full ${
                  step >= stepNum ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
                <p className="text-xs text-center mt-2">
                  {stepNum === 1 ? 'Medya' : stepNum === 2 ? 'Detaylar' : 'Paylaş'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Medya Ekle</h3>
              
              {/* Image upload area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {postData.images.length === 0 ? (
                  <>
                    <div className="text-4xl mb-4">📸</div>
                    <p className="font-medium text-gray-700">Fotoğraf veya video yükleyin</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Sürükle bırak veya tıkla
                    </p>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {postData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index)
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="text-2xl">+</span>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files) {
                    handleImageUpload(Array.from(e.target.files))
                  }
                }}
                className="hidden"
              />

              <div className="mt-6">
                <h4 className="font-medium mb-3">Paylaşım Türü</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'sighting', label: '👁️ Gördüm', desc: 'Nadir ürün gördüm' },
                    { value: 'collection', label: '🏆 Koleksiyon', desc: 'Koleksiyonumu paylaşıyorum' },
                    { value: 'question', label: '❓ Soru', desc: 'Bu nedir?' },
                    { value: 'showcase', label: '✨ Vitrin', desc: 'Ürünümü sergiliyorum' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setPostData({...postData, type: type.value})}
                      className={`p-4 rounded-xl border-2 text-center ${
                        postData.type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.label.split(' ')[0]}</div>
                      <div className="font-medium">{type.label.split(' ')[1]}</div>
                      <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Detayları Ekle</h3>
              
              {/* Caption */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={postData.caption}
                  onChange={(e) => setPostData({...postData, caption: e.target.value})}
                  placeholder="Paylaşımınızı anlatın..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  maxLength={2000}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {postData.caption.length}/2000
                </div>
              </div>

              {/* Hashtags */}
              <div className="mb-6">
                <HashtagInput
                  hashtags={postData.hashtags}
                  onAdd={handleHashtagAdd}
                  onRemove={handleHashtagRemove}
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum (opsiyonel)
                </label>
                <LocationPicker
                  value={postData.location}
                  onChange={(location) => setPostData({...postData, location})}
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={postData.category}
                  onChange={(e) => setPostData({...postData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Kategori seçin</option>
                  <option value="electronics">Elektronik</option>
                  <option value="fashion">Giyim & Aksesuar</option>
                  <option value="home">Ev & Bahçe</option>
                  <option value="collectible">Koleksiyon</option>
                  <option value="vehicle">Araç & Parça</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              {/* Privacy */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={postData.isPublic}
                  onChange={(e) => setPostData({...postData, isPublic: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                  id="isPublic"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Herkese açık paylaş
                </label>
                <span className="text-xs text-gray-500">
                  (Kapalıysa sadece takipçilerin görebilir)
                </span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Önizleme</h3>
              
              {/* Post preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                {/* Header preview */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                  <div>
                    <div className="font-bold">Sen</div>
                    <div className="text-sm text-gray-500">
                      {postData.location || 'Konum belirtilmemiş'}
                    </div>
                  </div>
                </div>

                {/* Caption preview */}
                {postData.caption && (
                  <p className="text-gray-800 mb-4 whitespace-pre-line">
                    {postData.caption}
                    {postData.hashtags.length > 0 && (
                      <div className="mt-2">
                        {postData.hashtags.map(tag => (
                          <span key={tag} className="text-blue-600 mr-2">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </p>
                )}

                {/* Images preview */}
                {postData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {postData.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        {postData.images.length > 4 && index === 3 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-bold text-lg">
                            +{postData.images.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats preview */}
                <div className="text-sm text-gray-500">
                  {postData.type === 'sighting' && '👁️ Gördüm paylaşımı • '}
                  {postData.type === 'collection' && '🏆 Koleksiyon paylaşımı • '}
                  {postData.images.length} fotoğraf • Herkese açık
                </div>
              </div>

              {/* Bonus points info */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">🎉 Puan Kazanacaksınız!</p>
                    <p className="text-sm text-green-600">
                      • Paylaşım: <strong>10 puan</strong><br />
                      • Fotoğraf başına: <strong>+5 puan</strong><br />
                      • Hashtag başına: <strong>+2 puan</strong>
                    </p>
                  </div>
                  <div className="text-2xl">🏆</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
            >
              {step === 1 ? 'İptal' : 'Geri'}
            </button>
            
            <button
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1)
                } else {
                  handleSubmit()
                }
              }}
              disabled={loading || (step === 1 && postData.images.length === 0)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Paylaşılıyor...
                </span>
              ) : step === 3 ? (
                `Paylaş (${10 + (postData.images.length * 5)} puan kazan)`
              ) : (
                'Devam Et'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
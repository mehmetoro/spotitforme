// app/shop/[id]/social/new/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CreateShopSocialPostPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string

  const [shop, setShop] = useState<any>(null)
  const [loadingShop, setLoadingShop] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('product_showcase')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchShop()
    getUser()
  }, [shopId])

  const fetchShop = async () => {
    setLoadingShop(true)
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single()
      if (error) throw error
      setShop(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingShop(false)
    }
  }

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages(prev => [...prev, ...files])
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${shopId}/social/${timestamp}_${randomString}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      urls.push(publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Giriş yapmalısınız')
      return
    }
    if (!shop) return
    if (user.id !== shop.owner_id) {
      alert('Bu sayfaya erişim yetkiniz yok')
      return
    }

    if (!title.trim()) {
      alert('Başlık gerekli')
      return
    }

    setSubmitting(true)
    try {
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadImages()
      }

      const { data: newPost, error } = await supabase
        .from('shop_social_posts')
        .insert({
          shop_id: shopId,
          title: title.trim(),
          content,
          type: postType,
          images: imageUrls,
          status: 'published',
          publish_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      alert('Paylaşımınız yayınlandı')
      router.push(`/shop/${shopId}/social/${newPost.id}`)
    } catch (err: any) {
      console.error(err)
      alert('Hata: ' + (err.message || ''))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingShop) return <div className="text-center py-12">Yükleniyor...</div>
  if (!shop) return <div className="text-center py-12">Mağaza bulunamadı</div>

  if (!user || user.id !== shop.owner_id) {
    return (
      <div className="text-center py-12">
        <p>Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-6">Yeni Paylaşım</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
            <select
              value={postType}
              onChange={e => setPostType(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-3"
            >
              <option value="product_showcase">Ürün Tanıtımı</option>
              <option value="new_arrival">Yeni Ürün</option>
              <option value="sale">İndirim</option>
              <option value="behind_scenes">Sahne Arkası</option>
              <option value="customer_review">Müşteri Yorumu</option>
              <option value="looking_for">Aranıyor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-3 h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fotoğraflar ({images.length} seçildi)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative">
                  <img src={src} className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {submitting ? 'Yükleniyor...' : 'Paylaş'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

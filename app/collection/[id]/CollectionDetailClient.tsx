'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { buildSeoImageAlt, buildSeoImageFileName } from '@/lib/content-seo'
import { getImagePreviewDataUrl, optimizeImageFile } from '@/lib/image-processing'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { extractSightingIdFromParam } from '@/lib/sighting-slug'

interface CollectionDetail {
  id: string
  user_id: string
  title: string
  description: string
  category: string | null
  photo_url: string | null
  estimated_price: number | null
  city: string | null
  district: string | null
  is_public: boolean
  status: string
  created_at: string
}

interface CollectionOwner {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export default function CollectionDetailClient() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id
  const id = rawId ? extractSightingIdFromParam(rawId) : ''

  const [item, setItem] = useState<CollectionDetail | null>(null)
  const [owner, setOwner] = useState<CollectionOwner | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    photo_url: '',
    estimated_price: '',
    city: '',
    district: '',
    is_public: true,
    status: 'active',
  })

  useEffect(() => {
    if (!id) return

    const loadPage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id ?? null)

        const { data, error: itemError } = await supabase
          .from('collection_posts')
          .select('id, user_id, title, description, category, photo_url, estimated_price, city, district, is_public, status, created_at')
          .eq('id', id)
          .single()

        if (itemError || !data) {
          setError('Koleksiyon kaydı bulunamadı veya görüntüleme izniniz yok')
          return
        }

        setItem(data as CollectionDetail)

        const { data: ownerData } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .eq('id', data.user_id)
          .single()

        if (ownerData) {
          setOwner(ownerData as CollectionOwner)
        }
      } catch (err: any) {
        setError(err?.message || 'Koleksiyon yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [id])

  useEffect(() => {
    if (!item) return
    setEditForm({
      title: item.title,
      description: item.description,
      category: item.category || '',
      photo_url: item.photo_url || '',
      estimated_price: item.estimated_price != null ? String(item.estimated_price) : '',
      city: item.city || '',
      district: item.district || '',
      is_public: item.is_public,
      status: item.status,
    })
  }, [item])

  const handleMessageRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Mesaj talebi için giriş yapmanız gerekir')
        router.push('/auth/login')
        return
      }

      if (!item?.user_id) {
        toast.error('Koleksiyon sahibi bulunamadı')
        return
      }

      if (item.user_id === user.id) {
        toast.error('Kendi koleksiyonunuz için mesaj talebi gönderemezsiniz')
        return
      }

      const draft = `Merhaba, "${item.title}" koleksiyon paylaşımınız için iletişime geçmek istiyorum. Uygun olursa ürün detaylarını paylaşabilir misiniz? (%15 yardım komisyonu modelini kabul ediyorum.)`
      const query = new URLSearchParams({ receiver: item.user_id, type: 'reward', draft })
      router.push(`/messages?${query.toString()}`)
    } catch (err) {
      console.error('Collection detail message request error:', err)
      toast.error('Mesaj talebi başlatılamadı')
    }
  }

  const extractSpotImagePath = (publicUrl: string): string | null => {
    const marker = '/storage/v1/object/public/spot-images/'
    const markerIndex = publicUrl.indexOf(marker)
    if (markerIndex === -1) return null
    const pathWithQuery = publicUrl.slice(markerIndex + marker.length)
    const path = decodeURIComponent(pathWithQuery.split('?')[0] || '')
    return path || null
  }

  const handleSaveChanges = async () => {
    if (!item) return
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error('Başlık ve açıklama zorunludur')
      return
    }

    try {
      setSaving(true)
      const previousPhotoUrl = item.photo_url
      let updatedPhotoUrl: string | null = editForm.photo_url || null

      if (editPhotoFile && item.user_id) {
        const fileName = buildSeoImageFileName({
          folder: 'collection',
          userId: item.user_id,
          title: editForm.title,
          originalName: editPhotoFile.name,
        })
        const { error: uploadError } = await supabase.storage.from('spot-images').upload(fileName, editPhotoFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('spot-images').getPublicUrl(fileName)
        updatedPhotoUrl = publicUrl
      }

      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category || null,
        photo_url: updatedPhotoUrl,
        estimated_price: editForm.estimated_price ? Number(editForm.estimated_price) : null,
        city: editForm.city || null,
        district: editForm.district || null,
        is_public: editForm.is_public,
        status: editForm.status,
        updated_at: new Date().toISOString(),
      }

      const { data, error: updateError } = await supabase
        .from('collection_posts')
        .update(payload)
        .eq('id', item.id)
        .select('id, user_id, title, description, category, photo_url, estimated_price, city, district, is_public, status, created_at')
        .single()

      if (updateError || !data) throw updateError || new Error('Kayıt güncellenemedi')
      setItem(data as CollectionDetail)

      const nextPhotoUrl = (data as CollectionDetail).photo_url
      if (previousPhotoUrl && previousPhotoUrl !== nextPhotoUrl) {
        const oldStoragePath = extractSpotImagePath(previousPhotoUrl)
        if (oldStoragePath && oldStoragePath.startsWith(`${item.user_id}/`)) {
          const { error: removeError } = await supabase.storage.from('spot-images').remove([oldStoragePath])
          if (removeError) console.warn('Old collection image cleanup warning:', removeError.message)
        }
      }

      setEditPhotoFile(null)
      setEditPhotoPreview(null)
      setEditMode(false)
      toast.success('Koleksiyon paylaşımı güncellendi')
    } catch (err: any) {
      console.error('Collection update error:', err)
      toast.error(err?.message || 'Güncelleme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleEditPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 12 * 1024 * 1024) {
      toast.error('Fotograf 12MB\'dan kucuk olmalidir')
      return
    }

    try {
      const optimizedFile = await optimizeImageFile(file)
      const preview = await getImagePreviewDataUrl(optimizedFile)
      setEditPhotoFile(optimizedFile)
      setEditPhotoPreview(preview)
    } catch {
      toast.error('Resim optimize edilirken bir hata olustu')
    }

    e.target.value = ''
  }

  const handleDelete = async () => {
    if (!item) return
    const confirmed = window.confirm('Bu koleksiyon paylaşımını kalıcı olarak silmek istediğinize emin misiniz?')
    if (!confirmed) return

    try {
      setDeleting(true)
      const previousPhotoUrl = item.photo_url
      const ownerId = item.user_id
      const { data: deletedItem, error: deleteError } = await supabase
        .from('collection_posts')
        .delete()
        .eq('id', item.id)
        .select('id')
        .maybeSingle()
      if (deleteError) throw deleteError
      if (!deletedItem) throw new Error('Koleksiyon paylaşımı silinemedi veya yetkiniz yok')

      if (previousPhotoUrl) {
        const oldStoragePath = extractSpotImagePath(previousPhotoUrl)
        if (oldStoragePath && oldStoragePath.startsWith(`${ownerId}/`)) {
          const { error: removeError } = await supabase.storage.from('spot-images').remove([oldStoragePath])
          if (removeError) console.warn('Deleted collection image cleanup warning:', removeError.message)
        }
      }

      toast.success('Koleksiyon paylaşımı silindi')
      router.push('/collection')
    } catch (err: any) {
      console.error('Collection delete error:', err)
      toast.error(err?.message || 'Silme işlemi başarısız oldu')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" /></div>
  }

  if (!item || error) {
    return (
      <main className="container-custom py-10 text-center">
        <div className="text-5xl mb-4">🧭</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Koleksiyon kaydı bulunamadı</h1>
        <p className="text-gray-600 mb-6">{error || 'Aradığınız kayıt kaldırılmış olabilir.'}</p>
        <Link href="/collection" className="text-blue-600 hover:text-blue-800 font-medium">← Koleksiyon listesine dön</Link>
      </main>
    )
  }

  const locationText = [item.city, item.district].filter(Boolean).join(', ')
  const isOwner = item.user_id === currentUserId
  const seoAlt = buildSeoImageAlt({ title: item.title, category: item.category, location: locationText })

  return (
    <main className="container-custom py-8">
      <div className="mb-6">
        <Link href="/collection" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm">← Koleksiyon listesine dön</Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="bg-gray-100 min-h-[280px]">
            {item.photo_url ? <img src={item.photo_url} alt={seoAlt} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl text-blue-300">🧳</div>}
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Fiziki Koleksiyon</span>
              {item.category && <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{item.category}</span>}
              {!item.is_public && <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">Özel Kayıt</span>}
            </div>

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { if (editMode) { setEditPhotoFile(null); setEditPhotoPreview(null) } setEditMode((prev) => !prev) }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                  {editMode ? 'Düzenlemeyi Kapat' : 'Paylaşımı Düzenle'}
                </button>
                <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
                  {deleting ? 'Siliniyor...' : 'Paylaşımı Sil'}
                </button>
              </div>
            )}

            {editMode ? (
              <div className="space-y-3 border border-blue-100 bg-blue-50 rounded-xl p-4">
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Başlık" className="w-full px-3 py-2 border border-blue-200 rounded-lg" />
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Açıklama" rows={4} className="w-full px-3 py-2 border border-blue-200 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="Kategori" className="px-3 py-2 border border-blue-200 rounded-lg" />
                  <input value={editForm.estimated_price} onChange={(e) => setEditForm({ ...editForm, estimated_price: e.target.value })} placeholder="Tahmini değer (TL)" inputMode="decimal" className="px-3 py-2 border border-blue-200 rounded-lg" />
                </div>
                <div className="rounded-lg border border-blue-200 bg-white p-3">
                  <p className="text-sm font-medium text-blue-900 mb-2">Fotoğrafı Güncelle</p>
                  <input type="file" accept="image/*" onChange={handleEditPhotoUpload} className="w-full text-sm text-gray-700" />
                  {(editPhotoPreview || editForm.photo_url) && (
                    <div className="mt-3">
                      <img src={editPhotoPreview || editForm.photo_url} alt="Koleksiyon fotoğraf önizleme" className="w-full max-h-56 object-cover rounded-lg" />
                      <button type="button" onClick={() => { setEditPhotoFile(null); setEditPhotoPreview(null); setEditForm({ ...editForm, photo_url: '' }) }} className="mt-2 text-sm text-red-600 hover:text-red-700">Fotoğrafı Kaldır</button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">İsterseniz harici bir foto URL de kullanabilirsiniz.</p>
                </div>
                <input value={editForm.photo_url} onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })} placeholder="Harici Foto URL" className="w-full px-3 py-2 border border-blue-200 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="Şehir" className="px-3 py-2 border border-blue-200 rounded-lg" />
                  <input value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} placeholder="İlçe" className="px-3 py-2 border border-blue-200 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={editForm.is_public} onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })} className="h-4 w-4" />Herkese açık paylaşım</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="px-3 py-2 border border-blue-200 rounded-lg">
                    <option value="active">Yayında</option>
                    <option value="archived">Arşivde</option>
                  </select>
                </div>
                <button onClick={handleSaveChanges} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg disabled:opacity-60">{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
              </>
            )}

            {item.estimated_price != null && <p className="text-lg font-semibold text-green-700">Tahmini Değer: ₺{item.estimated_price.toLocaleString('tr-TR')}</p>}
            {locationText && <p className="text-sm text-gray-500">📍 {locationText}</p>}
            <p className="text-sm text-gray-500">📅 {new Date(item.created_at).toLocaleDateString('tr-TR')}</p>

            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-3">
                {owner?.avatar_url ? <img src={owner.avatar_url} alt={owner.full_name || 'Kullanıcı'} className="w-11 h-11 rounded-full object-cover" /> : <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">{owner?.full_name?.[0] ?? '?'}</div>}
                <div>
                  <p className="font-semibold text-gray-900">{owner?.full_name || 'Kullanıcı'}</p>
                  <p className="text-xs text-gray-500">Koleksiyon sahibi</p>
                </div>
              </div>

              {item.user_id !== currentUserId && (
                <>
                  <p className="text-xs text-gray-500 mb-2">Bu paylaşım için mesaj talebi gönderildiğinde profesyonel/ticari iş birliklerinde varsayılan <span className="font-semibold text-gray-700"> %15 yardım komisyonu</span> modeli uygulanabilir.</p>
                  <button onClick={handleMessageRequest} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg">Yardımcıya Mesaj Talebi Gönder</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

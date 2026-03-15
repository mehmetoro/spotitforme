'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { supabase } from '@/lib/supabase'

interface CollectionFormState {
  title: string
  description: string
  category: string
  photo_url: string
  estimated_price: string
  city: string
  district: string
  is_public: boolean
}

const initialForm: CollectionFormState = {
  title: '',
  description: '',
  category: '',
  photo_url: '',
  estimated_price: '',
  city: '',
  district: '',
  is_public: true,
}

export default function ShareCollectionPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [modalOpen, setModalOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [form, setForm] = useState<CollectionFormState>(initialForm)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const ensureAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      setUserId(user.id)
      setLoadingUser(false)
    }

    ensureAuth()
  }, [router])

  useEffect(() => {
    if (!modalOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [modalOpen])

  useEffect(() => {
    if (!modalOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) {
        handleCloseModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [modalOpen, saving])

  const handleCloseModal = () => {
    setModalOpen(false)
    router.push('/collection')
  }

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Koleksiyon fotoğrafı 5MB\'dan küçük olmalıdır.')
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.title.trim() || !form.description.trim()) {
      alert('Başlık ve açıklama zorunludur.')
      return
    }

    if (!userId) {
      alert('Kullanıcı bulunamadı.')
      return
    }

    try {
      setSaving(true)

      let uploadedPhotoUrl: string | null = form.photo_url.trim() || null

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop() || 'jpg'
        const fileName = `${userId}/collection/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, photoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)

        uploadedPhotoUrl = publicUrl
      }

      const payload = {
        user_id: userId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || null,
        photo_url: uploadedPhotoUrl,
        estimated_price: form.estimated_price ? Number(form.estimated_price) : null,
        city: form.city || null,
        district: form.district || null,
        is_public: form.is_public,
        status: 'active',
      }

      const { data, error } = await supabase
        .from('collection_posts')
        .insert(payload)
        .select('id')
        .single()

      if (error || !data) throw error || new Error('Koleksiyon kaydı oluşturulamadı.')

      router.push(`/collection/${data.id}`)
    } catch (err: any) {
      alert(err?.message || 'Koleksiyon paylaşımı kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleFormKeyDown = (e: ReactKeyboardEvent<HTMLFormElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !saving) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  if (loadingUser) {
    return (
      <main className="container-custom py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">Hızlı koleksiyon formu hazırlanıyor...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container-custom py-8">
      {modalOpen && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            aria-label="Formu kapat"
            onClick={handleCloseModal}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute inset-x-0 top-4 bottom-4 px-4">
            <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Koleksiyon Ekle</h1>
                  <p className="mt-1 text-xs text-gray-500">Hızlı paylaşım formu</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Kapat
                </button>
              </div>

              <div className="h-[calc(100%-73px)] overflow-y-auto px-5 py-4">
                <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Başlık *"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Kategori (opsiyonel)"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      placeholder="Fotoğraf URL (opsiyonel)"
                      value={form.photo_url}
                      onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  {photoPreview && (
                    <div className="rounded-xl border border-gray-200 p-2">
                      <img src={photoPreview} alt="Koleksiyon önizleme" className="w-full max-h-64 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null)
                          setPhotoPreview(null)
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-700"
                      >
                        Yüklenen fotoğrafı kaldır
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Tahmini değer (TL)"
                      value={form.estimated_price}
                      onChange={(e) => setForm({ ...form, estimated_price: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Şehir"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="İlçe"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <textarea
                    placeholder="Açıklama *"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />

                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Herkese açık yayınla
                  </label>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? 'Kaydediliyor...' : 'Koleksiyona Ekle'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Vazgeç
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Koleksiyon Ekle</h2>
        <p className="mt-2 text-sm text-gray-600">
          Hızlı form modal olarak açıldı. Kapatırsanız koleksiyon akışına yönlendirilirsiniz.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Formu Yeniden Aç
          </button>
          <Link
            href="/collection"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Koleksiyon akışına dön
          </Link>
        </div>
      </div>
    </main>
  )
}

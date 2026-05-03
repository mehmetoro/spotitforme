'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { buildSeoImageFileName, suggestHashtagsFromText } from '@/lib/content-seo'
import { getImagePreviewDataUrl, optimizeImageFile } from '@/lib/image-processing'
import { supabase } from '@/lib/supabase'
import { buildCollectionPath } from '@/lib/sighting-slug'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const collectionText = {
  tr: {
    loading: 'Hızlı koleksiyon formu hazırlanıyor...',
    modalTitle: 'Koleksiyon Ekle',
    modalSubtitle: 'Hızlı paylaşım formu',
    closeBtn: 'Kapat',
    phTitle: 'Başlık *',
    phCategory: 'Kategori (opsiyonel)',
    phPhotoUrl: 'Fotoğraf URL (opsiyonel)',
    titleSeoHint: 'Başlıkta ürün adı, dönem veya marka geçmesi SEO açısından faydalı olur.',
    removePhoto: 'Yüklenen fotoğrafı kaldır',
    phPrice: 'Tahmini değer (TL)',
    phCity: 'Şehir',
    phDistrict: 'İlçe',
    phDesc: 'Açıklama *',
    descSeoHint: 'Açıklamaya materyal, kondisyon, ölçü, dönem ve varsa şehir bilgisini ekleyin.',
    seoTagsLabel: 'Önerilen SEO etiketleri',
    isPublicLabel: 'Herkese açık yayınla',
    submitBtn: 'Koleksiyona Ekle',
    savingBtn: 'Kaydediliyor...',
    cancelBtn: 'Vazgeç',
    pageTitle: 'Koleksiyon Ekle',
    pageDesc: 'Hızlı form modal olarak açıldı. Kapatırsanız koleksiyon akışına yönlendirilirsiniz.',
    reopenBtn: 'Formu Yeniden Aç',
    backLink: 'Koleksiyon akışına dön',
    photoPreviewAlt: 'Koleksiyon önizleme',
    saveError: 'Koleksiyon paylaşımı kaydedilemedi.',
    createError: 'Koleksiyon kaydı oluşturulamadı.',
  },
  en: {
    loading: 'Preparing quick collection form...',
    modalTitle: 'Add to Collection',
    modalSubtitle: 'Quick share form',
    closeBtn: 'Close',
    phTitle: 'Title *',
    phCategory: 'Category (optional)',
    phPhotoUrl: 'Photo URL (optional)',
    titleSeoHint: 'Including product name, period or brand in the title helps SEO.',
    removePhoto: 'Remove uploaded photo',
    phPrice: 'Estimated value',
    phCity: 'City',
    phDistrict: 'District',
    phDesc: 'Description *',
    descSeoHint: 'Add material, condition, size, period and city to the description.',
    seoTagsLabel: 'Suggested SEO tags',
    isPublicLabel: 'Publish publicly',
    submitBtn: 'Add to Collection',
    savingBtn: 'Saving...',
    cancelBtn: 'Cancel',
    pageTitle: 'Add to Collection',
    pageDesc: 'Opened as a quick form modal. Closing will redirect you to the collection feed.',
    reopenBtn: 'Reopen Form',
    backLink: 'Back to collection feed',
    photoPreviewAlt: 'Collection preview',
    saveError: 'Could not save collection post.',
    createError: 'Could not create collection record.',
  },
  de: {
    loading: 'Schnelles Sammlungsformular wird vorbereitet...',
    modalTitle: 'Zur Sammlung hinzufügen',
    modalSubtitle: 'Schnelles Freigabeformular',
    closeBtn: 'Schließen',
    phTitle: 'Titel *',
    phCategory: 'Kategorie (optional)',
    phPhotoUrl: 'Foto-URL (optional)',
    titleSeoHint: 'Produktname, Epoche oder Marke im Titel hilft bei SEO.',
    removePhoto: 'Hochgeladenes Foto entfernen',
    phPrice: 'Geschätzter Wert',
    phCity: 'Stadt',
    phDistrict: 'Bezirk',
    phDesc: 'Beschreibung *',
    descSeoHint: 'Material, Zustand, Maße, Epoche und Stadt in die Beschreibung aufnehmen.',
    seoTagsLabel: 'Vorgeschlagene SEO-Tags',
    isPublicLabel: 'Öffentlich veröffentlichen',
    submitBtn: 'Zur Sammlung hinzufügen',
    savingBtn: 'Wird gespeichert...',
    cancelBtn: 'Abbrechen',
    pageTitle: 'Zur Sammlung hinzufügen',
    pageDesc: 'Als schnelles Formular-Modal geöffnet. Schließen leitet zur Sammlungsseite.',
    reopenBtn: 'Formular erneut öffnen',
    backLink: 'Zurück zur Sammlung',
    photoPreviewAlt: 'Sammlungsvorschau',
    saveError: 'Sammlungsbeitrag konnte nicht gespeichert werden.',
    createError: 'Sammlungseintrag konnte nicht erstellt werden.',
  },
  fr: {
    loading: 'Préparation du formulaire de collection rapide...',
    modalTitle: 'Ajouter à la collection',
    modalSubtitle: 'Formulaire de partage rapide',
    closeBtn: 'Fermer',
    phTitle: 'Titre *',
    phCategory: 'Catégorie (optionnel)',
    phPhotoUrl: 'URL de photo (optionnel)',
    titleSeoHint: "Inclure le nom du produit, la période ou la marque dans le titre aide le SEO.",
    removePhoto: 'Supprimer la photo téléchargée',
    phPrice: 'Valeur estimée',
    phCity: 'Ville',
    phDistrict: 'Quartier',
    phDesc: 'Description *',
    descSeoHint: 'Ajouter matériau, état, taille, période et ville à la description.',
    seoTagsLabel: 'Tags SEO suggérés',
    isPublicLabel: 'Publier publiquement',
    submitBtn: 'Ajouter à la collection',
    savingBtn: 'Enregistrement...',
    cancelBtn: 'Annuler',
    pageTitle: 'Ajouter à la collection',
    pageDesc: 'Ouvert comme modal de formulaire rapide. Fermer redirige vers le flux de collection.',
    reopenBtn: 'Rouvrir le formulaire',
    backLink: 'Retour au flux de collection',
    photoPreviewAlt: 'Aperçu de la collection',
    saveError: "Impossible d'enregistrer le post de collection.",
    createError: "Impossible de créer l'enregistrement de collection.",
  },
  es: {
    loading: 'Preparando formulario de colección rápido...',
    modalTitle: 'Agregar a la colección',
    modalSubtitle: 'Formulario de compartir rápido',
    closeBtn: 'Cerrar',
    phTitle: 'Título *',
    phCategory: 'Categoría (opcional)',
    phPhotoUrl: 'URL de foto (opcional)',
    titleSeoHint: 'Incluir nombre del producto, período o marca en el título ayuda al SEO.',
    removePhoto: 'Eliminar foto cargada',
    phPrice: 'Valor estimado',
    phCity: 'Ciudad',
    phDistrict: 'Distrito',
    phDesc: 'Descripción *',
    descSeoHint: 'Agregar material, condición, tamaño, período y ciudad a la descripción.',
    seoTagsLabel: 'Etiquetas SEO sugeridas',
    isPublicLabel: 'Publicar públicamente',
    submitBtn: 'Agregar a la colección',
    savingBtn: 'Guardando...',
    cancelBtn: 'Cancelar',
    pageTitle: 'Agregar a la colección',
    pageDesc: 'Abierto como modal de formulario rápido. Cerrar redirigirá al feed de colección.',
    reopenBtn: 'Reabrir formulario',
    backLink: 'Volver al feed de colección',
    photoPreviewAlt: 'Vista previa de la colección',
    saveError: 'No se pudo guardar el post de colección.',
    createError: 'No se pudo crear el registro de colección.',
  },
  ru: {
    loading: 'Подготовка быстрой формы коллекции...',
    modalTitle: 'Добавить в коллекцию',
    modalSubtitle: 'Быстрая форма публикации',
    closeBtn: 'Закрыть',
    phTitle: 'Заголовок *',
    phCategory: 'Категория (необязательно)',
    phPhotoUrl: 'URL фото (необязательно)',
    titleSeoHint: 'Включение названия продукта, эпохи или марки в заголовок помогает SEO.',
    removePhoto: 'Удалить загруженное фото',
    phPrice: 'Оценочная стоимость',
    phCity: 'Город',
    phDistrict: 'Район',
    phDesc: 'Описание *',
    descSeoHint: 'Добавьте материал, состояние, размер, эпоху и город в описание.',
    seoTagsLabel: 'Предлагаемые SEO-теги',
    isPublicLabel: 'Опубликовать публично',
    submitBtn: 'Добавить в коллекцию',
    savingBtn: 'Сохранение...',
    cancelBtn: 'Отменить',
    pageTitle: 'Добавить в коллекцию',
    pageDesc: 'Открыто как быстрый модальный формуляр. Закрытие перенаправит на ленту коллекций.',
    reopenBtn: 'Открыть форму снова',
    backLink: 'Вернуться к ленте коллекций',
    photoPreviewAlt: 'Предварительный просмотр коллекции',
    saveError: 'Не удалось сохранить пост коллекции.',
    createError: 'Не удалось создать запись коллекции.',
  },
} as const

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
  const locale = useCurrentLocale()
  const t = collectionText[locale as keyof typeof collectionText] ?? collectionText.tr
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [modalOpen, setModalOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [form, setForm] = useState<CollectionFormState>(initialForm)
  const formRef = useRef<HTMLFormElement>(null)
  const normalizedTitle = form.title.trim()
  const normalizedDescription = form.description.trim()
  const isTitleDetailedEnough = normalizedTitle.length >= 12
  const isDescriptionDetailedEnough = normalizedDescription.length >= 50
  const suggestedSeoTags = suggestHashtagsFromText([form.title, form.description, form.category, form.city, form.district])

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

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 12 * 1024 * 1024) {
      alert('Koleksiyon fotografi 12MB\'dan kucuk olmalidir.')
      return
    }

    try {
      const optimizedFile = await optimizeImageFile(file)
      const preview = await getImagePreviewDataUrl(optimizedFile)
      setPhotoFile(optimizedFile)
      setPhotoPreview(preview)
    } catch {
      alert('Resim optimize edilirken bir hata olustu.')
    }

    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.title.trim() || !form.description.trim()) {
      alert('Başlık ve açıklama zorunludur.')
      return
    }

    if (!isTitleDetailedEnough) {
      alert('Başlık en az 12 karakter olmalı. Parçanın adı veya seri bilgisini ekleyin.')
      return
    }

    if (!isDescriptionDetailedEnough) {
      alert('Açıklama en az 50 karakter olmalı. Kondisyon, dönem ve ayırt edici özellikleri yazın.')
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
        const fileName = buildSeoImageFileName({
          folder: 'collection',
          userId,
          title: form.title,
          originalName: photoFile.name,
        })

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

      if (error || !data) throw error || new Error(t.createError)

      try {
        await fetch('/api/save-translations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity: 'collection_post',
            recordId: data.id,
            sourceLanguage: locale,
            title: payload.title,
            description: payload.description,
          }),
        })
      } catch {
        // Ana kayit basariliysa ceviri hatasi submit akisini bozmaz.
      }

      router.push(buildCollectionPath(data.id, form.title))
    } catch (err: any) {
      alert(err?.message || t.saveError)
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
          <p className="text-sm text-gray-500">{t.loading}</p>
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
                  <h1 className="text-xl font-bold text-gray-900">{t.modalTitle}</h1>
                  <p className="mt-1 text-xs text-gray-500">{t.modalSubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  {t.closeBtn}
                </button>
              </div>

              <div className="h-[calc(100%-73px)] overflow-y-auto px-5 py-4">
                <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t.phTitle}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder={t.phCategory}
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  {!isTitleDetailedEnough && form.title.length > 0 && (
                    <p className="text-xs text-amber-600">
                      {t.titleSeoHint}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      placeholder={t.phPhotoUrl}
                      value={form.photo_url}
                      onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  {photoPreview && (
                    <div className="rounded-xl border border-gray-200 p-2">
                      <img src={photoPreview} alt={t.photoPreviewAlt} className="w-full max-h-64 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null)
                          setPhotoPreview(null)
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-700"
                      >
                        {t.removePhoto}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder={t.phPrice}
                      value={form.estimated_price}
                      onChange={(e) => setForm({ ...form, estimated_price: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder={t.phCity}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder={t.phDistrict}
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <textarea
                    placeholder={t.phDesc}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  {!isDescriptionDetailedEnough && form.description.length > 0 && (
                    <p className="text-xs text-amber-600">
                      {t.descSeoHint}
                    </p>
                  )}
                  {suggestedSeoTags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">{t.seoTagsLabel}</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSeoTags.map((tag) => (
                          <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    {t.isPublicLabel}
                  </label>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                    {saving ? t.savingBtn : t.submitBtn}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      {t.cancelBtn}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t.pageDesc}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {t.reopenBtn}
          </button>
          <Link
            href="/collection"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {t.backLink}
          </Link>
        </div>
      </div>
    </main>
  )
}

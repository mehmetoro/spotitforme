'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'
import { buildSpotPath, extractSightingIdFromParam } from '@/lib/sighting-slug'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const sidcText = {
  tr: { loading: 'Yükleniyor...', notFound: 'Yardım bulunamadı', back: 'Geri Dön', backAll: '← Yardımlara Dön', whoFound: '👤 Kim Buldu?', unknownUser: 'Kullanıcı', sendMsgBtn: 'Yardımcıya Mesaj Talebi Gönder', price: 'Fiyat', where: '📍 Nerede Bulundu?', viewMap: '🗺️ Haritada Gör', productCard: '🔗 Otomatik Ürün Kartı', onlineSource: 'Online kaynak', seoPreview: 'SEO ürün önizlemesi', defaultDesc: 'Bu yardım için ürün linki paylaşıldı.', brand: 'Marka:', seller: 'Satıcı:', status: 'Durum:', helpUs: '🛟 Bize Yardımcı Olun', helpUsDesc: 'Bu linkte problem görürseniz hızlıca bildirin. Admin panelde inceleyip yayına alma/gizleme kararını güncelliyoruz.', sending: 'Gönderiliyor...', detailTitle: '📝 Ürün ve Paylaşım Detayı', searchedItem: '🎯 Aranan Ürün Hakkında', openSpot: 'Spotu Aç', errLogin: 'Mesaj talebi için giriş yapmanız gerekir', errNoSpotter: 'Yardım sağlayan kullanıcı bilgisi bulunamadı', errOwnSighting: 'Kendi yardım bildiriminiz için mesaj talebi gönderemezsiniz.', msgDraft: (title: string) => `Merhaba, "${title}" için paylaştığınız bilgi hakkında konuşmak istiyorum. Uygun olunca dönüş yapabilir misiniz?`, errMsgFail: 'Mesaj talebi başlatılamadı', reportSuccess: 'Teşekkürler! Bildiriminiz admin ekibine iletildi.', reportFail: 'Bildirim gönderilemedi', errNoLink: 'Bu kayıt için ürün linki bulunamadı' },
  en: { loading: 'Loading...', notFound: 'Sighting not found', back: 'Go Back', backAll: '← Back to Sightings', whoFound: '👤 Who Found It?', unknownUser: 'User', sendMsgBtn: 'Send Message to Helper', price: 'Price', where: '📍 Where Was It Found?', viewMap: '🗺️ View on Map', productCard: '🔗 Product Card', onlineSource: 'Online source', seoPreview: 'SEO product preview', defaultDesc: 'A product link was shared for this sighting.', brand: 'Brand:', seller: 'Seller:', status: 'Status:', helpUs: '🛟 Help Us Improve', helpUsDesc: 'If you see a problem with this link, let us know quickly. Admin will review and update visibility.', sending: 'Sending...', detailTitle: '📝 Product & Sighting Detail', searchedItem: '🎯 About the Searched Item', openSpot: 'Open Spot', errLogin: 'You must be logged in to send a message', errNoSpotter: 'Helper user info not found', errOwnSighting: 'You cannot send a message for your own sighting.', msgDraft: (title: string) => `Hello, I would like to talk about the info you shared for "${title}". Can you reply when you have time?`, errMsgFail: 'Could not start message request', reportSuccess: 'Thanks! Your report has been sent to the admin team.', reportFail: 'Could not submit report', errNoLink: 'No product link found for this record' },
  de: { loading: 'Laden...', notFound: 'Sichtung nicht gefunden', back: 'Zurück', backAll: '← Zurück zu Sichtungen', whoFound: '👤 Wer hat es gefunden?', unknownUser: 'Benutzer', sendMsgBtn: 'Nachricht an Helfer senden', price: 'Preis', where: '📍 Wo wurde es gefunden?', viewMap: '🗺️ Auf Karte anzeigen', productCard: '🔗 Produktkarte', onlineSource: 'Online-Quelle', seoPreview: 'SEO-Produktvorschau', defaultDesc: 'Ein Produktlink wurde für diese Sichtung geteilt.', brand: 'Marke:', seller: 'Verkäufer:', status: 'Status:', helpUs: '🛟 Helfen Sie uns', helpUsDesc: 'Wenn Sie ein Problem mit diesem Link sehen, teilen Sie es uns schnell mit.', sending: 'Senden...', detailTitle: '📝 Produkt- & Sichtungsdetail', searchedItem: '🎯 Über den gesuchten Artikel', openSpot: 'Spot öffnen', errLogin: 'Sie müssen angemeldet sein', errNoSpotter: 'Helfer-Info nicht gefunden', errOwnSighting: 'Sie können keine Nachricht für Ihre eigene Sichtung senden.', msgDraft: (title: string) => `Hallo, ich möchte über die von Ihnen geteilten Informationen zu "${title}" sprechen.`, errMsgFail: 'Nachrichtenanfrage konnte nicht gestartet werden', reportSuccess: 'Danke! Ihr Bericht wurde an das Admin-Team gesendet.', reportFail: 'Bericht konnte nicht gesendet werden', errNoLink: 'Kein Produktlink für diesen Eintrag gefunden' },
  fr: { loading: 'Chargement...', notFound: 'Observation introuvable', back: 'Retour', backAll: '← Retour aux observations', whoFound: '👤 Qui l\'a trouvé ?', unknownUser: 'Utilisateur', sendMsgBtn: 'Envoyer un message à l\'assistant', price: 'Prix', where: '📍 Où a-t-il été trouvé ?', viewMap: '🗺️ Voir sur la carte', productCard: '🔗 Carte produit', onlineSource: 'Source en ligne', seoPreview: 'Aperçu produit SEO', defaultDesc: 'Un lien produit a été partagé pour cette observation.', brand: 'Marque :', seller: 'Vendeur :', status: 'Statut :', helpUs: '🛟 Aidez-nous', helpUsDesc: 'Si vous voyez un problème avec ce lien, signalez-le rapidement.', sending: 'Envoi...', detailTitle: '📝 Détail du produit et de l\'observation', searchedItem: '🎯 À propos de l\'article recherché', openSpot: 'Ouvrir le spot', errLogin: 'Vous devez être connecté', errNoSpotter: 'Info de l\'assistant non trouvée', errOwnSighting: 'Vous ne pouvez pas envoyer de message pour votre propre observation.', msgDraft: (title: string) => `Bonjour, je voudrais parler des informations que vous avez partagées pour "${title}".`, errMsgFail: 'Impossible de démarrer la demande de message', reportSuccess: 'Merci ! Votre rapport a été envoyé à l\'équipe admin.', reportFail: 'Impossible d\'envoyer le rapport', errNoLink: 'Aucun lien produit trouvé pour cet enregistrement' },
  es: { loading: 'Cargando...', notFound: 'Avistamiento no encontrado', back: 'Volver', backAll: '← Volver a avistamientos', whoFound: '👤 ¿Quién lo encontró?', unknownUser: 'Usuario', sendMsgBtn: 'Enviar mensaje al asistente', price: 'Precio', where: '📍 ¿Dónde fue encontrado?', viewMap: '🗺️ Ver en mapa', productCard: '🔗 Tarjeta de producto', onlineSource: 'Fuente en línea', seoPreview: 'Vista previa SEO del producto', defaultDesc: 'Se compartió un enlace de producto para este avistamiento.', brand: 'Marca:', seller: 'Vendedor:', status: 'Estado:', helpUs: '🛟 Ayúdanos', helpUsDesc: 'Si ves un problema con este enlace, notifícanos rápidamente.', sending: 'Enviando...', detailTitle: '📝 Detalle del producto y avistamiento', searchedItem: '🎯 Sobre el artículo buscado', openSpot: 'Abrir spot', errLogin: 'Debes estar conectado', errNoSpotter: 'Info del asistente no encontrada', errOwnSighting: 'No puedes enviar un mensaje para tu propio avistamiento.', msgDraft: (title: string) => `Hola, me gustaría hablar sobre la información que compartiste para "${title}".`, errMsgFail: 'No se pudo iniciar la solicitud de mensaje', reportSuccess: '¡Gracias! Tu reporte fue enviado al equipo admin.', reportFail: 'No se pudo enviar el reporte', errNoLink: 'No se encontró enlace de producto para este registro' },
  ru: { loading: 'Загрузка...', notFound: 'Наблюдение не найдено', back: 'Назад', backAll: '← Назад к наблюдениям', whoFound: '👤 Кто нашёл?', unknownUser: 'Пользователь', sendMsgBtn: 'Отправить сообщение помощнику', price: 'Цена', where: '📍 Где было найдено?', viewMap: '🗺️ Показать на карте', productCard: '🔗 Карточка товара', onlineSource: 'Онлайн-источник', seoPreview: 'SEO-превью товара', defaultDesc: 'Для этого наблюдения была предоставлена ссылка на товар.', brand: 'Бренд:', seller: 'Продавец:', status: 'Статус:', helpUs: '🛟 Помогите нам', helpUsDesc: 'Если вы видите проблему с этой ссылкой, сообщите нам быстро.', sending: 'Отправка...', detailTitle: '📝 Детали товара и наблюдения', searchedItem: '🎯 О разыскиваемом предмете', openSpot: 'Открыть спот', errLogin: 'Необходимо войти в систему', errNoSpotter: 'Информация о помощнике не найдена', errOwnSighting: 'Вы не можете отправить сообщение для своего собственного наблюдения.', msgDraft: (title: string) => `Здравствуйте, я хотел бы поговорить об информации, которую вы поделились для "${title}".`, errMsgFail: 'Не удалось начать запрос на сообщение', reportSuccess: 'Спасибо! Ваш отчёт отправлен команде администраторов.', reportFail: 'Не удалось отправить отчёт', errNoLink: 'Ссылка на товар не найдена для этой записи' },
} as const

interface Sighting {
  id: string
  spot_id: string
  spotter_id: string
  image_url: string | null
  location_description: string
  price: string | null
  notes: string | null
  category: string | null
  hashtags: string | null
  latitude: number | null
  longitude: number | null
  source_channel: 'physical' | 'virtual' | null
  product_url: string | null
  marketplace: string | null
  seller_name: string | null
  link_preview_title: string | null
  link_preview_image: string | null
  link_preview_description: string | null
  link_preview_brand: string | null
  link_preview_availability: string | null
  link_preview_currency: string | null
  source_domain: string | null
  created_at: string
  spotter: { id: string; full_name: string; avatar_url: string | null } | null
  spot: { id: string; title: string; description: string } | null
  title: string | null
}

type ProductReportReason = 'out_of_stock' | 'broken_page' | 'prohibited_product' | 'not_rare'

const REPORT_REASON_OPTIONS: Array<{ value: ProductReportReason; label: string }> = [
  { value: 'out_of_stock', label: '1. Stok Yok' },
  { value: 'broken_page', label: '2. Bozuk Sayfa' },
  { value: 'prohibited_product', label: '3. Yasaklı Ürün' },
  { value: 'not_rare', label: '4. Nadir Değil' },
]

export default function SightingDetailClient() {
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const locale = useCurrentLocale()
  const t = sidcText[locale as keyof typeof sidcText] ?? sidcText.tr
  const [sighting, setSighting] = useState<Sighting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [reportLoading, setReportLoading] = useState<ProductReportReason | null>(null)

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
    }

    loadCurrentUser()

    const rawId = Array.isArray(params.id) ? params.id[0] : params.id
    const id = rawId ? extractSightingIdFromParam(rawId) : rawId
    if (id) {
      fetchSighting(id)
    } else {
      setError('Sighting ID not found')
      setLoading(false)
    }
  }, [params.id])

  const fetchSighting = async (sightingId: string) => {
    try {
      if (!sightingId || sightingId === 'undefined' || sightingId.trim() === '') {
        setError('Sighting ID invalid')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/sightings/${sightingId}`)
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load sighting')
        setLoading(false)
        return
      }

      const sightingData = await response.json()
      if (!sightingData) {
        setError('Sighting not found')
        setLoading(false)
        return
      }

      setSighting({
        ...sightingData,
        spotter: sightingData.spotter || null,
        spot: sightingData.spot || null,
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to load sighting')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCurrencyPrefix = (currency: string | null | undefined) => {
    const code = (currency || 'TRY').toUpperCase()
    if (code === 'TRY') return '₺'
    if (code === 'USD') return '$'
    if (code === 'EUR') return '€'
    if (code === 'GBP') return '£'
    return `${code} `
  }

  const openGoogleMaps = () => {
    if (sighting?.latitude && sighting?.longitude) {
      window.open(`https://www.google.com/maps?q=${sighting.latitude},${sighting.longitude}`, '_blank')
    }
  }

  const handleMessageRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error(t.errLogin)
        router.push('/auth/login')
        return
      }

      if (!sighting?.spotter_id) {
        toast.error(t.errNoSpotter)
        return
      }

      if (sighting.spotter_id === user.id) {
        toast.error(t.errOwnSighting)
        return
      }

      const draft = t.msgDraft(sighting.spot?.title || 'yardım bildirimi')
      const params = new URLSearchParams({
        receiver: sighting.spotter_id,
        type: 'reward',
        draft,
      })

      router.push(`/messages?${params.toString()}`)
    } catch {
      toast.error(t.errMsgFail)
    }
  }

  const submitProductReport = async (reason: ProductReportReason) => {
    if (!sighting?.product_url) {
      toast.error(t.errNoLink)
      return
    }

    setReportLoading(reason)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const response = await fetch('/api/product-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_name: 'sightings',
          record_id: sighting.id,
          product_url: sighting.product_url,
          reason,
          record_title: displayTitle,
          reporter_user_id: user?.id ?? null,
          reporter_name: user?.user_metadata?.full_name ?? user?.email ?? null,
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result?.error || t.reportFail)

      toast.success(t.reportSuccess)
    } catch (err: any) {
      toast.error(err?.message || t.reportFail)
    } finally {
      setReportLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !sighting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || t.notFound}</h1>
          <Link href="/sightings" className="text-blue-600 hover:text-blue-700">
            {t.back}
          </Link>
        </div>
      </div>
    )
  }

  const displayTitle = sighting.title || sighting.link_preview_title || sighting.spot?.title || t.notFound
  const displayDetail = sighting.notes || sighting.link_preview_description || sighting.location_description
  const titleNode = sighting.product_url ? (
    <a
      href={sighting.product_url}
      target="_blank"
      rel="nofollow ugc noopener noreferrer"
      className="hover:text-blue-700 underline-offset-4 hover:underline"
    >
      {displayTitle}
    </a>
  ) : (
    displayTitle
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        <Link href="/sightings" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          {t.backAll}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {sighting.image_url ? (
                <img src={sighting.image_url} alt={displayTitle} className="w-full h-96 object-cover" />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400 text-5xl">📷</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold text-gray-900 mb-3">{t.whoFound}</h3>
              <div className="flex items-center space-x-3">
                {sighting.spotter?.avatar_url && (
                  <img src={sighting.spotter.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{sighting.spotter?.full_name || t.unknownUser}</p>
                  <p className="text-xs text-gray-500">{formatDate(sighting.created_at)}</p>
                </div>
              </div>
              {sighting.spotter_id !== currentUserId && (
                <button onClick={handleMessageRequest} className="mt-4 w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold">
                  {t.sendMsgBtn}
                </button>
              )}
            </div>

            {sighting.price && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">{t.price}</p>
                <p className="text-2xl font-bold text-green-600">{getCurrencyPrefix(sighting.link_preview_currency)}{Number(sighting.price).toLocaleString('tr-TR')}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">{t.where}</p>
              <p className="font-medium text-gray-900 mb-3">{sighting.location_description}</p>
              {sighting.latitude && sighting.longitude && (
                <button onClick={openGoogleMaps} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                  {t.viewMap}
                </button>
              )}
            </div>

            {(sighting.product_url || sighting.link_preview_title || sighting.marketplace || sighting.source_channel === 'virtual') && (
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold text-gray-900 mb-3">{t.productCard}</h3>
                <a
                  href={sighting.product_url || '#'}
                  target="_blank"
                  rel="nofollow ugc noopener noreferrer"
                  className="block rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300"
                >
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate">{sighting.marketplace || sighting.source_domain || t.onlineSource}</span>
                    <span className="text-[11px] text-gray-500">{t.seoPreview}</span>
                  </div>
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-100 shrink-0 flex items-center justify-center">
                      {sighting.link_preview_image || sighting.image_url ? (
                        <img src={sighting.link_preview_image || sighting.image_url || ''} alt={displayTitle} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🛍️</span>
                      )}
                    </div>
                    <div className="p-3 min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{displayTitle}</p>
                      <p className="text-xs text-gray-600 line-clamp-3 mt-1">{displayDetail || t.defaultDesc}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                        {sighting.link_preview_brand && <span>{t.brand} {sighting.link_preview_brand}</span>}
                        {sighting.seller_name && <span>{t.seller} {sighting.seller_name}</span>}
                        {sighting.link_preview_availability && <span>{t.status} {sighting.link_preview_availability}</span>}
                        {sighting.price && <span className="font-semibold text-green-700">{getCurrencyPrefix(sighting.link_preview_currency)}{Number(sighting.price).toLocaleString('tr-TR')}</span>}
                      </div>
                    </div>
                  </div>
                  {sighting.product_url && <div className="px-3 py-2 border-t border-gray-100 text-xs text-blue-700 truncate">{sighting.product_url}</div>}
                </a>

                {sighting.source_channel === 'virtual' && sighting.product_url && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-semibold text-amber-900">{t.helpUs}</p>
                    <p className="text-xs text-amber-800 mt-1">{t.helpUsDesc}</p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {REPORT_REASON_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => submitProductReport(option.value)}
                          disabled={!!reportLoading}
                          className="px-3 py-2 text-xs font-medium rounded-md bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                        >
                          {reportLoading === option.value ? t.sending : option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {displayDetail && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="font-bold text-gray-900 mb-3">{t.detailTitle}</h2>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{titleNode}</h1>
            <p className="text-gray-700 whitespace-pre-wrap">{displayDetail}</p>
          </div>
        )}

        {sighting.spot && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="font-bold text-gray-900 mb-3">{t.searchedItem}</h2>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{sighting.spot.title}</h3>
            <p className="text-gray-600 mb-4">{sighting.spot.description}</p>
            <Link href={buildSpotPath(sighting.spot.id, sighting.spot.title)} className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              {t.openSpot}
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

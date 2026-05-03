'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import SightingModal from '@/components/SightingModal'
import SimpleMap from '@/components/SimpleMap'
import SimpleShareButtons from '@/components/SimpleShareButtons'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'
import { useToast } from '@/hooks/useToast'
import { buildSeoImageAlt } from '@/lib/content-seo'
import { buildSpotPath, extractSightingIdFromParam } from '@/lib/sighting-slug'
import { supabase } from '@/lib/supabase'

const sdcText = {
  tr: { loading: 'Yukleniyor...', notFound: 'Spot bulunamadi', notFoundDesc: 'Bu spot silinmis veya mevcut degil.', backAll: '← Tum Spot\'lara Don', active: 'Aktif', found: 'Bulundu', description: 'Aciklama', category: 'Kategori', location: 'Konum', views: 'Goruntulenme', viewsTimes: (n: number) => `${n} kez`, helps: 'Yardim', helpsPeople: (n: number) => `${n} kisi yardim etti`, notSpecified: 'Belirtilmemis', locationInfo: '📍 Konum Bilgisi', seenIt: 'Bu urunu gordunuz mu?', seenDesc: 'Topluluga yardim edin, baskalarini mutlu edin', yesISaw: 'Evet, Ben Gordum!', offerHelp: '💬 Yardim Teklif Et', offerDesc: 'Bu urunu bulmada yardimci olabilir misiniz? Spot sahibine mesaj gonderin.', sendMsg: 'Mesaj Gonder', owner: 'Spot Sahibi', member: 'Topluluk uyesi', unknownUser: 'Kullanici', stats: 'Istatistikler', viewsStat: 'Goruntulenme:', helpsStat: 'Yardim Edenler:', createdStat: 'Olusturulma:', categoryLabel: 'Kategori', errLogin: 'Mesaj talebi icin giris yapmaniz gerekir', errNoOwner: 'Spot sahibi bilgisi bulunamadi', errOwnSpot: 'Kendi spotunuza mesaj talebi gonderemezsiniz.', msgDraft: (title: string) => `Merhaba, "${title}" spotunuz icin size yardimci olabilirim. Bu urunu bulmaniza yardim etmek isterim.`, errMsgFail: 'Mesaj talebi baslatilamadi', sightingSuccess: 'Tesekkurler! Yardim bildiriminiz inceleme icin gonderildi. Onaylandiginda Spot odulu islenecek.' },
  en: { loading: 'Loading...', notFound: 'Spot not found', notFoundDesc: 'This spot has been deleted or does not exist.', backAll: '← Back to All Spots', active: 'Active', found: 'Found', description: 'Description', category: 'Category', location: 'Location', views: 'Views', viewsTimes: (n: number) => `${n} times`, helps: 'Help', helpsPeople: (n: number) => `${n} people helped`, notSpecified: 'Not specified', locationInfo: '📍 Location Info', seenIt: 'Have you seen this item?', seenDesc: 'Help the community, make others happy', yesISaw: 'Yes, I Saw It!', offerHelp: '💬 Offer Help', offerDesc: 'Can you help find this item? Send a message to the spot owner.', sendMsg: 'Send Message', owner: 'Spot Owner', member: 'Community member', unknownUser: 'User', stats: 'Statistics', viewsStat: 'Views:', helpsStat: 'Helpers:', createdStat: 'Created:', categoryLabel: 'Category', errLogin: 'You must be logged in to send a message', errNoOwner: 'Spot owner not found', errOwnSpot: 'You cannot send a message to your own spot.', msgDraft: (title: string) => `Hello, I can help with your spot "${title}". I would like to help you find it.`, errMsgFail: 'Could not start message request', sightingSuccess: 'Thank you! Your sighting report has been submitted for review. The spot reward will be processed when approved.' },
  de: { loading: 'Laden...', notFound: 'Spot nicht gefunden', notFoundDesc: 'Dieser Spot wurde gelöscht oder existiert nicht.', backAll: '← Zurück zu allen Spots', active: 'Aktiv', found: 'Gefunden', description: 'Beschreibung', category: 'Kategorie', location: 'Standort', views: 'Aufrufe', viewsTimes: (n: number) => `${n} mal`, helps: 'Hilfe', helpsPeople: (n: number) => `${n} Personen halfen`, notSpecified: 'Nicht angegeben', locationInfo: '📍 Standortinfo', seenIt: 'Haben Sie diesen Artikel gesehen?', seenDesc: 'Helfen Sie der Community, machen Sie andere glücklich', yesISaw: 'Ja, ich habe es gesehen!', offerHelp: '💬 Hilfe anbieten', offerDesc: 'Können Sie helfen, diesen Artikel zu finden? Senden Sie dem Spot-Eigentümer eine Nachricht.', sendMsg: 'Nachricht senden', owner: 'Spot-Eigentümer', member: 'Community-Mitglied', unknownUser: 'Benutzer', stats: 'Statistiken', viewsStat: 'Aufrufe:', helpsStat: 'Helfer:', createdStat: 'Erstellt:', categoryLabel: 'Kategorie', errLogin: 'Sie müssen angemeldet sein, um eine Nachricht zu senden', errNoOwner: 'Spot-Eigentümer nicht gefunden', errOwnSpot: 'Sie können keine Nachricht an Ihren eigenen Spot senden.', msgDraft: (title: string) => `Hallo, ich kann bei Ihrem Spot "${title}" helfen. Ich würde gerne helfen, es zu finden.`, errMsgFail: 'Nachrichtenanfrage konnte nicht gestartet werden', sightingSuccess: 'Danke! Ihr Sichtungsbericht wurde zur Überprüfung eingereicht.' },
  fr: { loading: 'Chargement...', notFound: 'Spot introuvable', notFoundDesc: 'Ce spot a été supprimé ou n\'existe pas.', backAll: '← Retour à tous les spots', active: 'Actif', found: 'Trouvé', description: 'Description', category: 'Catégorie', location: 'Emplacement', views: 'Vues', viewsTimes: (n: number) => `${n} fois`, helps: 'Aide', helpsPeople: (n: number) => `${n} personnes ont aidé`, notSpecified: 'Non spécifié', locationInfo: '📍 Info localisation', seenIt: 'Avez-vous vu cet article ?', seenDesc: 'Aidez la communauté, rendez les autres heureux', yesISaw: 'Oui, je l\'ai vu !', offerHelp: '💬 Proposer de l\'aide', offerDesc: 'Pouvez-vous aider à trouver cet article ? Envoyez un message au propriétaire du spot.', sendMsg: 'Envoyer un message', owner: 'Propriétaire du spot', member: 'Membre de la communauté', unknownUser: 'Utilisateur', stats: 'Statistiques', viewsStat: 'Vues :', helpsStat: 'Aidants :', createdStat: 'Créé le :', categoryLabel: 'Catégorie', errLogin: 'Vous devez être connecté pour envoyer un message', errNoOwner: 'Propriétaire du spot non trouvé', errOwnSpot: 'Vous ne pouvez pas envoyer de message à votre propre spot.', msgDraft: (title: string) => `Bonjour, je peux vous aider avec votre spot "${title}". Je voudrais vous aider à le trouver.`, errMsgFail: 'Impossible de démarrer la demande de message', sightingSuccess: 'Merci ! Votre rapport a été soumis pour examen.' },
  es: { loading: 'Cargando...', notFound: 'Spot no encontrado', notFoundDesc: 'Este spot fue eliminado o no existe.', backAll: '← Volver a todos los spots', active: 'Activo', found: 'Encontrado', description: 'Descripción', category: 'Categoría', location: 'Ubicación', views: 'Vistas', viewsTimes: (n: number) => `${n} veces`, helps: 'Ayuda', helpsPeople: (n: number) => `${n} personas ayudaron`, notSpecified: 'No especificado', locationInfo: '📍 Info de ubicación', seenIt: '¿Has visto este artículo?', seenDesc: 'Ayuda a la comunidad, haz felices a otros', yesISaw: '¡Sí, lo vi!', offerHelp: '💬 Ofrecer ayuda', offerDesc: '¿Puedes ayudar a encontrar este artículo? Envía un mensaje al propietario del spot.', sendMsg: 'Enviar mensaje', owner: 'Propietario del spot', member: 'Miembro de la comunidad', unknownUser: 'Usuario', stats: 'Estadísticas', viewsStat: 'Vistas:', helpsStat: 'Ayudantes:', createdStat: 'Creado:', categoryLabel: 'Categoría', errLogin: 'Debes estar conectado para enviar un mensaje', errNoOwner: 'Propietario del spot no encontrado', errOwnSpot: 'No puedes enviar un mensaje a tu propio spot.', msgDraft: (title: string) => `Hola, puedo ayudarte con tu spot "${title}". Me gustaría ayudarte a encontrarlo.`, errMsgFail: 'No se pudo iniciar la solicitud de mensaje', sightingSuccess: '¡Gracias! Tu reporte fue enviado para revisión.' },
  ru: { loading: 'Загрузка...', notFound: 'Спот не найден', notFoundDesc: 'Этот спот был удалён или не существует.', backAll: '← Назад ко всем спотам', active: 'Активный', found: 'Найден', description: 'Описание', category: 'Категория', location: 'Местоположение', views: 'Просмотры', viewsTimes: (n: number) => `${n} раз`, helps: 'Помощь', helpsPeople: (n: number) => `${n} человек помогли`, notSpecified: 'Не указано', locationInfo: '📍 Информация о местоположении', seenIt: 'Вы видели этот предмет?', seenDesc: 'Помогите сообществу, сделайте других счастливыми', yesISaw: 'Да, я видел(а)!', offerHelp: '💬 Предложить помощь', offerDesc: 'Можете помочь найти этот предмет? Отправьте сообщение владельцу спота.', sendMsg: 'Отправить сообщение', owner: 'Владелец спота', member: 'Участник сообщества', unknownUser: 'Пользователь', stats: 'Статистика', viewsStat: 'Просмотры:', helpsStat: 'Помощники:', createdStat: 'Создано:', categoryLabel: 'Категория', errLogin: 'Необходимо войти, чтобы отправить сообщение', errNoOwner: 'Владелец спота не найден', errOwnSpot: 'Вы не можете отправить сообщение своему собственному споту.', msgDraft: (title: string) => `Здравствуйте, я могу помочь с вашим спотом "${title}". Я хотел бы помочь вам найти это.`, errMsgFail: 'Не удалось начать запрос на сообщение', sightingSuccess: 'Спасибо! Ваш отчёт был отправлен на проверку.' },
} as const

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
  total_helps: number
  user?: {
    full_name: string | null
  }
}

export default function SpotDetailClient() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const locale = useCurrentLocale()
  const t = sdcText[locale as keyof typeof sdcText] ?? sdcText.tr
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id
  const spotId = rawId ? extractSightingIdFromParam(rawId) : ''

  const [spot, setSpot] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSightingModal, setShowSightingModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (spotId) {
      fetchSpotDetails()
    }
  }, [spotId, locale])

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
    }

    loadCurrentUser()
  }, [])

  const fetchSpotDetails = async () => {
    try {
      const { data: spotData, error: spotError } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spotId)
        .single()

      if (spotError) {
        console.error('Spot bulunamadi:', spotError)
        return
      }

      let localizedSpotData = spotData
      if (locale !== 'tr') {
        const { data: translationData } = await supabase
          .from('spot_translations')
          .select('title, description')
          .eq('spot_id', spotId)
          .eq('language', locale)
          .maybeSingle()

        if (translationData) {
          localizedSpotData = {
            ...spotData,
            title: translationData.title || spotData.title,
            description: translationData.description || spotData.description,
          }
        }
      }

      const { data: userData } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', spotData.user_id)
        .single()

      await supabase
        .from('spots')
        .update({ views: (spotData.views || 0) + 1 })
        .eq('id', spotId)

      setSpot({
        ...localizedSpotData,
        user: userData || { full_name: null },
      })
    } catch (error) {
      console.error('Spot detaylari yuklenemedi:', error)
    } finally {
      setLoading(false)
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

      if (!spot?.user_id) {
        toast.error(t.errNoOwner)
        return
      }

      if (spot.user_id === user.id) {
        toast.error(t.errOwnSpot)
        return
      }

      const draft = t.msgDraft(spot.title)
      const searchParams = new URLSearchParams({
        receiver: spot.user_id,
        type: 'help',
        draft,
      })

      router.push(`/messages?${searchParams.toString()}`)
    } catch (error) {
      console.error('Spot message request navigation error:', error)
      toast.error(t.errMsgFail)
    }
  }

  const handleSightingSuccess = () => {
    setShowSightingModal(false)
    fetchSpotDetails()
    toast.success(t.sightingSuccess, 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </main>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.notFound}</h1>
          <p className="text-gray-600 mb-8">{t.notFoundDesc}</p>
          <button onClick={() => router.push('/spots')} className="btn-primary">
            {t.backAll}
          </button>
        </main>
      </div>
    )
  }

  const seoAlt = buildSeoImageAlt({ title: spot.title, category: spot.category, location: spot.location })

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        <div className="mb-6">
          <button onClick={() => router.push('/spots')} className="text-blue-600 hover:text-blue-800 flex items-center">
            {t.backAll}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${spot.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {spot.status === 'active' ? t.active : t.found}
                    </span>
                    <span className="text-gray-500 text-sm">{new Date(spot.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{spot.title}</h1>
                </div>
              </div>

              {spot.image_url && (
                <div className="mb-6">
                  <div className="relative h-96 w-full rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={spot.image_url}
                      alt={seoAlt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{t.description}</h2>
                <p className="text-gray-700 whitespace-pre-line">{spot.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t.category}</h3>
                  <p className="font-medium">{spot.category || t.notSpecified}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t.location}</h3>
                  <p className="font-medium">{spot.location || t.notSpecified}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t.views}</h3>
                  <p className="font-medium">{t.viewsTimes(spot.views)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t.helps}</h3>
                  <p className="font-medium">{t.helpsPeople(spot.total_helps)}</p>
                </div>
              </div>
            </div>

            {spot.location && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t.locationInfo}</h2>
                <SimpleMap location={spot.location} />
              </div>
            )}

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">{t.seenIt}</h3>
              <p className="mb-6 opacity-90">{t.seenDesc}</p>
              <button onClick={() => setShowSightingModal(true)} className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg">
                {t.yesISaw}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <SimpleShareButtons url={buildSpotPath(spot.id, spot.title)} title={spot.title} />

            {spot.user_id !== currentUserId && (
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-white mb-3">{t.offerHelp}</h3>
                <p className="text-emerald-50 text-sm mb-4">{t.offerDesc}</p>
                <button onClick={handleMessageRequest} className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-3 rounded-xl transition-colors">
                  {t.sendMsg}
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.owner}</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {spot.user?.full_name?.[0]?.toUpperCase() || 'K'}
                </div>
                <div>
                  <p className="font-medium">{spot.user?.full_name || t.unknownUser}</p>
                  <p className="text-sm text-gray-500">{t.member}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.stats}</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">{t.viewsStat}</span><span className="font-bold">{spot.views}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">{t.helpsStat}</span><span className="font-bold">{spot.total_helps}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">{t.createdStat}</span><span className="font-bold">{new Date(spot.created_at).toLocaleDateString()}</span></div>
              </div>
            </div>

            {spot.category && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.categoryLabel}</h3>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {spot.category === 'Elektronik' && '🔌'}
                    {spot.category === 'Fotoğraf Makineleri' && '📷'}
                    {spot.category === 'Giyim & Aksesuar' && '👕'}
                    {spot.category === 'Ev & Bahçe' && '🏠'}
                    {spot.category === 'Koleksiyon' && '🎨'}
                    {spot.category === 'Kitap & Müzik' && '📚'}
                    {spot.category === 'Diğer' && '📦'}
                  </span>
                  <span className="font-medium">{spot.category}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showSightingModal && (
        <SightingModal
          spotId={spotId}
          spotTitle={spot.title}
          onClose={() => setShowSightingModal(false)}
          onSuccess={handleSightingSuccess}
        />
      )}
    </div>
  )
}

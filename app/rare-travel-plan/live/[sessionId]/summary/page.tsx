'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const SUMMARY_TEXT = {
  tr: {
    errorSessionNotFound: 'Oturum bulunamadi.',
    errorPlanNotFound: 'Plan bulunamadi.',
    errorLoad: 'Veri yuklenemedi.',
    authPath: '/auth',
    loading: 'Yukleniyor...',
    errorNoData: 'Veri bulunamadi.',
    backToPlans: 'Planlara don',
    successTitle: 'Seyahatiniz Tamamlandi!',
    successDesc: 'Harika bir deneyim paylastiniz. Anilariniz kalici hale getirildi.',
    travelDuration: 'Seyahat Suresi',
    collectedPosts: 'Toplanan Paylasimlar',
    routeDistance: 'Rota Mesafesi',
    travelInfo: 'Seyahat Bilgileri',
    planName: 'Plan Adi',
    start: 'Baslangic',
    end: 'Varis',
    startDate: 'Baslangic Tarihi',
    completedDate: 'Tamamlanma Tarihi',
    visibility: 'Gorunurluk',
    visPrivate: '🔒 Sadece ben',
    visFollowers: '👥 Takipcilerim',
    visPublic: '🌍 Herkese acik',
    timelineTitle: 'Seyahat zaman cizelgesi',
    timelineDesc: 'Kullanici saat girisiyle olusan "su saatte suradaydik" akisi.',
    defaultPostTitle: 'Paylasim',
    noLocation: 'Konum yok',
    tagPrivate: 'Ozel',
    tagFollowers: 'Takip',
    tagPublic: 'Genel',
    copyOk: 'Paylasim linki panoya kopyalandi!',
    copyFail: 'Baglanti kopyalanamadi.',
    copying: 'Kopyalaniyor...',
    share: '🔗 Paylas',
    viewMap: '📍 Haritayi Goruntule',
    routesFeed: '🧭 Seyahat Rotalari Akisi',
    createAnother: 'Baska Plan Olustur',
    tipLabel: '💡 Ipucu:',
    tipPublic: 'Bu seyahat herkese aciktir. Diger kullanicilar sizin seyahatinizin rotasini ve topladiginiz paylasimlari gorebilir.',
    tipFollowers: 'Bu seyahat takipcilerinize aciktir. Takipcileriniz sizin seyahatinizin rotasini ve topladiginiz paylasimlari gorebilir.',
    durationFmt: (h: number, m: number, s: number) => `${h}h ${m}m ${s}s`,
    distanceFmt: (km: number | null) => `${km ?? '—'} km`,
  },
  en: {
    errorSessionNotFound: 'Session not found.',
    errorPlanNotFound: 'Plan not found.',
    errorLoad: 'Failed to load data.',
    authPath: '/en/auth',
    loading: 'Loading...',
    errorNoData: 'Data not found.',
    backToPlans: 'Back to plans',
    successTitle: 'Your Trip Is Completed!',
    successDesc: 'You shared a great experience. Your memories were preserved.',
    travelDuration: 'Trip Duration',
    collectedPosts: 'Collected Posts',
    routeDistance: 'Route Distance',
    travelInfo: 'Trip Details',
    planName: 'Plan Name',
    start: 'Start',
    end: 'Arrival',
    startDate: 'Start Date',
    completedDate: 'Completion Date',
    visibility: 'Visibility',
    visPrivate: '🔒 Only me',
    visFollowers: '👥 My followers',
    visPublic: '🌍 Public',
    timelineTitle: 'Trip Timeline',
    timelineDesc: 'Timeline generated from user-entered visit times.',
    defaultPostTitle: 'Post',
    noLocation: 'No location',
    tagPrivate: 'Private',
    tagFollowers: 'Following',
    tagPublic: 'Public',
    copyOk: 'Share link copied to clipboard!',
    copyFail: 'Could not copy link.',
    copying: 'Copying...',
    share: '🔗 Share',
    viewMap: '📍 View Map',
    routesFeed: '🧭 Travel Routes Feed',
    createAnother: 'Create Another Plan',
    tipLabel: '💡 Tip:',
    tipPublic: 'This trip is public. Other users can view your route and collected posts.',
    tipFollowers: 'This trip is visible to your followers. Your followers can view your route and collected posts.',
    durationFmt: (h: number, m: number, s: number) => `${h}h ${m}m ${s}s`,
    distanceFmt: (km: number | null) => `${km ?? '—'} km`,
  },
  de: {
    errorSessionNotFound: 'Sitzung nicht gefunden.',
    errorPlanNotFound: 'Plan nicht gefunden.',
    errorLoad: 'Daten konnten nicht geladen werden.',
    authPath: '/de/auth',
    loading: 'Wird geladen...',
    errorNoData: 'Daten nicht gefunden.',
    backToPlans: 'Zuruck zu Planen',
    successTitle: 'Ihre Reise ist abgeschlossen!',
    successDesc: 'Sie haben ein tolles Erlebnis geteilt. Ihre Erinnerungen wurden gespeichert.',
    travelDuration: 'Reisedauer',
    collectedPosts: 'Gesammelte Beitrage',
    routeDistance: 'Routenentfernung',
    travelInfo: 'Reiseinformationen',
    planName: 'Planname',
    start: 'Start',
    end: 'Ankunft',
    startDate: 'Startdatum',
    completedDate: 'Abschlussdatum',
    visibility: 'Sichtbarkeit',
    visPrivate: '🔒 Nur ich',
    visFollowers: '👥 Meine Follower',
    visPublic: '🌍 Offentlich',
    timelineTitle: 'Reise-Zeitachse',
    timelineDesc: 'Ablauf basierend auf manuell eingegebenen Zeiten.',
    defaultPostTitle: 'Beitrag',
    noLocation: 'Kein Standort',
    tagPrivate: 'Privat',
    tagFollowers: 'Follower',
    tagPublic: 'Offentlich',
    copyOk: 'Link in die Zwischenablage kopiert!',
    copyFail: 'Link konnte nicht kopiert werden.',
    copying: 'Kopieren...',
    share: '🔗 Teilen',
    viewMap: '📍 Karte anzeigen',
    routesFeed: '🧭 Reiserouten-Feed',
    createAnother: 'Weiteren Plan erstellen',
    tipLabel: '💡 Tipp:',
    tipPublic: 'Diese Reise ist offentlich. Andere konnen Ihre Route und Beitrage sehen.',
    tipFollowers: 'Diese Reise ist fur Ihre Follower sichtbar. Ihre Follower konnen Ihre Route und Beitrage sehen.',
    durationFmt: (h: number, m: number, s: number) => `${h}h ${m}m ${s}s`,
    distanceFmt: (km: number | null) => `${km ?? '—'} km`,
  },
  fr: {
    errorSessionNotFound: 'Session introuvable.',
    errorPlanNotFound: 'Plan introuvable.',
    errorLoad: 'Impossible de charger les donnees.',
    authPath: '/fr/auth',
    loading: 'Chargement...',
    errorNoData: 'Donnees introuvables.',
    backToPlans: 'Retour aux plans',
    successTitle: 'Votre voyage est termine !',
    successDesc: 'Vous avez partage une belle experience. Vos souvenirs ont ete conserves.',
    travelDuration: 'Duree du voyage',
    collectedPosts: 'Publications collecte es',
    routeDistance: 'Distance de l itineraire',
    travelInfo: 'Informations du voyage',
    planName: 'Nom du plan',
    start: 'Depart',
    end: 'Arrivee',
    startDate: 'Date de debut',
    completedDate: 'Date de fin',
    visibility: 'Visibilite',
    visPrivate: '🔒 Moi uniquement',
    visFollowers: '👥 Mes abonnes',
    visPublic: '🌍 Public',
    timelineTitle: 'Chronologie du voyage',
    timelineDesc: 'Flux cree avec les heures saisies par l utilisateur.',
    defaultPostTitle: 'Publication',
    noLocation: 'Aucune localisation',
    tagPrivate: 'Prive',
    tagFollowers: 'Abonnes',
    tagPublic: 'Public',
    copyOk: 'Lien copie dans le presse-papiers !',
    copyFail: 'Impossible de copier le lien.',
    copying: 'Copie...',
    share: '🔗 Partager',
    viewMap: '📍 Voir la carte',
    routesFeed: '🧭 Flux des itineraires',
    createAnother: 'Creer un autre plan',
    tipLabel: '💡 Astuce :',
    tipPublic: 'Ce voyage est public. Les autres utilisateurs peuvent voir votre itineraire et vos publications.',
    tipFollowers: 'Ce voyage est visible par vos abonnes. Ils peuvent voir votre itineraire et vos publications.',
    durationFmt: (h: number, m: number, s: number) => `${h}h ${m}m ${s}s`,
    distanceFmt: (km: number | null) => `${km ?? '—'} km`,
  },
  es: {
    errorSessionNotFound: 'Sesion no encontrada.',
    errorPlanNotFound: 'Plan no encontrado.',
    errorLoad: 'No se pudieron cargar los datos.',
    authPath: '/es/auth',
    loading: 'Cargando...',
    errorNoData: 'No se encontraron datos.',
    backToPlans: 'Volver a planes',
    successTitle: 'Tu viaje ha finalizado!',
    successDesc: 'Compartiste una gran experiencia. Tus recuerdos se guardaron.',
    travelDuration: 'Duracion del viaje',
    collectedPosts: 'Publicaciones recopiladas',
    routeDistance: 'Distancia de ruta',
    travelInfo: 'Informacion del viaje',
    planName: 'Nombre del plan',
    start: 'Inicio',
    end: 'Llegada',
    startDate: 'Fecha de inicio',
    completedDate: 'Fecha de finalizacion',
    visibility: 'Visibilidad',
    visPrivate: '🔒 Solo yo',
    visFollowers: '👥 Mis seguidores',
    visPublic: '🌍 Publico',
    timelineTitle: 'Cronologia del viaje',
    timelineDesc: 'Flujo generado con las horas ingresadas por el usuario.',
    defaultPostTitle: 'Publicacion',
    noLocation: 'Sin ubicacion',
    tagPrivate: 'Privado',
    tagFollowers: 'Seguidores',
    tagPublic: 'Publico',
    copyOk: 'Enlace copiado al portapapeles!',
    copyFail: 'No se pudo copiar el enlace.',
    copying: 'Copiando...',
    share: '🔗 Compartir',
    viewMap: '📍 Ver mapa',
    routesFeed: '🧭 Flujo de rutas',
    createAnother: 'Crear otro plan',
    tipLabel: '💡 Consejo:',
    tipPublic: 'Este viaje es publico. Otros usuarios pueden ver tu ruta y publicaciones.',
    tipFollowers: 'Este viaje es visible para tus seguidores. Tus seguidores pueden ver tu ruta y publicaciones.',
    durationFmt: (h: number, m: number, s: number) => `${h}h ${m}m ${s}s`,
    distanceFmt: (km: number | null) => `${km ?? '—'} km`,
  },
  ru: {
    errorSessionNotFound: 'Sessiya ne naidena.',
    errorPlanNotFound: 'Plan ne naiden.',
    errorLoad: 'Ne udalos zagruzit dannye.',
    authPath: '/ru/auth',
    loading: 'Zagruzka...',
    errorNoData: 'Dannye ne naideny.',
    backToPlans: 'Nazad k planam',
    successTitle: 'Vashe puteshestvie zaversheno!',
    successDesc: 'Vy podelilis otlichnym opytom. Vashi vospominaniya sohraneny.',
    travelDuration: 'Dlitelnost puteshestviya',
    collectedPosts: 'Sobrannye publikacii',
    routeDistance: 'Distanciya marshruta',
    travelInfo: 'Informaciya o puteshestvii',
    planName: 'Nazvanie plana',
    start: 'Start',
    end: 'Pribytie',
    startDate: 'Data starta',
    completedDate: 'Data zaversheniya',
    visibility: 'Vidimost',
    visPrivate: '🔒 Tolko ya',
    visFollowers: '👥 Moi podpischiki',
    visPublic: '🌍 Publichno',
    timelineTitle: 'Lenta puteshestviya',
    timelineDesc: 'Lenta na osnove vremeni, ukazannogo polzovatelem.',
    defaultPostTitle: 'Publikaciya',
    noLocation: 'Net lokacii',
    tagPrivate: 'Privatno',
    tagFollowers: 'Podpischiki',
    tagPublic: 'Publichno',
    copyOk: 'Ssylka skopirovana v буфер!',
    copyFail: 'Ne udalos skopirovat ssylku.',
    copying: 'Kopirovanie...',
    share: '🔗 Podelitsya',
    viewMap: '📍 Otkryt kartu',
    routesFeed: '🧭 Lenta marshrutov',
    createAnother: 'Sozdat drugoi plan',
    tipLabel: '💡 Sovet:',
    tipPublic: 'Eto puteshestvie publichnoe. Drugie polzovateli mogut videt marshrut i publikacii.',
    tipFollowers: 'Eto puteshestvie vidno podpischikam. Oni mogut videt marshrut i publikacii.',
    durationFmt: (h: number, m: number, s: number) => `${h}h ${m}m ${s}s`,
    distanceFmt: (km: number | null) => `${km ?? '—'} km`,
  },
} as const

type LocaleKey = keyof typeof SUMMARY_TEXT

type LiveTravelSession = {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'completed'
  started_at: string
  completed_at: string | null
  posts_collected: string[]
  total_km: number
  visibility: string
  manual_route_post_ids?: string[]
  route_overridden?: boolean
  post_time_map?: Record<string, string>
}

type CollectedPost = {
  id: string
  title: string
  location_name: string | null
  city: string | null
  visit_time: string | null
  visibility: 'private' | 'followers' | 'public'
  sort_order: number
}

type SavedTravelPlan = {
  id: string
  title: string
  from_location: string
  to_location: string
  query_params: string
}

export default function LiveTravelSessionSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useCurrentLocale()
  const t = SUMMARY_TEXT[(locale as LocaleKey)] ?? SUMMARY_TEXT.tr
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<LiveTravelSession | null>(null)
  const [plan, setPlan] = useState<SavedTravelPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sharing, setSharing] = useState(false)
  const [collectedPosts, setCollectedPosts] = useState<CollectedPost[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push(t.authPath)
          return
        }

        const { data: sessionData, error: sessionErr } = await supabase
          .from('live_travel_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single()

        if (sessionErr || !sessionData) {
          setError(t.errorSessionNotFound)
          setLoading(false)
          return
        }

        setSession(sessionData)

        const { data: tripRows } = await supabase
          .from('live_trip_posts')
          .select('id, title, location_name, city, visit_time, visibility, sort_order')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true })

        let nextCollectedPosts = (tripRows || []) as CollectedPost[]
        if (locale !== 'tr' && nextCollectedPosts.length > 0) {
          const ids = nextCollectedPosts.map((row) => row.id)
          const { data: translationRows } = await supabase
            .from('live_trip_post_translations')
            .select('live_trip_post_id, title')
            .in('live_trip_post_id', ids)
            .eq('language', locale)

          if (translationRows && translationRows.length > 0) {
            const translationMap = new Map(
              translationRows.map((row: any) => [row.live_trip_post_id as string, row.title as string]),
            )
            nextCollectedPosts = nextCollectedPosts.map((post) => ({
              ...post,
              title: translationMap.get(post.id) || post.title,
            }))
          }
        }

        setCollectedPosts(nextCollectedPosts)

        const { data: planData, error: planErr } = await supabase
          .from('rare_travel_plans')
          .select('*')
          .eq('id', sessionData.plan_id)
          .single()

        if (planErr || !planData) {
          setError(t.errorPlanNotFound)
          setLoading(false)
          return
        }

        setPlan(planData)
        setLoading(false)
      } catch (err: any) {
        setError(err?.message || t.errorLoad)
        setLoading(false)
      }
    }

    loadData()
  }, [locale, sessionId, router, t.authPath, t.errorLoad, t.errorPlanNotFound, t.errorSessionNotFound])

  const shareSession = async () => {
    if (!plan) return

    setSharing(true)
    try {
      // Generate shareable link
      const url = `${window.location.origin}/rare-travel-plan/live/${sessionId}/summary`
      await navigator.clipboard.writeText(url)

      alert(t.copyOk)
    } catch (err) {
      alert(t.copyFail)
    } finally {
      setSharing(false)
    }
  }

  if (loading) {
    return (
      <section className="space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-300 border-t-emerald-600" />
          <p className="mt-3 text-sm text-gray-600">{t.loading}</p>
        </div>
      </section>
    )
  }

  if (!session || !plan) {
    return (
      <section className="space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">{error || t.errorNoData}</p>
          <Link href="/rare-travel-plan" className="mt-3 inline-block text-sm font-semibold text-red-700 hover:underline">
            {t.backToPlans}
          </Link>
        </div>
      </section>
    )
  }

  const duration = session.completed_at
    ? Math.floor((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 1000)
    : 0
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60

  return (
    <section className="space-y-4 p-4 md:p-6">
      {/* Success Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-3xl">🎉</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{t.successTitle}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t.successDesc}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.travelDuration}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {t.durationFmt(hours, minutes, seconds)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.collectedPosts}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{collectedPosts.length}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.routeDistance}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{t.distanceFmt(session.total_km || null)}</p>
        </div>
      </div>

      {/* Plan Details */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <h2 className="font-bold text-gray-900">{t.travelInfo}</h2>
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">{t.planName}:</span> {plan.title}
          </p>
          <p>
            <span className="font-semibold">{t.start}:</span> {plan.from_location}
          </p>
          <p>
            <span className="font-semibold">{t.end}:</span> {plan.to_location}
          </p>
          <p>
            <span className="font-semibold">{t.startDate}:</span>{' '}
            {new Date(session.started_at).toLocaleString(locale)}
          </p>
          <p>
            <span className="font-semibold">{t.completedDate}:</span>{' '}
            {session.completed_at ? new Date(session.completed_at).toLocaleString(locale) : '—'}
          </p>
          <p>
            <span className="font-semibold">{t.visibility}:</span>{' '}
            {session.visibility === 'private'
              ? t.visPrivate
              : session.visibility === 'followers'
                ? t.visFollowers
                : t.visPublic}
          </p>
        </div>
      </div>

      {collectedPosts.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <h2 className="font-bold text-gray-900">{t.timelineTitle}</h2>
          <p className="mt-1 text-xs text-gray-500">{t.timelineDesc}</p>
          <div className="mt-3 space-y-2">
            {collectedPosts.map((post, index) => (
              <div key={`timeline-${post.id}`} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="w-14 rounded-md bg-emerald-100 px-2 py-1 text-center text-xs font-bold text-emerald-700">
                  {post.visit_time || session.post_time_map?.[post.id] || '--:--'}
                </span>
                <span className="w-7 text-xs font-bold text-gray-500">#{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{post.title || t.defaultPostTitle}</p>
                  <p className="truncate text-xs text-gray-500">{[post.location_name, post.city].filter(Boolean).join(' · ') || t.noLocation}</p>
                </div>
                <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                  {post.visibility === 'private' ? t.tagPrivate : post.visibility === 'followers' ? t.tagFollowers : t.tagPublic}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={shareSession}
          disabled={sharing}
          className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
        >
          {sharing ? t.copying : t.share}
        </button>

        <Link
          href={`/rare-travel-plan/live/${sessionId}`}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {t.viewMap}
        </Link>

        <Link
          href="/seyahat-rotalari"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
        >
          {t.routesFeed}
        </Link>

        <Link
          href="/rare-travel-plan"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {t.createAnother}
        </Link>
      </div>

      {/* Share Info */}
      {session.visibility !== 'private' && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">{t.tipLabel}</span>{' '}
            {session.visibility === 'followers' ? t.tipFollowers : t.tipPublic}
          </p>
        </div>
      )}
    </section>
  )
}

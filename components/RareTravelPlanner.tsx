'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import LocationSelector from './LocationSelector'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MapContainer, Marker, TileLayer, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { buildSocialPath } from '@/lib/sighting-slug'
import { supabase } from '@/lib/supabase'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

type LatLng = { lat: number; lng: number }

type PlannedPost = {
  id: string
  stop_index: number
  title: string | null
  description: string | null
  category: string | null
  location_name: string | null
  city: string | null
  district: string | null
  country: string | null
  latitude: number
  longitude: number
  likes_count: number
  shares_count: number
  distance_to_route_km: number
  image_url: string | null
  created_at: string
}

type PlannedStop = {
  index: number
  latitude: number
  longitude: number
  post_id: string
  title: string | null
  city: string | null
  category: string | null
  likes_count: number
  shares_count: number
  distance_to_route_km: number
  image_url: string | null
}

type PlannerResponse = {
  meta: {
    from: string
    to: string
    sortBy: string
    category: string[] | null
    query: string | null
    nearbyOnly: boolean
    nearRadiusKm: number
    corridorKm: number
    stops: number
    routeDistanceKm: number
    routeDurationMin: number
    routingProvider?: string
    routeIsFallback?: boolean
    foundPosts: number
  }
  route: {
    from: LatLng
    to: LatLng
    geometry: LatLng[]
  }
  stops: PlannedStop[]
  categoryOptions: string[]
  posts: PlannedPost[]
}

type SavedTravelPlan = {
  id: string
  title: string
  from_location: string
  to_location: string
  query_params: string
  created_at: string
}

type ActiveLivePlan = {
  session_id: string
  plan_id: string
  status: 'active' | 'completed'
  title: string
  from_location: string
  to_location: string
  started_at: string
  stops_count: number
}

type NominatimResult = {
  place_id: number
  display_name: string
  name: string
  lat: string
  lon: string
}

const TRAVEL_CATEGORIES = [
  'Antika ve Koleksiyon',
  'Vintage ve Retro',
  'Kitap ve Plak',
  'Oyuncak ve Figür',
  'Saat ve Takı',
  'Dekorasyon ve Ev',
  'Mutfak ve Zanaat',
  'Giyim ve Aksesuar',
  'Pazar ve Bit Pazarı',
  'Sahaf ve Plakçı',
  'Müzayede ve Mezat',
  'Müze ve Sergi',
  'Tarihi Çarşı ve Han',
  'Yerel Dükkan ve Atölye',
  'Rota Üstü Durak',
  'Gizli Mekan',
  'Fotoğraflık Nokta',
  'Etkinlik ve Festival',
  'Kafe ve Mola Noktası',
  'Diğer',
]

function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  showCurrentLocation,
  onCurrentLocation,
}: {
  value: string
  onChange: (val: string) => void
  onSelect: (display: string, lat: number, lng: number) => void
  placeholder?: string
  showCurrentLocation?: boolean
  onCurrentLocation?: () => void
}) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = (q: string) => {
    if (timer.current) clearTimeout(timer.current)
    if (!q.trim() || q.length < 2) { setSuggestions([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      setBusy(true)
      try {
        const url =
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=7&q=` +
          encodeURIComponent(q) +
          `&accept-language=tr`
        const res = await fetch(url, { headers: { 'User-Agent': 'spotitforme/1.0' } })
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setBusy(false)
      }
    }, 320)
  }

  const inputCls =
    'mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-emerald-100 focus:border-emerald-400 focus:ring-2'

  return (
    <div className="relative">
      <div className="flex gap-1">
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => { onChange(e.target.value); search(e.target.value) }}
            onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
            onBlur={() => setTimeout(() => setOpen(false), 180)}
            placeholder={placeholder}
            className={inputCls}
            autoComplete="off"
          />
          {busy && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</span>
          )}
        </div>
        {showCurrentLocation && onCurrentLocation && (
          <button
            type="button"
            title={placeholder || 'Use current location'}
            onClick={onCurrentLocation}
            className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.464-.987 2.316-1.857C15.041 15.002 17 12.459 17 9A7 7 0 103 9c0 3.459 1.959 6.002 3.312 7.492.852.87 1.696 1.473 2.316 1.857.31.193.571.337.757.433a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-[9999] mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {suggestions.map((s) => {
            const parts = s.display_name.split(',')
            const short = parts.slice(0, 3).join(',')
            const rest = parts.length > 3 ? parts.slice(3).join(',').trim() : null
            return (
              <li key={s.place_id}>
                <button
                  type="button"
                  onMouseDown={() => {
                    const display = parts.slice(0, 2).join(',').trim()
                    onSelect(display, Number(s.lat), Number(s.lon))
                    setSuggestions([])
                    setOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-emerald-50 focus:bg-emerald-50"
                >
                  <p className="text-sm font-medium text-gray-900 leading-snug">{short}</p>
                  {rest && <p className="text-xs text-gray-400 leading-tight">{rest}</p>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const SORT_OPTION_VALUES = ['likes', 'shares', 'likes_shares', 'recent', 'route_proximity'] as const

const PLANNER_TEXT = {
  tr: {
    title: 'Nadir Seyahat Plani',
    subtitle: 'Baslangic ve varis konumunu sec, yol uzerindeki en iyi nadir sosyal paylasimlari otomatik getir.',
    stops: 'Durak sayisi',
    sort: 'Siralama',
    corridor: 'Rota koridoru (km)',
    categories: 'Kategoriler (birden fazla secilebilir)',
    up: 'Yukari',
    down: 'Asagi',
    categoryPick: 'Kategori sec',
    clear: 'Temizle',
    allCategories: 'Tum kategoriler',
    selectedCategoryCount: '{count} kategori secildi',
    allIncluded: 'Kategori secmezsen tumu dahil edilir',
    searchLabel: 'Arama kelimesi (opsiyonel)',
    searchPlaceholder: 'Ornek: antika, koleksiyon, figur',
    nearbyFilter: 'Yakinimdakiler filtresi (OSRM rota + mevcut konum)',
    useMyLocation: 'Konumumu kullan',
    nearbyRadius: 'Yakindaki yaricap (km)',
    locationReady: 'Konum hazir: {lat}, {lng}',
    preparingPlan: 'Plan hazirlaniyor...',
    createPlan: 'Nadir seyahat planini olustur',
    openAllPins: 'Haritada tum sosyal pinleri ac',
    saving: 'Kaydediliyor...',
    savePlan: 'Plani kaydet',
    starting: 'Baslatiliyor...',
    startLive: 'Canli Plan Baslat',
    createShareLink: 'Paylasim linki olustur',
    summaryTitle: 'Plan ozeti',
    route: 'Rota:',
    distance: 'Mesafe:',
    duration: 'Sure:',
    foundPosts: 'Bulunan paylasim:',
    openRouteInGoogle: "Google Maps'te Tum Rotayi Ac",
    fallbackRoute: 'Rota servisinde gecici kesinti var. Plan, acil modda dogrusal guzergahla olusturuldu.',
    startPoint: 'Baslangic',
    destination: 'Varis',
    stop: 'Durak',
    rarePost: 'Nadir paylasim',
    openPost: 'Paylasimi ac',
    openOnMap: 'Haritada ac',
    routeStops: 'Rota duraklari ({count} secildi)',
    noLocationProvided: 'Konum belirtilmemis',
    toRouteKm: 'km rotaya',
    googleMaps: 'Google Haritalar',
    savedPlans: 'Kayitli planlarim',
    savedPlansDesc: 'Hesaba girisliysen profiline bagli saklanir, degilsen bu tarayicida tutulur.',
    liveEditArea: 'Canli duzenleme alanin',
    liveEditDesc: 'Buradaki aktif oturumlarda ara kaydet, ekle-cikar-duzenle yap; sadece sen "tamamla" dediginde rota yayina cikar.',
    noSavedPlans: 'Henuz kayitli plan yok.',
    livePlanBadge: 'Canli Plan',
    completedBadge: 'Tamamlandi',
    continueToEdit: 'Durak: {count} · Devam etmek icin tikla · {date}',
    completedSessions: 'Tamamlanan canli oturumlar',
    clickToEdit: 'Durak: {count} · Duzenlemek icin tikla',
    cityNotFoundManual: 'Sehir konumu bulunamadi. Lutfen baslangic ve varis adresini manuel girin.',
    cityLocationFetchFailed: 'Sehir konumu alinamadi. Lutfen baslangic ve varis adresini manuel girin.',
    browserGeoNotSupported: 'Tarayici konum servisini desteklemiyor.',
    geoPermissionDenied: 'Konum izni verilmedi veya konum alinamadi.',
    startEndRequired: 'Baslangic ve varis konumu gerekli. Metin veya enlem,boylam girebilirsin.',
    planCreateFailed: 'Plan olusturulamadi',
    saveSuccess: 'Plan kaydedildi.',
    saveFailed: 'Plan kaydedilemedi. Tablo hazir degilse migration calistirilmali.',
    loginRequiredForLive: 'Canli plan baslatmak icin giris yapmalisiniz.',
    liveStarted: 'Canli plan baslatildi!',
    liveStartFailed: 'Canli plan baslatilamadi.',
    shareCopied: 'Paylasim linki panoya kopyalandi.',
    shareLinkPrefix: 'Paylasim linki:',
    defaultStart: 'Baslangic',
    defaultEnd: 'Son durak',
    currentLocationTitle: 'Mevcut konumumu kullan',
    sortOptions: {
      likes: 'En cok begeni',
      shares: 'En cok paylasim',
      likes_shares: 'Begeni + paylasim',
      recent: 'En yeni paylasimlar',
      route_proximity: 'Rotaya en yakin',
    },
  },
  en: {
    title: 'Rare Travel Plan', subtitle: 'Choose start and destination, and automatically fetch the best rare social posts along the route.',
    stops: 'Number of stops', sort: 'Sort', corridor: 'Route corridor (km)', categories: 'Categories (multi-select)', up: 'Up', down: 'Down',
    categoryPick: 'Select category', clear: 'Clear', allCategories: 'All categories', selectedCategoryCount: '{count} categories selected', allIncluded: 'If none selected, all categories are included',
    searchLabel: 'Search keyword (optional)', searchPlaceholder: 'Example: antique, collection, figure', nearbyFilter: 'Nearby filter (OSRM route + current location)',
    useMyLocation: 'Use my location', nearbyRadius: 'Nearby radius (km)', locationReady: 'Location ready: {lat}, {lng}', preparingPlan: 'Preparing plan...',
    createPlan: 'Create rare travel plan', openAllPins: 'Open all social pins on map', saving: 'Saving...', savePlan: 'Save plan', starting: 'Starting...',
    startLive: 'Start Live Plan', createShareLink: 'Create share link', summaryTitle: 'Plan summary', route: 'Route:', distance: 'Distance:', duration: 'Duration:',
    foundPosts: 'Found posts:', openRouteInGoogle: 'Open full route in Google Maps', fallbackRoute: 'Routing service is temporarily unavailable. Plan was created with a straight-line fallback.',
    startPoint: 'Start', destination: 'Destination', stop: 'Stop', rarePost: 'Rare post', openPost: 'Open post', openOnMap: 'Open on map',
    routeStops: 'Route stops ({count} selected)', noLocationProvided: 'Location not specified', toRouteKm: 'km to route', googleMaps: 'Google Maps',
    savedPlans: 'My saved plans', savedPlansDesc: 'If signed in, plans are linked to your profile; otherwise stored in this browser.', liveEditArea: 'Live editing area',
    liveEditDesc: 'In active sessions you can save/edit add-remove; route is published only when you press "complete".', noSavedPlans: 'No saved plans yet.',
    livePlanBadge: 'Live Plan', completedBadge: 'Completed', continueToEdit: 'Stops: {count} · Click to continue · {date}', completedSessions: 'Completed live sessions',
    clickToEdit: 'Stops: {count} · Click to edit', cityNotFoundManual: 'City location not found. Please enter start and destination manually.', cityLocationFetchFailed: 'City location could not be fetched. Please enter start and destination manually.',
    browserGeoNotSupported: 'Your browser does not support geolocation.', geoPermissionDenied: 'Location permission denied or location unavailable.', startEndRequired: 'Start and destination are required. You can enter text or lat,lng.',
    planCreateFailed: 'Plan could not be created', saveSuccess: 'Plan saved.', saveFailed: 'Plan could not be saved. If table is missing, run migrations.', loginRequiredForLive: 'You need to sign in to start a live plan.',
    liveStarted: 'Live plan started!', liveStartFailed: 'Live plan could not be started.', shareCopied: 'Share link copied to clipboard.', shareLinkPrefix: 'Share link:', defaultStart: 'Start', defaultEnd: 'Last stop',
    currentLocationTitle: 'Use my current location', sortOptions: { likes: 'Most likes', shares: 'Most shares', likes_shares: 'Likes + shares', recent: 'Most recent posts', route_proximity: 'Closest to route' },
  },
  de: {
    title: 'Seltener Reiseplan', subtitle: 'Wahlen Sie Start und Ziel und laden Sie seltene soziale Beitrage entlang der Route automatisch.',
    stops: 'Anzahl Stopps', sort: 'Sortierung', corridor: 'Routenkorridor (km)', categories: 'Kategorien (Mehrfachauswahl)', up: 'Hoch', down: 'Runter',
    categoryPick: 'Kategorie wahlen', clear: 'Loschen', allCategories: 'Alle Kategorien', selectedCategoryCount: '{count} Kategorien ausgewahlt', allIncluded: 'Wenn nichts ausgewahlt ist, werden alle Kategorien einbezogen',
    searchLabel: 'Suchbegriff (optional)', searchPlaceholder: 'Beispiel: antik, sammlung, figur', nearbyFilter: 'In der Nahe Filter (OSRM-Route + aktueller Standort)',
    useMyLocation: 'Meinen Standort verwenden', nearbyRadius: 'Radius in der Nahe (km)', locationReady: 'Standort bereit: {lat}, {lng}', preparingPlan: 'Plan wird vorbereitet...',
    createPlan: 'Seltenen Reiseplan erstellen', openAllPins: 'Alle sozialen Pins auf der Karte offnen', saving: 'Wird gespeichert...', savePlan: 'Plan speichern', starting: 'Wird gestartet...',
    startLive: 'Live-Plan starten', createShareLink: 'Freigabelink erstellen', summaryTitle: 'Planubersicht', route: 'Route:', distance: 'Entfernung:', duration: 'Dauer:',
    foundPosts: 'Gefundene Beitrage:', openRouteInGoogle: 'Gesamte Route in Google Maps offnen', fallbackRoute: 'Routing-Dienst ist vorubergehend nicht verfugbar. Plan wurde als Luftlinie erstellt.',
    startPoint: 'Start', destination: 'Ziel', stop: 'Stopp', rarePost: 'Seltener Beitrag', openPost: 'Beitrag offnen', openOnMap: 'Auf Karte offnen',
    routeStops: 'Routenstopps ({count} ausgewahlt)', noLocationProvided: 'Kein Standort angegeben', toRouteKm: 'km zur Route', googleMaps: 'Google Maps',
    savedPlans: 'Meine gespeicherten Plane', savedPlansDesc: 'Wenn angemeldet, mit Ihrem Profil verknupft; sonst in diesem Browser gespeichert.', liveEditArea: 'Live-Bearbeitungsbereich',
    liveEditDesc: 'In aktiven Sitzungen konnen Sie speichern/bearbeiten; veroffentlicht wird erst nach "abschlieBen".', noSavedPlans: 'Noch kein gespeicherter Plan.',
    livePlanBadge: 'Live-Plan', completedBadge: 'Abgeschlossen', continueToEdit: 'Stopps: {count} · Zum Fortsetzen klicken · {date}', completedSessions: 'Abgeschlossene Live-Sitzungen',
    clickToEdit: 'Stopps: {count} · Zum Bearbeiten klicken', cityNotFoundManual: 'Stadtposition nicht gefunden. Bitte Start und Ziel manuell eingeben.', cityLocationFetchFailed: 'Stadtposition konnte nicht abgerufen werden. Bitte Start und Ziel manuell eingeben.',
    browserGeoNotSupported: 'Ihr Browser unterstutzt keine Geolokalisierung.', geoPermissionDenied: 'Standortberechtigung verweigert oder Standort nicht verfugbar.', startEndRequired: 'Start und Ziel sind erforderlich. Sie konnen Text oder Lat,Lng eingeben.',
    planCreateFailed: 'Plan konnte nicht erstellt werden', saveSuccess: 'Plan gespeichert.', saveFailed: 'Plan konnte nicht gespeichert werden. Falls Tabelle fehlt, Migration ausfuhren.', loginRequiredForLive: 'Zum Starten eines Live-Plans bitte anmelden.',
    liveStarted: 'Live-Plan gestartet!', liveStartFailed: 'Live-Plan konnte nicht gestartet werden.', shareCopied: 'Freigabelink in Zwischenablage kopiert.', shareLinkPrefix: 'Freigabelink:', defaultStart: 'Start', defaultEnd: 'Letzter Stopp',
    currentLocationTitle: 'Meinen aktuellen Standort verwenden', sortOptions: { likes: 'Meiste Likes', shares: 'Meiste Shares', likes_shares: 'Likes + Shares', recent: 'Neueste Beitrage', route_proximity: 'Am nachsten zur Route' },
  },
  fr: {
    title: 'Plan de voyage rare', subtitle: 'Choisissez depart et arrivee, puis chargez automatiquement les publications rares le long de l\'itineraire.',
    stops: 'Nombre d\'arrets', sort: 'Tri', corridor: 'Corridor de route (km)', categories: 'Categories (selection multiple)', up: 'Haut', down: 'Bas',
    categoryPick: 'Choisir categorie', clear: 'Effacer', allCategories: 'Toutes les categories', selectedCategoryCount: '{count} categories selectionnees', allIncluded: 'Si rien n\'est selectionne, toutes les categories sont incluses',
    searchLabel: 'Mot-cle (optionnel)', searchPlaceholder: 'Exemple: antique, collection, figurine', nearbyFilter: 'Filtre a proximite (route OSRM + position actuelle)',
    useMyLocation: 'Utiliser ma position', nearbyRadius: 'Rayon a proximite (km)', locationReady: 'Position prete: {lat}, {lng}', preparingPlan: 'Preparation du plan...',
    createPlan: 'Creer un plan de voyage rare', openAllPins: 'Ouvrir tous les pins sociaux sur la carte', saving: 'Enregistrement...', savePlan: 'Enregistrer le plan', starting: 'Demarrage...',
    startLive: 'Demarrer plan live', createShareLink: 'Creer lien de partage', summaryTitle: 'Resume du plan', route: 'Itineraire:', distance: 'Distance:', duration: 'Duree:',
    foundPosts: 'Publications trouvees:', openRouteInGoogle: 'Ouvrir l\'itineraire complet dans Google Maps', fallbackRoute: 'Service de routage indisponible temporairement. Plan cree en mode ligne droite.',
    startPoint: 'Depart', destination: 'Arrivee', stop: 'Arret', rarePost: 'Publication rare', openPost: 'Ouvrir la publication', openOnMap: 'Ouvrir sur la carte',
    routeStops: 'Arrets de route ({count} selectionnes)', noLocationProvided: 'Position non specifiee', toRouteKm: 'km jusqu\'a la route', googleMaps: 'Google Maps',
    savedPlans: 'Mes plans enregistres', savedPlansDesc: 'Connecte: lie a votre profil, sinon stocke dans ce navigateur.', liveEditArea: 'Zone d\'edition live',
    liveEditDesc: 'Dans les sessions actives, vous pouvez modifier; publication seulement apres "terminer".', noSavedPlans: 'Aucun plan enregistre pour le moment.',
    livePlanBadge: 'Plan live', completedBadge: 'Termine', continueToEdit: 'Arrets: {count} · Cliquer pour continuer · {date}', completedSessions: 'Sessions live terminees',
    clickToEdit: 'Arrets: {count} · Cliquer pour modifier', cityNotFoundManual: 'Position de ville introuvable. Saisissez depart et arrivee manuellement.', cityLocationFetchFailed: 'Position de ville indisponible. Saisissez depart et arrivee manuellement.',
    browserGeoNotSupported: 'Votre navigateur ne prend pas en charge la geolocalisation.', geoPermissionDenied: 'Autorisation de localisation refusee ou position indisponible.', startEndRequired: 'Le depart et l\'arrivee sont requis. Vous pouvez saisir texte ou lat,lng.',
    planCreateFailed: 'Impossible de creer le plan', saveSuccess: 'Plan enregistre.', saveFailed: 'Impossible d\'enregistrer le plan. Lancez les migrations si la table manque.', loginRequiredForLive: 'Connectez-vous pour demarrer un plan live.',
    liveStarted: 'Plan live demarre !', liveStartFailed: 'Impossible de demarrer le plan live.', shareCopied: 'Lien de partage copie dans le presse-papiers.', shareLinkPrefix: 'Lien de partage:', defaultStart: 'Depart', defaultEnd: 'Dernier arret',
    currentLocationTitle: 'Utiliser ma position actuelle', sortOptions: { likes: 'Le plus de likes', shares: 'Le plus de partages', likes_shares: 'Likes + partages', recent: 'Publications recentes', route_proximity: 'Le plus proche de la route' },
  },
  es: {
    title: 'Plan de viaje raro', subtitle: 'Elige origen y destino y carga automaticamente publicaciones raras en la ruta.',
    stops: 'Numero de paradas', sort: 'Ordenar', corridor: 'Corredor de ruta (km)', categories: 'Categorias (seleccion multiple)', up: 'Arriba', down: 'Abajo',
    categoryPick: 'Seleccionar categoria', clear: 'Limpiar', allCategories: 'Todas las categorias', selectedCategoryCount: '{count} categorias seleccionadas', allIncluded: 'Si no seleccionas ninguna, se incluyen todas',
    searchLabel: 'Palabra clave (opcional)', searchPlaceholder: 'Ejemplo: antiguedad, coleccion, figura', nearbyFilter: 'Filtro cercanos (ruta OSRM + ubicacion actual)',
    useMyLocation: 'Usar mi ubicacion', nearbyRadius: 'Radio cercano (km)', locationReady: 'Ubicacion lista: {lat}, {lng}', preparingPlan: 'Preparando plan...',
    createPlan: 'Crear plan de viaje raro', openAllPins: 'Abrir todos los pines sociales en el mapa', saving: 'Guardando...', savePlan: 'Guardar plan', starting: 'Iniciando...',
    startLive: 'Iniciar plan en vivo', createShareLink: 'Crear enlace para compartir', summaryTitle: 'Resumen del plan', route: 'Ruta:', distance: 'Distancia:', duration: 'Duracion:',
    foundPosts: 'Publicaciones encontradas:', openRouteInGoogle: 'Abrir ruta completa en Google Maps', fallbackRoute: 'Servicio de rutas no disponible temporalmente. Se creo en modo linea recta.',
    startPoint: 'Inicio', destination: 'Destino', stop: 'Parada', rarePost: 'Publicacion rara', openPost: 'Abrir publicacion', openOnMap: 'Abrir en mapa',
    routeStops: 'Paradas de ruta ({count} seleccionadas)', noLocationProvided: 'Ubicacion no especificada', toRouteKm: 'km hasta la ruta', googleMaps: 'Google Maps',
    savedPlans: 'Mis planes guardados', savedPlansDesc: 'Si inicias sesion, se guarda en tu perfil; si no, en este navegador.', liveEditArea: 'Area de edicion en vivo',
    liveEditDesc: 'En sesiones activas puedes editar; solo se publica al pulsar "completar".', noSavedPlans: 'Aun no hay planes guardados.',
    livePlanBadge: 'Plan en vivo', completedBadge: 'Completado', continueToEdit: 'Paradas: {count} · Clic para continuar · {date}', completedSessions: 'Sesiones en vivo completadas',
    clickToEdit: 'Paradas: {count} · Clic para editar', cityNotFoundManual: 'No se encontro la ubicacion de la ciudad. Introduce origen y destino manualmente.', cityLocationFetchFailed: 'No se pudo obtener la ubicacion de la ciudad. Introduce origen y destino manualmente.',
    browserGeoNotSupported: 'Tu navegador no soporta geolocalizacion.', geoPermissionDenied: 'Permiso de ubicacion denegado o ubicacion no disponible.', startEndRequired: 'Origen y destino son obligatorios. Puedes ingresar texto o lat,lng.',
    planCreateFailed: 'No se pudo crear el plan', saveSuccess: 'Plan guardado.', saveFailed: 'No se pudo guardar el plan. Si falta la tabla, ejecuta migraciones.', loginRequiredForLive: 'Debes iniciar sesion para iniciar un plan en vivo.',
    liveStarted: 'Plan en vivo iniciado!', liveStartFailed: 'No se pudo iniciar el plan en vivo.', shareCopied: 'Enlace copiado al portapapeles.', shareLinkPrefix: 'Enlace para compartir:', defaultStart: 'Inicio', defaultEnd: 'Ultima parada',
    currentLocationTitle: 'Usar mi ubicacion actual', sortOptions: { likes: 'Mas likes', shares: 'Mas compartidos', likes_shares: 'Likes + compartidos', recent: 'Publicaciones mas recientes', route_proximity: 'Mas cerca de la ruta' },
  },
  ru: {
    title: 'Plan redkogo puteshestviya', subtitle: 'Vyberite start i finish, a redkie posty po marshrutu podgruzhatsya avtomaticheski.',
    stops: 'Kolichestvo ostanovok', sort: 'Sortirovka', corridor: 'Koridor marshruta (km)', categories: 'Kategorii (mul tiselect)', up: 'Vverkh', down: 'Vniz',
    categoryPick: 'Vybrat kategoriyu', clear: 'Ochistit', allCategories: 'Vse kategorii', selectedCategoryCount: 'Vybrano kategoriy: {count}', allIncluded: 'Esli nichego ne vybrano, vklyuchayutsya vse kategorii',
    searchLabel: 'Klyuchevoe slovo (neobyazatelno)', searchPlaceholder: 'Primer: antik, kollektsiya, figurka', nearbyFilter: 'Filtr ryadom (OSRM + tekushchaya lokatsiya)',
    useMyLocation: 'Ispolzovat moyu lokatsiyu', nearbyRadius: 'Radius ryadom (km)', locationReady: 'Lokatsiya gotova: {lat}, {lng}', preparingPlan: 'Podgotovka plana...',
    createPlan: 'Sozdat plan redkogo puteshestviya', openAllPins: 'Otkryt vse socialnye piny na karte', saving: 'Sohranenie...', savePlan: 'Sohranit plan', starting: 'Zapusk...',
    startLive: 'Zapustit live-plan', createShareLink: 'Sozdat ssylku', summaryTitle: 'Svodka plana', route: 'Marshrut:', distance: 'Rasstoyanie:', duration: 'Dlitelnost:',
    foundPosts: 'Naydeno postov:', openRouteInGoogle: 'Otkryt ves marshrut v Google Maps', fallbackRoute: 'Servis marshrutizatsii vremenno nedostupen. Plan postroen po pryamoy.',
    startPoint: 'Start', destination: 'Finish', stop: 'Stop', rarePost: 'Redkiy post', openPost: 'Otkryt post', openOnMap: 'Otkryt na karte',
    routeStops: 'Ostanovki marshruta ({count} vybrano)', noLocationProvided: 'Lokatsiya ne ukazana', toRouteKm: 'km do marshruta', googleMaps: 'Google Maps',
    savedPlans: 'Moi sohranennye plany', savedPlansDesc: 'Pri vhode privyazyvaetsya k profilyu, inache hranitsya v etom brauzere.', liveEditArea: 'Zona live-redaktirovaniya',
    liveEditDesc: 'V aktivnyh sessiyah mozhno redaktirovat; publikuetsya tolko posle "zavershit".', noSavedPlans: 'Poka net sohranennyh planov.',
    livePlanBadge: 'Live-plan', completedBadge: 'Zavershen', continueToEdit: 'Ostanovki: {count} · Kliknite chtoby prodolzhit · {date}', completedSessions: 'Zavershennye live-sessii',
    clickToEdit: 'Ostanovki: {count} · Kliknite chtoby redaktirovat', cityNotFoundManual: 'Ne udalos nayti lokatsiyu goroda. Vvedite start i finish vruchnuyu.', cityLocationFetchFailed: 'Ne udalos poluchit lokatsiyu goroda. Vvedite start i finish vruchnuyu.',
    browserGeoNotSupported: 'Vash brauzer ne podderzhivaet geolokatsiyu.', geoPermissionDenied: 'Dostup k geolokatsii zapreshchen ili lokatsiya nedostupna.', startEndRequired: 'Nuzhny start i finish. Mozhno vvesti tekst ili lat,lng.',
    planCreateFailed: 'Ne udalos sozdat plan', saveSuccess: 'Plan sohranen.', saveFailed: 'Ne udalos sohranit plan. Esli net tablicy, zapustite migracii.', loginRequiredForLive: 'Voydite, chtoby zapustit live-plan.',
    liveStarted: 'Live-plan zapushchen!', liveStartFailed: 'Ne udalos zapustit live-plan.', shareCopied: 'Ssylka skopirovana v буфер обмена.', shareLinkPrefix: 'Ssylka:', defaultStart: 'Start', defaultEnd: 'Poslednyaya ostanovka',
    currentLocationTitle: 'Ispolzovat tekushchuyu lokatsiyu', sortOptions: { likes: 'Bolshe vsego лайков', shares: 'Bolshe vsego repostov', likes_shares: 'Lajki + reposty', recent: 'Noveyshie posty', route_proximity: 'Blizhe vsego k marshrutu' },
  },
} as const

const localeToIntl: Record<string, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  ru: 'ru-RU',
}

function makeCircleIcon(color: string, label?: string) {
  const size = 32
  const inner = label
    ? `<span style="font-size:10px;font-weight:700;color:#fff;line-height:1">${label}</span>`
    : ''
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center">${inner}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

const startIcon = makeCircleIcon('#0f172a')
const endIcon = makeCircleIcon('#b91c1c')

function isLatLngLike(value: string): boolean {
  return /^\s*-?\d+(?:\.\d+)?\s*[,;]\s*-?\d+(?:\.\d+)?\s*$/.test(value)
}

function getLastStopLabel(result: PlannerResponse | null): string {
  if (!result || result.posts.length === 0) return ''
  const last = result.posts[result.posts.length - 1]
  return (
    last.location_name ||
    [last.district, last.city, last.country].filter(Boolean).join(', ') ||
    last.title ||
    ''
  )
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }, [map, positions])
  return null
}

export default function RareTravelPlanner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useCurrentLocale()
  const t = (PLANNER_TEXT as any)[locale] || PLANNER_TEXT.tr
  const dateLocale = localeToIntl[locale] || 'tr-TR'

  const sortOptions = SORT_OPTION_VALUES.map((value) => ({
    value,
    label: t.sortOptions[value] || PLANNER_TEXT.tr.sortOptions[value],
  }))

  const [fromLocation, setFromLocation] = useState<{ name: string; latitude: number | null; longitude: number | null; city: string } | null>({ name: 'Istanbul', latitude: null, longitude: null, city: '' })
  const [toLocation, setToLocation] = useState<{ name: string; latitude: number | null; longitude: number | null; city: string } | null>({ name: 'Ankara', latitude: null, longitude: null, city: '' })
  const [stops, setStops] = useState(5)
  const [sortBy, setSortBy] = useState<string>('likes_shares')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [corridorKm, setCorridorKm] = useState(12)
  const [nearbyOnly, setNearbyOnly] = useState(false)
  const [nearRadiusKm, setNearRadiusKm] = useState(25)
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const hasAutoRun = useRef(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PlannerResponse | null>(null)
  const [activeQuery, setActiveQuery] = useState('')
  const [initialCategoryOptions, setInitialCategoryOptions] = useState<string[]>([])
  const [savedPlans, setSavedPlans] = useState<SavedTravelPlan[]>([])
  const [activeLivePlans, setActiveLivePlans] = useState<ActiveLivePlan[]>([])
  const [savingPlan, setSavingPlan] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [liveSessionActive, setLiveSessionActive] = useState(false)
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null)
  const [liveSessionStarting, setLiveSessionStarting] = useState(false)
  const categoryMenuRef = useRef<HTMLDivElement | null>(null)

  const categoryOptions = useMemo(() => {
    const options = result?.categoryOptions?.length ? result.categoryOptions : initialCategoryOptions
    const missingSelected = selectedCategories.filter((item) => !options.includes(item))
    return [...missingSelected, ...options]
  }, [result, initialCategoryOptions, selectedCategories])

  const mapCenter = useMemo<[number, number]>(() => {
    if (result?.route?.from) {
      return [result.route.from.lat, result.route.from.lng]
    }
    return [39, 35]
  }, [result])

  const polylinePositions = useMemo<[number, number][]>(() => {
    return (result?.route.geometry || []).map((point) => [point.lat, point.lng])
  }, [result])

  const fitBoundsPositions = useMemo<[number, number][]>(() => {
    if (!result) return []
    const pts: [number, number][] = [
      [result.route.from.lat, result.route.from.lng],
      [result.route.to.lat, result.route.to.lng],
      ...result.posts.map((p): [number, number] => [p.latitude, p.longitude]),
    ]
    return pts
  }, [result])

  const categorySummary = useMemo(() => {
    if (selectedCategories.length === 0) return t.allCategories
    if (selectedCategories.length === 1) return selectedCategories[0]
    if (selectedCategories.length === 2) return `${selectedCategories[0]}, ${selectedCategories[1]}`
    return `${selectedCategories[0]}, ${selectedCategories[1]} +${selectedCategories.length - 2}`
  }, [selectedCategories, t.allCategories])

  const activeEditableSessions = useMemo(
    () => activeLivePlans.filter((item) => item.status === 'active'),
    [activeLivePlans],
  )

  const completedLiveSessions = useMemo(
    () => activeLivePlans.filter((item) => item.status === 'completed'),
    [activeLivePlans],
  )

  const buildPlannerParams = () => {
    const params = new URLSearchParams()
    params.set('from', fromLocation?.name || '')
    if (toLocation?.name) params.set('to', toLocation.name)
    if (fromLocation?.latitude != null && fromLocation?.longitude != null) {
      params.set('fromLat', String(fromLocation.latitude))
      params.set('fromLng', String(fromLocation.longitude))
    }
    if (toLocation?.latitude != null && toLocation?.longitude != null) {
      params.set('toLat', String(toLocation.latitude))
      params.set('toLng', String(toLocation.longitude))
    }
    params.set('stops', String(stops))
    params.set('sortBy', sortBy)
    params.set('corridorKm', String(corridorKm))
    for (const category of selectedCategories) params.append('category', category)
    if (searchText.trim()) params.set('q', searchText.trim())
    if (nearbyOnly) params.set('nearbyOnly', '1')
    if (nearbyOnly && currentLocation) {
      params.set('currentLat', String(currentLocation.lat))
      params.set('currentLng', String(currentLocation.lng))
      params.set('nearRadiusKm', String(nearRadiusKm))
    }
    for (const postId of selectedPostIds) {
      params.append('postId', postId)
    }
    return params
  }

  const loadSavedPlans = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const localRaw = localStorage.getItem('rare_travel_plans_local')
      const localPlans = localRaw ? (JSON.parse(localRaw) as SavedTravelPlan[]) : []
      setSavedPlans(localPlans.slice(0, 10))
      setActiveLivePlans([])
      return
    }

    const { data, error: fetchErr } = await supabase
      .from('rare_travel_plans')
      .select('id, title, from_location, to_location, query_params, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (fetchErr) {
      const localRaw = localStorage.getItem('rare_travel_plans_local')
      const localPlans = localRaw ? (JSON.parse(localRaw) as SavedTravelPlan[]) : []
      setSavedPlans(localPlans.slice(0, 10))
    } else {
      setSavedPlans((data || []) as SavedTravelPlan[])
    }

    const { data: liveRows } = await supabase
      .from('live_travel_sessions')
      .select('id, plan_id, status, started_at')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(20)

    const liveSessionRows = (liveRows || []) as Array<{ id: string; plan_id: string; status: 'active' | 'completed'; started_at: string }>
    if (liveSessionRows.length === 0) {
      setActiveLivePlans([])
      return
    }

    const sessionIds = liveSessionRows.map((row) => row.id)
    const { data: liveTripRows } = await supabase
      .from('live_trip_posts')
      .select('id, session_id')
      .in('session_id', sessionIds)

    const stopCountBySession = new Map<string, number>()
    for (const row of liveTripRows || []) {
      const sessionId = (row as any).session_id as string
      stopCountBySession.set(sessionId, (stopCountBySession.get(sessionId) || 0) + 1)
    }

    const planIds = Array.from(new Set(liveSessionRows.map((row) => row.plan_id).filter(Boolean)))
    const { data: planRows } = await supabase
      .from('rare_travel_plans')
      .select('id, title, from_location, to_location')
      .in('id', planIds)

    const planMap = new Map((planRows || []).map((row: any) => [row.id as string, row]))
    const mergedRaw = liveSessionRows
      .map((sessionRow) => {
        const planRow = planMap.get(sessionRow.plan_id)
        if (!planRow) return null
        return {
          session_id: sessionRow.id,
          plan_id: sessionRow.plan_id,
          status: sessionRow.status,
          title: planRow.title || `${planRow.from_location} -> ${planRow.to_location}`,
          from_location: planRow.from_location,
          to_location: planRow.to_location,
          started_at: sessionRow.started_at,
          stops_count: stopCountBySession.get(sessionRow.id) || 0,
        } as ActiveLivePlan
      })
      .filter(Boolean) as ActiveLivePlan[]

    const merged = mergedRaw.sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    )

    setActiveLivePlans(merged)
  }

  useEffect(() => {
    const loadInitialCategories = async () => {
      setInitialCategoryOptions(TRAVEL_CATEGORIES)
    }

    loadInitialCategories()
    loadSavedPlans()
  }, [])

  useEffect(() => {
    let disposed = false
    let rarePlansChannel: ReturnType<typeof supabase.channel> | null = null
    let liveSessionsChannel: ReturnType<typeof supabase.channel> | null = null

    const refresh = () => {
      if (disposed) return
      loadSavedPlans()
    }

    const handleFocus = () => refresh()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || disposed) return

      rarePlansChannel = supabase
        .channel(`rare-travel-plans-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rare_travel_plans',
            filter: `user_id=eq.${user.id}`,
          },
          () => refresh(),
        )
        .subscribe()

      liveSessionsChannel = supabase
        .channel(`live-travel-sessions-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_travel_sessions',
            filter: `user_id=eq.${user.id}`,
          },
          () => refresh(),
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      disposed = true
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
      rarePlansChannel?.unsubscribe()
      liveSessionsChannel?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const postIdsFromQuery = searchParams.getAll('postId').filter(Boolean)

    if (postIdsFromQuery.length > 0) {
      setSelectedPostIds(postIdsFromQuery)
    }

    // --- Secim sayfasindan gelme (postId var): query aynen korunur ---
    if (fromParam && postIdsFromQuery.length > 0) {
      setFromLocation({
        name: fromParam,
        latitude: Number(searchParams.get('fromLat')) || null,
        longitude: Number(searchParams.get('fromLng')) || null,
        city: '',
      })
      setToLocation({
        name: toParam || '',
        latitude: Number(searchParams.get('toLat')) || null,
        longitude: Number(searchParams.get('toLng')) || null,
        city: '',
      })
      setStops(Math.max(1, Math.min(12, Number(searchParams.get('stops') || 5))))
      setSortBy(searchParams.get('sortBy') || 'likes_shares')
      setCorridorKm(Math.max(1, Math.min(40, Number(searchParams.get('corridorKm') || 12))))
      const categoriesFromQuery = searchParams.getAll('category')
      setSelectedCategories(categoriesFromQuery.length > 0 ? categoriesFromQuery : (searchParams.get('category') ? [searchParams.get('category') as string] : []))
      setSearchText(searchParams.get('q') || '')
      setNearbyOnly(searchParams.get('nearbyOnly') === '1' || searchParams.get('nearbyOnly') === 'true')
      const nearLat = Number(searchParams.get('currentLat'))
      const nearLng = Number(searchParams.get('currentLng'))
      if (Number.isFinite(nearLat) && Number.isFinite(nearLng)) {
        setCurrentLocation({ lat: nearLat, lng: nearLng })
      }
      setNearRadiusKm(Math.max(1, Math.min(150, Number(searchParams.get('nearRadiusKm') || 25))))
      setActiveQuery(searchParams.toString())
      return
    }

    // --- Tam URL (from + to var): normal akış ---
    if (fromParam && toParam) {
      setFromLocation({
        name: fromParam,
        latitude: Number(searchParams.get('fromLat')) || null,
        longitude: Number(searchParams.get('fromLng')) || null,
        city: '',
      })
      setToLocation({
        name: toParam,
        latitude: Number(searchParams.get('toLat')) || null,
        longitude: Number(searchParams.get('toLng')) || null,
        city: '',
      })
      setStops(Math.max(1, Math.min(12, Number(searchParams.get('stops') || 5))))
      setSortBy(searchParams.get('sortBy') || 'likes_shares')
      setCorridorKm(Math.max(1, Math.min(40, Number(searchParams.get('corridorKm') || 12))))
      const categoriesFromQuery = searchParams.getAll('category')
      setSelectedCategories(categoriesFromQuery.length > 0 ? categoriesFromQuery : (searchParams.get('category') ? [searchParams.get('category') as string] : []))
      setSearchText(searchParams.get('q') || '')
      setNearbyOnly(searchParams.get('nearbyOnly') === '1' || searchParams.get('nearbyOnly') === 'true')
      const nearLat = Number(searchParams.get('currentLat'))
      const nearLng = Number(searchParams.get('currentLng'))
      if (Number.isFinite(nearLat) && Number.isFinite(nearLng)) {
        setCurrentLocation({ lat: nearLat, lng: nearLng })
      }
      setNearRadiusKm(Math.max(1, Math.min(150, Number(searchParams.get('nearRadiusKm') || 25))))
      setActiveQuery(searchParams.toString())
      return
    }

    // --- Kategori sayfasından gelme: sadece from (+category) var, to yok ---
    if (fromParam && !toParam && !hasAutoRun.current) {
      hasAutoRun.current = true
      const categoryParam = searchParams.get('category')
      if (categoryParam) {
        setSelectedCategories([categoryParam])
      }
      setFromLocation({
        name: fromParam,
        latitude: Number(searchParams.get('fromLat')) || null,
        longitude: Number(searchParams.get('fromLng')) || null,
        city: '',
      })

      const geocodeAndRun = async () => {
        setLoading(true)
        setError('')
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(fromParam)}&accept-language=tr`,
            { headers: { 'User-Agent': 'spotitforme/1.0' } }
          )
          const geoData = await res.json()
          if (!Array.isArray(geoData) || geoData.length === 0) {
            setError(t.cityNotFoundManual)
            setLoading(false)
            return
          }
          const lat = Number(geoData[0].lat)
          const lng = Number(geoData[0].lon)

          setFromLocation({
            name: fromParam,
            latitude: lat,
            longitude: lng,
            city: '',
          })
          setToLocation({
            name: fromParam,
            latitude: lat,
            longitude: lng,
            city: '',
          })
          setCurrentLocation({ lat, lng })
          setNearbyOnly(true)
          setNearRadiusKm(30)

          const params = new URLSearchParams()
          params.set('from', fromParam)
          params.set('to', fromParam)
          params.set('fromLat', String(lat))
          params.set('fromLng', String(lng))
          params.set('toLat', String(lat))
          params.set('toLng', String(lng))
          params.set('stops', '5')
          params.set('sortBy', 'likes_shares')
          params.set('corridorKm', '12')
          params.set('nearbyOnly', '1')
          params.set('currentLat', String(lat))
          params.set('currentLng', String(lng))
          params.set('nearRadiusKm', '30')
          if (categoryParam) params.append('category', categoryParam)

          setActiveQuery(params.toString())
          router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        } catch {
          setError(t.cityLocationFetchFailed)
          setLoading(false)
        }
      }

      geocodeAndRun()
    }
  }, [searchParams])

  useEffect(() => {
    if (!activeQuery) return
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/rare-travel-plan?${activeQuery}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Plan olusturulamadi')
        setResult(data)
      } catch (err: any) {
        setError(err?.message || 'Plan olusturulamadi')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [activeQuery])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!categoryMenuRef.current) return
      if (!categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const toggleCategory = (nextCategory: string) => {
    setSelectedCategories((prev) =>
      prev.includes(nextCategory)
        ? prev.filter((item) => item !== nextCategory)
        : [...prev, nextCategory],
    )
  }

  const requestCurrentLocation = () => {
    setError('')
    if (!navigator.geolocation) {
      setError(t.browserGeoNotSupported)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => setError(t.geoPermissionDenied),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const runPlan = async () => {
    setLoading(true)
    setError('')
    setSaveMessage('')

    try {
      // fromLocation ve toLocation kontrolü
      if (!fromLocation?.name?.trim() || !toLocation?.name?.trim()) {
        setError(t.startEndRequired)
        setLoading(false)
        return
      }
      const params = buildPlannerParams()
      const query = params.toString()
      setActiveQuery(query)
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })

      const res = await fetch(`/api/rare-travel-plan?${query}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || t.planCreateFailed)
      setResult(data)

      if (selectedCategories.length === 0 && Array.isArray(data?.categoryOptions) && data.categoryOptions.length > 0) {
        setSelectedCategories([])
      }
    } catch (err: any) {
      // Backend "Başlangıç ve varış konumu gerekli" diyorsa, kullanıcıya metinle de plan oluşturulabileceğini belirt
      if (err?.message?.includes('Baslangic ve varis konumu gerekli')) {
        setError(t.startEndRequired)
      } else {
        setError(err?.message || t.planCreateFailed)
      }
    } finally {
      setLoading(false)
    }
  }

  const savePlan = async () => {
    setSaveMessage('')
    setSavingPlan(true)
    try {
      const params = buildPlannerParams().toString()
      const fromInput = fromLocation?.name?.trim() || ''
      const toInput = toLocation?.name?.trim() || ''
      const fromLabel = (fromInput && !isLatLngLike(fromInput) ? fromInput : (result?.meta?.from || fromInput || t.defaultStart))
      const lastStopLabel = getLastStopLabel(result)
      const toLabel =
        (toInput && !isLatLngLike(toInput)
          ? toInput
          : (result?.meta?.to || lastStopLabel || toInput || t.defaultEnd))
      const title = `${fromLabel} -> ${toLabel}`
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const payload = {
          user_id: user.id,
          title,
          from_location: fromLabel,
          to_location: toLabel,
          query_params: params,
        }

        const { error: insertErr } = await supabase.from('rare_travel_plans').insert(payload)
        if (insertErr) throw insertErr
      } else {
        const localRaw = localStorage.getItem('rare_travel_plans_local')
        const localPlans = localRaw ? (JSON.parse(localRaw) as SavedTravelPlan[]) : []
        const next = [
          {
            id: crypto.randomUUID(),
            title,
            from_location: fromLabel,
            to_location: toLabel,
            query_params: params,
            created_at: new Date().toISOString(),
          },
          ...localPlans,
        ].slice(0, 20)
        localStorage.setItem('rare_travel_plans_local', JSON.stringify(next))
      }

      setSaveMessage(t.saveSuccess)
      await loadSavedPlans()
    } catch {
      setSaveMessage(t.saveFailed)
    } finally {
      setSavingPlan(false)
    }
  }

  // Duraksız (boş) canlı plan başlat
  const startLiveSessionEmpty = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError(t.loginRequiredForLive)
      return
    }
    setLiveSessionStarting(true)
    setSaveMessage('')
    try {
      const params = buildPlannerParams().toString()
      const fromInput = fromLocation?.name?.trim() || ''
      const toInput = toLocation?.name?.trim() || ''
      const fromLabel = fromInput && !isLatLngLike(fromInput)
        ? fromInput
        : t.defaultStart
      const toLabel = toInput && !isLatLngLike(toInput)
        ? toInput
        : t.defaultEnd
      const title = `${fromLabel} -> ${toLabel}`

      const { data: planData, error: planErr } = await supabase
        .from('rare_travel_plans')
        .insert({
          user_id: user.id,
          title,
          from_location: fromLabel,
          to_location: toLabel,
          query_params: params,
        })
        .select('id')
        .single()
      if (planErr) throw planErr

      const { data: sessionData, error: sessionErr } = await supabase
        .from('live_travel_sessions')
        .insert({
          user_id: user.id,
          plan_id: planData.id,
          status: 'active',
        })
        .select('id')
        .single()
      if (sessionErr) throw sessionErr

      setLiveSessionId(sessionData.id)
      setLiveSessionActive(true)
      setSaveMessage(t.liveStarted)
      await loadSavedPlans()
      setTimeout(() => {
        router.push(`/rare-travel-plan/live/${sessionData.id}`)
      }, 800)
    } catch (err: any) {
      setError(err?.message || t.liveStartFailed)
    } finally {
      setLiveSessionStarting(false)
    }
  }

  // Planlı (duraklı) canlı plan başlat
  const startLiveSessionWithStops = async () => {
    if (!result) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError(t.loginRequiredForLive)
      return
    }
    setLiveSessionStarting(true)
    setSaveMessage('')
    try {
      const params = buildPlannerParams().toString()
      const fromInput = fromLocation?.name?.trim() || ''
      const toInput = toLocation?.name?.trim() || ''
      const fromLabel = fromInput && !isLatLngLike(fromInput)
        ? fromInput
        : result?.meta?.from || fromInput || t.defaultStart
      const lastStopLabel = getLastStopLabel(result)
      const toLabel = toInput && !isLatLngLike(toInput)
        ? toInput
        : result?.meta?.to || lastStopLabel || toInput || t.defaultEnd
      const title = `${fromLabel} -> ${toLabel}`

      // Önce planı kaydet
      const { data: planData, error: planErr } = await supabase
        .from('rare_travel_plans')
        .insert({
          user_id: user.id,
          title,
          from_location: fromLabel,
          to_location: toLabel,
          query_params: params,
        })
        .select('id')
        .single()
      if (planErr) throw planErr

      // Sonra canlı oturumu başlat
      const { data: sessionData, error: sessionErr } = await supabase
        .from('live_travel_sessions')
        .insert({
          user_id: user.id,
          plan_id: planData.id,
          status: 'active',
        })
        .select('id')
        .single()
      if (sessionErr) throw sessionErr

      // Durakları canlı oturumun session_id'si ile ekle
      for (const post of result.posts) {
        await supabase.from('live_trip_posts').insert({
          session_id: sessionData.id,
          user_id: user.id,
          source_social_post_id: post.id,
          title: post.title,
          description: post.description,
          image_url: post.image_url,
          category: post.category,
          location_name: post.location_name,
          city: post.city,
          latitude: post.latitude,
          longitude: post.longitude,
          visit_time: null,
          visibility: 'followers',
          sort_order: post.stop_index,
        })
      }

      setLiveSessionId(sessionData.id)
      setLiveSessionActive(true)
      setSaveMessage(t.liveStarted)
      await loadSavedPlans()
      setTimeout(() => {
        router.push(`/rare-travel-plan/live/${sessionData.id}`)
      }, 800)
    } catch (err: any) {
      setError(err?.message || t.liveStartFailed)
    } finally {
      setLiveSessionStarting(false)
    }
  }

  const sharePlan = async () => {
    setSaveMessage('')
    const params = buildPlannerParams().toString()
    const url = `${window.location.origin}${pathname}?${params}`
    try {
      await navigator.clipboard.writeText(url)
      setSaveMessage(t.shareCopied)
    } catch {
      setSaveMessage(`${t.shareLinkPrefix} ${url}`)
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-4 md:p-5">
        <h2 className="text-lg font-bold text-gray-900">{t.title}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {t.subtitle}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <LocationSelector
              onLocationSelect={(loc) => setFromLocation({
                name: loc.address || loc.name,
                latitude: loc.latitude,
                longitude: loc.longitude,
                city: loc.city || ''
              })}
              initialLocation={fromLocation?.name || ''}
              required
              // Başlangıç için otomatik konum ve öneri aktif
              showQuickLocations={false}
            />
          </div>
          <div>
            <LocationSelector
              onLocationSelect={(loc) => setToLocation({
                name: loc.address || loc.name,
                latitude: loc.latitude,
                longitude: loc.longitude,
                city: loc.city || ''
              })}
              initialLocation={toLocation?.name || ''}
              required
              // Varış için otomatik konum ve örnek girişler kapalı, sadece tamamlama
              showCurrentLocation={false}
              showQuickLocations={false}
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            {t.stops}
            <input
              type="number"
              min={1}
              max={12}
              value={stops}
              onChange={(e) => setStops(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-emerald-100 focus:border-emerald-400 focus:ring-2"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            {t.sort}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-emerald-100 focus:border-emerald-400 focus:ring-2"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            {t.corridor}
            <input
              type="number"
              min={1}
              max={40}
              value={corridorKm}
              onChange={(e) => setCorridorKm(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-emerald-100 focus:border-emerald-400 focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            {t.categories}
            <div ref={categoryMenuRef} className="relative mt-1">
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-sm outline-none ring-emerald-100 transition focus:border-emerald-400 focus:ring-2"
              >
                <span className={selectedCategories.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {categorySummary}
                </span>
                <span className="ml-3 text-xs text-gray-400">{categoryMenuOpen ? t.up : t.down}</span>
              </button>

              {categoryMenuOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                  <div className="mb-2 flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{t.categoryPick}</p>
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      {t.clear}
                    </button>
                  </div>

                  <div className="max-h-56 space-y-1 overflow-auto pr-1">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedCategories.length === 0}
                        onChange={() => setSelectedCategories([])}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{t.allCategories}</span>
                    </label>

                    {categoryOptions.map((cat) => {
                      const isSelected = selectedCategories.includes(cat)
                      return (
                        <label key={cat} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCategory(cat)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{cat}</span>
                        </label>
                      )
                    })}
                  </div>

                  <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
                    {selectedCategories.length > 0
                      ? t.selectedCategoryCount.replace('{count}', String(selectedCategories.length))
                      : t.allIncluded}
                  </p>
                </div>
              )}
            </div>
          </label>

          <label className="text-sm font-medium text-gray-700">
            {t.searchLabel}
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-emerald-100 focus:border-emerald-400 focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={nearbyOnly}
              onChange={(e) => setNearbyOnly(e.target.checked)}
            />
            {t.nearbyFilter}
          </label>

          {nearbyOnly && (
            <div className="mt-3 grid gap-2 md:grid-cols-[auto_1fr] md:items-end">
              <button
                type="button"
                onClick={requestCurrentLocation}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
              >
                {t.useMyLocation}
              </button>

              <label className="text-sm font-medium text-gray-700">
                {t.nearbyRadius}
                <input
                  type="number"
                  min={1}
                  max={150}
                  value={nearRadiusKm}
                  onChange={(e) => setNearRadiusKm(Math.max(1, Math.min(150, Number(e.target.value) || 1)))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-emerald-100 focus:border-emerald-400 focus:ring-2"
                />
              </label>
            </div>
          )}

          {currentLocation && nearbyOnly && (
            <p className="mt-2 text-xs text-gray-500">
              {t.locationReady
                .replace('{lat}', currentLocation.lat.toFixed(5))
                .replace('{lng}', currentLocation.lng.toFixed(5))}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runPlan}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {loading ? t.preparingPlan : t.createPlan}
          </button>

          <Link
            href="/rare-travel-map"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t.openAllPins}
          </Link>

          <button
            type="button"
            onClick={savePlan}
            disabled={savingPlan}
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
          >
            {savingPlan ? t.saving : t.savePlan}
          </button>

          {/* Plan yoksa üstte, plan varsa aşağıda buton */}
          {!result && (
            <button
              type="button"
              onClick={startLiveSessionEmpty}
              disabled={liveSessionStarting}
              className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {liveSessionStarting ? t.starting : `🔴 ${t.startLive}`}
            </button>
          )}
          {result && (
            <button
              type="button"
              onClick={startLiveSessionWithStops}
              disabled={liveSessionStarting}
              className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {liveSessionStarting ? t.starting : `🔴 ${t.startLive}`}
            </button>
          )}

          <button
            type="button"
            onClick={sharePlan}
            className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            {t.createShareLink}
          </button>
        </div>

        {saveMessage && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">{saveMessage}</p>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
      </div>

      {result && (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
            <h3 className="text-base font-bold text-gray-900">{t.summaryTitle}</h3>
            <div className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-4">
              <p><span className="font-semibold">{t.route}</span> {result.meta.from} {'->'} {result.meta.to}</p>
              <p><span className="font-semibold">{t.distance}</span> {result.meta.routeDistanceKm} km</p>
              <p><span className="font-semibold">{t.duration}</span> ~{result.meta.routeDurationMin} dk</p>
              <p><span className="font-semibold">{t.foundPosts}</span> {result.meta.foundPosts}</p>
            </div>
            {result.posts.length > 0 && (() => {
              const origin = `${result.route.from.lat},${result.route.from.lng}`
              const destination = `${result.route.to.lat},${result.route.to.lng}`
              const waypoints = result.posts
                .slice(0, 23) // Google Maps max 23 waypoint
                .map((p) => `${p.latitude},${p.longitude}`)
                .join('|')
              const gmUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`
              return (
                <a
                  href={gmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <span>🗺️</span> {t.openRouteInGoogle}
                </a>
              )
            })()}
            {result.meta.routeIsFallback && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {t.fallbackRoute}
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="h-[420px] w-full">
              <MapContainer center={mapCenter} zoom={6} className="h-full w-full" scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds positions={fitBoundsPositions} />

                {polylinePositions.length > 1 && (
                  <Polyline positions={polylinePositions} pathOptions={{ color: '#059669', weight: 4, opacity: 0.85 }} />
                )}

                <Marker position={[result.route.from.lat, result.route.from.lng]} icon={startIcon}>
                  <Popup>{t.startPoint}</Popup>
                </Marker>

                <Marker position={[result.route.to.lat, result.route.to.lng]} icon={endIcon}>
                  <Popup>{t.destination}</Popup>
                </Marker>

                {result.posts.map((post) => (
                  <Marker
                    key={`post-${post.id}`}
                    position={[post.latitude, post.longitude]}
                    icon={makeCircleIcon('#f59e0b', String(post.stop_index))}
                  >
                    <Popup>
                      <div className="w-48">
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title || t.rarePost} className="h-24 w-full rounded-md object-cover" loading="lazy" />
                        ) : null}
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-500">{t.stop} {post.stop_index}</p>
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">{post.title || t.rarePost}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{[post.city, post.location_name, post.category].filter(Boolean).join(' · ')}</p>
                        <p className="mt-0.5 text-xs text-gray-600">❤️ {post.likes_count} | 🔁 {post.shares_count} | {post.distance_to_route_km} km</p>
                        <div className="mt-2 flex items-center gap-2">
                          <a href={buildSocialPath(post.id, post.title || post.description || '')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">{t.openPost}</a>
                          <span className="text-gray-300">|</span>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${post.latitude},${post.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">{t.openOnMap}</a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
            <h3 className="text-base font-bold text-gray-900">{t.routeStops.replace('{count}', String(result.posts.length))}</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {result.posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title || t.rarePost} className="h-40 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-gray-100">
                      <span className="text-3xl font-bold text-amber-400">{post.stop_index}</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-500">{t.stop} {post.stop_index}</p>
                    <p className="line-clamp-2 text-sm font-semibold text-gray-900">{post.title || t.rarePost}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {[post.city, post.location_name, post.category].filter(Boolean).join(' · ') || t.noLocationProvided}
                    </p>
                    <p className="mt-2 text-xs text-gray-600">
                      ❤️ {post.likes_count} &nbsp;🔁 {post.shares_count} &nbsp;📍 {post.distance_to_route_km} {t.toRouteKm}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={buildSocialPath(post.id, post.title || post.description || '')}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        {t.openPost}
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${post.latitude},${post.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        {t.googleMaps}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <h3 className="text-base font-bold text-gray-900">{t.savedPlans}</h3>
        <p className="mt-1 text-xs text-gray-500">{t.savedPlansDesc}</p>

        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t.liveEditArea}</p>
          <p className="mt-1 text-xs text-emerald-800">{t.liveEditDesc}</p>
        </div>

        <div className="mt-3 space-y-2">
          {activeEditableSessions.length === 0 && savedPlans.length === 0 && (
            <p className="text-sm text-gray-500">{t.noSavedPlans}</p>
          )}
          {activeEditableSessions.map((plan) => (
            <button
              key={plan.session_id}
              type="button"
              onClick={() => router.push(`/rare-travel-plan/live/${plan.session_id}`)}
              className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-left hover:bg-red-100"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{plan.title}</p>
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t.livePlanBadge}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">{plan.from_location} {'->'} {plan.to_location}</p>
              <p className="mt-1 text-xs font-medium text-red-700">{t.continueToEdit.replace('{count}', String(plan.stops_count)).replace('{date}', new Date(plan.started_at).toLocaleString(dateLocale))}</p>
            </button>
          ))}

          {completedLiveSessions.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t.completedSessions}</p>
              <div className="space-y-2">
                {completedLiveSessions.map((plan) => (
                  <button
                    key={plan.session_id}
                    type="button"
                    onClick={() => router.push(`/rare-travel-plan/live/${plan.session_id}`)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:bg-slate-100"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{plan.title}</p>
                      <span className="rounded-full bg-slate-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t.completedBadge}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{plan.from_location} {'->'} {plan.to_location}</p>
                    <p className="mt-1 text-xs font-medium text-slate-700">{t.clickToEdit.replace('{count}', String(plan.stops_count))}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {savedPlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => router.push(`${pathname}?${plan.query_params}`)}
              className="w-full rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50"
            >
              <p className="text-sm font-semibold text-gray-900">{plan.title}</p>
              <p className="mt-1 text-xs text-gray-600">{new Date(plan.created_at).toLocaleString(dateLocale)}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

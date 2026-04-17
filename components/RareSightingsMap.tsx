'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { buildRareSightingPath, buildSocialPath } from '@/lib/sighting-slug'
import { findCategoryByValue, getCitySlug } from '@/lib/social-categories'

type RareItem = {
  id: string
  title: string | null
  description: string | null
  country: string | null
  city: string | null
  district: string | null
  location_name: string | null
  category: string | null
  marketplace: string | null
  seller_name: string | null
  source_channel: string | null
  price: number | null
  latitude: number | null
  longitude: number | null
  image_url: string | null
  photo_url: string | null
  link_preview_image: string | null
  created_at: string
}

type Filters = {
  searchText: string
  country: string
  city: string
  district: string
  category: string
  marketplace: string
  hasPhoto: 'all' | 'with' | 'without'
  minPrice: string
  maxPrice: string
  startDate: string
  endDate: string
  sortBy: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
}

type ViewMode = 'pins' | 'city_clusters'
type ClusterLevel = 'country' | 'city' | 'district' | 'location'

type CityCluster = {
  key: string
  level: ClusterLevel
  country: string | null
  city: string | null
  district: string | null
  location_name: string | null
  latitude: number
  longitude: number
  count: number
  childClusterCount: number
  items: RareItem[]
}

type MapBounds = {
  north: number
  south: number
  east: number
  west: number
} | null

type MapFocusTarget = {
  lat: number
  lng: number
  zoom: number
} | null

type RareSightingsMapProps = {
  channel?: 'physical' | 'virtual' | 'social'
}

const DEFAULT_CENTER: [number, number] = [39.0, 35.0]
const DEFAULT_FILTERS: Filters = {
  searchText: '',
  country: 'all',
  city: 'all',
  district: 'all',
  category: 'all',
  marketplace: 'all',
  hasPhoto: 'all',
  minPrice: '',
  maxPrice: '',
  startDate: '',
  endDate: '',
  sortBy: 'newest',
}

const QUERY_KEYS = {
  searchText: 'q',
  country: 'co',
  city: 'ci',
  district: 'di',
  category: 'ca',
  marketplace: 'mk',
  hasPhoto: 'hp',
  minPrice: 'min',
  maxPrice: 'max',
  startDate: 'sd',
  endDate: 'ed',
  sortBy: 's',
  view: 'v',
  visible: 'vis',
} as const

// Next + Leaflet ortamında default marker ikonlarını elle tanımla.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function clamp(val: number, min: number, max: number) { return Math.max(min, Math.min(max, val)) }

function buildItemDetailPath(item: RareItem) {
  const title = item.title || item.description || ''
  return item.source_channel === 'social'
    ? buildSocialPath(item.id, title)
    : buildRareSightingPath(item.id, title)
}

function createClusterIcon(level: ClusterLevel, count: number, currentZoom: number, label?: string | null) {
  const safeCount = count > 999 ? '999+' : String(count)
  const normalizedLabel = (label || '').trim()
  const displayLabel = normalizedLabel.length > 14 ? `${normalizedLabel.slice(0, 14)}...` : normalizedLabel
  const showLabel = Boolean(displayLabel) && (
    (level === 'country' && currentZoom >= 6) ||
    (level === 'city' && currentZoom >= 8)
  )

  let w: number, h: number
  if (showLabel) {
    // İsimli pill — sabit boyut
    w = level === 'country' ? 90 : 80
    h = level === 'country' ? 54 : 48
  } else {
    // Zoom'a göre yumuşak interpolasyon — yuvarlak
    let d: number
    if (level === 'country') {
      // zoom 1-5: 20px → 34px
      d = Math.round(clamp(20 + (currentZoom - 1) * 3.5, 20, 34))
    } else if (level === 'city') {
      // zoom 5-8: 18px → 30px
      d = Math.round(clamp(18 + Math.max(0, currentZoom - 5) * 4, 18, 30))
    } else if (level === 'district') {
      // zoom 8-12: 22px → 36px
      d = Math.round(clamp(22 + Math.max(0, currentZoom - 8) * 3.5, 22, 36))
    } else {
      // location, zoom 12-16: 20px → 30px
      d = Math.round(clamp(20 + Math.max(0, currentZoom - 12) * 2.5, 20, 30))
    }
    w = d; h = d
  }

  const fontSize = showLabel ? '0.8rem' : w >= 30 ? '0.72rem' : w >= 24 ? '0.65rem' : '0.58rem'
  // Görsel boyuttan bağımsız min 44px tıklama alanı
  const hitW = Math.max(w, 44)
  const hitH = Math.max(h, 44)
  const anchor: [number, number] = [hitW / 2, hitH / 2]

  return L.divIcon({
    className: 'rare-cluster-icon-wrapper',
    html: `
      <div style="width:${hitW}px;height:${hitH}px;display:flex;align-items:center;justify-content:center;cursor:pointer">
        <div class="rare-cluster-icon rare-cluster-${level}" style="width:${w}px;height:${h}px;font-size:${fontSize}">
          ${showLabel ? `<span class="rare-cluster-label">${displayLabel}</span>` : ''}
          <span class="rare-cluster-count">${safeCount}</span>
        </div>
      </div>
    `,
    iconSize: [hitW, hitH],
    iconAnchor: anchor,
    popupAnchor: [0, -22],
  })
}

export default function RareSightingsMap({ channel = 'physical' }: RareSightingsMapProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [items, setItems] = useState<RareItem[]>([])
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [viewMode, setViewMode] = useState<ViewMode>('pins')
  const [onlyVisibleInMap, setOnlyVisibleInMap] = useState(false)
  const [mapBounds, setMapBounds] = useState<MapBounds>(null)
  const [currentZoom, setCurrentZoom] = useState(5)
  const [focusedCountryKey, setFocusedCountryKey] = useState<string | null>(null)
  const [focusedCityKey, setFocusedCityKey] = useState<string | null>(null)
  const [focusedDistrictKey, setFocusedDistrictKey] = useState<string | null>(null)
  const [focusedLocationKey, setFocusedLocationKey] = useState<string | null>(null)
  const [mapFocusTarget, setMapFocusTarget] = useState<MapFocusTarget>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const hasHydratedFromUrl = useRef(false)

  const parsePrice = (value: unknown): number | null => {
    if (value == null) return null
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const raw = String(value).trim()
    if (!raw) return null
    const normalized = raw
      .replace(/[^0-9.,]/g, '')
      .replace(/\.(?=\d{3}(\D|$))/g, '')
      .replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  const normalizeText = (value: string | null | undefined) => (value || '').toLocaleLowerCase('tr-TR')
  const getCountryKey = (item: RareItem) => item.country || 'Bilinmeyen Ulke'
  const getCityKey = (item: RareItem) => `${item.country || ''}|${item.city || ''}`
  const getDistrictKey = (item: RareItem) => `${getCityKey(item)}|${item.district || 'Bilinmeyen Ilce'}`
  const getLocationKey = (item: RareItem) => `${getDistrictKey(item)}|${item.location_name || 'Bilinmeyen Lokasyon'}`

  const parseFiltersFromUrl = (params: URLSearchParams): { nextFilters: Filters; nextViewMode: ViewMode; nextVisibleOnly: boolean } => {
    const getParam = (shortKey: string, longKey: string) => params.get(shortKey) || params.get(longKey)

    const sortBy = getParam(QUERY_KEYS.sortBy, 'sortBy')
    const hasPhoto = getParam(QUERY_KEYS.hasPhoto, 'hasPhoto')
    const view = getParam(QUERY_KEYS.view, 'view')
    const visible = getParam(QUERY_KEYS.visible, 'visible')

    const nextFilters: Filters = {
      searchText: getParam(QUERY_KEYS.searchText, 'searchText') || '',
      country: getParam(QUERY_KEYS.country, 'country') || 'all',
      city: getParam(QUERY_KEYS.city, 'city') || 'all',
      district: getParam(QUERY_KEYS.district, 'district') || 'all',
      category: getParam(QUERY_KEYS.category, 'category') || 'all',
      marketplace: getParam(QUERY_KEYS.marketplace, 'marketplace') || 'all',
      hasPhoto: hasPhoto === 'with' || hasPhoto === 'without' ? hasPhoto : 'all',
      minPrice: getParam(QUERY_KEYS.minPrice, 'minPrice') || '',
      maxPrice: getParam(QUERY_KEYS.maxPrice, 'maxPrice') || '',
      startDate: getParam(QUERY_KEYS.startDate, 'startDate') || '',
      endDate: getParam(QUERY_KEYS.endDate, 'endDate') || '',
      sortBy:
        sortBy === 'oldest' || sortBy === 'price_asc' || sortBy === 'price_desc'
          ? sortBy
          : 'newest',
    }

    const nextViewMode: ViewMode = view === 'city_clusters' ? 'city_clusters' : 'pins'
    const nextVisibleOnly = visible === '1' || visible === 'true'
    return { nextFilters, nextViewMode, nextVisibleOnly }
  }

  const buildQueryFromState = (stateFilters: Filters, stateViewMode: ViewMode, stateVisibleOnly: boolean) => {
    const params = new URLSearchParams()
    if (stateFilters.searchText) params.set(QUERY_KEYS.searchText, stateFilters.searchText)
    if (stateFilters.country !== 'all') params.set(QUERY_KEYS.country, stateFilters.country)
    if (stateFilters.city !== 'all') params.set(QUERY_KEYS.city, stateFilters.city)
    if (stateFilters.district !== 'all') params.set(QUERY_KEYS.district, stateFilters.district)
    if (stateFilters.category !== 'all') params.set(QUERY_KEYS.category, stateFilters.category)
    if (stateFilters.marketplace !== 'all') params.set(QUERY_KEYS.marketplace, stateFilters.marketplace)
    if (stateFilters.hasPhoto !== 'all') params.set(QUERY_KEYS.hasPhoto, stateFilters.hasPhoto)
    if (stateFilters.minPrice) params.set(QUERY_KEYS.minPrice, stateFilters.minPrice)
    if (stateFilters.maxPrice) params.set(QUERY_KEYS.maxPrice, stateFilters.maxPrice)
    if (stateFilters.startDate) params.set(QUERY_KEYS.startDate, stateFilters.startDate)
    if (stateFilters.endDate) params.set(QUERY_KEYS.endDate, stateFilters.endDate)
    if (stateFilters.sortBy !== 'newest') params.set(QUERY_KEYS.sortBy, stateFilters.sortBy)
    if (stateViewMode !== 'pins') params.set(QUERY_KEYS.view, stateViewMode)
    if (stateVisibleOnly) params.set(QUERY_KEYS.visible, '1')
    return params
  }

  useEffect(() => {
    if (hasHydratedFromUrl.current) return
    const { nextFilters, nextViewMode, nextVisibleOnly } = parseFiltersFromUrl(new URLSearchParams(searchParams.toString()))
    setFilters(nextFilters)
    setViewMode(nextViewMode)
    setOnlyVisibleInMap(nextVisibleOnly)
    hasHydratedFromUrl.current = true
  }, [searchParams])

  useEffect(() => {
    if (!hasHydratedFromUrl.current) return
    const params = buildQueryFromState(filters, viewMode, onlyVisibleInMap)
    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [filters, viewMode, onlyVisibleInMap, pathname, router])

  useEffect(() => {
    let isMounted = true

    const fetchRareLocations = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/quick-sightings?channel=${channel}&hasLocation=with`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Nadir verileri alinamadi')
        if (!isMounted) return

        const normalized = (Array.isArray(data) ? data : [])
          .map((item: any) => ({
            id: item.id,
            title: item.title ?? item.link_preview_title ?? null,
            description: item.description ?? item.link_preview_description ?? null,
            country: item.country ?? 'Turkiye',
            city: item.city ?? null,
            district: item.district ?? null,
            location_name: item.location_name ?? null,
            category: item.category ?? null,
            marketplace: item.marketplace ?? null,
            seller_name: item.seller_name ?? null,
            source_channel: item.source_channel ?? channel,
            price: parsePrice(item.price),
            latitude: item.latitude != null ? Number(item.latitude) : null,
            longitude: item.longitude != null ? Number(item.longitude) : null,
            image_url: item.image_url ?? null,
            photo_url: item.photo_url ?? null,
            link_preview_image: item.link_preview_image ?? null,
            created_at: item.created_at,
          }))
          .filter((item: RareItem) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))

        setItems(normalized)
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Harita verisi alinamadi')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRareLocations()

    return () => {
      isMounted = false
    }
  }, [channel])

  const countryOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.country).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'tr')),
    [items],
  )

  const cityOptions = useMemo(() => {
    const selectedCountry = filters.country
    return Array.from(
      new Set(
        items
          .filter((item) => selectedCountry === 'all' || item.country === selectedCountry)
          .map((item) => item.city)
          .filter(Boolean) as string[],
      ),
    ).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [items, filters.country])

  const districtOptions = useMemo(() => {
    const selectedCountry = filters.country
    const selectedCity = filters.city
    return Array.from(
      new Set(
        items
          .filter((item) => selectedCountry === 'all' || item.country === selectedCountry)
          .filter((item) => selectedCity === 'all' || item.city === selectedCity)
          .map((item) => item.district)
          .filter(Boolean) as string[],
      ),
    ).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [items, filters.country, filters.city])

  const categoryOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.category).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'tr')),
    [items],
  )

  const marketplaceOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.marketplace).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'tr')),
    [items],
  )

  const filteredItems = useMemo(() => {
    const minPrice = filters.minPrice ? Number(filters.minPrice) : null
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null
    const startDateMs = filters.startDate ? new Date(`${filters.startDate}T00:00:00`).getTime() : null
    const endDateMs = filters.endDate ? new Date(`${filters.endDate}T23:59:59`).getTime() : null

    const search = normalizeText(filters.searchText)

    const base = items.filter((item) => {
      if (filters.country !== 'all' && item.country !== filters.country) return false
      if (filters.city !== 'all' && getCitySlug(item.city || '') !== getCitySlug(filters.city)) return false
      if (filters.district !== 'all' && item.district !== filters.district) return false
      if (filters.category !== 'all') {
        const itemCat = findCategoryByValue(item.category)
        const filterCat = findCategoryByValue(filters.category)
        if (filterCat) {
          // alias-aware: her iki tarafı da canonical id'ye çek
          if (itemCat?.id !== filterCat.id) return false
        } else {
          // bilinmeyen kategori — birebir eşleşme
          if (item.category !== filters.category) return false
        }
      }
      if (filters.marketplace !== 'all' && item.marketplace !== filters.marketplace) return false

      const hasPhoto = Boolean(item.photo_url || item.image_url || item.link_preview_image)
      if (filters.hasPhoto === 'with' && !hasPhoto) return false
      if (filters.hasPhoto === 'without' && hasPhoto) return false

      if (minPrice != null && (item.price == null || item.price < minPrice)) return false
      if (maxPrice != null && (item.price == null || item.price > maxPrice)) return false

      const createdMs = new Date(item.created_at).getTime()
      if (startDateMs != null && createdMs < startDateMs) return false
      if (endDateMs != null && createdMs > endDateMs) return false

      if (search) {
        const haystack = [
          item.title,
          item.description,
          item.country,
          item.city,
          item.district,
          item.location_name,
          item.category,
          item.marketplace,
          item.seller_name,
        ]
          .map((v) => normalizeText(v))
          .join(' ')
        if (!haystack.includes(search)) return false
      }

      return true
    })

    const sorted = [...base]
    if (filters.sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (filters.sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (filters.sortBy === 'price_asc') {
      sorted.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER))
    } else if (filters.sortBy === 'price_desc') {
      sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1))
    }

    return sorted
  }, [items, filters])

  const visibleItems = useMemo(() => {
    if (!onlyVisibleInMap || !mapBounds) return filteredItems
    return filteredItems.filter((item) => {
      const lat = Number(item.latitude)
      const lng = Number(item.longitude)
      return lat <= mapBounds.north && lat >= mapBounds.south && lng <= mapBounds.east && lng >= mapBounds.west
    })
  }, [filteredItems, onlyVisibleInMap, mapBounds])

  const pinItems = useMemo(() => {
    if (!focusedLocationKey) return visibleItems
    return visibleItems.filter((item) => getLocationKey(item) === focusedLocationKey)
  }, [visibleItems, focusedLocationKey])

  const cityClusters = useMemo<CityCluster[]>(() => {
    const level: ClusterLevel = !focusedCountryKey
      ? 'country'
      : !focusedCityKey
        ? 'city'
        : focusedDistrictKey
          ? 'location'
          : 'district'

    const countrySource = focusedCountryKey
      ? visibleItems.filter((item) => getCountryKey(item) === focusedCountryKey)
      : visibleItems

    const citySource = focusedCityKey
      ? countrySource.filter((item) => getCityKey(item) === focusedCityKey)
      : countrySource

    const levelSource = focusedDistrictKey
      ? citySource.filter((item) => getDistrictKey(item) === focusedDistrictKey)
      : citySource

    const groups = new Map<string, RareItem[]>()
    for (const item of levelSource) {
      const key = level === 'country'
        ? getCountryKey(item)
        : level === 'city'
          ? getCityKey(item)
          : level === 'district'
            ? getDistrictKey(item)
            : getLocationKey(item)
      const bucket = groups.get(key) || []
      bucket.push(item)
      groups.set(key, bucket)
    }

    const result: CityCluster[] = []
    for (const [key, clusterItems] of groups.entries()) {
      const latSum = clusterItems.reduce((sum, item) => sum + Number(item.latitude || 0), 0)
      const lngSum = clusterItems.reduce((sum, item) => sum + Number(item.longitude || 0), 0)
      const first = clusterItems[0]

      const childClusterCount = level === 'country'
        ? new Set(clusterItems.map((item) => item.city || 'Bilinmeyen Sehir')).size
        : level === 'city'
          ? new Set(clusterItems.map((item) => item.district || 'Bilinmeyen Ilce')).size
          : level === 'district'
            ? new Set(clusterItems.map((item) => item.location_name || 'Bilinmeyen Lokasyon')).size
            : 0

      result.push({
        key,
        level,
        country: first.country,
        city: level === 'country' ? null : first.city,
        district: level === 'district' || level === 'location' ? (first.district || 'Bilinmeyen Ilce') : null,
        location_name: level === 'location' ? (first.location_name || 'Bilinmeyen Lokasyon') : null,
        latitude: latSum / clusterItems.length,
        longitude: lngSum / clusterItems.length,
        count: clusterItems.length,
        childClusterCount,
        items: clusterItems,
      })
    }

    return result.sort((a, b) => b.count - a.count)
  }, [visibleItems, focusedCountryKey, focusedCityKey, focusedDistrictKey])

  useEffect(() => {
    // Ust filtreler degistiginde odaklari sifirla.
    setFocusedCountryKey(null)
    setFocusedCityKey(null)
    setFocusedDistrictKey(null)
    setFocusedLocationKey(null)
  }, [filters.country, filters.city, onlyVisibleInMap])

  const center = useMemo<[number, number]>(() => {
    if (pinItems.length) {
      const firstVisible = pinItems[0]
      return [Number(firstVisible.latitude), Number(firstVisible.longitude)]
    }
    if (!filteredItems.length) return DEFAULT_CENTER
    const first = filteredItems[0]
    return [Number(first.latitude), Number(first.longitude)]
  }, [filteredItems, pinItems])

  const onMapBoundsChange = useCallback((nextBounds: MapBounds) => {
    setMapBounds(nextBounds)
  }, [])

  // Zoom ileri giderken hiyerarsiyi otomatik ilerlet (goruntu alaninda tek kume kaldiysa).
  useEffect(() => {
    if (viewMode !== 'city_clusters') return
    if (!mapBounds) return

    const visible = cityClusters.filter(
      (c) =>
        c.latitude >= mapBounds.south &&
        c.latitude <= mapBounds.north &&
        c.longitude >= mapBounds.west &&
        c.longitude <= mapBounds.east,
    )
    if (visible.length !== 1) return
    const cluster = visible[0]

    if (!focusedCountryKey && currentZoom >= 6 && cluster.level === 'country') {
      setFocusedCountryKey(cluster.country || 'Bilinmeyen Ulke')
    } else if (focusedCountryKey && !focusedCityKey && currentZoom >= 9 && cluster.level === 'city') {
      setFocusedCountryKey(cluster.country || 'Bilinmeyen Ulke')
      setFocusedCityKey(`${cluster.country || ''}|${cluster.city || ''}`)
    } else if (focusedCityKey && !focusedDistrictKey && currentZoom >= 12 && cluster.level === 'district') {
      const cityKey = `${cluster.country || ''}|${cluster.city || ''}`
      setFocusedDistrictKey(`${cityKey}|${cluster.district || 'Bilinmeyen Ilce'}`)
    } else if (focusedDistrictKey && currentZoom >= 14 && cluster.level === 'location') {
      const cityKey = `${cluster.country || ''}|${cluster.city || ''}`
      const districtKey = `${cityKey}|${cluster.district || 'Bilinmeyen Ilce'}`
      setFocusedLocationKey(`${districtKey}|${cluster.location_name || 'Bilinmeyen Lokasyon'}`)
      setViewMode('pins')
    }
  }, [currentZoom, mapBounds, cityClusters, viewMode, focusedCountryKey, focusedCityKey, focusedDistrictKey])

  const onMapZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom)

    // Zoom geri acildikca hiyerarsi tersine cozulsun.
    if (focusedLocationKey && zoom <= 13) {
      setFocusedLocationKey(null)
      setViewMode('city_clusters')
      return
    }

    if (focusedDistrictKey && zoom <= 11) {
      setFocusedDistrictKey(null)
      return
    }

    if (focusedCityKey && zoom <= 8) {
      setFocusedCityKey(null)
      return
    }

    if (focusedCountryKey && zoom <= 5) {
      setFocusedCountryKey(null)
    }
  }, [focusedCountryKey, focusedCityKey, focusedDistrictKey, focusedLocationKey])

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleClose = (marker: any) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => marker?.closePopup?.(), 400)
  }

  const cancelClose = () => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
  }

  const attachPopupHoverHandler = (event: any) => {
    const popupElement = event.popup?.getElement?.()
    if (!popupElement) return
    popupElement.addEventListener('mouseenter', cancelClose)
    popupElement.addEventListener('mouseleave', () => event.target?.closePopup?.())
  }

  if (loading) {
    return <div className="rounded-xl border border-gray-200 p-6 text-sm text-gray-500">Harita verileri yukleniyor...</div>
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
        {channel === 'social'
          ? 'Konum bilgisi olan sosyal nadir paylasimi bulunamadi.'
          : 'Konum bilgisi olan fiziksel nadir paylasimi bulunamadi. Discovery paylasimlari icin Nadir Seyahat Haritasi sayfasini kullanin.'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={filters.searchText}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchText: e.target.value }))}
            placeholder="Ara: baslik, aciklama, sehir, kategori..."
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />

          <select
            value={filters.country}
            onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value, city: 'all', district: 'all' }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Ulke: Tumu</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            value={filters.city}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value, district: 'all' }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Sehir: Tumu</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={filters.district}
            onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Ilce/Bolge: Tumu</option>
            {districtOptions.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Kategori: Tumu</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.marketplace}
            onChange={(e) => setFilters((prev) => ({ ...prev, marketplace: e.target.value }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Pazar Yeri: Tumu</option>
            {marketplaceOptions.map((marketplace) => (
              <option key={marketplace} value={marketplace}>{marketplace}</option>
            ))}
          </select>

          <select
            value={filters.hasPhoto}
            onChange={(e) => setFilters((prev) => ({ ...prev, hasPhoto: e.target.value as Filters['hasPhoto'] }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Gorsel: Tumu</option>
            <option value="with">Sadece gorselli</option>
            <option value="without">Sadece gorselsiz</option>
          </select>

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            placeholder="Min fiyat"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            placeholder="Max fiyat"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as Filters['sortBy'] }))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="newest">Sirala: En yeni</option>
            <option value="oldest">Sirala: En eski</option>
            <option value="price_asc">Sirala: Fiyat artan</option>
            <option value="price_desc">Sirala: Fiyat azalan</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            Toplam {items.length} kayittan {filteredItems.length} tanesi filtreye uydu, {visibleItems.length} tanesi haritada gosteriliyor.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'city_clusters' && focusedCountryKey && !focusedCityKey && (
              <button
                onClick={() => {
                  setFocusedCountryKey(null)
                  setFocusedCityKey(null)
                  setFocusedDistrictKey(null)
                  setFocusedLocationKey(null)
                  setMapFocusTarget({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1], zoom: 5 })
                }}
                className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
              >
                Ulke odagini temizle
              </button>
            )}
            {viewMode === 'city_clusters' && focusedCityKey && (
              <button
                onClick={() => {
                  setFocusedCountryKey(focusedCountryKey)
                  setFocusedCityKey(null)
                  setFocusedDistrictKey(null)
                  setMapFocusTarget({ lat: center[0], lng: center[1], zoom: 6 })
                }}
                className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Sehir odagini temizle
              </button>
            )}
            {viewMode === 'city_clusters' && focusedDistrictKey && (
              <button
                onClick={() => {
                  setFocusedDistrictKey(null)
                  setFocusedLocationKey(null)
                  setMapFocusTarget({ lat: center[0], lng: center[1], zoom: 10 })
                }}
                className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
              >
                Ilce odagini temizle
              </button>
            )}
            {viewMode === 'pins' && focusedLocationKey && (
              <button
                onClick={() => setFocusedLocationKey(null)}
                className="rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
              >
                Lokasyon odagini temizle
              </button>
            )}
            <label className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={onlyVisibleInMap}
                onChange={(e) => setOnlyVisibleInMap(e.target.checked)}
              />
              Sadece gorunen alan
            </label>
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 text-xs">
              <button
                onClick={() => setViewMode('pins')}
                className={`rounded-md px-2 py-1 ${viewMode === 'pins' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Tekil Pin
              </button>
              <button
                onClick={() => setViewMode('city_clusters')}
                className={`rounded-md px-2 py-1 ${viewMode === 'city_clusters' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Sehir Kumesi
              </button>
            </div>
            <button
              onClick={() => {
                setFilters(DEFAULT_FILTERS)
                setViewMode('pins')
                setOnlyVisibleInMap(false)
                setFocusedCountryKey(null)
                setFocusedCityKey(null)
                setFocusedDistrictKey(null)
                setFocusedLocationKey(null)
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Filtreleri sifirla
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <MapContainer center={center} zoom={5} scrollWheelZoom className="h-[70vh] min-h-[420px] w-full">
          <MapBoundsWatcher onBoundsChange={onMapBoundsChange} onZoomChange={onMapZoomChange} />
          <MapFocusController target={mapFocusTarget} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {viewMode === 'pins' && pinItems.map((item) => {
            const lat = Number(item.latitude)
            const lng = Number(item.longitude)
            const image = item.photo_url || item.image_url || item.link_preview_image || ''
            const title = item.title || item.description || 'Nadir Paylasim'

            return (
              <Marker
                key={item.id}
                position={[lat, lng]}
                icon={markerIcon}
                eventHandlers={{
                  mouseover: (event) => { cancelClose(); event.target.openPopup() },
                  mouseout: (event) => scheduleClose(event.target),
                  popupopen: attachPopupHoverHandler,
                }}
              >
                <Popup closeButton={false} autoPan>
                  <div className="w-52">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="h-28 w-full rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-900">{title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {[item.country, item.city, item.district, item.location_name].filter(Boolean).join(' · ') || 'Konum'}
                    </p>
                    {item.price != null && (
                      <p className="mt-1 text-xs font-semibold text-emerald-700">
                        Fiyat: {item.price.toLocaleString('tr-TR')} TL
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={buildItemDetailPath(item)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Paylasimi ac
                      </a>
                      <span className="text-gray-300">|</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Google Haritalar'da ac
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {viewMode === 'city_clusters' && cityClusters.map((cluster) => (
            <Marker
              key={cluster.key}
              position={[cluster.latitude, cluster.longitude]}
              icon={createClusterIcon(
                cluster.level,
                cluster.count,
                currentZoom,
                cluster.level === 'country'
                  ? cluster.country
                  : cluster.level === 'city'
                    ? cluster.city
                    : null,
              )}
              eventHandlers={{
                click: () => {
                  const countryKey = cluster.country || 'Bilinmeyen Ulke'
                  const cityKey = `${cluster.country || ''}|${cluster.city || ''}`
                  const districtKey = `${cityKey}|${cluster.district || 'Bilinmeyen Ilce'}`
                  const locationKey = `${districtKey}|${cluster.location_name || 'Bilinmeyen Lokasyon'}`

                  if (cluster.level === 'country') {
                    setFocusedCountryKey(countryKey)
                    setFocusedCityKey(null)
                    setFocusedDistrictKey(null)
                    setFocusedLocationKey(null)
                    setMapFocusTarget({
                      lat: cluster.latitude,
                      lng: cluster.longitude,
                      zoom: 6,
                    })
                  } else if (cluster.level === 'city' && cluster.city) {
                    setFocusedCountryKey(countryKey)
                    setFocusedCityKey(cityKey)
                    setFocusedDistrictKey(null)
                    setFocusedLocationKey(null)
                    setMapFocusTarget({
                      lat: cluster.latitude,
                      lng: cluster.longitude,
                      zoom: 10,
                    })
                  } else if (cluster.level === 'district' && cluster.district) {
                    setFocusedDistrictKey(districtKey)
                    setFocusedLocationKey(null)
                    setMapFocusTarget({
                      lat: cluster.latitude,
                      lng: cluster.longitude,
                      zoom: 12,
                    })
                  } else if (cluster.level === 'location') {
                    setFocusedLocationKey(locationKey)
                    setViewMode('pins')
                    setMapFocusTarget({
                      lat: cluster.latitude,
                      lng: cluster.longitude,
                      zoom: 14,
                    })
                  }
                },
                mouseover: (event) => { cancelClose(); event.target.openPopup() },
                mouseout: (event) => scheduleClose(event.target),
                popupopen: attachPopupHoverHandler,
              }}
            >
              <Popup closeButton={false} autoPan>
                <div className="w-56">
                  <p className="text-sm font-semibold text-gray-900">
                    {[cluster.country, cluster.city, cluster.district, cluster.location_name].filter(Boolean).join(' · ') || 'Konum Kumesi'}
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    {cluster.level === 'country'
                      ? `Bu ulkede ${cluster.count} paylasim var. ${cluster.childClusterCount} sehirde mevcut. Tiklayinca sehir kumesine inersiniz.`
                      : cluster.level === 'city'
                        ? `Bu sehirde ${cluster.count} paylasim var. ${cluster.childClusterCount} ilcede mevcut. Tiklayinca ilce kumesine inersiniz.`
                      : cluster.level === 'district'
                        ? `Bu ilcede ${cluster.count} paylasim var. ${cluster.childClusterCount} lokasyonda mevcut. Tiklayinca lokasyon kumesine inersiniz.`
                        : `Bu lokasyonda ${cluster.count} paylasim var. Tiklayinca tekil pinlere gecilir.`}
                  </p>
                  {(() => {
                    const priceItems = cluster.items
                      .map((item) => item.price)
                      .filter((price): price is number => Number.isFinite(price))
                    const averagePrice =
                      priceItems.length > 0
                        ? priceItems.reduce((sum, price) => sum + price, 0) / priceItems.length
                        : null
                    const latestDateMs = Math.max(...cluster.items.map((item) => new Date(item.created_at).getTime()))

                    return (
                      <div className="mt-1 text-[11px] text-gray-600">
                        <p>Son paylasim: {new Date(latestDateMs).toLocaleDateString('tr-TR')}</p>
                        {averagePrice != null && (
                          <p>Ort. fiyat: {averagePrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL</p>
                        )}
                      </div>
                    )
                  })()}
                  <div className="mt-2 max-h-40 space-y-1 overflow-auto pr-1">
                    {cluster.items.slice(0, 5).map((item) => (
                      <a
                        key={item.id}
                        href={buildItemDetailPath(item)}
                        className="block truncate text-xs text-gray-700 hover:text-blue-600"
                      >
                        • {item.title || item.description || 'Nadir Paylasim'}
                      </a>
                    ))}
                  </div>
                  {cluster.count > 5 && (
                    <p className="mt-1 text-[11px] text-gray-500">+ {cluster.count - 5} paylasim daha</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {!filteredItems.length && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Secili filtrelere gore kayit bulunamadi. Filtreleri gevsetmeyi deneyin.
        </div>
      )}

      <p className="text-xs text-gray-500">
        Ipuclari: Isaretlerin uzerine geldiginde paylasim onizlemesi acilir. Mobilde isarete dokunarak ayni karti gorebilirsiniz.
      </p>
    </div>
  )
}

function MapBoundsWatcher({
  onBoundsChange,
  onZoomChange,
}: {
  onBoundsChange: (bounds: MapBounds) => void
  onZoomChange: (zoom: number) => void
}) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds()
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    },
    zoomend: () => {
      const b = map.getBounds()
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
      onZoomChange(map.getZoom())
    },
  })

  useEffect(() => {
    const b = map.getBounds()
    onBoundsChange({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    })
    onZoomChange(map.getZoom())
  }, [map, onBoundsChange, onZoomChange])

  return null
}

function MapFocusController({ target }: { target: MapFocusTarget }) {
  const map = useMapEvents({})

  useEffect(() => {
    if (!target) return
    map.setView([target.lat, target.lng], target.zoom, { animate: true })
  }, [map, target])

  return null
}

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MapContainer, Marker, TileLayer, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { buildSocialPath } from '@/lib/sighting-slug'
import { supabase } from '@/lib/supabase'

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

type NominatimResult = {
  place_id: number
  display_name: string
  name: string
  lat: string
  lon: string
}

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
            title="Mevcut konumumu kullan"
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

const SORT_OPTIONS = [
  { value: 'likes', label: 'En cok begeni' },
  { value: 'shares', label: 'En cok paylasim' },
  { value: 'likes_shares', label: 'Begeni + paylasim' },
  { value: 'recent', label: 'En yeni paylasimlar' },
  { value: 'route_proximity', label: 'Rotaya en yakin' },
] as const

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

  const [from, setFrom] = useState('Istanbul')
  const [fromCoords, setFromCoords] = useState<LatLng | null>(null)
  const [to, setTo] = useState('Ankara')
  const [toCoords, setToCoords] = useState<LatLng | null>(null)
  const [stops, setStops] = useState(5)
  const [sortBy, setSortBy] = useState<string>('likes_shares')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const [corridorKm, setCorridorKm] = useState(12)
  const [nearbyOnly, setNearbyOnly] = useState(false)
  const [nearRadiusKm, setNearRadiusKm] = useState(25)
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PlannerResponse | null>(null)
  const [activeQuery, setActiveQuery] = useState('')
  const [initialCategoryOptions, setInitialCategoryOptions] = useState<string[]>([])
  const [savedPlans, setSavedPlans] = useState<SavedTravelPlan[]>([])
  const [savingPlan, setSavingPlan] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
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
    if (selectedCategories.length === 0) return 'Tum kategoriler'
    if (selectedCategories.length === 1) return selectedCategories[0]
    if (selectedCategories.length === 2) return `${selectedCategories[0]}, ${selectedCategories[1]}`
    return `${selectedCategories[0]}, ${selectedCategories[1]} +${selectedCategories.length - 2}`
  }, [selectedCategories])

  const buildPlannerParams = () => {
    const params = new URLSearchParams()
    params.set('from', from)
    params.set('to', to)
    if (fromCoords) {
      params.set('fromLat', String(fromCoords.lat))
      params.set('fromLng', String(fromCoords.lng))
    }
    if (toCoords) {
      params.set('toLat', String(toCoords.lat))
      params.set('toLng', String(toCoords.lng))
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
      return
    }

    setSavedPlans((data || []) as SavedTravelPlan[])
  }

  useEffect(() => {
    const loadInitialCategories = async () => {
      const { data, error: fetchErr } = await supabase
        .from('social_posts')
        .select('category')
        .limit(200)

      if (fetchErr) return

      const options = Array.from(
        new Set(
          (data || [])
            .map((row: any) => String(row?.category || '').trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, 'tr'))

      setInitialCategoryOptions(options)
    }

    loadInitialCategories()
    loadSavedPlans()
  }, [])

  useEffect(() => {
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    if (!fromParam || !toParam) return

    setFrom(fromParam)
    setTo(toParam)
    const spFromLat = Number(searchParams.get('fromLat'))
    const spFromLng = Number(searchParams.get('fromLng'))
    const spToLat = Number(searchParams.get('toLat'))
    const spToLng = Number(searchParams.get('toLng'))
    if (Number.isFinite(spFromLat) && spFromLat !== 0) setFromCoords({ lat: spFromLat, lng: spFromLng })
    if (Number.isFinite(spToLat) && spToLat !== 0) setToCoords({ lat: spToLat, lng: spToLng })
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
      setError('Tarayici konum servisini desteklemiyor.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => setError('Konum izni verilmedi veya konum alinamadi.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const runPlan = async () => {
    setLoading(true)
    setError('')
    setSaveMessage('')

    try {
      const params = buildPlannerParams()
      const query = params.toString()
      setActiveQuery(query)
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })

      const res = await fetch(`/api/rare-travel-plan?${query}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Plan olusturulamadi')
      setResult(data)

      if (selectedCategories.length === 0 && Array.isArray(data?.categoryOptions) && data.categoryOptions.length > 0) {
        setSelectedCategories([])
      }
    } catch (err: any) {
      setError(err?.message || 'Plan olusturulamadi')
    } finally {
      setLoading(false)
    }
  }

  const savePlan = async () => {
    setSaveMessage('')
    setSavingPlan(true)
    try {
      const params = buildPlannerParams().toString()
      const title = `${from} -> ${to}`
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const payload = {
          user_id: user.id,
          title,
          from_location: from,
          to_location: to,
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
            from_location: from,
            to_location: to,
            query_params: params,
            created_at: new Date().toISOString(),
          },
          ...localPlans,
        ].slice(0, 20)
        localStorage.setItem('rare_travel_plans_local', JSON.stringify(next))
      }

      setSaveMessage('Plan kaydedildi.')
      await loadSavedPlans()
    } catch {
      setSaveMessage('Plan kaydedilemedi. Tablo hazir degilse migration calistirilmali.')
    } finally {
      setSavingPlan(false)
    }
  }

  const sharePlan = async () => {
    setSaveMessage('')
    const params = buildPlannerParams().toString()
    const url = `${window.location.origin}${pathname}?${params}`
    try {
      await navigator.clipboard.writeText(url)
      setSaveMessage('Paylasim linki panoya kopyalandi.')
    } catch {
      setSaveMessage(`Paylasim linki: ${url}`)
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-4 md:p-5">
        <h2 className="text-lg font-bold text-gray-900">Nadir Seyahat Plani</h2>
        <p className="mt-1 text-sm text-gray-600">
          Baslangic ve varis konumunu sec, yol uzerindeki en iyi nadir sosyal paylasimlari otomatik getir.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-0.5">Baslangic</p>
            <LocationAutocomplete
              value={from}
              onChange={(v) => { setFrom(v); setFromCoords(null) }}
              onSelect={(display, lat, lng) => { setFrom(display); setFromCoords({ lat, lng }) }}
              placeholder="Sehir veya adres ara..."
              showCurrentLocation
              onCurrentLocation={() => {
                if (!navigator.geolocation) return
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    const lat = pos.coords.latitude
                    const lng = pos.coords.longitude
                    setFromCoords({ lat, lng })
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=tr`,
                        { headers: { 'User-Agent': 'spotitforme/1.0' } },
                      )
                      const data = await res.json()
                      const city = data?.address?.city || data?.address?.town || data?.address?.province || ''
                      const country = data?.address?.country || ''
                      setFrom([city, country].filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                    } catch {
                      setFrom(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                    }
                  },
                  () => setError('Konum alinamadi.'),
                  { enableHighAccuracy: true, timeout: 8000 },
                )
              }}
            />
            {fromCoords && (
              <p className="mt-0.5 text-xs text-emerald-600">✓ Konum secildi ({fromCoords.lat.toFixed(4)}, {fromCoords.lng.toFixed(4)})</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-0.5">Varis</p>
            <LocationAutocomplete
              value={to}
              onChange={(v) => { setTo(v); setToCoords(null) }}
              onSelect={(display, lat, lng) => { setTo(display); setToCoords({ lat, lng }) }}
              placeholder="Sehir veya adres ara..."
            />
            {toCoords && (
              <p className="mt-0.5 text-xs text-emerald-600">✓ Konum secildi ({toCoords.lat.toFixed(4)}, {toCoords.lng.toFixed(4)})</p>
            )}
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            Durak sayisi
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
            Siralama
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-emerald-100 focus:border-emerald-400 focus:ring-2"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Rota koridoru (km)
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
            Kategoriler (birden fazla secilebilir)
            <div ref={categoryMenuRef} className="relative mt-1">
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-sm outline-none ring-emerald-100 transition focus:border-emerald-400 focus:ring-2"
              >
                <span className={selectedCategories.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {categorySummary}
                </span>
                <span className="ml-3 text-xs text-gray-400">{categoryMenuOpen ? 'Yukari' : 'Asagi'}</span>
              </button>

              {categoryMenuOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                  <div className="mb-2 flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Kategori sec</p>
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Temizle
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
                      <span className="text-sm text-gray-700">Tum kategoriler</span>
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
                      ? `${selectedCategories.length} kategori secildi`
                      : 'Kategori secmezsen tumu dahil edilir'}
                  </p>
                </div>
              )}
            </div>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Arama kelimesi (opsiyonel)
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Ornek: antika, koleksiyon, fig\u00fcr"
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
            Yakinimdakiler filtresi (OSRM rota + mevcut konum)
          </label>

          {nearbyOnly && (
            <div className="mt-3 grid gap-2 md:grid-cols-[auto_1fr] md:items-end">
              <button
                type="button"
                onClick={requestCurrentLocation}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
              >
                Konumumu kullan
              </button>

              <label className="text-sm font-medium text-gray-700">
                Yakindaki yaricap (km)
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
              Konum hazir: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
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
            {loading ? 'Plan hazirlaniyor...' : 'Nadir seyahat planini olustur'}
          </button>

          <Link
            href="/rare-travel-map"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Haritada tum sosyal pinleri ac
          </Link>

          <button
            type="button"
            onClick={savePlan}
            disabled={savingPlan}
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
          >
            {savingPlan ? 'Kaydediliyor...' : 'Plani kaydet'}
          </button>

          <button
            type="button"
            onClick={sharePlan}
            className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            Paylasim linki olustur
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
            <h3 className="text-base font-bold text-gray-900">Plan ozeti</h3>
            <div className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-4">
              <p><span className="font-semibold">Rota:</span> {result.meta.from} {'->'} {result.meta.to}</p>
              <p><span className="font-semibold">Mesafe:</span> {result.meta.routeDistanceKm} km</p>
              <p><span className="font-semibold">Sure:</span> ~{result.meta.routeDurationMin} dk</p>
              <p><span className="font-semibold">Bulunan paylasim:</span> {result.meta.foundPosts}</p>
            </div>
            {result.meta.routeIsFallback && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Rota servisinde gecici kesinti var. Plan, acil modda dogrusal guzergahla olusturuldu.
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
                  <Popup>Baslangic</Popup>
                </Marker>

                <Marker position={[result.route.to.lat, result.route.to.lng]} icon={endIcon}>
                  <Popup>Varis</Popup>
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
                          <img src={post.image_url} alt={post.title || 'Nadir paylasim'} className="h-24 w-full rounded-md object-cover" loading="lazy" />
                        ) : null}
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-500">Durak {post.stop_index}</p>
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">{post.title || 'Nadir paylasim'}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{[post.city, post.location_name, post.category].filter(Boolean).join(' · ')}</p>
                        <p className="mt-0.5 text-xs text-gray-600">❤️ {post.likes_count} | 🔁 {post.shares_count} | {post.distance_to_route_km} km</p>
                        <div className="mt-2 flex items-center gap-2">
                          <a href={buildSocialPath(post.id, post.title || post.description || '')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Paylasimi ac</a>
                          <span className="text-gray-300">|</span>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${post.latitude},${post.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Haritada ac</a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
            <h3 className="text-base font-bold text-gray-900">Rota durakları ({result.posts.length} seçildi)</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {result.posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title || 'Nadir paylasim'} className="h-40 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-gray-100">
                      <span className="text-3xl font-bold text-amber-400">{post.stop_index}</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-500">Durak {post.stop_index}</p>
                    <p className="line-clamp-2 text-sm font-semibold text-gray-900">{post.title || 'Nadir paylasim'}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {[post.city, post.location_name, post.category].filter(Boolean).join(' · ') || 'Konum belirtilmemis'}
                    </p>
                    <p className="mt-2 text-xs text-gray-600">
                      ❤️ {post.likes_count} &nbsp;🔁 {post.shares_count} &nbsp;📍 {post.distance_to_route_km} km rotaya
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={buildSocialPath(post.id, post.title || post.description || '')}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Paylasimi ac
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${post.latitude},${post.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Google Haritalar
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
        <h3 className="text-base font-bold text-gray-900">Kayitli planlarim</h3>
        <p className="mt-1 text-xs text-gray-500">Hesaba girisliysen profiline bagli saklanir, degilsen bu tarayicida tutulur.</p>
        <div className="mt-3 space-y-2">
          {savedPlans.length === 0 && (
            <p className="text-sm text-gray-500">Henuz kayitli plan yok.</p>
          )}
          {savedPlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => router.push(`${pathname}?${plan.query_params}`)}
              className="w-full rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50"
            >
              <p className="text-sm font-semibold text-gray-900">{plan.title}</p>
              <p className="mt-1 text-xs text-gray-600">{new Date(plan.created_at).toLocaleString('tr-TR')}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

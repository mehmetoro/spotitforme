'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CreatePostModal, { TripPostModalPayload } from '@/components/social/CreatePostModal'
import { MapContainer, Marker, Popup, Polyline, TileLayer } from 'react-leaflet'
import L from 'leaflet'

type LatLng = { lat: number; lng: number }

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

type SavedTravelPlan = {
  id: string
  title: string
  from_location: string
  to_location: string
  query_params: string
}

type PlannerPost = {
  id: string
  title: string | null
  city: string | null
  latitude: number
  longitude: number
}

type PlannerResponse = {
  meta: {
    from: string
    to: string
    routeDistanceKm: number
    routeDurationMin: number
  }
  route: {
    from: LatLng
    to: LatLng
    geometry: LatLng[]
  }
  posts: PlannerPost[]
}

type LiveTripPost = {
  id: string
  session_id: string
  user_id: string
  source_social_post_id: string | null
  title: string
  description: string | null
  image_url: string | null
  category: string | null
  location_name: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  visit_time: string | null
  visibility: 'private' | 'followers' | 'public'
  sort_order: number
  created_at: string
}

type OwnSocialPost = {
  id: string
  title: string | null
  content: string | null
  category: string | null
  location: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  images: string[] | null
}

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    province?: string
    country?: string
  }
}

type RoutePreviewResponse = {
  geometry: LatLng[]
  distanceKm: number
  durationMin: number
}

function parseCoordinate(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.')
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
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
  onSelect: (display: string, lat: number, lng: number, city?: string) => void
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
    if (!q.trim() || q.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

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

  return (
    <div className="relative">
      <div className="flex gap-1">
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              search(e.target.value)
            }}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true)
            }}
            onBlur={() => setTimeout(() => setOpen(false), 180)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
            const city = s.address?.city || s.address?.town || s.address?.province || ''
            return (
              <li key={s.place_id}>
                <button
                  type="button"
                  onMouseDown={() => {
                    const display = parts.slice(0, 2).join(',').trim()
                    onSelect(display, Number(s.lat), Number(s.lon), city)
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

type CollageStop = {
  title: string
  imageUrl: string | null
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getCollageLayout(count: number, width: number, height: number) {
  if (count <= 1) {
    return [{ x: 0, y: 0, w: width, h: height }]
  }

  if (count === 2) {
    const half = Math.floor(width / 2)
    return [
      { x: 0, y: 0, w: half, h: height },
      { x: half, y: 0, w: width - half, h: height },
    ]
  }

  if (count === 3) {
    const leftW = Math.floor(width * 0.62)
    const rightW = width - leftW
    const rightHalfH = Math.floor(height / 2)
    return [
      { x: 0, y: 0, w: leftW, h: height },
      { x: leftW, y: 0, w: rightW, h: rightHalfH },
      { x: leftW, y: rightHalfH, w: rightW, h: height - rightHalfH },
    ]
  }

  if (count === 4) {
    const halfW = Math.floor(width / 2)
    const halfH = Math.floor(height / 2)
    return [
      { x: 0, y: 0, w: halfW, h: halfH },
      { x: halfW, y: 0, w: width - halfW, h: halfH },
      { x: 0, y: halfH, w: halfW, h: height - halfH },
      { x: halfW, y: halfH, w: width - halfW, h: height - halfH },
    ]
  }

  if (count === 5) {
    const topH = Math.floor(height * 0.52)
    const bottomH = height - topH
    const topThird = Math.floor(width / 3)
    const bottomHalf = Math.floor(width / 2)
    return [
      { x: 0, y: 0, w: topThird, h: topH },
      { x: topThird, y: 0, w: topThird, h: topH },
      { x: topThird * 2, y: 0, w: width - topThird * 2, h: topH },
      { x: 0, y: topH, w: bottomHalf, h: bottomH },
      { x: bottomHalf, y: topH, w: width - bottomHalf, h: bottomH },
    ]
  }

  const cols = 3
  const rows = 2
  const colW = Math.floor(width / cols)
  const rowH = Math.floor(height / rows)
  const cells: Array<{ x: number; y: number; w: number; h: number }> = []

  for (let i = 0; i < 6; i += 1) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * colW
    const y = row * rowH
    const w = col === cols - 1 ? width - x : colW
    const h = row === rows - 1 ? height - y : rowH
    cells.push({ x, y, w, h })
  }
  return cells
}

function buildRouteCollageDataUrl(fromLocation: string, toLocation: string, stops: CollageStop[]) {
  const width = 1200
  const height = 630
  const palette = ['#0f766e', '#0ea5e9', '#f97316', '#e11d48', '#7c3aed', '#16a34a']

  const normalizedStops = stops
    .map((stop) => ({
      title: (stop.title || 'Durak').replace(/[\r\n]+/g, ' ').trim(),
      imageUrl: stop.imageUrl,
    }))
    .filter((stop) => stop.title.length > 0)

  const visibleStops = (normalizedStops.length ? normalizedStops : [{ title: 'Seyahat Duragi', imageUrl: null }]).slice(0, 6)
  const tiles = getCollageLayout(visibleStops.length, width, height)

  const defs = visibleStops
    .map((stop, idx) => {
      if (!stop.imageUrl) return ''
      return `
        <pattern id="img-${idx}" patternUnits="userSpaceOnUse" width="${tiles[idx].w}" height="${tiles[idx].h}">
          <image href="${escapeXml(stop.imageUrl)}" x="0" y="0" width="${tiles[idx].w}" height="${tiles[idx].h}" preserveAspectRatio="xMidYMid slice"/>
        </pattern>
      `
    })
    .join('')

  const tileMarkup = visibleStops
    .map((stop, idx) => {
      const tile = tiles[idx]
      const fallbackColor = palette[idx % palette.length]
      const title = escapeXml(stop.title.slice(0, 42))
      const fill = stop.imageUrl ? `url(#img-${idx})` : fallbackColor
      const overlayY = tile.y + tile.h - 56

      return `
        <g>
          <rect x="${tile.x}" y="${tile.y}" width="${tile.w}" height="${tile.h}" fill="${fill}"/>
          <rect x="${tile.x}" y="${overlayY}" width="${tile.w}" height="56" fill="rgba(15,23,42,0.58)"/>
          <text x="${tile.x + 18}" y="${overlayY + 34}" fill="#ffffff" font-size="24" font-weight="700" font-family="Arial">${title}</text>
        </g>
      `
    })
    .join('')

  const safeFrom = escapeXml(fromLocation)
  const safeTo = escapeXml(toLocation)
  const extraCount = normalizedStops.length - visibleStops.length
  const extraBadge =
    extraCount > 0
      ? `<g>
          <rect x="1010" y="22" width="168" height="44" rx="22" fill="rgba(15,23,42,0.74)"/>
          <text x="1094" y="50" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="700" font-family="Arial">+${extraCount} durak</text>
        </g>`
      : ''

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        ${defs}
      </defs>
      <rect width="${width}" height="${height}" fill="#0f172a"/>
      ${tileMarkup}
      <rect x="20" y="20" width="720" height="72" rx="16" fill="rgba(15,23,42,0.72)"/>
      <text x="42" y="50" fill="#f8fafc" font-size="30" font-weight="800" font-family="Arial">Nadir Rota</text>
      <text x="42" y="76" fill="#cbd5e1" font-size="18" font-family="Arial">${safeFrom} -> ${safeTo}</text>
      ${extraBadge}
    </svg>
  `

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default function LiveTravelSessionPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = params.sessionId as string
  const isRouteReadonly = searchParams.get('mode') === 'route'
  const canEditSession = !isRouteReadonly

  const [session, setSession] = useState<LiveTravelSession | null>(null)
  const [plan, setPlan] = useState<SavedTravelPlan | null>(null)
  const [planResult, setPlanResult] = useState<PlannerResponse | null>(null)
  const [tripPosts, setTripPosts] = useState<LiveTripPost[]>([])
  const [ownPosts, setOwnPosts] = useState<OwnSocialPost[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completing, setCompleting] = useState(false)
  const [savingEdits, setSavingEdits] = useState(false)

  const [visibility, setVisibility] = useState<'private' | 'followers' | 'public'>('followers')
  const [routeOrderDraft, setRouteOrderDraft] = useState<string[]>([])
  const [timeMapDraft, setTimeMapDraft] = useState<Record<string, string>>({})
  const [postVisibilityDraft, setPostVisibilityDraft] = useState<Record<string, 'private' | 'followers' | 'public'>>({})

  const [selectedOwnPostId, setSelectedOwnPostId] = useState('')
  const [showTripPostModal, setShowTripPostModal] = useState(false)
  const [dynamicGeometry, setDynamicGeometry] = useState<LatLng[]>([])
  const [dynamicDistanceKm, setDynamicDistanceKm] = useState<number | null>(null)
  const [dynamicDurationMin, setDynamicDurationMin] = useState<number | null>(null)
  const [routingBusy, setRoutingBusy] = useState(false)
  const [suggestedSessionId, setSuggestedSessionId] = useState<string | null>(null)
  const [suggestedSessionStops, setSuggestedSessionStops] = useState<number>(0)

  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const geocodeAttemptedRef = useRef<Set<string>>(new Set())

  const orderedTripPosts = useMemo(() => {
    if (!tripPosts.length) return [] as LiveTripPost[]
    if (!routeOrderDraft.length) return tripPosts

    const byId = new Map(tripPosts.map((post) => [post.id, post]))
    const ordered = routeOrderDraft.map((id) => byId.get(id)).filter(Boolean) as LiveTripPost[]
    const remaining = tripPosts.filter((post) => !routeOrderDraft.includes(post.id))
    return [...ordered, ...remaining]
  }, [tripPosts, routeOrderDraft])

  const routedWaypoints = useMemo(() => {
    if (!planResult?.route?.from || !planResult?.route?.to) return [] as LatLng[]

    const stopPoints = orderedTripPosts
      .filter((post) => post.latitude != null && post.longitude != null)
      .map((post) => ({ lat: post.latitude as number, lng: post.longitude as number }))

    return [planResult.route.from, ...stopPoints, planResult.route.to]
  }, [planResult, orderedTripPosts])

  const googleMapsUrl = useMemo(() => {
    if (routedWaypoints.length < 2) return ''
    const toCoord = (p: LatLng) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`
    const origin = toCoord(routedWaypoints[0])
    const destination = toCoord(routedWaypoints[routedWaypoints.length - 1])
    const waypoints = routedWaypoints
      .slice(1, -1)
      .slice(0, 23)
      .map((p) => toCoord(p))
      .join('|')

    const waypointParam = waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypointParam}&travelmode=driving&dir_action=navigate`
  }, [routedWaypoints])

  const recomputeRoute = async (waypoints: LatLng[]) => {
    if (waypoints.length < 2) return
    setRoutingBusy(true)
    try {
      const res = await fetch('/api/travel-routes/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: waypoints }),
      })

      if (!res.ok) throw new Error('Rota onizleme olusturulamadi')
      const data = (await res.json()) as RoutePreviewResponse
      setDynamicGeometry(data.geometry || [])
      setDynamicDistanceKm(Number.isFinite(data.distanceKm) ? data.distanceKm : null)
      setDynamicDurationMin(Number.isFinite(data.durationMin) ? data.durationMin : null)
    } catch {
      setDynamicGeometry(waypoints)
      setDynamicDistanceKm(null)
      setDynamicDurationMin(null)
    } finally {
      setRoutingBusy(false)
    }
  }

  const loadTripPosts = async (fallbackSession?: Pick<LiveTravelSession, 'posts_collected' | 'post_time_map'> | null) => {
    const { data } = await supabase
      .from('live_trip_posts')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    let rawRows = (data || []) as LiveTripPost[]

    const sessionSnapshot = fallbackSession || session
    const fallbackIds = (sessionSnapshot?.posts_collected || []).filter(Boolean)

    // Geriye donuk uyum: bazi eski oturumlarda sadece posts_collected dolu olabilir.
    if (rawRows.length === 0 && fallbackIds.length > 0) {
      const { data: socialRows } = await supabase
        .from('social_posts')
        .select('id, title, content, category, location, city, latitude, longitude, images, created_at')
        .in('id', fallbackIds)

      const byId = new Map((socialRows || []).map((row: any) => [String(row.id), row]))
      rawRows = fallbackIds
        .map((postId, index) => {
          const row = byId.get(String(postId))
          if (!row) return null
          return {
            id: `legacy-${String(postId)}`,
            session_id: sessionId,
            user_id: session?.user_id || '',
            source_social_post_id: String(postId),
            title: row.title || row.content || 'Seyahat paylasimi',
            description: row.content || null,
            image_url: Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null,
            category: row.category || null,
            location_name: row.location || null,
            city: row.city || null,
            latitude: parseCoordinate(row.latitude),
            longitude: parseCoordinate(row.longitude),
            visit_time: sessionSnapshot?.post_time_map?.[String(postId)] || null,
            visibility: 'followers' as const,
            sort_order: index,
            created_at: row.created_at || new Date().toISOString(),
          } as LiveTripPost
        })
        .filter(Boolean) as LiveTripPost[]
    }

    const normalizedRows = rawRows.map((row) => ({
      ...row,
      latitude: parseCoordinate(row.latitude),
      longitude: parseCoordinate(row.longitude),
    }))

    const rows = await Promise.all(
      normalizedRows.map(async (row) => {
        if (row.latitude != null && row.longitude != null) return row

        const query = [row.location_name, row.city].filter(Boolean).join(', ').trim()
        if (!query || geocodeAttemptedRef.current.has(row.id)) return row
        geocodeAttemptedRef.current.add(row.id)

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}&accept-language=tr`,
            { headers: { 'User-Agent': 'spotitforme/1.0' } },
          )
          const dataRows = await res.json()
          if (!Array.isArray(dataRows) || dataRows.length === 0) return row

          const first = dataRows[0] as any
          const lat = parseCoordinate(first?.lat)
          const lng = parseCoordinate(first?.lon)
          if (lat == null || lng == null) return row

          await supabase
            .from('live_trip_posts')
            .update({
              latitude: lat,
              longitude: lng,
              city: row.city || first?.address?.city || first?.address?.town || first?.address?.province || null,
            })
            .eq('id', row.id)
            .eq('session_id', sessionId)

          return {
            ...row,
            latitude: lat,
            longitude: lng,
            city: row.city || first?.address?.city || first?.address?.town || first?.address?.province || null,
          }
        } catch {
          return row
        }
      }),
    )

    setTripPosts(rows)
    setRouteOrderDraft(rows.map((row) => row.id))

    const timeMap: Record<string, string> = {}
    const visibilityMap: Record<string, 'private' | 'followers' | 'public'> = {}
    for (const row of rows) {
      if (row.visit_time) timeMap[row.id] = row.visit_time
      visibilityMap[row.id] = row.visibility
    }
    setTimeMapDraft(timeMap)
    setPostVisibilityDraft(visibilityMap)
    return rows
  }

  const findSuggestedSessionWithStops = async (userId: string, currentSessionId: string) => {
    const { data: activeSessions } = await supabase
      .from('live_travel_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .neq('id', currentSessionId)
      .order('started_at', { ascending: false })
      .limit(20)

    const ids = (activeSessions || []).map((row: any) => row.id as string)
    if (ids.length === 0) {
      setSuggestedSessionId(null)
      setSuggestedSessionStops(0)
      return
    }

    const { data: tripRows } = await supabase
      .from('live_trip_posts')
      .select('session_id')
      .in('session_id', ids)

    const counts = new Map<string, number>()
    for (const row of tripRows || []) {
      const sid = (row as any).session_id as string
      counts.set(sid, (counts.get(sid) || 0) + 1)
    }

    let bestSessionId: string | null = null
    let bestCount = 0
    for (const sid of ids) {
      const count = counts.get(sid) || 0
      if (count > bestCount) {
        bestCount = count
        bestSessionId = sid
      }
    }

    if (bestSessionId && bestCount > 0) {
      setSuggestedSessionId(bestSessionId)
      setSuggestedSessionStops(bestCount)
      return
    }

    setSuggestedSessionId(null)
    setSuggestedSessionStops(0)
  }

  const loadOwnPosts = async (userId: string) => {
    const { data } = await supabase
      .from('social_posts')
      .select('id, title, content, category, location, city, latitude, longitude, images')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(80)
    setOwnPosts((data || []) as OwnSocialPost[])
  }

  const moveRouteItem = (index: number, direction: -1 | 1) => {
    setRouteOrderDraft((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  const saveRouteEdits = async () => {
    if (!session) return
    setSavingEdits(true)
    setError('')
    try {
      const initialOrder = tripPosts.map((post) => post.id)
      const routeOverridden = JSON.stringify(routeOrderDraft) !== JSON.stringify(initialOrder)

      const sessionTimeMap = { ...(session.post_time_map || {}), ...timeMapDraft }

      const { error: sessionUpdateErr } = await supabase
        .from('live_travel_sessions')
        .update({
          manual_route_post_ids: routeOrderDraft,
          route_overridden: routeOverridden,
          post_time_map: sessionTimeMap,
        })
        .eq('id', sessionId)

      if (sessionUpdateErr) throw sessionUpdateErr

      const updates = routeOrderDraft.map((postId, index) =>
        supabase
          .from('live_trip_posts')
          .update({
            sort_order: index,
            visit_time: timeMapDraft[postId] || null,
            visibility: postVisibilityDraft[postId] || 'followers',
          })
          .eq('id', postId)
          .eq('session_id', sessionId),
      )

      await Promise.all(updates)

      setSession((prev) =>
        prev
          ? {
              ...prev,
              manual_route_post_ids: routeOrderDraft,
              route_overridden: routeOverridden,
              post_time_map: sessionTimeMap,
            }
          : prev,
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) await loadTripPosts()
    } catch (err: any) {
      setError(err?.message || 'Durak düzeni kaydedilemedi.')
    } finally {
      setSavingEdits(false)
    }
  }

  const saveDraftAndExit = async () => {
    await saveRouteEdits()
    router.push('/rare-travel-plan')
  }

  const addSelectedOwnPost = async () => {
    if (!selectedOwnPostId || !session) return
    const src = ownPosts.find((post) => post.id === selectedOwnPostId)
    if (!src) return

    const payload = {
      session_id: sessionId,
      user_id: session.user_id,
      source_social_post_id: src.id,
      title: src.title || src.content || 'Seyahat paylaşımı',
      description: src.content,
      image_url: src.images?.[0] || null,
      category: src.category,
      location_name: src.location,
      city: src.city,
      latitude: src.latitude,
      longitude: src.longitude,
      visit_time: '',
      visibility: 'followers',
      sort_order: tripPosts.length,
    }

    const { error: insertErr } = await supabase.from('live_trip_posts').insert(payload)
    if (insertErr) {
      setError(insertErr.message)
      return
    }

    setSelectedOwnPostId('')
    await loadTripPosts()
  }

  const removeTripPost = async (postId: string) => {
    if (!session) return
    const { error: deleteErr } = await supabase
      .from('live_trip_posts')
      .delete()
      .eq('id', postId)
      .eq('session_id', sessionId)
    if (deleteErr) {
      setError(deleteErr.message)
      return
    }
    await loadTripPosts()
  }

  const handleTripModalCreated = async (payload: TripPostModalPayload) => {
    if (!session) return

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')

    const { error: insertErr } = await supabase.from('live_trip_posts').insert({
      session_id: sessionId,
      user_id: session.user_id,
      source_social_post_id: null,
      title: payload.title,
      description: payload.description,
      image_url: payload.imageUrl,
      category: payload.category || 'Seyahat',
      location_name: payload.locationName,
      city: payload.city,
      latitude: payload.latitude,
      longitude: payload.longitude,
      visit_time: `${hh}:${mm}`,
      visibility: 'followers',
      sort_order: tripPosts.length,
    })

    if (insertErr) {
      throw insertErr
    }

    await loadTripPosts(session.user_id)
  }

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('Giris yapmalısiniz.')
          setLoading(false)
          return
        }

        const { data: sessionData, error: sessionErr } = await supabase
          .from('live_travel_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single()

        if (sessionErr || !sessionData) {
          setError('Oturum bulunamadı.')
          setLoading(false)
          return
        }

        setSession(sessionData as LiveTravelSession)
        const normalizedVisibility = sessionData.visibility === 'friends' ? 'followers' : sessionData.visibility
        setVisibility((normalizedVisibility as 'private' | 'followers' | 'public') || 'followers')
        setTimeMapDraft((sessionData.post_time_map || {}) as Record<string, string>)

        const { data: planData, error: planErr } = await supabase
          .from('rare_travel_plans')
          .select('id, title, from_location, to_location, query_params')
          .eq('id', sessionData.plan_id)
          .single()

        if (planErr || !planData) {
          setError('Plan bulunamadı.')
          setLoading(false)
          return
        }

        setPlan(planData as SavedTravelPlan)

        const plannerRes = await fetch(`/api/rare-travel-plan?${planData.query_params}`)
        const routeData = (await plannerRes.json()) as PlannerResponse
        setPlanResult(routeData)

        const [loadedRows] = await Promise.all([loadTripPosts(sessionData as LiveTravelSession), loadOwnPosts(user.id)])
        if ((loadedRows || []).length === 0) {
          await findSuggestedSessionWithStops(user.id, sessionId)
        } else {
          setSuggestedSessionId(null)
          setSuggestedSessionStops(0)
        }
        setLoading(false)
      } catch (err: any) {
        setError(err?.message || 'Veri yüklenemedi.')
        setLoading(false)
      }
    }

    loadSessionData()

    const channel = supabase
      .channel(`live_session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_travel_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new) {
            const next = payload.new as LiveTravelSession
            setSession(next)
            const normalizedVisibility = next.visibility === 'friends' ? 'followers' : next.visibility
            setVisibility((normalizedVisibility as 'private' | 'followers' | 'public') || 'followers')
          }
        },
      )
      .subscribe()

    sessionCheckInterval.current = setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await loadTripPosts()
    }, 30000)

    return () => {
      channel.unsubscribe()
      if (sessionCheckInterval.current) clearInterval(sessionCheckInterval.current)
    }
  }, [sessionId])

  useEffect(() => {
    if (!planResult || routedWaypoints.length < 2) return
    const timer = setTimeout(() => {
      recomputeRoute(routedWaypoints)
    }, 250)
    return () => clearTimeout(timer)
  }, [planResult, routedWaypoints])

  const completeSession = async () => {
    if (!session || !plan) return
    setCompleting(true)
    try {
      const { error: updateErr } = await supabase
        .from('live_travel_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          visibility,
          manual_route_post_ids: routeOrderDraft,
          route_overridden: true,
          post_time_map: { ...(session.post_time_map || {}), ...timeMapDraft },
        })
        .eq('id', sessionId)

      if (updateErr) throw updateErr

      const firstCategory = orderedTripPosts.find((post) => post.category)?.category || 'Seyahat'
      const coverLabel = `${plan.from_location} -> ${plan.to_location}`
      const collageDataUrl = buildRouteCollageDataUrl(
        plan.from_location,
        plan.to_location,
        orderedTripPosts.map((post) => ({
          title: post.title,
          imageUrl: post.image_url,
        })),
      )
      const { error: publishErr } = await supabase
        .from('travel_routes')
        .upsert(
          {
            session_id: sessionId,
            user_id: session.user_id,
            title: plan.title,
            from_location: plan.from_location,
            to_location: plan.to_location,
            category: firstCategory,
            visibility,
            cover_collage_url: collageDataUrl,
            shares_count: 0,
            comments_count: 0,
            likes_count: 0,
          },
          { onConflict: 'session_id' },
        )

      if (publishErr) throw publishErr

      const { error: archiveErr } = await supabase
        .from('rare_travel_plans')
        .update({ is_archived: true })
        .eq('id', session.plan_id)
      if (archiveErr) console.warn('Plan arşivleme hatası:', archiveErr)

      setSession((prev) => (prev ? { ...prev, status: 'completed', completed_at: new Date().toISOString() } : prev))
      console.log('Seyahat rotasi yayinlandi:', coverLabel)

      setTimeout(() => {
        router.push(`/rare-travel-plan/live/${sessionId}/summary`)
      }, 800)
    } catch (err: any) {
      setError(err?.message || 'Oturum tamamlanamadı.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <section className="space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-300 border-t-emerald-600" />
          <p className="mt-3 text-sm text-gray-600">Oturum yükleniyor...</p>
        </div>
      </section>
    )
  }

  if (!session || !plan) {
    return (
      <section className="space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">{error || 'Oturum bulunamadı.'}</p>
          <Link href="/rare-travel-plan" className="mt-3 inline-block text-sm font-semibold text-red-700 hover:underline">
            Planlara dön
          </Link>
        </div>
      </section>
    )
  }

  const elapsedTime = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
  const hours = Math.floor(elapsedTime / 3600)
  const minutes = Math.floor((elapsedTime % 3600) / 60)

  const mapCenter: [number, number] = planResult?.route?.from
    ? [planResult.route.from.lat, planResult.route.from.lng]
    : [39, 35]
  const lineToRender = dynamicGeometry.length > 1 ? dynamicGeometry : planResult?.route.geometry || []
  const shownDistance = dynamicDistanceKm ?? planResult?.meta.routeDistanceKm
  const shownDuration = dynamicDurationMin ?? planResult?.meta.routeDurationMin

  return (
    <section className="space-y-4 p-4 md:p-6">
      <CreatePostModal
        isOpen={showTripPostModal}
        onClose={() => setShowTripPostModal(false)}
        onPostCreated={() => setShowTripPostModal(false)}
        mode="trip_only"
        headerTitle="Yeni Durak Olustur"
        submitLabel="Durak Olustur"
        onTripPostCreated={handleTripModalCreated}
      />

      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Canlı Seyahat</h1>
            <p className="mt-1 text-sm text-gray-600">{plan.title}</p>
            <p className="mt-2 text-xs font-semibold text-red-600">Gecen sure: {hours}h {minutes}m</p>
          </div>
          {session.status === 'active' && !isRouteReadonly && <div className="flex h-3 w-3 animate-pulse rounded-full bg-red-600" />}
        </div>
        {suggestedSessionId && (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-800">Bu canli oturumda durak yok.</p>
            <p className="mt-1 text-xs text-amber-700">Durak iceren baska bir canli oturum bulundu ({suggestedSessionStops} durak).</p>
            <button
              type="button"
              onClick={() => router.push(`/rare-travel-plan/live/${suggestedSessionId}`)}
              className="mt-2 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              Durakli oturuma gec
            </button>
          </div>
        )}
      </div>

      {planResult && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <h3 className="font-bold text-gray-900">Plan Bilgileri</h3>
          <div className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-4">
            <p><span className="font-semibold">Baslangic:</span> {plan.from_location}</p>
            <p><span className="font-semibold">Varis:</span> {plan.to_location}</p>
            <p><span className="font-semibold">Mesafe:</span> {shownDistance ?? '-'} km</p>
            <p><span className="font-semibold">Sure:</span> ~{shownDuration ?? '-'} dk</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Google Haritalarda Aç
              </a>
            )}
            {routingBusy && (
              <span className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                Rota duraklara gore guncelleniyor...
              </span>
            )}
          </div>
        </div>
      )}

      {planResult && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="h-[400px] w-full">
            <MapContainer center={mapCenter} zoom={6} className="h-full w-full" scrollWheelZoom={isRouteReadonly}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {lineToRender.length > 1 && (
                <Polyline positions={lineToRender.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#059669', weight: 4, opacity: 0.85 }} />
              )}

              <Marker position={[planResult.route.from.lat, planResult.route.from.lng]} icon={startIcon}>
                <Popup>Baslangic: {plan.from_location}</Popup>
              </Marker>

              <Marker position={[planResult.route.to.lat, planResult.route.to.lng]} icon={endIcon}>
                <Popup>Varis: {plan.to_location}</Popup>
              </Marker>

              {orderedTripPosts
                .filter((post) => post.latitude != null && post.longitude != null)
                .map((post, idx) => (
                  <Marker
                    key={`trip-post-${post.id}`}
                    position={[post.latitude as number, post.longitude as number]}
                    icon={makeCircleIcon('#0ea5e9', String(idx + 1))}
                  >
                    <Popup>
                      <div className="w-48">
                        <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{[post.location_name, post.city].filter(Boolean).join(' · ') || 'Konum yok'}</p>
                        <p className="mt-0.5 text-xs text-emerald-700">Saat: {timeMapDraft[post.id] || post.visit_time || '--:--'}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
      )}

      {canEditSession && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <h3 className="text-base font-bold text-gray-900">Kendi paylasimini duraga ekle</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <select
              value={selectedOwnPostId}
              onChange={(e) => setSelectedOwnPostId(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Kendi social postunu sec...</option>
              {ownPosts.map((post) => (
                <option key={post.id} value={post.id}>
                  {(post.title || post.content || 'Paylasim').slice(0, 70)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addSelectedOwnPost}
              disabled={!selectedOwnPostId}
              className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              Duraga ekle
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Yeni durak olustur</p>
            <p className="mt-1 text-xs text-gray-600">Duragi tek adimda olustur ve rota listesine otomatik ekle.</p>
            <button
              type="button"
              onClick={() => setShowTripPostModal(true)}
              className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Yeni durak olustur
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-gray-900">Durak paylasimlari ({orderedTripPosts.length})</h3>
          {canEditSession && (
            <button
              type="button"
              onClick={saveRouteEdits}
              disabled={savingEdits}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
            >
              {savingEdits ? 'Kaydediliyor...' : 'Ara kaydet'}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Bu listedeki icerikler sadece bu seyahat rotasinda gorunur. Nadir feed'e ayrica dusmez.
        </p>

        <div className="mt-3 space-y-2">
          {orderedTripPosts.length === 0 && <p className="text-sm text-gray-500">Henuz durak paylasimi eklenmedi.</p>}
          {orderedTripPosts.map((post, idx) => (
            <div key={post.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
              <span className="w-7 rounded-md bg-gray-200 px-2 py-1 text-center text-xs font-bold text-gray-700">{idx + 1}</span>
              <div className="min-w-[180px] flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-500">{[post.location_name, post.city].filter(Boolean).join(' · ') || 'Konum yok'}</p>
              </div>
              <input
                type="time"
                value={timeMapDraft[post.id] || post.visit_time || ''}
                onChange={(e) => setTimeMapDraft((prev) => ({ ...prev, [post.id]: e.target.value }))}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
              />
              <select
                value={postVisibilityDraft[post.id] || post.visibility}
                onChange={(e) =>
                  setPostVisibilityDraft((prev) => ({
                    ...prev,
                    [post.id]: e.target.value as 'private' | 'followers' | 'public',
                  }))
                }
                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="private">Ozel</option>
                <option value="followers">Takip</option>
                <option value="public">Genel</option>
              </select>
              {canEditSession && (
                <>
                  <button
                    type="button"
                    onClick={() => moveRouteItem(idx, -1)}
                    disabled={idx === 0}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRouteItem(idx, 1)}
                    disabled={idx === orderedTripPosts.length - 1}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTripPost(post.id)}
                    className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Cikar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-gray-900">Paylasim akisi (duraklarin altinda)</h4>
          <div className="mt-3 space-y-4">
            {orderedTripPosts.length === 0 && <p className="text-sm text-gray-500">Gosterilecek paylasim yok.</p>}
            {orderedTripPosts.map((post, idx) => {
              const locationLine = [post.location_name, post.city].filter(Boolean).join(' · ') || 'Konum yok'
              const shownTime = timeMapDraft[post.id] || post.visit_time || '--:--'
              const visibilityLabel = postVisibilityDraft[post.id] || post.visibility

              return (
                <article
                  key={`share-${post.id}`}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                        <p className="text-[11px] text-gray-500">{locationLine}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-semibold text-emerald-700">{shownTime}</span>
                      <span className="text-[11px] text-gray-500 capitalize">{visibilityLabel}</span>
                    </div>
                  </div>

                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="h-72 w-full object-cover sm:h-80" />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-100 px-4 text-center">
                      <p className="text-base font-semibold text-slate-700">{post.title}</p>
                    </div>
                  )}

                  <div className="px-3 pb-3 pt-2">
                    <div className="mb-2 flex items-center gap-4 text-gray-700">
                      <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-rose-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                          <path d="M12 21s-6.5-4.35-9-8.2C.95 9.73 2.3 5.5 6.34 4.65c2.3-.48 4.44.43 5.66 2.26 1.22-1.83 3.36-2.74 5.66-2.26 4.03.85 5.39 5.08 3.34 8.15C18.5 16.65 12 21 12 21z" />
                        </svg>
                        <span>Begeni</span>
                      </button>
                      <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-blue-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                          <path d="M21 12a8.5 8.5 0 01-8.5 8.5H5l-2 2v-10A8.5 8.5 0 1112 21" />
                        </svg>
                        <span>Yorum</span>
                      </button>
                      <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-emerald-700">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                          <path d="M22 2L11 13" />
                          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                        <span>Paylas</span>
                      </button>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-700">
                      {post.description?.trim() || 'Bu durak icin aciklama eklenmedi.'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                      {post.category && <span className="rounded-full bg-gray-100 px-2 py-1">#{post.category}</span>}
                      <span className="rounded-full bg-gray-100 px-2 py-1">Durak #{idx + 1}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>

      {canEditSession && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <p className="mb-3 text-sm text-gray-600">Ekle-cikar-duzenle degisikliklerini ara kaydedip daha sonra devam edebilirsin.</p>
          <button
            type="button"
            onClick={saveDraftAndExit}
            disabled={savingEdits}
            className="mb-3 w-full rounded-xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
          >
            {savingEdits ? 'Taslak kaydediliyor...' : 'Taslaga kaydet ve planlara don'}
          </button>

          <p className="mb-3 text-sm text-gray-600">
            {session.status === 'completed'
              ? 'Bu rota tamamlanmis durumda. Duzenlemeleri kaydedip yeniden yayinlayabilirsin.'
              : 'Varisa geldiginde bitirip seyahat rotalari akisina yayinlayabilirsin.'}
          </p>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Oturum gorunurlugu</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'private' | 'followers' | 'public')}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="private">Ozel</option>
              <option value="followers">Takipciler</option>
              <option value="public">Genel</option>
            </select>
          </div>
          <button
            type="button"
            onClick={completeSession}
            disabled={completing}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {completing ? 'Kaydediliyor...' : session.status === 'completed' ? 'Duzenlemeleri yeniden yayinla' : 'Seyahati tamamla ve rota olarak yayinla'}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}
    </section>
  )
}

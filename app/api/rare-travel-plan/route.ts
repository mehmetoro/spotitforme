import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

type LatLng = { lat: number; lng: number }
type RouteDistance = { km: number; nearestIndex: number }
type RoutingResult = {
  points: LatLng[]
  distanceKm: number
  durationMin: number
  provider: string
  isFallback: boolean
}

type SocialFetchResult = {
  rows: any[]
  removedColumns: string[]
  error: any | null
}

const geocodeCache = new Map<string, LatLng>()

const SOCIAL_POST_SELECT_COLUMNS = [
  'id',
  'user_id',
  'title',
  'content',
  'description',
  'category',
  'location',
  'city',
  'district',
  'country',
  'created_at',
  'images',
  'image_urls',
  'latitude',
  'longitude',
  'lat',
  'lng',
  'share_count',
  'shares_count',
  'repost_count',
  'is_public',
]

function toFiniteNumber(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'string' && value.trim() === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function parseLatLngText(text: string | null): LatLng | null {
  if (!text) return null
  const normalized = text.trim()
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)$/)
  if (!match) return null
  const lat = Number(match[1])
  const lng = Number(match[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

async function geocodeLocation(queryRaw: string): Promise<LatLng | null> {
  const query = queryRaw.trim()
  if (!query) return null

  const cacheKey = query.toLocaleLowerCase('tr-TR')
  const cached = geocodeCache.get(cacheKey)
  if (cached) return cached

  try {
    const queryWithCountry = /turki|turkey|t\u00fcrkiye/i.test(query) ? query : `${query}, Turkiye`
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(queryWithCountry)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'spotitforme-rare-travel-plan/1.0',
        'Accept-Language': 'tr',
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    const first = Array.isArray(data) ? data[0] : null
    const lat = toFiniteNumber(first?.lat)
    const lng = toFiniteNumber(first?.lon)
    if (lat == null || lng == null) return null

    const coords = { lat, lng }
    geocodeCache.set(cacheKey, coords)
    return coords
  } catch {
    return null
  }
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const c = 2 * Math.atan2(
    Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng),
    Math.sqrt(1 - (sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng)),
  )
  return R * c
}

function toLocalXYKm(point: LatLng, lat0: number): { x: number; y: number } {
  const k = 111.32
  return {
    x: point.lng * k * Math.cos((lat0 * Math.PI) / 180),
    y: point.lat * k,
  }
}

function pointToSegmentDistanceKm(point: LatLng, a: LatLng, b: LatLng, lat0: number): number {
  const p = toLocalXYKm(point, lat0)
  const p1 = toLocalXYKm(a, lat0)
  const p2 = toLocalXYKm(b, lat0)

  const vx = p2.x - p1.x
  const vy = p2.y - p1.y
  const wx = p.x - p1.x
  const wy = p.y - p1.y

  const len2 = vx * vx + vy * vy
  if (len2 === 0) return Math.hypot(p.x - p1.x, p.y - p1.y)

  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2))
  const projX = p1.x + t * vx
  const projY = p1.y + t * vy
  return Math.hypot(p.x - projX, p.y - projY)
}

function downsampleRoutePoints(points: LatLng[], maxPoints = 280): LatLng[] {
  if (points.length <= maxPoints) return points
  const step = Math.ceil(points.length / maxPoints)
  const reduced: LatLng[] = []
  for (let i = 0; i < points.length; i += step) {
    reduced.push(points[i])
  }
  const last = points[points.length - 1]
  const tail = reduced[reduced.length - 1]
  if (!tail || tail.lat !== last.lat || tail.lng !== last.lng) reduced.push(last)
  return reduced
}

function distanceToRouteKm(point: LatLng, routePoints: LatLng[]): RouteDistance {
  if (routePoints.length === 0) return { km: Number.POSITIVE_INFINITY, nearestIndex: 0 }
  if (routePoints.length === 1) return { km: haversineKm(point, routePoints[0]), nearestIndex: 0 }

  const lat0 = point.lat
  let minDistance = Number.POSITIVE_INFINITY
  let nearestIndex = 0

  for (let i = 0; i < routePoints.length - 1; i += 1) {
    const distance = pointToSegmentDistanceKm(point, routePoints[i], routePoints[i + 1], lat0)
    if (distance < minDistance) {
      minDistance = distance
      nearestIndex = i
    }
  }

  return { km: minDistance, nearestIndex }
}

function scorePost(sortBy: string, likes: number, shares: number, routeDistanceKm: number, createdAt: string): number {
  if (sortBy === 'likes') return likes
  if (sortBy === 'shares') return shares
  if (sortBy === 'route_proximity') return -routeDistanceKm
  if (sortBy === 'recent') return new Date(createdAt).getTime() || 0
  return likes + shares * 2
}

function orderByNearestFromStart(from: LatLng, posts: any[]): any[] {
  const remaining = [...posts]
  const ordered: any[] = []
  let current = { ...from }

  while (remaining.length > 0) {
    let bestIndex = 0
    let bestDistance = Number.POSITIVE_INFINITY

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i]
      const distance = haversineKm(current, { lat: candidate.latitude, lng: candidate.longitude })
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = i
      }
    }

    const [picked] = remaining.splice(bestIndex, 1)
    ordered.push(picked)
    current = { lat: picked.latitude, lng: picked.longitude }
  }

  return ordered
}

function buildStraightLineRoute(from: LatLng, to: LatLng, steps = 24): LatLng[] {
  const points: LatLng[] = []
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    points.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    })
  }
  return points
}

async function fetchRouteWithFallback(from: LatLng, to: LatLng): Promise<RoutingResult> {
  const providers = [
    {
      name: 'osrm-primary',
      url:
        `https://router.project-osrm.org/route/v1/driving/` +
        `${from.lng},${from.lat};${to.lng},${to.lat}` +
        `?overview=full&geometries=geojson&steps=false`,
    },
    {
      name: 'osrm-backup',
      url:
        `https://routing.openstreetmap.de/routed-car/route/v1/driving/` +
        `${from.lng},${from.lat};${to.lng},${to.lat}` +
        `?overview=full&geometries=geojson&steps=false`,
    },
  ]

  for (const provider of providers) {
    try {
      const res = await fetch(provider.url, {
        headers: { 'User-Agent': 'spotitforme-rare-travel-plan/1.0' },
      })
      if (!res.ok) continue

      const data = await res.json()
      const firstRoute = Array.isArray(data?.routes) ? data.routes[0] : null
      const coordinates = Array.isArray(firstRoute?.geometry?.coordinates)
        ? firstRoute.geometry.coordinates
        : []
      if (!firstRoute || coordinates.length < 2) continue

      const points = downsampleRoutePoints(
        coordinates
          .map((c: any) => {
            const lng = toFiniteNumber(c?.[0])
            const lat = toFiniteNumber(c?.[1])
            if (lat == null || lng == null) return null
            return { lat, lng }
          })
          .filter(Boolean) as LatLng[],
      )

      if (points.length < 2) continue

      return {
        points,
        distanceKm: Number(((firstRoute?.distance || 0) / 1000).toFixed(1)),
        durationMin: Math.round((firstRoute?.duration || 0) / 60),
        provider: provider.name,
        isFallback: false,
      }
    } catch {
      continue
    }
  }

  const fallbackPoints = buildStraightLineRoute(from, to)
  const fallbackDistance = haversineKm(from, to)
  return {
    points: fallbackPoints,
    distanceKm: Number(fallbackDistance.toFixed(1)),
    durationMin: Math.round((fallbackDistance / 70) * 60),
    provider: 'straight-line-fallback',
    isFallback: true,
  }
}

async function fetchRouteThroughPoints(points: LatLng[]): Promise<RoutingResult> {
  if (points.length < 2) {
    return {
      points,
      distanceKm: 0,
      durationMin: 0,
      provider: 'single-point',
      isFallback: true,
    }
  }

  let mergedPoints: LatLng[] = []
  let totalDistanceKm = 0
  let totalDurationMin = 0
  let providerLabel = 'segment-mixed'
  let hasFallback = false

  for (let i = 0; i < points.length - 1; i += 1) {
    const segment = await fetchRouteWithFallback(points[i], points[i + 1])
    totalDistanceKm += segment.distanceKm
    totalDurationMin += segment.durationMin
    providerLabel = segment.provider
    if (segment.isFallback) hasFallback = true

    if (mergedPoints.length === 0) {
      mergedPoints = [...segment.points]
    } else {
      // Segmentleri birlestirirken ilk noktayi atarak tekrarli koseyi engelle.
      mergedPoints = [...mergedPoints, ...segment.points.slice(1)]
    }
  }

  return {
    points: downsampleRoutePoints(mergedPoints),
    distanceKm: Number(totalDistanceKm.toFixed(1)),
    durationMin: Math.round(totalDurationMin),
    provider: providerLabel,
    isFallback: hasFallback,
  }
}

function extractMissingColumnName(errorMessage: string): string | null {
  const match = errorMessage.match(/social_posts\.([a-zA-Z0-9_]+)/i)
  return match?.[1] || null
}

async function fetchSocialPostsSchemaSafe(supabase: any): Promise<SocialFetchResult> {
  let columns = [...SOCIAL_POST_SELECT_COLUMNS]
  const removedColumns: string[] = []

  while (columns.length > 0) {
    const selectExpr = columns.join(', ')
    const { data, error } = await supabase
      .from('social_posts')
      .select(selectExpr)
      .order('created_at', { ascending: false })
      .limit(300)

    if (!error) {
      return { rows: data || [], removedColumns, error: null }
    }

    const missing = extractMissingColumnName(String(error?.message || ''))
    if (!missing || !columns.includes(missing)) {
      return { rows: [], removedColumns, error }
    }

    columns = columns.filter((col) => col !== missing)
    removedColumns.push(missing)
  }

  return { rows: [], removedColumns, error: new Error('social_posts icin okunabilir kolon kalmadi') }
}

async function fetchSocialPostsByIdsSchemaSafe(supabase: any, ids: string[]): Promise<SocialFetchResult> {
  let columns = [...SOCIAL_POST_SELECT_COLUMNS]
  const removedColumns: string[] = []

  while (columns.length > 0) {
    const selectExpr = columns.join(', ')
    const { data, error } = await supabase
      .from('social_posts')
      .select(selectExpr)
      .in('id', ids)

    if (!error) {
      return { rows: data || [], removedColumns, error: null }
    }

    const missing = extractMissingColumnName(String(error?.message || ''))
    if (!missing || !columns.includes(missing)) {
      return { rows: [], removedColumns, error }
    }

    columns = columns.filter((col) => col !== missing)
    removedColumns.push(missing)
  }

  return { rows: [], removedColumns, error: new Error('social_posts icin okunabilir kolon kalmadi') }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { searchParams } = request.nextUrl
    const fromText = searchParams.get('from')
    const toText = searchParams.get('to')

    const stops = Math.max(1, Math.min(12, Number(searchParams.get('stops') || 5)))
    // Kullanici tarafindan secilmis post ID'leri (secim sayfasindan gelir)
    const selectedPostIds = searchParams.getAll('postId').filter(Boolean)
    const categories = searchParams
      .getAll('category')
      .map((item) => item.trim())
      .filter(Boolean)
    const legacyCategory = (searchParams.get('category') || '').trim()
    if (categories.length === 0 && legacyCategory) categories.push(legacyCategory)
    const query = (searchParams.get('q') || '').trim().toLocaleLowerCase('tr-TR')
    const sortBy = searchParams.get('sortBy') || 'likes_shares'
    const corridorKm = Math.max(1, Math.min(40, Number(searchParams.get('corridorKm') || 12)))
    const limit = Math.max(6, Math.min(120, Number(searchParams.get('limit') || stops * 6)))

    const nearbyOnly = searchParams.get('nearbyOnly') === '1' || searchParams.get('nearbyOnly') === 'true'
    const currentLat = toFiniteNumber(searchParams.get('currentLat'))
    const currentLng = toFiniteNumber(searchParams.get('currentLng'))
    const nearRadiusKm = Math.max(1, Math.min(150, Number(searchParams.get('nearRadiusKm') || 25)))

    let fromCoords: LatLng | null = null
    let toCoords: LatLng | null = null

    const fromLat = toFiniteNumber(searchParams.get('fromLat'))
    const fromLng = toFiniteNumber(searchParams.get('fromLng'))
    const toLat = toFiniteNumber(searchParams.get('toLat'))
    const toLng = toFiniteNumber(searchParams.get('toLng'))

    if (fromLat != null && fromLng != null) fromCoords = { lat: fromLat, lng: fromLng }
    if (toLat != null && toLng != null) toCoords = { lat: toLat, lng: toLng }

    if (!fromCoords) fromCoords = parseLatLngText(fromText) || (fromText ? await geocodeLocation(fromText) : null)
    if (!toCoords) toCoords = parseLatLngText(toText) || (toText ? await geocodeLocation(toText) : null)

    // Secili postlar varsa sadece onlari kullan — geri kalan filtreleme atlaniyor
    if (selectedPostIds.length > 0) {
      if (!fromCoords) {
        return NextResponse.json(
          { error: 'Secili paylasimlarla plan icin baslangic konumu gerekli.' },
          { status: 400 },
        )
      }

      // ID'lere gore postlari schema-safe cek (kolon uyumsuzluklarinda hata vermesin)
      const selectedFetch = await fetchSocialPostsByIdsSchemaSafe(supabase, selectedPostIds)
      if (selectedFetch.error) {
        return NextResponse.json({ error: selectedFetch.error.message }, { status: 500 })
      }
      if (selectedFetch.removedColumns.length > 0) {
        console.warn('rare-travel-plan selected schema-safe social_posts select removed columns:', selectedFetch.removedColumns)
      }

      const selectedRows = selectedFetch.rows

      const resolvedSelected = await Promise.all(
        (selectedRows || []).map(async (row: any) => {
          const latitude = toFiniteNumber(row.latitude ?? row.lat)
          const longitude = toFiniteNumber(row.longitude ?? row.lng)
          if (latitude != null && longitude != null) return { ...row, latitude, longitude }
          const geocodeQuery = String(row.location || row.city || '').trim()
          if (!geocodeQuery) return null
          const resolved = await geocodeLocation(geocodeQuery)
          if (!resolved) return null
          return { ...row, latitude: resolved.lat, longitude: resolved.lng }
        }),
      )

      const validSelected = resolvedSelected.filter(Boolean) as any[]

      if (validSelected.length === 0) {
        return NextResponse.json(
          { error: 'Secili paylasimlar icin konum bilgisi bulunamadi.' },
          { status: 400 },
        )
      }

      // Baslangica gore en yakin komsu rotasi: varis noktasi en son secilen paylasim olur.
      const orderedByTrip = orderByNearestFromStart(fromCoords, validSelected).slice(0, stops)
      if (!toCoords && orderedByTrip.length > 0) {
        const last = orderedByTrip[orderedByTrip.length - 1]
        toCoords = { lat: last.latitude, lng: last.longitude }
      }
      if (!toCoords) toCoords = fromCoords

      const routeWaypoints: LatLng[] = [
        fromCoords,
        ...orderedByTrip.map((p: any) => ({ lat: p.latitude, lng: p.longitude })),
      ]

      const lastWaypoint = routeWaypoints[routeWaypoints.length - 1]
      if (!lastWaypoint || lastWaypoint.lat !== toCoords.lat || lastWaypoint.lng !== toCoords.lng) {
        routeWaypoints.push(toCoords)
      }

      const routing = await fetchRouteThroughPoints(routeWaypoints)
      const routePoints = routing.points

      const postIds = validSelected.map((p: any) => p.id)
      const likeCountMap = new Map<string, number>()
      if (postIds.length > 0) {
        const { data: likeRows } = await supabase.from('social_likes').select('post_id').in('post_id', postIds)
        for (const row of likeRows || []) {
          const key = String((row as any).post_id)
          likeCountMap.set(key, (likeCountMap.get(key) || 0) + 1)
        }
      }

      const scoredSelected = orderedByTrip.map((p: any) => {
        const routeDistance = distanceToRouteKm({ lat: p.latitude, lng: p.longitude }, routePoints)
        const likes = likeCountMap.get(String(p.id)) || 0
        const shares = toFiniteNumber(p.share_count) || toFiniteNumber(p.shares_count) || 0
        return {
          ...p,
          likes_count: likes,
          shares_count: shares,
          distance_to_route_km: Number(routeDistance.km.toFixed(2)),
          nearest_route_index: routeDistance.nearestIndex,
          score: scorePost(sortBy, likes, shares, routeDistance.km, p.created_at),
        }
      })

      const finalPosts = scoredSelected.slice(0, stops).map((p: any, i: number) => {
        const firstImage = Array.isArray(p.images) && p.images.length > 0
          ? p.images[0]
          : Array.isArray(p.image_urls) && p.image_urls.length > 0
            ? p.image_urls[0]
            : null
        return {
          id: p.id,
          stop_index: i + 1,
          title: p.title || p.content || null,
          description: p.description || p.content || null,
          category: p.category || null,
          location_name: p.location_name || p.location || null,
          city: p.city || null,
          district: p.district || null,
          country: p.country || null,
          latitude: p.latitude,
          longitude: p.longitude,
          likes_count: p.likes_count,
          shares_count: p.shares_count,
          distance_to_route_km: p.distance_to_route_km,
          image_url: firstImage,
          created_at: p.created_at,
        }
      })

      const lastStop = finalPosts[finalPosts.length - 1]
      const lastStopLabel = lastStop
        ? (lastStop.location_name || [lastStop.district, lastStop.city, lastStop.country].filter(Boolean).join(', ') || lastStop.title || 'Son durak')
        : 'Secili konumlar'

      const categoryOptions = Array.from(
        new Set(finalPosts.map((p: any) => String(p.category || '').trim()).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, 'tr'))

      return NextResponse.json({
        meta: {
          from: fromText || 'Secili konumlar',
          to: (toText || '').trim() || lastStopLabel,
          sortBy,
          category: categories.length > 0 ? categories : null,
          query: query || null,
          nearbyOnly: false,
          nearRadiusKm,
          corridorKm,
          stops: finalPosts.length,
          routeDistanceKm: routing.distanceKm,
          routeDurationMin: routing.durationMin,
          routingProvider: routing.provider,
          routeIsFallback: routing.isFallback,
          foundPosts: finalPosts.length,
          mode: 'selected_posts',
        },
        route: {
          from: fromCoords,
          to: toCoords,
          geometry: routePoints,
        },
        stops: finalPosts,
        categoryOptions,
        posts: finalPosts,
      })
    }

    if (!fromCoords || !toCoords) {
      return NextResponse.json(
        { error: 'Baslangic ve varis konumu gerekli. Metin veya enlem,boylam girebilirsin.' },
        { status: 400 },
      )
    }

    const routing = await fetchRouteWithFallback(fromCoords, toCoords)
    const routePoints = routing.points

    const socialFetch = await fetchSocialPostsSchemaSafe(supabase)
    if (socialFetch.error) {
      return NextResponse.json({ error: socialFetch.error.message }, { status: 500 })
    }

    if (socialFetch.removedColumns.length > 0) {
      console.warn('rare-travel-plan schema-safe social_posts select removed columns:', socialFetch.removedColumns)
    }

    const socialRows = socialFetch.rows

    const visiblePosts = (socialRows || []).filter((row: any) => {
      if (typeof row?.is_public === 'boolean' && row.is_public === false) return false
      return true
    })

    const withResolvedCoords = await Promise.all(
      visiblePosts.map(async (row: any) => {
        const latitude = toFiniteNumber(row.latitude ?? row.lat)
        const longitude = toFiniteNumber(row.longitude ?? row.lng)
        if (latitude != null && longitude != null) {
          return { ...row, latitude, longitude }
        }

        const geocodeQuery = String(row.location || row.city || '').trim()
        if (!geocodeQuery) return null

        const resolved = await geocodeLocation(geocodeQuery)
        if (!resolved) return null
        return { ...row, latitude: resolved.lat, longitude: resolved.lng }
      }),
    )

    let candidates = withResolvedCoords.filter(Boolean) as any[]

    if (query) {
      candidates = candidates.filter((p) => {
        const haystack = [p.title, p.content, p.description, p.category, p.location, p.city, p.district]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('tr-TR')
        return haystack.includes(query)
      })
    }

    if (nearbyOnly && currentLat != null && currentLng != null) {
      const me = { lat: currentLat, lng: currentLng }
      candidates = candidates.filter((p) => haversineKm(me, { lat: p.latitude, lng: p.longitude }) <= nearRadiusKm)
    }

    const postIds = candidates.map((p) => p.id)
    const likeCountMap = new Map<string, number>()

    if (postIds.length > 0) {
      const { data: likeRows } = await supabase.from('social_likes').select('post_id').in('post_id', postIds)
      for (const row of likeRows || []) {
        const key = String((row as any).post_id)
        likeCountMap.set(key, (likeCountMap.get(key) || 0) + 1)
      }
    }

    const scoredAll = candidates
      .map((p) => {
        const routeDistance = distanceToRouteKm({ lat: p.latitude, lng: p.longitude }, routePoints)
        const likes = likeCountMap.get(String(p.id)) || 0
        const shares =
          toFiniteNumber(p.share_count) ||
          toFiniteNumber(p.shares_count) ||
          toFiniteNumber(p.repost_count) ||
          0
        const score = scorePost(sortBy, likes, shares, routeDistance.km, p.created_at)

        return {
          ...p,
          likes_count: likes,
          shares_count: shares,
          distance_to_route_km: Number(routeDistance.km.toFixed(2)),
          nearest_route_index: routeDistance.nearestIndex,
          score,
        }
      })

    let effectiveCorridorKm = corridorKm
    let corridorScoped = scoredAll.filter((p) => p.distance_to_route_km <= effectiveCorridorKm)
    if (corridorScoped.length === 0 && scoredAll.length > 0) {
      for (const km of [25, 40, 60, 100, 180]) {
        effectiveCorridorKm = Math.max(corridorKm, km)
        corridorScoped = scoredAll.filter((p) => p.distance_to_route_km <= effectiveCorridorKm)
        if (corridorScoped.length > 0) break
      }
    }

    const categoryOptions = Array.from(
      new Set(
        corridorScoped
          .map((p) => String(p.category || '').trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, 'tr'))

    let scored = corridorScoped
    if (categories.length > 0) {
      const selectedCategorySet = new Set(categories.map((item) => item.toLocaleLowerCase('tr-TR')))
      scored = scored.filter((p) => selectedCategorySet.has(String(p.category || '').toLocaleLowerCase('tr-TR')))
    }

    const sorted = [...scored].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.distance_to_route_km - b.distance_to_route_km
    })

    // Segment bazli secim: rota boyunca dagitilmis, filtreleme oncelikli
    const segmentBest = new Map<number, any>()

    for (const item of sorted) {
      const ratio = routePoints.length > 1 ? item.nearest_route_index / (routePoints.length - 1) : 0
      const segmentIndex = Math.max(0, Math.min(stops - 1, Math.floor(ratio * stops)))
      const existing = segmentBest.get(segmentIndex)
      if (!existing || item.score > existing.score) {
        segmentBest.set(segmentIndex, item)
      }
    }

    const selectedIds = new Set<string>()
    const selected: any[] = []

    // Once her segmentten bir tane al
    for (let i = 0; i < stops; i += 1) {
      const best = segmentBest.get(i)
      if (best && !selectedIds.has(best.id)) {
        selected.push(best)
        selectedIds.add(best.id)
      }
    }

    // Bos segment olduysa (yeterli post yok) sirali listeden tamla
    for (const item of sorted) {
      if (selected.length >= stops) break
      if (selectedIds.has(item.id)) continue
      selected.push(item)
      selectedIds.add(item.id)
    }

    // Rota siralamasina gore diz (bas -> son)
    const stopPosts = selected.slice(0, stops).sort((a, b) => a.nearest_route_index - b.nearest_route_index)

    // Ayni (veya cok yakin) koordinata dusen durakları hafifce dairesel olarak dagit
    // (~0.003 derece ≈ 300m — gorsel ayristirma icin yeterli, haritada farkedilmez)
    const JITTER_DEG = 0.003
    const usedCoords: { lat: number; lng: number }[] = []
    const jitteredPosts = stopPosts.map((p) => {
      const TOO_CLOSE = 0.0005
      const isTooClose = usedCoords.some(
        (c) => Math.abs(c.lat - p.latitude) < TOO_CLOSE && Math.abs(c.lng - p.longitude) < TOO_CLOSE,
      )
      if (!isTooClose) {
        usedCoords.push({ lat: p.latitude, lng: p.longitude })
        return p
      }
      // Birbiri ardina gelen cakisan noktalar icin farkli acilarda kücük offset uygula
      const angle = (usedCoords.length * (360 / Math.max(stops, 5)) * Math.PI) / 180
      const jLat = p.latitude + JITTER_DEG * Math.cos(angle)
      const jLng = p.longitude + JITTER_DEG * Math.sin(angle)
      usedCoords.push({ lat: jLat, lng: jLng })
      return { ...p, latitude: jLat, longitude: jLng }
    })

    const normalizedPosts = jitteredPosts.map((p, stopIndex) => {
      const firstImage = Array.isArray(p.images) && p.images.length > 0
        ? p.images[0]
        : Array.isArray(p.image_urls) && p.image_urls.length > 0
          ? p.image_urls[0]
          : null

      return {
        id: p.id,
        stop_index: stopIndex + 1,
        title: p.title || p.content || null,
        description: p.description || p.content || null,
        category: p.category || null,
        location_name: p.location || null,
        city: p.city || null,
        district: p.district || null,
        country: p.country || 'Turkiye',
        latitude: p.latitude,
        longitude: p.longitude,
        likes_count: p.likes_count,
        shares_count: p.shares_count,
        distance_to_route_km: p.distance_to_route_km,
        image_url: firstImage,
        created_at: p.created_at,
        source_channel: 'social',
      }
    })

    // Duraklar = secilen postlarin konumlari (rota sirali)
    const stopsList = normalizedPosts.map((p) => ({
      index: p.stop_index,
      latitude: p.latitude,
      longitude: p.longitude,
      post_id: p.id,
      title: p.title,
      city: p.city,
      category: p.category,
      likes_count: p.likes_count,
      shares_count: p.shares_count,
      distance_to_route_km: p.distance_to_route_km,
      image_url: p.image_url,
    }))

    return NextResponse.json({
      meta: {
        from: fromText || `${fromCoords.lat},${fromCoords.lng}`,
        to: toText || `${toCoords.lat},${toCoords.lng}`,
        sortBy,
        category: categories.length > 0 ? categories : null,
        query: query || null,
        nearbyOnly,
        nearRadiusKm,
        corridorKm,
        effectiveCorridorKm,
        stops,
        routeDistanceKm: routing.distanceKm,
        routeDurationMin: routing.durationMin,
        routingProvider: routing.provider,
        routeIsFallback: routing.isFallback,
        foundPosts: normalizedPosts.length,
      },
      route: {
        from: fromCoords,
        to: toCoords,
        geometry: routePoints,
      },
      stops: stopsList,
      categoryOptions,
      posts: normalizedPosts,
    })
  } catch (err: any) {
    console.error('rare-travel-plan error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}

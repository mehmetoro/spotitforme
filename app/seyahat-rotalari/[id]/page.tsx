'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MapContainer, Marker, Popup, Polyline, TileLayer } from 'react-leaflet'
import L from 'leaflet'

type LatLng = { lat: number; lng: number }

type TravelRoute = {
  id: string
  session_id: string
  user_id: string
  title: string
  from_location: string
  to_location: string
  category: string | null
  visibility: 'private' | 'followers' | 'public'
  cover_collage_url: string | null
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
}

type LiveTripPost = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  location_name: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  visit_time: string | null
  visibility: 'private' | 'followers' | 'public'
  sort_order: number
}

type RoutePreviewResponse = {
  geometry: LatLng[]
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

async function resolveStopsWithCoordinates(rows: LiveTripPost[]): Promise<LiveTripPost[]> {
  const normalized = rows.map((row) => ({
    ...row,
    latitude: parseCoordinate(row.latitude),
    longitude: parseCoordinate(row.longitude),
  }))

  const resolved = await Promise.all(
    normalized.map(async (row) => {
      if (row.latitude != null && row.longitude != null) return row

      const query = [row.location_name, row.city].filter(Boolean).join(', ').trim()
      if (!query) return row

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}&accept-language=tr`,
          { headers: { 'User-Agent': 'spotitforme/1.0' } },
        )
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) return row

        const lat = parseCoordinate(data[0]?.lat)
        const lng = parseCoordinate(data[0]?.lon)
        if (lat == null || lng == null) return row

        return {
          ...row,
          latitude: lat,
          longitude: lng,
        }
      } catch {
        return row
      }
    }),
  )

  return resolved
}

function makeCircleIcon(color: string, label?: string) {
  const size = 30
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

type RouteComment = {
  id: string
  route_id: string
  user_id: string
  content: string
  created_at: string
}

function visibilityText(value: 'private' | 'followers' | 'public') {
  if (value === 'private') return 'Özel'
  if (value === 'followers') return 'Takip'
  return 'Genel'
}

export default function TravelRouteDetailPage() {
  const params = useParams()
  const routeId = params.id as string

  const [route, setRoute] = useState<TravelRoute | null>(null)
  const [stops, setStops] = useState<LiveTripPost[]>([])
  const [comments, setComments] = useState<RouteComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [routeGeometry, setRouteGeometry] = useState<LatLng[]>([])

  const mappableStops = useMemo(
    () =>
      stops
        .filter((stop) => stop.latitude != null && stop.longitude != null)
        .map((stop) => ({
          id: stop.id,
          title: stop.title,
          description: stop.description,
          location_name: stop.location_name,
          city: stop.city,
          visit_time: stop.visit_time,
          latitude: stop.latitude as number,
          longitude: stop.longitude as number,
        })),
    [stops],
  )

  const mapCenter: [number, number] = mappableStops.length
    ? [mappableStops[0].latitude, mappableStops[0].longitude]
    : [39, 35]

  const routeShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/seyahat-rotalari/${routeId}`
  }, [routeId])

  const loadComments = async () => {
    const { data } = await supabase
      .from('travel_route_comments')
      .select('id, route_id, user_id, content, created_at')
      .eq('route_id', routeId)
      .order('created_at', { ascending: false })
      .limit(300)

    setComments((data || []) as RouteComment[])
  }

  const refreshCounts = async () => {
    if (!route) return
    const [{ count: likesCount }, { count: commentsCount }, { count: sharesCount }] = await Promise.all([
      supabase.from('travel_route_likes').select('id', { count: 'exact', head: true }).eq('route_id', route.id),
      supabase.from('travel_route_comments').select('id', { count: 'exact', head: true }).eq('route_id', route.id),
      supabase.from('travel_route_shares').select('id', { count: 'exact', head: true }).eq('route_id', route.id),
    ])

    const next = {
      likes_count: likesCount || 0,
      comments_count: commentsCount || 0,
      shares_count: sharesCount || 0,
    }

    await supabase.from('travel_routes').update(next).eq('id', route.id)
    setRoute((prev) => (prev ? { ...prev, ...next } : prev))
  }

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)

        const { data: routeRow, error: routeErr } = await supabase
          .from('travel_routes')
          .select('*')
          .eq('id', routeId)
          .single()

        if (routeErr || !routeRow) {
          setError('Rota bulunamadı veya erişim izni yok.')
          setLoading(false)
          return
        }

        setRoute(routeRow as TravelRoute)

        const { data: stopRows } = await supabase
          .from('live_trip_posts')
          .select('id, title, description, image_url, location_name, city, latitude, longitude, visit_time, visibility, sort_order')
          .eq('session_id', (routeRow as TravelRoute).session_id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true })

        const resolvedStops = await resolveStopsWithCoordinates((stopRows || []) as LiveTripPost[])
        setStops(resolvedStops)
        await loadComments()
      } catch (err: any) {
        setError(err?.message || 'Rota detay yüklenemedi.')
      } finally {
        setLoading(false)
      }
    }

    load()

    const routeChannel = supabase
      .channel(`travel-route-${routeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_routes',
          filter: `id=eq.${routeId}`,
        },
        (payload) => {
          if (payload.new) {
            setRoute(payload.new as TravelRoute)
          }
        },
      )
      .subscribe()

    const commentsChannel = supabase
      .channel(`travel-route-comments-${routeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_route_comments',
          filter: `route_id=eq.${routeId}`,
        },
        async () => {
          await loadComments()
          await refreshCounts()
        },
      )
      .subscribe()

    const socialCountChannel = supabase
      .channel(`travel-route-social-${routeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_route_likes',
          filter: `route_id=eq.${routeId}`,
        },
        async () => {
          await refreshCounts()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_route_shares',
          filter: `route_id=eq.${routeId}`,
        },
        async () => {
          await refreshCounts()
        },
      )
      .subscribe()

    return () => {
      routeChannel.unsubscribe()
      commentsChannel.unsubscribe()
      socialCountChannel.unsubscribe()
    }
  }, [routeId])

  useEffect(() => {
    const loadGeometry = async () => {
      if (mappableStops.length < 2) {
        setRouteGeometry(mappableStops.map((stop) => ({ lat: stop.latitude, lng: stop.longitude })))
        return
      }

      const points = mappableStops.map((stop) => ({ lat: stop.latitude, lng: stop.longitude }))

      try {
        const res = await fetch('/api/travel-routes/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points }),
        })

        if (!res.ok) throw new Error('Rota onizleme hatasi')
        const data = (await res.json()) as RoutePreviewResponse
        setRouteGeometry(data.geometry?.length ? data.geometry : points)
      } catch {
        setRouteGeometry(points)
      }
    }

    loadGeometry()
  }, [mappableStops])

  const handleLike = async () => {
    if (!route || !currentUserId) return
    setActionBusy(true)
    try {
      await supabase
        .from('travel_route_likes')
        .upsert({ route_id: route.id, user_id: currentUserId }, { onConflict: 'route_id,user_id' })
      await refreshCounts()
    } finally {
      setActionBusy(false)
    }
  }

  const handleShare = async () => {
    if (!route || !currentUserId) return
    setActionBusy(true)
    try {
      await supabase
        .from('travel_route_shares')
        .upsert({ route_id: route.id, user_id: currentUserId }, { onConflict: 'route_id,user_id' })
      await refreshCounts()
      if (routeShareUrl) {
        await navigator.clipboard.writeText(routeShareUrl)
      }
    } finally {
      setActionBusy(false)
    }
  }

  const handleAddComment = async () => {
    if (!route || !currentUserId) return
    const content = commentText.trim()
    if (!content) return
    setActionBusy(true)
    try {
      await supabase.from('travel_route_comments').insert({
        route_id: route.id,
        user_id: currentUserId,
        content,
      })
      setCommentText('')
      await loadComments()
      await refreshCounts()
    } finally {
      setActionBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Yükleniyor...</div>
      </section>
    )
  }

  if (!route) {
    return (
      <section className="space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error || 'Rota bulunamadı'}
        </div>
        <Link href="/seyahat-rotalari" className="text-sm font-semibold text-blue-700 hover:underline">
          Seyahat rotalarına dön
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-4 p-4 md:p-6">
      <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-4 md:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">Nadir Rotalar</p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">{route.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{route.from_location} {'->'} {route.to_location}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-cyan-100 px-2 py-1 font-bold text-cyan-700">{route.category || 'Seyahat'}</span>
          <span className="rounded-md bg-gray-100 px-2 py-1 font-bold text-gray-700">{visibilityText(route.visibility)}</span>
        </div>
      </div>

      {route.cover_collage_url && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <img src={route.cover_collage_url} alt={route.title} className="h-auto w-full object-cover" />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-bold text-gray-900">Rota Haritasi</h2>
          <p className="mt-1 text-xs text-gray-500">Durak koordinatlarina gore cizilen rota</p>
        </div>
        {mappableStops.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Bu rotada haritada gosterilecek koordinatli durak bulunamadi.</div>
        ) : (
          <div className="h-[360px] w-full">
            <MapContainer center={mapCenter} zoom={6} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {routeGeometry.length > 1 && (
                <Polyline
                  positions={routeGeometry.map((p) => [p.lat, p.lng])}
                  pathOptions={{ color: '#059669', weight: 4, opacity: 0.85 }}
                />
              )}

              {mappableStops.map((stop, idx) => (
                <Marker
                  key={stop.id}
                  position={[stop.latitude, stop.longitude]}
                  icon={makeCircleIcon('#0ea5e9', String(idx + 1))}
                >
                  <Popup>
                    <div className="w-52">
                      <p className="text-sm font-semibold text-gray-900">{stop.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{[stop.location_name, stop.city].filter(Boolean).join(' · ') || 'Konum yok'}</p>
                      <p className="mt-0.5 text-xs text-emerald-700">Saat: {stop.visit_time || '--:--'}</p>
                      {stop.description && <p className="mt-1 text-xs text-gray-700">{stop.description}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={!currentUserId || actionBusy}
            className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            ❤️ Beğen
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!currentUserId || actionBusy}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            🔁 Paylaş
          </button>
          <div className="text-xs text-gray-600">
            ❤️ {route.likes_count} · 💬 {route.comments_count} · 🔁 {route.shares_count}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <h2 className="text-base font-bold text-gray-900">Duraklar</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stops.map((stop, index) => (
            <article key={stop.id} className="overflow-hidden rounded-xl border border-gray-200">
              {stop.image_url ? (
                <img src={stop.image_url} alt={stop.title} className="h-32 w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-gray-100 text-sm text-gray-500">Görsel yok</div>
              )}
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-600">Durak {index + 1}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">{stop.title}</p>
                <p className="mt-1 text-xs text-gray-500">{[stop.location_name, stop.city].filter(Boolean).join(' · ') || 'Konum yok'}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 font-bold text-emerald-700">{stop.visit_time || '--:--'}</span>
                  <span className="rounded-md bg-gray-100 px-2 py-1 font-bold text-gray-700">{visibilityText(stop.visibility)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <h2 className="text-base font-bold text-gray-900">Yorumlar ({route.comments_count})</h2>

        <div className="mt-3 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Yorumunu yaz..."
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!currentUserId || actionBusy || !commentText.trim()}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Gönder
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {comments.length === 0 && <p className="text-sm text-gray-500">Henüz yorum yok.</p>}
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-gray-600">{comment.user_id.slice(0, 8)}...</p>
                <p className="text-[11px] text-gray-500">{new Date(comment.created_at).toLocaleString('tr-TR')}</p>
              </div>
              <p className="mt-1 text-sm text-gray-800">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>

      <Link href="/seyahat-rotalari" className="inline-block text-sm font-semibold text-blue-700 hover:underline">
        ← Seyahat rotalarına dön
      </Link>
    </section>
  )
}
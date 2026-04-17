'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

type RoutePreviewPost = {
  id: string
  title: string
  image_url: string | null
}

type FilterTab = 'private' | 'follow' | 'popular' | 'category'

function score(route: TravelRoute) {
  return route.likes_count * 2 + route.comments_count * 3 + route.shares_count * 4
}

export default function TravelRoutesPage() {
  const router = useRouter()
  const [routes, setRoutes] = useState<TravelRoute[]>([])
  const [previews, setPreviews] = useState<Record<string, RoutePreviewPost[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<FilterTab>('popular')
  const [category, setCategory] = useState<string>('all')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const [busyRouteId, setBusyRouteId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)

        if (user?.id) {
          const { data: follows } = await supabase
            .from('social_follows')
            .select('following_id')
            .eq('follower_id', user.id)
          setFollowingIds((follows || []).map((row: any) => row.following_id).filter(Boolean))
        }

        const { data: routeRows, error: routeErr } = await supabase
          .from('travel_routes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200)

        if (routeErr) throw routeErr

        const routeList = (routeRows || []) as TravelRoute[]
        setRoutes(routeList)

        const sessionIds = routeList.map((route) => route.session_id).filter(Boolean)
        if (sessionIds.length > 0) {
          const { data: postRows } = await supabase
            .from('live_trip_posts')
            .select('id, session_id, title, image_url, sort_order')
            .in('session_id', sessionIds)
            .order('sort_order', { ascending: true })
            .limit(800)

          const grouped: Record<string, RoutePreviewPost[]> = {}
          for (const row of postRows || []) {
            const key = (row as any).session_id as string
            if (!grouped[key]) grouped[key] = []
            if (grouped[key].length < 3) {
              grouped[key].push({
                id: (row as any).id,
                title: (row as any).title || 'Durak',
                image_url: (row as any).image_url || null,
              })
            }
          }
          setPreviews(grouped)
        }
      } catch (err: any) {
        setError(err?.message || 'Seyahat rotalari yuklenemedi.')
      } finally {
        setLoading(false)
      }
    }

    load()

    const channel = supabase
      .channel('travel-routes-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_routes',
        },
        (payload) => {
          const next = payload.new as TravelRoute
          const prevRow = payload.old as TravelRoute

          if (payload.eventType === 'INSERT' && next?.id) {
            setRoutes((prev) => {
              const exists = prev.some((row) => row.id === next.id)
              if (exists) return prev
              return [next, ...prev]
            })
          }

          if (payload.eventType === 'UPDATE' && next?.id) {
            setRoutes((prev) => prev.map((row) => (row.id === next.id ? { ...row, ...next } : row)))
          }

          if (payload.eventType === 'DELETE' && prevRow?.id) {
            setRoutes((prev) => prev.filter((row) => row.id !== prevRow.id))
          }
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(routes.map((route) => route.category).filter(Boolean))) as string[]
    return ['all', ...unique]
  }, [routes])

  const filteredRoutes = useMemo(() => {
    let next = [...routes]

    if (tab === 'private') {
      next = next.filter((route) => route.user_id === currentUserId && route.visibility === 'private')
    }

    if (tab === 'follow') {
      next = next.filter(
        (route) =>
          followingIds.includes(route.user_id) && (route.visibility === 'followers' || route.visibility === 'public'),
      )
    }

    if (tab === 'popular') {
      next = next.filter((route) => route.visibility === 'public' || route.user_id === currentUserId)
      next.sort((a, b) => score(b) - score(a))
    }

    if (tab === 'category') {
      next = next.filter((route) => route.visibility !== 'private' || route.user_id === currentUserId)
      if (category !== 'all') {
        next = next.filter((route) => route.category === category)
      }
    }

    return next
  }, [routes, tab, category, currentUserId, followingIds])

  const refreshRouteCounts = async (routeId: string) => {
    const [{ count: likesCount }, { count: commentsCount }, { count: sharesCount }] = await Promise.all([
      supabase.from('travel_route_likes').select('id', { count: 'exact', head: true }).eq('route_id', routeId),
      supabase.from('travel_route_comments').select('id', { count: 'exact', head: true }).eq('route_id', routeId),
      supabase.from('travel_route_shares').select('id', { count: 'exact', head: true }).eq('route_id', routeId),
    ])

    const nextLikes = likesCount || 0
    const nextComments = commentsCount || 0
    const nextShares = sharesCount || 0

    await supabase
      .from('travel_routes')
      .update({ likes_count: nextLikes, comments_count: nextComments, shares_count: nextShares })
      .eq('id', routeId)

    setRoutes((prev) =>
      prev.map((route) =>
        route.id === routeId
          ? { ...route, likes_count: nextLikes, comments_count: nextComments, shares_count: nextShares }
          : route,
      ),
    )
  }

  const handleLike = async (route: TravelRoute) => {
    if (!currentUserId) return
    setBusyRouteId(route.id)
    try {
      await supabase
        .from('travel_route_likes')
        .upsert({ route_id: route.id, user_id: currentUserId }, { onConflict: 'route_id,user_id' })
      await refreshRouteCounts(route.id)
    } finally {
      setBusyRouteId(null)
    }
  }

  const handleShare = async (route: TravelRoute) => {
    if (!currentUserId) return
    setBusyRouteId(route.id)
    try {
      await supabase
        .from('travel_route_shares')
        .upsert({ route_id: route.id, user_id: currentUserId }, { onConflict: 'route_id,user_id' })
      await refreshRouteCounts(route.id)
      const shareUrl = `${window.location.origin}/rare-travel-plan/live/${route.session_id}/summary`
      await navigator.clipboard.writeText(shareUrl)
    } finally {
      setBusyRouteId(null)
    }
  }

  const handleComment = async (route: TravelRoute) => {
    if (!currentUserId) return
    const content = window.prompt('Yorumunu yaz')?.trim()
    if (!content) return
    setBusyRouteId(route.id)
    try {
      await supabase.from('travel_route_comments').insert({
        route_id: route.id,
        user_id: currentUserId,
        content,
      })
      await refreshRouteCounts(route.id)
    } finally {
      setBusyRouteId(null)
    }
  }

  return (
    <section className="space-y-4 p-4 md:p-6">
      <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-4 md:p-5">
        <h1 className="text-xl font-bold text-gray-900">Seyahat Rotaları</h1>
        <p className="mt-1 text-sm text-gray-600">
          Canli seyahatten uretilen, begeni/yorum/paylasimlari discovery'den ayri akan rota paylasimlari.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('private')}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${tab === 'private' ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-700'}`}
          >
            🎯 Ozel
          </button>
          <button
            type="button"
            onClick={() => setTab('follow')}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${tab === 'follow' ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-700'}`}
          >
            👥 Takip
          </button>
          <button
            type="button"
            onClick={() => setTab('popular')}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${tab === 'popular' ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-700'}`}
          >
            🔥 Populer
          </button>
          <button
            type="button"
            onClick={() => setTab('category')}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${tab === 'category' ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-700'}`}
          >
            🏷️ Kategoriler
          </button>
          {tab === 'category' && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'Tum kategoriler' : item}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Rotalar yukleniyor...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredRoutes.map((route) => {
          const cards = previews[route.session_id] || []
          return (
            <article
              key={route.id}
              onClick={() => router.push(`/rare-travel-plan/live/${route.session_id}?mode=route`)}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white cursor-pointer transition hover:shadow-md"
            >
              <div className="grid h-40 grid-cols-3 gap-1 bg-gray-100 p-1">
                {cards.length === 0 && (
                  <div className="col-span-3 flex items-center justify-center text-xs text-gray-500">
                    Kolaj hazir degil
                  </div>
                )}
                {cards.map((card) => (
                  <div key={card.id} className="relative overflow-hidden rounded-lg bg-gray-200">
                    {card.image_url ? (
                      <img src={card.image_url} alt={card.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] text-gray-500">
                        {card.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3">
                <p className="line-clamp-1 text-sm font-bold text-gray-900">{route.title}</p>
                <p className="mt-1 text-xs text-gray-500">{route.from_location} {'->'} {route.to_location}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded-md bg-cyan-100 px-2 py-1 text-[10px] font-bold text-cyan-700">
                    {route.category || 'Seyahat'}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {route.visibility === 'private' ? 'Ozel' : route.visibility === 'followers' ? 'Takip' : 'Genel'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  ❤️ {route.likes_count} · 💬 {route.comments_count} · 🔁 {route.shares_count}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(route)
                    }}
                    disabled={!currentUserId || busyRouteId === route.id}
                    className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  >
                    ❤️ Beğen
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleComment(route)
                    }}
                    disabled={!currentUserId || busyRouteId === route.id}
                    className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    💬 Yorum
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(route)
                    }}
                    disabled={!currentUserId || busyRouteId === route.id}
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    🔁 Paylaş
                  </button>
                  <Link
                    href={`/rare-travel-plan/live/${route.session_id}?mode=route`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Plani ac
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {!loading && filteredRoutes.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Bu filtrede rota yok.
        </div>
      )}
    </section>
  )
}

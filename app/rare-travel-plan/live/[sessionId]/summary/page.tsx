'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
          router.push('/auth')
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

        setSession(sessionData)

        const { data: tripRows } = await supabase
          .from('live_trip_posts')
          .select('id, title, location_name, city, visit_time, visibility, sort_order')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true })

        setCollectedPosts((tripRows || []) as CollectedPost[])

        const { data: planData, error: planErr } = await supabase
          .from('rare_travel_plans')
          .select('*')
          .eq('id', sessionData.plan_id)
          .single()

        if (planErr || !planData) {
          setError('Plan bulunamadı.')
          setLoading(false)
          return
        }

        setPlan(planData)
        setLoading(false)
      } catch (err: any) {
        setError(err?.message || 'Veri yüklenemedi.')
        setLoading(false)
      }
    }

    loadData()
  }, [sessionId, router])

  const shareSession = async () => {
    if (!plan) return

    setSharing(true)
    try {
      // Generate shareable link
      const url = `${window.location.origin}/rare-travel-plan/live/${sessionId}/summary`
      await navigator.clipboard.writeText(url)

      alert('Paylaşım linki panoya kopyalandı!')
    } catch (err) {
      alert('Bağlantı kopyalanamadı.')
    } finally {
      setSharing(false)
    }
  }

  if (loading) {
    return (
      <section className="space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-300 border-t-emerald-600" />
          <p className="mt-3 text-sm text-gray-600">Yükleniyor...</p>
        </div>
      </section>
    )
  }

  if (!session || !plan) {
    return (
      <section className="space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">{error || 'Veri bulunamadı.'}</p>
          <Link href="/rare-travel-plan" className="mt-3 inline-block text-sm font-semibold text-red-700 hover:underline">
            Planlara dön
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
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Seyahatiniz Tamamlandı!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Harika bir deneyim paylaştınız. Anılarınız kalıcı hale getirildi.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Seyahat Süresi</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {hours}h {minutes}m {seconds}s
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Toplanan Paylaşımlar</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{collectedPosts.length}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rota Mesafesi</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{session.total_km || '—'} km</p>
        </div>
      </div>

      {/* Plan Details */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <h2 className="font-bold text-gray-900">Seyahat Bilgileri</h2>
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Plan Adı:</span> {plan.title}
          </p>
          <p>
            <span className="font-semibold">Başlangıç:</span> {plan.from_location}
          </p>
          <p>
            <span className="font-semibold">Varış:</span> {plan.to_location}
          </p>
          <p>
            <span className="font-semibold">Başlangıç Tarihi:</span>{' '}
            {new Date(session.started_at).toLocaleString('tr-TR')}
          </p>
          <p>
            <span className="font-semibold">Tamamlanma Tarihi:</span>{' '}
            {session.completed_at ? new Date(session.completed_at).toLocaleString('tr-TR') : '—'}
          </p>
          <p>
            <span className="font-semibold">Görünürlük:</span>{' '}
            {session.visibility === 'private'
              ? '🔒 Sadece ben'
              : session.visibility === 'followers'
                ? '👥 Takipçilerim'
                : '🌍 Herkese açık'}
          </p>
        </div>
      </div>

      {collectedPosts.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <h2 className="font-bold text-gray-900">Seyahat zaman cizelgesi</h2>
          <p className="mt-1 text-xs text-gray-500">Kullanici saat girişiyle olusan "su saatte suradaydik" akisi.</p>
          <div className="mt-3 space-y-2">
            {collectedPosts.map((post, index) => (
              <div key={`timeline-${post.id}`} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="w-14 rounded-md bg-emerald-100 px-2 py-1 text-center text-xs font-bold text-emerald-700">
                  {post.visit_time || session.post_time_map?.[post.id] || '--:--'}
                </span>
                <span className="w-7 text-xs font-bold text-gray-500">#{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{post.title || 'Paylaşım'}</p>
                  <p className="truncate text-xs text-gray-500">{[post.location_name, post.city].filter(Boolean).join(' · ') || 'Konum yok'}</p>
                </div>
                <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                  {post.visibility === 'private' ? 'Özel' : post.visibility === 'followers' ? 'Takip' : 'Genel'}
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
          {sharing ? 'Kopyalanıyor...' : '🔗 Paylaş'}
        </button>

        <Link
          href={`/rare-travel-plan/live/${sessionId}`}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          📍 Haritayı Görüntüle
        </Link>

        <Link
          href="/seyahat-rotalari"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
        >
          🧭 Seyahat Rotaları Akışı
        </Link>

        <Link
          href="/rare-travel-plan"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Başka Plan Oluştur
        </Link>
      </div>

      {/* Share Info */}
      {session.visibility !== 'private' && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">💡 İpucu:</span> Bu seyahat{' '}
            {session.visibility === 'followers' ? 'takipçileriniz' : 'herkese'} açıktır. Diğer
            kullanıcılar sizin seyahatinizin rotasını ve topladığınız paylaşımları görebilir.
          </p>
        </div>
      )}
    </section>
  )
}

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(token)

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, latitude, longitude } = await request.json()

    if (!postId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'postId, latitude, longitude gerekli' },
        { status: 400 },
      )
    }

    // Aktif oturum bul
    const { data: sessionData, error: sessionErr } = await supabase
      .from('live_travel_sessions')
      .select('id, plan_id, posts_collected, post_time_map')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionErr || !sessionData) {
      return NextResponse.json({ added: false, reason: 'no_active_session' })
    }

    // Plan sorgusu parametrelerini al
    const { data: planData } = await supabase
      .from('rare_travel_plans')
      .select('query_params')
      .eq('id', sessionData.plan_id)
      .single()

    if (!planData) {
      return NextResponse.json({ added: false, reason: 'plan_not_found' })
    }

    // Rotayı kontrol et (corridor içine giriyor mu?)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const plannerRes = await fetch(`${appUrl}/api/rare-travel-plan?${planData.query_params}`)
    const planResult = await plannerRes.json()

    // Paylaşımın koordinatlarının rotaya ne kadar yakın olduğunu kontrol et
    // Basit olarak: rota üstündeki main posts'tan herhangi biri ~10km içindeyse kabul et
    const corridorKm = planResult.meta?.corridorKm || 12
    const maxDistKm = corridorKm

    const isNearRoute = planResult.posts.some((p: any) => {
      // Haversine distance
      const R = 6371
      const dLat = ((p.latitude - latitude) * Math.PI) / 180
      const dLng = ((p.longitude - longitude) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((p.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c
      return distance <= maxDistKm
    })

    if (!isNearRoute) {
      return NextResponse.json({ added: false, reason: 'not_near_route' })
    }

    // Paylaşımı oturum poslarına ekle
    const currentPosts = sessionData.posts_collected || []
    const currentTimeMap = (sessionData.post_time_map || {}) as Record<string, string>
    if (!currentPosts.includes(postId)) {
      const updatedPosts = [...currentPosts, postId]
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const updatedTimeMap = {
        ...currentTimeMap,
        [postId]: currentTimeMap[postId] || `${hh}:${mm}`,
      }

      const { error: updateErr } = await supabase
        .from('live_travel_sessions')
        .update({ posts_collected: updatedPosts, post_time_map: updatedTimeMap })
        .eq('id', sessionData.id)

      if (updateErr) {
        console.error('Live session update error:', updateErr)
        return NextResponse.json({ error: updateErr.message }, { status: 500 })
      }

      // Ayrı tablo: bu seyahate özel postlar (global feed'den bağımsız)
      const { data: sourcePost } = await supabase
        .from('social_posts')
        .select('id, title, content, category, location, city, latitude, longitude, images')
        .eq('id', postId)
        .eq('user_id', user.id)
        .single()

      if (sourcePost) {
        const { data: existingTripRow } = await supabase
          .from('live_trip_posts')
          .select('id')
          .eq('session_id', sessionData.id)
          .eq('source_social_post_id', postId)
          .maybeSingle()

        if (!existingTripRow) {
          await supabase.from('live_trip_posts').insert({
            session_id: sessionData.id,
            user_id: user.id,
            source_social_post_id: sourcePost.id,
            title: sourcePost.title || sourcePost.content || 'Seyahat paylaşımı',
            description: sourcePost.content,
            image_url: Array.isArray(sourcePost.images) && sourcePost.images.length > 0 ? sourcePost.images[0] : null,
            category: sourcePost.category,
            location_name: sourcePost.location,
            city: sourcePost.city,
            latitude: sourcePost.latitude,
            longitude: sourcePost.longitude,
            visit_time: `${hh}:${mm}`,
            visibility: 'followers',
            sort_order: updatedPosts.length - 1,
          })
        }
      }

      return NextResponse.json({ added: true, sessionId: sessionData.id })
    }

    return NextResponse.json({ added: false, reason: 'already_collected' })
  } catch (error: any) {
    console.error('Live post add error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

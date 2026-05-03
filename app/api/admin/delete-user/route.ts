import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id } = body as { user_id: string }

    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json({ error: 'Geçerli bir user_id gerekli' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 })
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // user_profiles.id ile auth user id farklı olabilir (eski kayıtlar)
    const { data: profileRow } = await adminClient
      .from('user_profiles')
      .select('id, user_id')
      .eq('id', user_id)
      .maybeSingle()

    // Strateji 1: gönderilen id doğrudan auth.users.id mi?
    let authUserId: string | null = null
    const { data: directAuthUser } = await adminClient.auth.admin.getUserById(user_id)
    if (directAuthUser?.user?.id) {
      authUserId = directAuthUser.user.id
    }

    // Strateji 2: user_profiles.user_id kolonu dolu mu?
    if (!authUserId && (profileRow as any)?.user_id) {
      const { data: authUserByProfileUserId } = await adminClient.auth.admin.getUserById(
        (profileRow as any).user_id
      )
      if (authUserByProfileUserId?.user?.id) {
        authUserId = authUserByProfileUserId.user.id
      }
    }

    if (!authUserId) {
      return NextResponse.json(
        { error: 'Auth kullanıcısı bulunamadı. Supabase Dashboard → Authentication üzerinden manuel silin.' },
        { status: 404 }
      )
    }

    // Profil kaydı yoksa sadece auth kullanıcısını sil
    if (!profileRow) {
      const { error: directAuthDeleteError } = await adminClient.auth.admin.deleteUser(authUserId)
      if (directAuthDeleteError) throw directAuthDeleteError
      return NextResponse.json({ ok: true, deleted_user_id: authUserId })
    }

    // ilişkili veri temizliği için: user_profiles.id (FK'larda bu kullanılıyor)
    const profileId: string = user_id

    // Önce ilişkili veriler temizlenir

    // Mesajlaşma — participant olan thread'lerdeki mesajları ve thread'leri sil
    const { data: userThreads } = await adminClient
      .from('message_threads')
      .select('id')
      .or(`participant1_id.eq.${profileId},participant2_id.eq.${profileId}`)

    if (userThreads && userThreads.length > 0) {
      const threadIds = userThreads.map((t: { id: string }) => t.id)
      await adminClient.from('messages').delete().in('thread_id', threadIds)
      await adminClient.from('thread_participants').delete().in('thread_id', threadIds)
      await adminClient.from('trade_agreements').delete().in('thread_id', threadIds)
      await adminClient.from('message_threads').delete().in('id', threadIds)
    }

    const { error: spotsDeleteError } = await adminClient.from('spots').delete().eq('user_id', authUserId)
    if (spotsDeleteError) throw spotsDeleteError

    const { error: sightingsDeleteError } = await adminClient.from('sightings').delete().eq('spotter_id', authUserId)
    if (sightingsDeleteError) throw sightingsDeleteError

    const { error: quickSightingsDeleteError } = await adminClient.from('quick_sightings').delete().eq('user_id', authUserId)
    if (quickSightingsDeleteError) throw quickSightingsDeleteError

    const { error: profileDeleteError } = await adminClient.from('user_profiles').delete().eq('id', profileId)
    if (profileDeleteError) throw profileDeleteError

    // Son olarak auth user silinir
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(authUserId)
    if (authDeleteError) throw authDeleteError

    return NextResponse.json({ ok: true, deleted_user_id: authUserId })
  } catch (err: any) {
    console.error('[delete-user] Hata:', err)
    return NextResponse.json(
      { error: err?.message || 'Kullanıcı silinemedi' },
      { status: 500 },
    )
  }
}

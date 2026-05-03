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
    // user_profiles.user_id alanı gerçek auth.users.id'yi tutar
    const { data: profileRow } = await adminClient
      .from('user_profiles')
      .select('id, user_id, email')
      .eq('id', user_id)
      .maybeSingle()

    let authUserId: string = (profileRow as any)?.user_id || user_id

    // user_id kolonu boşsa email ile auth user'ı bul
    if (!(profileRow as any)?.user_id && (profileRow as any)?.email) {
      const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
      const matched = listData?.users?.find(
        (u) => u.email === (profileRow as any).email
      )
      if (matched?.id) {
        authUserId = matched.id
      }
    }

    // Profil kaydı bulunamadıysa (önceki silme denemesinde profile silindi ama auth kaldıysa)
    // gönderilen id'yi doğrudan auth üzerinde dene
    if (!profileRow) {
      const { error: directAuthDeleteError } = await adminClient.auth.admin.deleteUser(user_id)
      if (directAuthDeleteError) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı veya zaten silinmiş' }, { status: 404 })
      }
      return NextResponse.json({ ok: true, deleted_user_id: user_id })
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

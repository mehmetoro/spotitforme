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

    // Önce ilişkili veriler temizlenir
    const { error: spotsDeleteError } = await adminClient.from('spots').delete().eq('user_id', user_id)
    if (spotsDeleteError) throw spotsDeleteError

    const { error: sightingsDeleteError } = await adminClient.from('sightings').delete().eq('spotter_id', user_id)
    if (sightingsDeleteError) throw sightingsDeleteError

    const { error: quickSightingsDeleteError } = await adminClient.from('quick_sightings').delete().eq('user_id', user_id)
    if (quickSightingsDeleteError) throw quickSightingsDeleteError

    const { error: profileDeleteError } = await adminClient.from('user_profiles').delete().eq('id', user_id)
    if (profileDeleteError) throw profileDeleteError

    // Son olarak auth user silinir
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user_id)
    if (authDeleteError) throw authDeleteError

    return NextResponse.json({ ok: true, deleted_user_id: user_id })
  } catch (err: any) {
    console.error('[delete-user] Hata:', err)
    return NextResponse.json(
      { error: err?.message || 'Kullanıcı silinemedi' },
      { status: 500 },
    )
  }
}

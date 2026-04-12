import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_TABLES = ['spots', 'social_posts'] as const

type AllowedTable = (typeof ALLOWED_TABLES)[number]

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { table_name, id } = body as { table_name: string; id: string }

    if (!ALLOWED_TABLES.includes(table_name as AllowedTable)) {
      return NextResponse.json({ error: 'Geçersiz tablo adı' }, { status: 400 })
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Geçerli bir id gerekli' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 })
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: existing, error: fetchError } = await adminClient
      .from(table_name)
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!existing) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })
    }

    const { error } = await adminClient.from(table_name).delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true, table: table_name, deleted_id: id })
  } catch (err: any) {
    console.error('[delete-record] Hata:', err)
    return NextResponse.json(
      { error: err?.message || 'Silme işlemi başarısız' },
      { status: 500 },
    )
  }
}

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Sadece bu iki tablo silinebilir – injection koruması
const ALLOWED_TABLES = ['sightings', 'quick_sightings'] as const

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { table_name, id, delete_reports, only_reports } = body as {
      table_name: string
      id: string
      delete_reports?: boolean
      only_reports?: boolean
    }

    if (!ALLOWED_TABLES.includes(table_name as (typeof ALLOWED_TABLES)[number])) {
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

    // Sadece bağlı kullanıcı raporlarını temizleme modu
    if (delete_reports && only_reports) {
      await adminClient
        .from('product_user_reports')
        .delete()
        .eq('table_name', table_name)
        .eq('record_id', id)

      return NextResponse.json({ ok: true, reports_only: true, table: table_name, record_id: id })
    }

    // Kayıt var mı kontrol et
    const { data: existing, error: fetchError } = await adminClient
      .from(table_name)
      .select('id, source_channel')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!existing) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })
    }

    // Source table'dan sil
    const { error: deleteError } = await adminClient.from(table_name).delete().eq('id', id)
    if (deleteError) throw deleteError

    // Bağlı kullanıcı bildirimleri varsa onları da sil
    if (delete_reports) {
      await adminClient
        .from('product_user_reports')
        .delete()
        .eq('table_name', table_name)
        .eq('record_id', id)
      // product_user_reports henüz yoksa hata vermesin, sessizce geç
    }

    return NextResponse.json({ ok: true, deleted_id: id, table: table_name })
  } catch (err: any) {
    console.error('[delete-virtual] Hata:', err)
    return NextResponse.json(
      { error: err?.message || 'Silme işlemi başarısız' },
      { status: 500 },
    )
  }
}

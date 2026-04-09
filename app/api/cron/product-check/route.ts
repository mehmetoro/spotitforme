// app/api/cron/product-check/route.ts
// Periyodik sanal paylaşım stok ve erişilebilirlik kontrolü
// Vercel Cron veya harici zamanlayıcı ile çağrılır: GET /api/cron/product-check
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkProductUrl } from '@/lib/product-check'

export const dynamic = 'force-dynamic'
// Edge yerine Node runtime: response.text() ve uzun süre çalışma için
export const maxDuration = 60

// Kaç saatte bir yeniden kontrol yapılacak
const RECHECK_AFTER_HOURS = 72
// Tek seferinde en fazla kaç kayıt işlenecek (rate limiting için)
const BATCH_SIZE = 20
// İstekler arası bekleme (ms) – site ban riskini azaltır
const DELAY_MS = 1500

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type TableName = 'sightings' | 'quick_sightings'

interface RecordToCheck {
  id: string
  product_url: string
  table_name: TableName
}

export async function GET(request: NextRequest) {
  // Cron secret doğrulaması
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase config eksik' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // RECHECK_AFTER_HOURS öncesinden daha eski veya hiç kontrol edilmemiş kayıtları bul
  const recheckBefore = new Date(
    Date.now() - RECHECK_AFTER_HOURS * 60 * 60 * 1000,
  ).toISOString()

  const records: RecordToCheck[] = []

  // sightings tablosu
  const { data: sightingRows } = await supabase
    .from('sightings')
    .select('id, product_url')
    .eq('source_channel', 'virtual')
    .eq('is_hidden', false)
    .not('product_url', 'is', null)
    .or(`product_checked_at.is.null,product_checked_at.lt.${recheckBefore}`)
    .limit(BATCH_SIZE)

  for (const row of sightingRows ?? []) {
    records.push({ id: row.id, product_url: row.product_url, table_name: 'sightings' })
  }

  // quick_sightings tablosu (kalan kapasiteye göre)
  if (records.length < BATCH_SIZE) {
    const { data: quickRows } = await supabase
      .from('quick_sightings')
      .select('id, product_url')
      .eq('source_channel', 'virtual')
      .eq('is_hidden', false)
      .not('product_url', 'is', null)
      .or(`product_checked_at.is.null,product_checked_at.lt.${recheckBefore}`)
      .limit(BATCH_SIZE - records.length)

    for (const row of quickRows ?? []) {
      records.push({ id: row.id, product_url: row.product_url, table_name: 'quick_sightings' })
    }
  }

  const stats = { checked: 0, active: 0, hidden: 0, blocked: 0, errors: 0 }

  for (let i = 0; i < records.length; i++) {
    const record = records[i]

    try {
      const result = await checkProductUrl(record.product_url)

      // Yayından kaldırılacak durumlar
      const shouldHide = ['out_of_stock', 'removed', 'suspicious', 'blocked'].includes(result.status)

      const updatePayload: Record<string, unknown> = {
        product_check_status: result.status,
        product_checked_at: new Date().toISOString(),
        product_check_notes: result.notes,
      }

      if (shouldHide) {
        updatePayload.is_hidden = true
      }

      await supabase
        .from(record.table_name)
        .update(updatePayload)
        .eq('id', record.id)

      // Kontrol kaydını logla
      await supabase.from('product_check_logs').insert({
        table_name: record.table_name,
        record_id: record.id,
        product_url: record.product_url,
        http_status: result.http_status,
        check_result: result.status,
        check_notes: result.notes,
      })

      if (result.status === 'active') {
        stats.active++
      } else if (result.status === 'blocked') {
        stats.blocked++
      } else {
        stats.hidden++
      }

      stats.checked++
    } catch {
      stats.errors++
    }

    // Son kayıt değilse siteden ban yememek için bekle
    if (i < records.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  return NextResponse.json({
    success: true,
    ...stats,
    timestamp: new Date().toISOString(),
  })
}

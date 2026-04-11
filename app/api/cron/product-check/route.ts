// app/api/cron/product-check/route.ts
// Periyodik sanal paylaşım stok ve erişilebilirlik kontrolü
// Vercel Cron veya harici zamanlayıcı ile çağrılır: GET /api/cron/product-check
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkProductUrl } from '@/lib/product-check'

export const dynamic = 'force-dynamic'
// Edge yerine Node runtime: response.text() ve uzun süre çalışma için
export const maxDuration = 60

// Yaşa göre dinamik yeniden kontrol aralıkları
// 0-24 saat: 6 saatte bir
// 1-7 gün: 24 saatte bir
// 7+ gün: 72 saatte bir
const RECHECK_HOURS_NEW = 6
const RECHECK_HOURS_MID = 24
const RECHECK_HOURS_OLD = 72
// Tek seferinde en fazla kaç kayıt işlenecek (rate limiting için)
const BATCH_SIZE = 20
// Due filtrelemesinden sonra yeterli kayıt kalabilmesi için daha geniş aday havuzu çek
const CANDIDATE_MULTIPLIER = 4
// İstekler arası bekleme (ms) – site ban riskini azaltır
const DELAY_MS = 1500
// Çalışma pencereleri (UTC):
// - 07:00-09:59 UTC  (TRT 10:00-12:59)
// - 17:00-18:59 UTC  (TRT 20:00-21:59)
const RUN_WINDOWS_UTC: Array<{ startHour: number; endHour: number }> = [
  { startHour: 7, endHour: 10 },
  { startHour: 17, endHour: 19 },
]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type TableName = 'sightings' | 'quick_sightings'

interface RecordToCheck {
  id: string
  product_url: string
  table_name: TableName
  created_at: string
  product_checked_at: string | null
}

function getAgeHours(createdAt: string): number {
  const createdMs = new Date(createdAt).getTime()
  if (Number.isNaN(createdMs)) return RECHECK_HOURS_OLD
  return Math.max(0, (Date.now() - createdMs) / (1000 * 60 * 60))
}

function getDynamicRecheckHours(createdAt: string): number {
  const ageHours = getAgeHours(createdAt)
  if (ageHours <= 24) return RECHECK_HOURS_NEW
  if (ageHours <= 24 * 7) return RECHECK_HOURS_MID
  return RECHECK_HOURS_OLD
}

function isDueForCheck(record: RecordToCheck): boolean {
  if (!record.product_checked_at) return true

  const lastCheckedMs = new Date(record.product_checked_at).getTime()
  if (Number.isNaN(lastCheckedMs)) return true

  const dynamicRecheckMs = getDynamicRecheckHours(record.created_at) * 60 * 60 * 1000
  return Date.now() - lastCheckedMs >= dynamicRecheckMs
}

function isWithinRunWindowUtc(now: Date = new Date()): boolean {
  const utcHour = now.getUTCHours()
  return RUN_WINDOWS_UTC.some(
    (window) => utcHour >= window.startHour && utcHour < window.endHour,
  )
}

export async function GET(request: NextRequest) {
  // Cron secret doğrulaması
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Sadece belirlenen TRT pencerelerinde çalıştır.
  // Acil/manuel tetikleme için ?force=1 ile pencere kuralı atlanabilir.
  const forceRun = request.nextUrl.searchParams.get('force') === '1'
  if (!forceRun && !isWithinRunWindowUtc()) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: 'Outside configured TRT run windows',
      run_windows_utc: RUN_WINDOWS_UTC,
      timestamp: new Date().toISOString(),
    })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase config eksik' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // En sık aralık (6 saat) baz alınarak aday kayıtlar çekilir, kesin due kontrolü kodda yapılır.
  const recheckBefore = new Date(
    Date.now() - RECHECK_HOURS_NEW * 60 * 60 * 1000,
  ).toISOString()

  const candidateRecords: RecordToCheck[] = []

  // sightings tablosu
  const { data: sightingRows } = await supabase
    .from('sightings')
    .select('id, product_url, created_at, product_checked_at')
    .eq('source_channel', 'virtual')
    .eq('is_hidden', false)
    .not('product_url', 'is', null)
    .or(`product_checked_at.is.null,product_checked_at.lt.${recheckBefore}`)
    .order('product_checked_at', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE * CANDIDATE_MULTIPLIER)

  for (const row of sightingRows ?? []) {
    candidateRecords.push({
      id: row.id,
      product_url: row.product_url,
      table_name: 'sightings',
      created_at: row.created_at,
      product_checked_at: row.product_checked_at,
    })
  }

  // quick_sightings tablosu (kalan kapasiteye göre)
  if (candidateRecords.length < BATCH_SIZE * CANDIDATE_MULTIPLIER) {
    const { data: quickRows } = await supabase
      .from('quick_sightings')
      .select('id, product_url, created_at, product_checked_at')
      .eq('source_channel', 'virtual')
      .eq('is_hidden', false)
      .not('product_url', 'is', null)
      .or(`product_checked_at.is.null,product_checked_at.lt.${recheckBefore}`)
      .order('product_checked_at', { ascending: true, nullsFirst: true })
      .limit(BATCH_SIZE * CANDIDATE_MULTIPLIER - candidateRecords.length)

    for (const row of quickRows ?? []) {
      candidateRecords.push({
        id: row.id,
        product_url: row.product_url,
        table_name: 'quick_sightings',
        created_at: row.created_at,
        product_checked_at: row.product_checked_at,
      })
    }
  }

  const records = candidateRecords
    .filter(isDueForCheck)
    .sort((a, b) => {
      const aChecked = a.product_checked_at ? new Date(a.product_checked_at).getTime() : 0
      const bChecked = b.product_checked_at ? new Date(b.product_checked_at).getTime() : 0
      return aChecked - bChecked
    })
    .slice(0, BATCH_SIZE)

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
    selected: records.length,
    candidates: candidateRecords.length,
    timestamp: new Date().toISOString(),
  })
}

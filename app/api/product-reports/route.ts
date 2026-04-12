import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type SourceTable = 'sightings' | 'quick_sightings'
type ProductReportReason = 'out_of_stock' | 'broken_page' | 'prohibited_product' | 'not_rare'

const ALLOWED_TABLES: SourceTable[] = ['sightings', 'quick_sightings']
const ALLOWED_REASONS: ProductReportReason[] = [
  'out_of_stock',
  'broken_page',
  'prohibited_product',
  'not_rare',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    const tableName = body?.table_name as SourceTable
    const recordId = typeof body?.record_id === 'string' ? body.record_id : null
    const productUrl = typeof body?.product_url === 'string' ? body.product_url.trim() : null
    const reason = body?.reason as ProductReportReason
    const recordTitle = typeof body?.record_title === 'string' ? body.record_title.trim() : null
    const reporterUserId =
      typeof body?.reporter_user_id === 'string' && body.reporter_user_id.trim()
        ? body.reporter_user_id
        : null
    const reporterName =
      typeof body?.reporter_name === 'string' && body.reporter_name.trim()
        ? body.reporter_name.trim().slice(0, 120)
        : null

    if (!ALLOWED_TABLES.includes(tableName) || !recordId || !productUrl || !ALLOWED_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Geçersiz bildirim verisi' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Sunucu yapılandırması eksik' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: existing } = await supabase
      .from('product_user_reports')
      .select('id, created_at')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .eq('report_reason', reason)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing?.created_at) {
      const lastMs = new Date(existing.created_at).getTime()
      if (!Number.isNaN(lastMs) && Date.now() - lastMs < 60 * 60 * 1000) {
        return NextResponse.json({ ok: true, deduplicated: true })
      }
    }

    const { error } = await supabase.from('product_user_reports').insert({
      table_name: tableName,
      record_id: recordId,
      product_url: productUrl,
      report_reason: reason,
      record_title: recordTitle,
      reporter_user_id: reporterUserId,
      reporter_name: reporterName,
      report_status: 'open',
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Bildirim kaydedilemedi' }, { status: 500 })
    }

    const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentOpenCount } = await supabase
      .from('product_user_reports')
      .select('id', { count: 'exact', head: true })
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .in('report_status', ['open', 'reviewed'])
      .gte('created_at', sinceIso)

    const shouldEscalate = (recentOpenCount ?? 0) >= 3
    if (shouldEscalate) {
      await supabase
        .from(tableName)
        .update({
          product_check_status: 'pending_review',
          product_check_notes: `Kullanıcı bildirimi yoğunlaştı (${recentOpenCount} adet / 24s)`,
          product_checked_at: new Date().toISOString(),
        })
        .eq('id', recordId)
    }

    return NextResponse.json({ ok: true, escalated: shouldEscalate, recent_open_count: recentOpenCount ?? 0 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Bildirim kaydedilemedi' },
      { status: 500 },
    )
  }
}

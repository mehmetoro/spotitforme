// app/api/admin/db-stats/route.ts
// Admin paneli için tablo istatistikleri + temizlik önizlemesi
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const CLEANUP_REPORT_RETENTION_DAYS = 30
const CLEANUP_LOG_RETENTION_DAYS = 90
const PREVIEW_LIMIT = 100

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Yetki gerekli' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Admin doğrulama
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
    }

    const olderThanReports = new Date(
      Date.now() - CLEANUP_REPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString()

    const olderThanLogs = new Date(
      Date.now() - CLEANUP_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString()

    // Paralel tüm verileri çek
    const [
      sightingsCount,
      quickSightingsCount,
      reportsCount,
      logsCount,
      pendingReports,
      resolvedOldReports,
      oldLogs,
      recentLogs,
      reportsByStatus,
    ] = await Promise.all([
      supabase.from('sightings').select('id', { count: 'exact', head: true }).eq('source_channel', 'virtual'),
      supabase.from('quick_sightings').select('id', { count: 'exact', head: true }).eq('source_channel', 'virtual'),
      supabase.from('product_user_reports').select('id', { count: 'exact', head: true }),
      supabase.from('product_check_logs').select('id', { count: 'exact', head: true }),

      // Bekleyen (open) raporlar
      supabase
        .from('product_user_reports')
        .select('id', { count: 'exact', head: true })
        .eq('report_status', 'open'),

      // Temizlenecek eski resolved/dismissed raporlar
      supabase
        .from('product_user_reports')
        .select('id', { count: 'exact', head: true })
        .in('report_status', ['resolved', 'dismissed'])
        .lt('created_at', olderThanReports),

      // Temizlenecek eski loglar
      supabase
        .from('product_check_logs')
        .select('id', { count: 'exact', head: true })
        .lt('created_at', olderThanLogs),

      // Son 50 kontrol logu
      supabase
        .from('product_check_logs')
        .select('id, table_name, record_id, product_url, http_status, check_result, check_notes, created_at')
        .order('created_at', { ascending: false })
        .limit(50),

      // Rapor durumlarına göre özet
      supabase
        .from('product_user_reports')
        .select('report_status, id')
        .limit(PREVIEW_LIMIT),
    ])

    // Rapor durum sayıları
    const statusCounts: Record<string, number> = {}
    for (const row of reportsByStatus.data ?? []) {
      const s: string = row.report_status ?? 'unknown'
      statusCounts[s] = (statusCounts[s] ?? 0) + 1
    }

    // Orphan rapor tahmini için product_user_reports'tan record_id'leri çek
    const { data: allReportRefs } = await supabase
      .from('product_user_reports')
      .select('id, table_name, record_id')
      .limit(500)

    let estimatedOrphans = 0
    if (allReportRefs && allReportRefs.length > 0) {
      const sightingIds = [...new Set(
        allReportRefs.filter(r => r.table_name === 'sightings').map(r => r.record_id)
      )]
      const quickIds = [...new Set(
        allReportRefs.filter(r => r.table_name === 'quick_sightings').map(r => r.record_id)
      )]

      const [existingSightings, existingQuick] = await Promise.all([
        sightingIds.length > 0
          ? supabase.from('sightings').select('id').in('id', sightingIds)
          : Promise.resolve({ data: [] }),
        quickIds.length > 0
          ? supabase.from('quick_sightings').select('id').in('id', quickIds)
          : Promise.resolve({ data: [] }),
      ])

      const existingSet = new Set<string>([
        ...(existingSightings.data ?? []).map((r: any) => `sightings:${r.id}`),
        ...(existingQuick.data ?? []).map((r: any) => `quick_sightings:${r.id}`),
      ])

      estimatedOrphans = allReportRefs.filter(
        r => !existingSet.has(`${r.table_name}:${r.record_id}`)
      ).length
    }

    return NextResponse.json({
      table_counts: {
        sightings_virtual: sightingsCount.count ?? 0,
        quick_sightings_virtual: quickSightingsCount.count ?? 0,
        product_user_reports: reportsCount.count ?? 0,
        product_check_logs: logsCount.count ?? 0,
      },
      cleanup_preview: {
        orphan_reports: estimatedOrphans,
        old_resolved_dismissed_reports: resolvedOldReports.count ?? 0,
        old_check_logs: oldLogs.count ?? 0,
        retention: {
          reports_days: CLEANUP_REPORT_RETENTION_DAYS,
          logs_days: CLEANUP_LOG_RETENTION_DAYS,
        },
      },
      reports_summary: {
        open: pendingReports.count ?? 0,
        by_status: statusCounts,
      },
      recent_check_logs: recentLogs.data ?? [],
    })
  } catch (error) {
    console.error('db-stats error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

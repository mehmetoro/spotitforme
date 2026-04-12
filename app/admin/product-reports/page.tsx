'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type SourceTable = 'sightings' | 'quick_sightings'
type ReportReason = 'out_of_stock' | 'broken_page' | 'prohibited_product' | 'not_rare'
type ReportStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed'

interface ProductUserReport {
  id: string
  table_name: SourceTable
  record_id: string
  product_url: string
  record_title: string | null
  report_reason: ReportReason
  report_status: ReportStatus
  reporter_name: string | null
  reporter_user_id: string | null
  admin_note: string | null
  created_at: string
  updated_at: string
}

const REASON_LABELS: Record<ReportReason, string> = {
  out_of_stock: 'Stok Yok',
  broken_page: 'Bozuk Sayfa',
  prohibited_product: 'Yasaklı Ürün',
  not_rare: 'Nadir Değil',
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'Açık',
  reviewed: 'İncelendi',
  resolved: 'Çözüldü',
  dismissed: 'Geçersiz',
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  dismissed: 'bg-gray-100 text-gray-700 border-gray-200',
}

const REASON_BASE_SCORE: Record<ReportReason, number> = {
  out_of_stock: 65,
  broken_page: 75,
  prohibited_product: 90,
  not_rare: 55,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function buildReporterTrustMap(items: ProductUserReport[]): Map<string, number> {
  const stats = new Map<string, { resolved: number; dismissed: number }>()

  for (const item of items) {
    if (!item.reporter_user_id) continue
    const current = stats.get(item.reporter_user_id) ?? { resolved: 0, dismissed: 0 }
    if (item.report_status === 'resolved') current.resolved += 1
    if (item.report_status === 'dismissed') current.dismissed += 1
    stats.set(item.reporter_user_id, current)
  }

  const trustMap = new Map<string, number>()
  for (const [userId, userStats] of stats.entries()) {
    const score = clamp(50 + userStats.resolved * 6 - userStats.dismissed * 5, 20, 100)
    trustMap.set(userId, score)
  }

  return trustMap
}

function getPriorityLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 90) return 'critical'
  if (score >= 75) return 'high'
  if (score >= 55) return 'medium'
  return 'low'
}

function getPriorityLevelLabel(level: 'critical' | 'high' | 'medium' | 'low'): string {
  if (level === 'critical') return 'Kritik'
  if (level === 'high') return 'Yüksek'
  if (level === 'medium') return 'Orta'
  return 'Düşük'
}

function getPriorityLevelColor(level: 'critical' | 'high' | 'medium' | 'low'): string {
  if (level === 'critical') return 'bg-red-100 text-red-800'
  if (level === 'high') return 'bg-orange-100 text-orange-800'
  if (level === 'medium') return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-700'
}

export default function ProductReportsAdminPage() {
  const [items, setItems] = useState<ProductUserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<ReportStatus | 'all'>('all')
  const [activeReason, setActiveReason] = useState<ReportReason | 'all'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('product_user_reports')
        .select(
          'id, table_name, record_id, product_url, record_title, report_reason, report_status, reporter_name, reporter_user_id, admin_note, created_at, updated_at',
        )
        .order('created_at', { ascending: false })
        .limit(500)

      setItems((data ?? []) as ProductUserReport[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const updateStatus = async (item: ProductUserReport, nextStatus: ReportStatus, adminNote?: string) => {
    setActionLoading(`${item.id}-${nextStatus}`)
    try {
      const { error } = await supabase
        .from('product_user_reports')
        .update({
          report_status: nextStatus,
          admin_note: adminNote ?? item.admin_note,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) throw error

      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
                ...row,
                report_status: nextStatus,
                admin_note: adminNote ?? row.admin_note,
                updated_at: new Date().toISOString(),
              }
            : row,
        ),
      )
    } catch (err: any) {
      alert(err?.message || 'Durum güncellenemedi')
    } finally {
      setActionLoading(null)
    }
  }

  const publishItem = async (item: ProductUserReport) => {
    setActionLoading(`${item.id}-publish`)
    try {
      const nowIso = new Date().toISOString()
      const { error: publishError } = await supabase
        .from(item.table_name)
        .update({
          is_hidden: false,
          product_check_status: 'active',
          product_check_notes: `Kullanıcı bildirimi sonrası admin yayına aldı (${REASON_LABELS[item.report_reason]})`,
          product_checked_at: nowIso,
        })
        .eq('id', item.record_id)

      if (publishError) throw publishError

      // Yayına alınan kayıt için aynı ürüne ait kullanıcı bildirimlerini temizle.
      const cleanupRes = await fetch('/api/admin/delete-virtual', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_name: item.table_name,
          id: item.record_id,
          delete_reports: true,
          only_reports: true,
        }),
      })
      const cleanupData = await cleanupRes.json()
      if (!cleanupRes.ok) throw new Error(cleanupData?.error || 'Rapor temizleme başarısız')

      setItems((prev) =>
        prev.filter(
          (row) => !(row.table_name === item.table_name && row.record_id === item.record_id),
        ),
      )
    } catch (err: any) {
      alert(err?.message || 'Yayına alma başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteRecordCompletely = async (item: ProductUserReport) => {
    if (!confirm('Bu ürünü ve bağlı kullanıcı bildirimlerini veritabanından kalıcı silmek istediğinize emin misiniz?')) {
      return
    }

    setActionLoading(`${item.id}-delete-record`)
    try {
      const res = await fetch('/api/admin/delete-virtual', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_name: item.table_name, id: item.record_id, delete_reports: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kalıcı silme başarısız')

      setItems((prev) =>
        prev.filter(
          (row) => !(row.table_name === item.table_name && row.record_id === item.record_id),
        ),
      )
    } catch (err: any) {
      alert(err?.message || 'Kalıcı silme başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredItems = useMemo(() => {
    const trustMap = buildReporterTrustMap(items)
    const groupedCounts = new Map<string, number>()

    for (const item of items) {
      const key = `${item.table_name}-${item.record_id}-${item.report_reason}`
      groupedCounts.set(key, (groupedCounts.get(key) ?? 0) + 1)
    }

    const enriched = items.map((item) => {
      const key = `${item.table_name}-${item.record_id}-${item.report_reason}`
      const reportCountForRecord = groupedCounts.get(key) ?? 1
      const reporterTrustScore = item.reporter_user_id
        ? (trustMap.get(item.reporter_user_id) ?? 50)
        : 45

      const ageHours = Math.max(
        0,
        (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60),
      )
      const freshnessBoost = ageHours <= 6 ? 14 : ageHours <= 24 ? 8 : ageHours <= 72 ? 4 : 0
      const repeatedBoost = Math.min(24, (reportCountForRecord - 1) * 6)
      const statusPenalty = item.report_status === 'open' ? 0 : item.report_status === 'reviewed' ? 10 : 22

      const priorityScore = clamp(
        REASON_BASE_SCORE[item.report_reason] +
          repeatedBoost +
          Math.round(reporterTrustScore * 0.2) +
          freshnessBoost -
          statusPenalty,
        0,
        100,
      )

      return {
        ...item,
        reportCountForRecord,
        reporterTrustScore,
        priorityScore,
      }
    })

    const filtered = enriched.filter((item) => {
      if (activeStatus !== 'all' && item.report_status !== activeStatus) return false
      if (activeReason !== 'all' && item.report_reason !== activeReason) return false
      return true
    })

    return filtered.sort((a, b) => {
      const aOpenLike = a.report_status === 'open' || a.report_status === 'reviewed'
      const bOpenLike = b.report_status === 'open' || b.report_status === 'reviewed'
      if (aOpenLike && bOpenLike && b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [items, activeReason, activeStatus])

  const counts = useMemo(() => {
    return {
      all: items.length,
      open: items.filter((i) => i.report_status === 'open').length,
      reviewed: items.filter((i) => i.report_status === 'reviewed').length,
      resolved: items.filter((i) => i.report_status === 'resolved').length,
      dismissed: items.filter((i) => i.report_status === 'dismissed').length,
    }
  }, [items])

  const highPriorityOpenCount = useMemo(
    () =>
      filteredItems.filter(
        (item) => (item.report_status === 'open' || item.report_status === 'reviewed') && item.priorityScore >= 80,
      ).length,
    [filteredItems],
  )

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Ürün Bildirimleri</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kullanıcıların ürün linkleri için yaptığı "stok yok / bozuk sayfa / yasaklı ürün / nadir değil" bildirimleri.
        </p>
        <p className="text-xs text-amber-700 mt-2">
          Yüksek öncelikli açık bildirim: {highPriorityOpenCount} (öncelik puanı 80+)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Tümü" value={counts.all} active={activeStatus === 'all'} onClick={() => setActiveStatus('all')} />
        <SummaryCard label="Açık" value={counts.open} active={activeStatus === 'open'} onClick={() => setActiveStatus('open')} />
        <SummaryCard label="İncelendi" value={counts.reviewed} active={activeStatus === 'reviewed'} onClick={() => setActiveStatus('reviewed')} />
        <SummaryCard label="Çözüldü" value={counts.resolved} active={activeStatus === 'resolved'} onClick={() => setActiveStatus('resolved')} />
        <SummaryCard label="Geçersiz" value={counts.dismissed} active={activeStatus === 'dismissed'} onClick={() => setActiveStatus('dismissed')} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveReason('all')}
          className={`px-3 py-1.5 rounded-full border text-sm ${activeReason === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-300'}`}
        >
          Tüm Sebepler
        </button>
        {(Object.keys(REASON_LABELS) as ReportReason[]).map((reason) => (
          <button
            key={reason}
            onClick={() => setActiveReason(reason)}
            className={`px-3 py-1.5 rounded-full border text-sm ${activeReason === reason ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-300'}`}
          >
            {REASON_LABELS[reason]}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Yükleniyor...' : '↺ Yenile'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
        <span className="font-medium">Öncelik Seviyesi:</span>
        <span className="inline-flex px-2 py-0.5 rounded-full bg-red-100 text-red-800">Kritik (90+)</span>
        <span className="inline-flex px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">Yüksek (75-89)</span>
        <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Orta (55-74)</span>
        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Düşük (0-54)</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Ürün</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Sebep</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Durum</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Bildiren</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Tarih</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Yükleniyor...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Bu filtrede bildirim yok.</td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isBusy = !!actionLoading
                const priorityLevel = getPriorityLevel(item.priorityScore)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                        {item.record_title || '(başlık yok)'}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${getPriorityLevelColor(priorityLevel)}`}>
                          {getPriorityLevelLabel(priorityLevel)} ({item.priorityScore})
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium">
                          Güven: {item.reporterTrustScore}
                        </span>
                        {item.reportCountForRecord > 1 && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium">
                            Tekrar: {item.reportCountForRecord}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Kaynak: {item.table_name === 'sightings' ? 'Yardım' : 'Nadir'}
                      </div>
                      <a href={item.product_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline line-clamp-1 max-w-xs block mt-1">
                        {item.product_url}
                      </a>
                      {item.admin_note && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                          Admin notu: {item.admin_note}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top hidden md:table-cell">
                      <span className="inline-flex px-2 py-0.5 rounded border text-xs font-semibold bg-amber-50 border-amber-200 text-amber-800">
                        {REASON_LABELS[item.report_reason]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-semibold ${STATUS_COLORS[item.report_status]}`}>
                        {STATUS_LABELS[item.report_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-500 hidden lg:table-cell">
                      {item.reporter_name || item.reporter_user_id || 'Anonim'}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-500 hidden lg:table-cell">
                      {new Date(item.created_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => publishItem(item)}
                          disabled={isBusy}
                          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === `${item.id}-publish` ? 'İşleniyor...' : 'Yayına Al ve Kaldır'}
                        </button>
                        <button
                          onClick={() => deleteRecordCompletely(item)}
                          disabled={isBusy}
                          className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === `${item.id}-delete-record` ? 'Siliniyor...' : 'Sil (DB)'}
                        </button>
                        <button
                          onClick={() => updateStatus(item, 'reviewed')}
                          disabled={isBusy}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50"
                        >
                          İncelemede
                        </button>
                        <button
                          onClick={() => updateStatus(item, 'resolved')}
                          disabled={isBusy}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200 disabled:opacity-50"
                        >
                          Çözüldü
                        </button>
                        <button
                          onClick={() => updateStatus(item, 'dismissed')}
                          disabled={isBusy}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                        >
                          Geçersiz
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        active
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-200 text-gray-800 hover:border-blue-300'
      }`}
    >
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs opacity-80 mt-1">{label}</div>
    </button>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface TableCounts {
  sightings_virtual: number
  quick_sightings_virtual: number
  product_user_reports: number
  product_check_logs: number
}

interface CleanupPreview {
  orphan_reports: number
  old_resolved_dismissed_reports: number
  old_check_logs: number
  retention: { reports_days: number; logs_days: number }
}

interface ReportsSummary {
  open: number
  by_status: Record<string, number>
}

interface CheckLog {
  id: string
  table_name: string
  record_id: string
  product_url: string
  http_status: number
  check_result: string
  check_notes: string | null
  created_at: string
}

interface DbStats {
  table_counts: TableCounts
  cleanup_preview: CleanupPreview
  reports_summary: ReportsSummary
  recent_check_logs: CheckLog[]
}

interface CronResult {
  success: boolean
  dry_run?: boolean
  skipped?: boolean
  reason?: string
  checked?: number
  active?: number
  hidden?: number
  blocked?: number
  errors?: number
  selected?: number
  candidates?: number
  cleanup?: {
    orphanReportsDeleted: number
    oldResolvedReportsDeleted: number
    oldLogsDeleted: number
  }
  cleanup_policy?: { reports_retention_days: number; logs_retention_days: number }
  timestamp?: string
  error?: string
}

type ConfirmAction =
  | { type: 'run'; label: string; dry_run: boolean; force: boolean }
  | null

const CHECK_RESULT_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  out_of_stock: 'bg-yellow-100 text-yellow-800',
  removed: 'bg-red-100 text-red-800',
  blocked: 'bg-orange-100 text-orange-800',
  suspicious: 'bg-purple-100 text-purple-800',
  pending_review: 'bg-blue-100 text-blue-800',
  error: 'bg-gray-100 text-gray-800',
}

export default function CronManagerPage() {
  const [stats, setStats] = useState<DbStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [running, setRunning] = useState(false)
  const [lastResult, setLastResult] = useState<CronResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logFilter, setLogFilter] = useState<string>('all')

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Oturum bulunamadı')
        return
      }

      const res = await fetch('/api/admin/db-stats', {
        headers: { authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Veri alınamadı')
        return
      }

      const data: DbStats = await res.json()
      setStats(data)
    } catch {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleConfirm = async () => {
    if (!confirmAction) return
    setConfirmAction(null)
    setRunning(true)
    setLastResult(null)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Oturum bulunamadı')
        return
      }

      const res = await fetch('/api/admin/run-cron', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          dry_run: confirmAction.dry_run,
          force: confirmAction.force,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Cron çalıştırılamadı')
        return
      }

      setLastResult(data.result ?? data)
      // Sonuçları gösterdikten sonra istatistikleri güncelle
      fetchStats(true)
    } catch {
      setError('Bağlantı hatası')
    } finally {
      setRunning(false)
    }
  }

  const filteredLogs = stats?.recent_check_logs.filter(
    (l) => logFilter === 'all' || l.check_result === logFilter,
  ) ?? []

  const totalCleanup = stats
    ? stats.cleanup_preview.orphan_reports +
      stats.cleanup_preview.old_resolved_dismissed_reports +
      stats.cleanup_preview.old_check_logs
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-lg">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cron Yöneticisi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Stok kontrol ve veritabanı temizlik işlemlerini yönetin
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition disabled:opacity-50"
        >
          <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          Yenile
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tablo İstatistikleri */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Sanal Gözlemler"
            value={stats.table_counts.sightings_virtual + stats.table_counts.quick_sightings_virtual}
            sub={`${stats.table_counts.sightings_virtual} sightings · ${stats.table_counts.quick_sightings_virtual} quick`}
            color="blue"
          />
          <StatCard
            label="Açık Raporlar"
            value={stats.reports_summary.open}
            sub="Kullanıcı ürün bildirimleri"
            color={stats.reports_summary.open > 0 ? 'red' : 'green'}
          />
          <StatCard
            label="Toplam Raporlar"
            value={stats.table_counts.product_user_reports}
            sub={Object.entries(stats.reports_summary.by_status)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')}
            color="gray"
          />
          <StatCard
            label="Kontrol Logları"
            value={stats.table_counts.product_check_logs}
            sub={`${stats.cleanup_preview.old_check_logs} adet silinecek (${stats.cleanup_preview.retention.logs_days}g+)`}
            color="gray"
          />
        </div>
      )}

      {/* Temizlik Önizlemesi */}
      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Temizlik Önizlemesi (Dry Run)</h2>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              totalCleanup > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {totalCleanup > 0
                ? `${totalCleanup} kayıt temizlenecek`
                : 'Temizlenecek kayıt yok'}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            <CleanupRow
              label="Sahipsiz raporlar"
              description={`Kaynağı silinmiş product_user_reports kayıtları`}
              count={stats.cleanup_preview.orphan_reports}
              color="orange"
            />
            <CleanupRow
              label="Eski çözülmüş raporlar"
              description={`${stats.cleanup_preview.retention.reports_days} günden eski resolved/dismissed raporlar`}
              count={stats.cleanup_preview.old_resolved_dismissed_reports}
              color="yellow"
            />
            <CleanupRow
              label="Eski kontrol logları"
              description={`${stats.cleanup_preview.retention.logs_days} günden eski product_check_logs kayıtları`}
              count={stats.cleanup_preview.old_check_logs}
              color="gray"
            />
          </div>
        </div>
      )}

      {/* Aksiyon Butonları */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ActionButton
            label="Dry Run (Simüle Et)"
            description="Silinecek kayıtları göster, hiçbir şeyi silme"
            icon="🔍"
            variant="secondary"
            disabled={running}
            onClick={() =>
              setConfirmAction({ type: 'run', label: 'Dry Run', dry_run: true, force: true })
            }
          />
          <ActionButton
            label="Sadece Temizlik"
            description="Stok kontrolü yapmadan yalnızca DB temizliği çalıştır"
            icon="🧹"
            variant="warning"
            disabled={running}
            onClick={() =>
              setConfirmAction({
                type: 'run',
                label: 'Sadece Temizlik',
                dry_run: false,
                force: true,
              })
            }
          />
          <ActionButton
            label="Tam Çalıştır"
            description="Stok kontrolü + DB temizliğini zorla çalıştır (TRT penceresi gözetmez)"
            icon="▶️"
            variant="danger"
            disabled={running}
            onClick={() =>
              setConfirmAction({
                type: 'run',
                label: 'Tam Çalıştır (Force)',
                dry_run: false,
                force: true,
              })
            }
          />
        </div>
        {running && (
          <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm">
            <span className="animate-spin">⏳</span>
            Çalışıyor, lütfen bekleyin...
          </div>
        )}
      </div>

      {/* Son İşlem Sonucu */}
      {lastResult && (
        <div className={`rounded-xl border shadow-sm overflow-hidden ${
          lastResult.dry_run
            ? 'border-blue-200 bg-blue-50'
            : lastResult.success
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="px-6 py-4 border-b border-opacity-30 border-current">
            <h2 className="font-semibold">
              {lastResult.dry_run ? '🔍 Dry Run Sonucu' : '✅ Çalıştırma Sonucu'}
              {lastResult.skipped && ' — Pencere Dışı (Skipped)'}
            </h2>
            {lastResult.timestamp && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(lastResult.timestamp).toLocaleString('tr-TR')}
              </p>
            )}
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {lastResult.skipped ? (
              <div className="col-span-4 text-gray-600">{lastResult.reason}</div>
            ) : (
              <>
                <ResultStat label="Kontrol edilen" value={lastResult.checked ?? 0} />
                <ResultStat label="Aktif" value={lastResult.active ?? 0} color="green" />
                <ResultStat label="Gizlenen" value={lastResult.hidden ?? 0} color="yellow" />
                <ResultStat label="Hata" value={lastResult.errors ?? 0} color="red" />
                {lastResult.cleanup && (
                  <>
                    <ResultStat
                      label={lastResult.dry_run ? 'Sahipsiz (tahmini)' : 'Sahipsiz silindi'}
                      value={lastResult.cleanup.orphanReportsDeleted}
                      color="orange"
                    />
                    <ResultStat
                      label={lastResult.dry_run ? 'Eski rapor (tahmini)' : 'Eski rapor silindi'}
                      value={lastResult.cleanup.oldResolvedReportsDeleted}
                      color="yellow"
                    />
                    <ResultStat
                      label={lastResult.dry_run ? 'Eski log (tahmini)' : 'Eski log silindi'}
                      value={lastResult.cleanup.oldLogsDeleted}
                      color="gray"
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Son Kontrol Logları */}
      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-gray-900">Son Kontrol Logları</h2>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'out_of_stock', 'removed', 'blocked', 'error'].map((f) => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    logFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Tümü' : f}
                </button>
              ))}
            </div>
          </div>
          {filteredLogs.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">Log bulunamadı</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tablo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HTTP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sonuç</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Not</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{log.table_name}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <a
                          href={log.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block max-w-[200px]"
                          title={log.product_url}
                        >
                          {log.product_url.replace(/^https?:\/\//, '').slice(0, 40)}…
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{log.http_status ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          CHECK_RESULT_COLORS[log.check_result] ?? 'bg-gray-100 text-gray-700'
                        }`}>
                          {log.check_result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{log.check_notes ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('tr-TR', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Onay Dialou */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">İşlemi Onayla</h3>
            <p className="text-gray-600 mb-1">
              <strong>{confirmAction.label}</strong> işlemini başlatmak istediğinizden emin misiniz?
            </p>
            {!confirmAction.dry_run && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                ⚠️ Bu işlem veritabanından kayıtları kalıcı olarak siler. Geri alınamaz.
              </div>
            )}
            {confirmAction.dry_run && (
              <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg">
                ℹ️ Dry Run: Hiçbir kayıt silinmez, sadece sayılar hesaplanır.
              </div>
            )}
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
              >
                İptal
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition ${
                  confirmAction.dry_run
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Evet, Çalıştır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Yardımcı Bileşenler ---

function StatCard({
  label, value, sub, color,
}: {
  label: string; value: number; sub: string; color: 'blue' | 'red' | 'green' | 'gray'
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value.toLocaleString('tr-TR')}</div>
      <div className="font-medium text-sm mt-1">{label}</div>
      <div className="text-xs opacity-70 mt-1">{sub}</div>
    </div>
  )
}

function CleanupRow({
  label, description, count, color,
}: {
  label: string; description: string; count: number; color: 'orange' | 'yellow' | 'gray'
}) {
  const countColors = {
    orange: count > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500',
    yellow: count > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500',
    gray: count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500',
  }
  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <div className="font-medium text-gray-800 text-sm">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${countColors[color]}`}>
        {count > 0 ? `${count} kayıt` : 'Temiz'}
      </span>
    </div>
  )
}

function ActionButton({
  label, description, icon, variant, disabled, onClick,
}: {
  label: string; description: string; icon: string; variant: 'secondary' | 'warning' | 'danger'; disabled: boolean; onClick: () => void
}) {
  const styles = {
    secondary: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    warning: 'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50',
    danger: 'border-red-200 hover:border-red-400 hover:bg-red-50',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border rounded-xl p-4 text-left transition disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold text-gray-900 text-sm">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </button>
  )
}

function ResultStat({
  label, value, color,
}: {
  label: string; value: number; color?: 'green' | 'yellow' | 'red' | 'orange' | 'gray'
}) {
  const textColors = {
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
    orange: 'text-orange-700',
    gray: 'text-gray-700',
  }
  return (
    <div>
      <div className={`text-2xl font-bold ${color ? textColors[color] : 'text-gray-900'}`}>
        {value.toLocaleString('tr-TR')}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

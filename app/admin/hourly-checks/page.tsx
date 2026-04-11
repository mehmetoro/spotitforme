'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type SourceTable = 'sightings' | 'quick_sightings'
type CheckStatus =
  | 'active'
  | 'pending_review'
  | 'out_of_stock'
  | 'removed'
  | 'blocked'
  | 'suspicious'

type TabFilter = 'all' | CheckStatus | 'hidden' | 'auto_hidden'
type IntervalFilter = 'all' | '6h' | '24h' | '72h'

interface AutoCheckInfo {
  lastRunAt: string | null
  lastResult: string | null
  lastRunProcessedCount: number
  lastRunActiveCount: number
  lastRunHiddenCount: number
  last24HoursAutoHiddenCount: number
}

interface StockItem {
  id: string
  table_name: SourceTable
  title: string | null
  product_url: string
  marketplace: string | null
  source_domain: string | null
  is_hidden: boolean | null
  product_check_status: CheckStatus | null
  product_check_notes: string | null
  product_checked_at: string | null
  created_at: string
}

const STATUS_LABELS: Record<CheckStatus, string> = {
  active: 'Aktif',
  pending_review: 'İnceleme Bekliyor',
  out_of_stock: 'Stok Tükendi',
  removed: 'Sayfa Kaldırılmış',
  blocked: 'Bot Engeli',
  suspicious: 'Şüpheli',
}

const STATUS_COLORS: Record<CheckStatus, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending_review: 'bg-amber-100 text-amber-800 border-amber-200',
  out_of_stock: 'bg-orange-100 text-orange-800 border-orange-200',
  removed: 'bg-red-100 text-red-800 border-red-200',
  blocked: 'bg-purple-100 text-purple-800 border-purple-200',
  suspicious: 'bg-gray-100 text-gray-800 border-gray-200',
}

const SHOULD_HIDE: CheckStatus[] = ['out_of_stock', 'removed', 'blocked', 'suspicious']
const AUTO_RUN_GROUP_MINUTES = 10

function getAssignedIntervalHours(createdAt: string): 6 | 24 | 72 {
  const createdMs = new Date(createdAt).getTime()
  if (Number.isNaN(createdMs)) return 72
  const ageHours = (Date.now() - createdMs) / (1000 * 60 * 60)
  if (ageHours <= 24) return 6
  if (ageHours <= 24 * 7) return 24
  return 72
}

function formatDateTime(value: string | null) {
  if (!value) return 'Henüz kayıt yok'
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isAutoHiddenStatus(value: CheckStatus | null) {
  return SHOULD_HIDE.includes((value || 'pending_review') as CheckStatus)
}

export default function AdminHourlyChecksPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [intervalFilter, setIntervalFilter] = useState<IntervalFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null)
  const [autoCheckInfo, setAutoCheckInfo] = useState<AutoCheckInfo>({
    lastRunAt: null,
    lastResult: null,
    lastRunProcessedCount: 0,
    lastRunActiveCount: 0,
    lastRunHiddenCount: 0,
    last24HoursAutoHiddenCount: 0,
  })

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const combined: StockItem[] = []

      const sightingQuery = supabase
        .from('sightings')
        .select(
          'id, title, product_url, marketplace, source_domain, is_hidden, product_check_status, product_check_notes, product_checked_at, created_at',
        )
        .eq('source_channel', 'virtual')
        .not('product_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(300)

      const quickQuery = supabase
        .from('quick_sightings')
        .select(
          'id, title, product_url, marketplace, source_domain, is_hidden, product_check_status, product_check_notes, product_checked_at, created_at',
        )
        .eq('source_channel', 'virtual')
        .not('product_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(300)

      const [{ data: sightingData }, { data: quickData }] = await Promise.all([
        sightingQuery,
        quickQuery,
      ])

      for (const row of sightingData ?? []) {
        combined.push({ ...row, table_name: 'sightings' } as StockItem)
      }
      for (const row of quickData ?? []) {
        combined.push({ ...row, table_name: 'quick_sightings' } as StockItem)
      }

      combined.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      setItems(combined)

      const { data: latestLogs } = await supabase
        .from('product_check_logs')
        .select('checked_at, check_result')
        .order('checked_at', { ascending: false })
        .limit(200)

      const latestLog = latestLogs?.[0] ?? null
      const latestCheckedAt = latestLog?.checked_at ? new Date(latestLog.checked_at).getTime() : null
      const runThresholdMs = AUTO_RUN_GROUP_MINUTES * 60 * 1000

      const lastRunLogs = latestCheckedAt
        ? (latestLogs ?? []).filter((log) => {
            const logTime = new Date(log.checked_at).getTime()
            return !Number.isNaN(logTime) && latestCheckedAt - logTime <= runThresholdMs
          })
        : []

      const lastRunProcessedCount = lastRunLogs.length
      const lastRunActiveCount = lastRunLogs.filter(
        (log) => (log.check_result as CheckStatus) === 'active',
      ).length
      const lastRunHiddenCount = lastRunLogs.filter((log) =>
        isAutoHiddenStatus(log.check_result as CheckStatus),
      ).length

      const last24HoursCutoff = Date.now() - 24 * 60 * 60 * 1000
      const last24HoursAutoHiddenCount = (latestLogs ?? []).filter((log) => {
        const logTime = new Date(log.checked_at).getTime()
        return !Number.isNaN(logTime) && logTime >= last24HoursCutoff && isAutoHiddenStatus(log.check_result as CheckStatus)
      }).length

      setAutoCheckInfo({
        lastRunAt: latestLog?.checked_at ?? null,
        lastResult: latestLog?.check_result ?? null,
        lastRunProcessedCount,
        lastRunActiveCount,
        lastRunHiddenCount,
        last24HoursAutoHiddenCount,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const startEdit = (item: StockItem) => {
    const key = `${item.table_name}-${item.id}`
    setEditingKey(key)
    setEditTitle(item.title || '')
    setEditUrl(item.product_url || '')
  }

  const cancelEdit = () => {
    setEditingKey(null)
    setEditTitle('')
    setEditUrl('')
  }

  const saveEdit = async (item: StockItem) => {
    if (!editUrl?.trim()) {
      alert('Ürün URL boş olamaz')
      return
    }

    setActionLoading(`save-${item.id}`)
    try {
      const { error } = await supabase
        .from(item.table_name)
        .update({
          title: editTitle.trim() || null,
          product_url: editUrl.trim(),
          product_check_notes: 'Admin düzenlemesi sonrası manuel kontrol önerilir',
        })
        .eq('id', item.id)

      if (error) throw error

      await fetchItems()
      cancelEdit()
    } catch (error) {
      console.error('Düzenleme kaydedilemedi:', error)
      alert('Düzenleme kaydedilemedi')
    } finally {
      setActionLoading(null)
    }
  }

  const runManualCheck = async (item: StockItem) => {
    setActionLoading(`check-${item.id}`)
    try {
      const response = await fetch('/api/product-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.product_url }),
      })

      const result = await response.json()
      if (!response.ok || !result?.status) {
        throw new Error(result?.error || 'Ürün kontrolü başarısız')
      }

      const status = result.status as CheckStatus
      const shouldHide = SHOULD_HIDE.includes(status)

      const { error } = await supabase
        .from(item.table_name)
        .update({
          product_check_status: status,
          product_check_notes: `Manuel kontrol: ${result.notes || 'durum güncellendi'}`,
          product_checked_at: new Date().toISOString(),
          is_hidden: shouldHide,
        })
        .eq('id', item.id)

      if (error) throw error

      await fetchItems()
    } catch (error: any) {
      console.error('Manuel kontrol hatası:', error)
      alert(error?.message || 'Manuel kontrol başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  const publishItem = async (item: StockItem) => {
    setActionLoading(`publish-${item.id}`)
    try {
      const { error } = await supabase
        .from(item.table_name)
        .update({
          is_hidden: false,
          product_check_status: 'active',
          product_check_notes: 'Admin manuel yayına aldı',
          product_checked_at: new Date().toISOString(),
        })
        .eq('id', item.id)
      if (error) throw error
      await fetchItems()
    } catch (error) {
      console.error('Yayınlanamadı:', error)
      alert('Yayınlama başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  const hideItem = async (item: StockItem) => {
    setActionLoading(`hide-${item.id}`)
    try {
      const { error } = await supabase
        .from(item.table_name)
        .update({ is_hidden: true })
        .eq('id', item.id)
      if (error) throw error
      await fetchItems()
    } catch (error) {
      console.error('Gizlenemedi:', error)
      alert('Gizleme başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (item: StockItem) => {
    if (!confirm('Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?')) return

    setActionLoading(`delete-${item.id}`)
    try {
      const { error } = await supabase.from(item.table_name).delete().eq('id', item.id)
      if (error) throw error
      setItems((prev) => prev.filter((x) => !(x.id === item.id && x.table_name === item.table_name)))
    } catch (error) {
      console.error('Kayıt silinemedi:', error)
      alert('Kayıt silinemedi')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredItems = useMemo(() => {
    const statusFiltered =
      activeTab === 'all'
        ? items
        : activeTab === 'hidden'
          ? items.filter((i) => i.is_hidden)
          : activeTab === 'auto_hidden'
            ? items.filter((i) => i.is_hidden && isAutoHiddenStatus(i.product_check_status))
          : items.filter((i) => i.product_check_status === activeTab)

    if (intervalFilter === 'all') return statusFiltered
    const intervalHours = intervalFilter === '6h' ? 6 : intervalFilter === '24h' ? 24 : 72
    return statusFiltered.filter((item) => getAssignedIntervalHours(item.created_at) === intervalHours)
  }, [items, activeTab, intervalFilter])

  // Seçim yönetimi
  const toggleSelect = (key: string) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const toggleSelectAll = () => {
    if (selectedKeys.size === filteredItems.length) {
      setSelectedKeys(new Set())
    } else {
      setSelectedKeys(new Set(filteredItems.map((i) => `${i.table_name}-${i.id}`)))
    }
  }

  const selectedItems = filteredItems.filter((i) =>
    selectedKeys.has(`${i.table_name}-${i.id}`),
  )

  // Toplu manuel kontrol
  const bulkCheck = async () => {
    if (selectedItems.length === 0) return
    if (!confirm(`${selectedItems.length} kayıt için stok kontrolü başlatılsın mı?`)) return
    setBulkProgress({ done: 0, total: selectedItems.length })
    let done = 0
    for (const item of selectedItems) {
      try {
        const response = await fetch('/api/product-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: item.product_url }),
        })
        const result = await response.json()
        if (response.ok && result?.status) {
          const status = result.status as CheckStatus
          await supabase
            .from(item.table_name)
            .update({
              product_check_status: status,
              product_check_notes: `Toplu kontrol: ${result.notes || 'güncellendi'}`,
              product_checked_at: new Date().toISOString(),
              is_hidden: SHOULD_HIDE.includes(status),
            })
            .eq('id', item.id)
        }
      } catch {
        // Hata atla, diğer kayıtlara devam et
      }
      done++
      setBulkProgress({ done, total: selectedItems.length })
    }
    setBulkProgress(null)
    setSelectedKeys(new Set())
    await fetchItems()
  }

  // Toplu gizle
  const bulkHide = async () => {
    if (selectedItems.length === 0) return
    if (!confirm(`${selectedItems.length} kayıt yayından kaldırılsın mı?`)) return
    setBulkProgress({ done: 0, total: selectedItems.length })
    let done = 0
    const sightingIds = selectedItems.filter((i) => i.table_name === 'sightings').map((i) => i.id)
    const quickIds = selectedItems.filter((i) => i.table_name === 'quick_sightings').map((i) => i.id)
    if (sightingIds.length) {
      await supabase.from('sightings').update({ is_hidden: true }).in('id', sightingIds)
    }
    if (quickIds.length) {
      await supabase.from('quick_sightings').update({ is_hidden: true }).in('id', quickIds)
    }
    done = selectedItems.length
    setBulkProgress({ done, total: selectedItems.length })
    setBulkProgress(null)
    setSelectedKeys(new Set())
    await fetchItems()
  }

  // Toplu yayına al
  const bulkShow = async () => {
    if (selectedItems.length === 0) return
    if (!confirm(`${selectedItems.length} kayıt yayına alınsın mı?`)) return
    setBulkProgress({ done: 0, total: selectedItems.length })
    const sightingIds = selectedItems.filter((i) => i.table_name === 'sightings').map((i) => i.id)
    const quickIds = selectedItems.filter((i) => i.table_name === 'quick_sightings').map((i) => i.id)
    if (sightingIds.length) {
      await supabase
        .from('sightings')
        .update({ is_hidden: false, product_check_status: 'active', product_check_notes: 'Admin toplu yayına aldı', product_checked_at: new Date().toISOString() })
        .in('id', sightingIds)
    }
    if (quickIds.length) {
      await supabase
        .from('quick_sightings')
        .update({ is_hidden: false, product_check_status: 'active', product_check_notes: 'Admin toplu yayına aldı', product_checked_at: new Date().toISOString() })
        .in('id', quickIds)
    }
    setBulkProgress(null)
    setSelectedKeys(new Set())
    await fetchItems()
  }

  // CSV dışa aktarma
  const exportCsv = () => {
    const rows = filteredItems
    const headers = ['Başlık', 'Ürün URL', 'Tablo', 'Durum', 'Gizli', 'Kaynak/Marketplace', 'Son Kontrol', 'Not', 'Oluşturulma']
    const lines = [
      headers.join(';'),
      ...rows.map((i) =>
        [
          `"${(i.title || '').replace(/"/g, '""')}"`,
          `"${i.product_url}"`,
          i.table_name === 'sightings' ? 'Yardım' : 'Nadir',
          i.product_check_status || '',
          i.is_hidden ? 'Gizli' : 'Yayında',
          `"${(i.marketplace || i.source_domain || '').replace(/"/g, '""')}"`,
          i.product_checked_at ? new Date(i.product_checked_at).toLocaleString('tr-TR') : '',
          `"${(i.product_check_notes || '').replace(/"/g, '""')}"`,
          new Date(i.created_at).toLocaleString('tr-TR'),
        ].join(';'),
      ),
    ]
    const bom = '\uFEFF'
    const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stok-kontrol-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const counts = useMemo(() => {
    return {
      all: items.length,
      hidden: items.filter((i) => i.is_hidden).length,
      autoHiddenOnly: items.filter((i) => i.is_hidden && isAutoHiddenStatus(i.product_check_status)).length,
      active: items.filter((i) => i.product_check_status === 'active').length,
      pending_review: items.filter((i) => i.product_check_status === 'pending_review').length,
      out_of_stock: items.filter((i) => i.product_check_status === 'out_of_stock').length,
      removed: items.filter((i) => i.product_check_status === 'removed').length,
      blocked: items.filter((i) => i.product_check_status === 'blocked').length,
      suspicious: items.filter((i) => i.product_check_status === 'suspicious').length,
      interval6h: items.filter((i) => getAssignedIntervalHours(i.created_at) === 6).length,
      interval24h: items.filter((i) => getAssignedIntervalHours(i.created_at) === 24).length,
      interval72h: items.filter((i) => getAssignedIntervalHours(i.created_at) === 72).length,
      autoHidden: items.filter(
        (i) => i.is_hidden && isAutoHiddenStatus(i.product_check_status),
      ).length,
    }
  }, [items])

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saatlik Stok Kontrol Paneli</h1>
        <p className="text-sm text-gray-500 mt-1">
          Otomatik kontrol devam eder. Bu sayfada tüm sanal ürün kayıtlarını görebilir, düzenleyebilir,
          silebilir ve ihtiyaç halinde manuel kontrol yapabilirsin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-blue-900">Son Otomatik Kontrol</div>
          <div className="text-lg font-bold text-blue-950 mt-1">
            {formatDateTime(autoCheckInfo.lastRunAt)}
          </div>
          <div className="text-xs text-blue-700 mt-2">
            Son kayıt sonucu: {autoCheckInfo.lastResult || 'Henüz otomatik akış kaydı yok'}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Son otomatik çalışmada işlenen ürün: {autoCheckInfo.lastRunProcessedCount}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Son otomatik çalışmada aktif kalan: {autoCheckInfo.lastRunActiveCount}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Son otomatik çalışmada gizlenen: {autoCheckInfo.lastRunHiddenCount}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Çalışma penceresi: TRT 10:00-12:59 ve 20:00-21:59
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-amber-900">Kontrol Aralığı Dağılımı</div>
          <div className="text-xs text-amber-800 mt-2 space-y-1">
            <div>6 saatlik kontrol: {counts.interval6h} kayıt</div>
            <div>24 saatlik kontrol: {counts.interval24h} kayıt</div>
            <div>72 saatlik kontrol: {counts.interval72h} kayıt</div>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-rose-900">Stokta Yoksa Ne Oluyor?</div>
          <div className="text-xs text-rose-800 mt-2 leading-relaxed">
            Stokta yok, kaldırılmış, bot engeli veya şüpheli görülen ürünler otomatik olarak yayından kaldırılır.
            Bu kayıtlar silinmez; bu panelde görünmeye devam eder ve manuel kontrolden geçirilebilir.
          </div>
          <div className="text-sm font-semibold text-rose-900 mt-3">
            Otomatik gizlenen kayıt: {counts.autoHidden}
          </div>
          <div className="text-xs text-rose-800 mt-1">
            Son 24 saatte otomatik gizlenen: {autoCheckInfo.last24HoursAutoHiddenCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Toplam" value={counts.all} active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
        <StatCard label="Aktif" value={counts.active} active={activeTab === 'active'} onClick={() => setActiveTab('active')} />
        <StatCard label="Gizli" value={counts.hidden} active={activeTab === 'hidden'} onClick={() => setActiveTab('hidden')} />
        <StatCard label="Oto. Gizlenen" value={counts.autoHiddenOnly} active={activeTab === 'auto_hidden'} onClick={() => setActiveTab('auto_hidden')} />
        <StatCard label="İncelemede" value={counts.pending_review} active={activeTab === 'pending_review'} onClick={() => setActiveTab('pending_review')} />
        <StatCard label="Stok Yok" value={counts.out_of_stock} active={activeTab === 'out_of_stock'} onClick={() => setActiveTab('out_of_stock')} />
        <StatCard label="Kaldırılmış" value={counts.removed} active={activeTab === 'removed'} onClick={() => setActiveTab('removed')} />
        <StatCard label="Blocked" value={counts.blocked} active={activeTab === 'blocked'} onClick={() => setActiveTab('blocked')} />
        <StatCard label="Şüpheli" value={counts.suspicious} active={activeTab === 'suspicious'} onClick={() => setActiveTab('suspicious')} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setIntervalFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            intervalFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-slate-400'
          }`}
        >
          Tüm Aralıklar
        </button>
        <button
          onClick={() => setIntervalFilter('6h')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            intervalFilter === '6h'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-slate-400'
          }`}
        >
          6 Saatlik Kontrol ({counts.interval6h})
        </button>
        <button
          onClick={() => setIntervalFilter('24h')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            intervalFilter === '24h'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-slate-400'
          }`}
        >
          24 Saatlik Kontrol ({counts.interval24h})
        </button>
        <button
          onClick={() => setIntervalFilter('72h')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            intervalFilter === '72h'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-slate-400'
          }`}
        >
          72 Saatlik Kontrol ({counts.interval72h})
        </button>
      </div>

      {/* Toplu işlem çubuğu */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
        <span className="text-sm text-gray-600 font-medium">
          {selectedKeys.size > 0 ? `${selectedKeys.size} kayıt seçili` : 'Toplu İşlem'}
        </span>
        {selectedKeys.size > 0 && (
          <>
            <button
              onClick={bulkCheck}
              disabled={!!bulkProgress}
              className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 disabled:opacity-50"
            >
              Toplu Kontrol Et
            </button>
            <button
              onClick={bulkShow}
              disabled={!!bulkProgress}
              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50"
            >
              Toplu Yayına Al
            </button>
            <button
              onClick={bulkHide}
              disabled={!!bulkProgress}
              className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
            >
              Toplu Gizle
            </button>
            <button
              onClick={() => setSelectedKeys(new Set())}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              Seçimi Temizle
            </button>
          </>
        )}
        {bulkProgress && (
          <span className="text-xs text-blue-600 font-medium">
            İşleniyor… {bulkProgress.done}/{bulkProgress.total}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
          >
            CSV İndir
          </button>
          <button
            onClick={fetchItems}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Yükleniyor...' : '↺ Yenile'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={filteredItems.length > 0 && selectedKeys.size === filteredItems.length}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Ürün</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Kaynak</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Durum</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Son Kontrol</th>
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
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Bu filtrede kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const key = `${item.table_name}-${item.id}`
                const isEditing = editingKey === key
                const isBusy = !!actionLoading || !!bulkProgress
                const isSelected = selectedKeys.has(key)
                const status = item.product_check_status || 'pending_review'

                return (
                  <tr
                    key={key}
                    className={`transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(key)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Başlık"
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                          <input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="Ürün URL"
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                            {item.title || '(başlık yok)'}
                          </div>
                          <div className="mt-1">
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {getAssignedIntervalHours(item.created_at)} saatlik akış
                            </span>
                          </div>
                          <a
                            href={item.product_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline line-clamp-1 max-w-xs block"
                          >
                            {item.product_url}
                          </a>
                          {item.product_check_notes && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                              {item.product_check_notes}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell align-top">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.table_name === 'sightings'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-violet-50 text-violet-700'
                        }`}
                      >
                        {item.table_name === 'sightings' ? 'Yardım' : 'Nadir'}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.marketplace || item.source_domain || '—'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded border text-xs font-semibold w-fit ${
                            STATUS_COLORS[status]
                          }`}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                        {item.is_hidden ? (
                          <span className="text-xs text-red-600">Yayında Değil (Otomatik kaldırıldı / manuel kontrol)</span>
                        ) : (
                          <span className="text-xs text-green-600">Yayında</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell align-top">
                      {item.product_checked_at
                        ? new Date(item.product_checked_at).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Kontrol yok'}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(item)}
                              disabled={isBusy}
                              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              Kaydet
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isBusy}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                            >
                              Vazgeç
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(item)}
                              disabled={isBusy}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 disabled:opacity-50"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => runManualCheck(item)}
                              disabled={isBusy}
                              className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 disabled:opacity-50"
                            >
                              Şimdi Kontrol Et
                            </button>
                            {item.is_hidden ? (
                              <button
                                onClick={() => publishItem(item)}
                                disabled={isBusy}
                                className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                              >
                                Yayınla
                              </button>
                            ) : (
                              <button
                                onClick={() => hideItem(item)}
                                disabled={isBusy}
                                className="px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50"
                              >
                                Gizle
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item)}
                              disabled={isBusy}
                              className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 border border-red-200 rounded-md hover:bg-red-200 disabled:opacity-50"
                            >
                              Sil
                            </button>
                          </>
                        )}
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

function StatCard({
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

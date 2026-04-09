// app/admin/product-checks/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type CheckStatus = 'pending_review' | 'out_of_stock' | 'removed' | 'blocked' | 'suspicious'
type SourceTable = 'sightings' | 'quick_sightings'

interface ReviewItem {
  id: string
  table_name: SourceTable
  title: string | null
  product_url: string
  marketplace: string | null
  source_domain: string | null
  product_check_status: CheckStatus
  product_check_notes: string | null
  product_checked_at: string | null
  created_at: string
}

const STATUS_LABELS: Record<CheckStatus, string> = {
  pending_review: 'İnceleme Bekliyor',
  out_of_stock: 'Stok Tükendi',
  removed: 'Sayfa Kaldırılmış',
  blocked: 'Bot Engeli (Manuel)',
  suspicious: 'Şüpheli',
}

const STATUS_COLORS: Record<CheckStatus, string> = {
  pending_review: 'bg-amber-100 text-amber-800 border-amber-200',
  out_of_stock: 'bg-orange-100 text-orange-800 border-orange-200',
  removed: 'bg-red-100 text-red-800 border-red-200',
  blocked: 'bg-purple-100 text-purple-800 border-purple-200',
  suspicious: 'bg-gray-100 text-gray-800 border-gray-200',
}

const ALL_STATUSES: CheckStatus[] = [
  'pending_review',
  'blocked',
  'out_of_stock',
  'removed',
  'suspicious',
]

export default function ProductChecksPage() {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<CheckStatus | 'all'>('all')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const combined: ReviewItem[] = []

      // sightings
      const sightingQuery = supabase
        .from('sightings')
        .select(
          'id, title, product_url, marketplace, source_domain, product_check_status, product_check_notes, product_checked_at, created_at',
        )
        .eq('source_channel', 'virtual')
        .not('product_check_status', 'is', null)
        .not('product_check_status', 'eq', 'active')
        .order('product_checked_at', { ascending: false })
        .limit(200)

      // quick_sightings
      const quickQuery = supabase
        .from('quick_sightings')
        .select(
          'id, title, product_url, marketplace, source_domain, product_check_status, product_check_notes, product_checked_at, created_at',
        )
        .eq('source_channel', 'virtual')
        .not('product_check_status', 'is', null)
        .not('product_check_status', 'eq', 'active')
        .order('product_checked_at', { ascending: false })
        .limit(200)

      const [{ data: sightingData }, { data: quickData }] = await Promise.all([
        sightingQuery,
        quickQuery,
      ])

      for (const row of sightingData ?? []) {
        combined.push({ ...row, table_name: 'sightings' } as ReviewItem)
      }
      for (const row of quickData ?? []) {
        combined.push({ ...row, table_name: 'quick_sightings' } as ReviewItem)
      }

      // Tarihe göre sırala
      combined.sort(
        (a, b) =>
          new Date(b.product_checked_at ?? b.created_at).getTime() -
          new Date(a.product_checked_at ?? a.created_at).getTime(),
      )

      setItems(combined)

      // Tab sayaçları
      const newCounts: Record<string, number> = { all: combined.length }
      for (const status of ALL_STATUSES) {
        newCounts[status] = combined.filter((i) => i.product_check_status === status).length
      }
      setCounts(newCounts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handlePublish = async (item: ReviewItem) => {
    setActionLoading(`publish-${item.id}`)
    try {
      await supabase
        .from(item.table_name)
        .update({
          is_hidden: false,
          product_check_status: 'active',
          product_check_notes: 'Admin tarafından onaylandı',
          product_checked_at: new Date().toISOString(),
        })
        .eq('id', item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id || i.table_name !== item.table_name))
      setCounts((prev) => ({
        ...prev,
        all: (prev.all ?? 0) - 1,
        [item.product_check_status]: Math.max(0, (prev[item.product_check_status] ?? 0) - 1),
      }))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (item: ReviewItem) => {
    if (!confirm('Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?')) return
    setActionLoading(`delete-${item.id}`)
    try {
      await supabase.from(item.table_name).delete().eq('id', item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id || i.table_name !== item.table_name))
      setCounts((prev) => ({
        ...prev,
        all: (prev.all ?? 0) - 1,
        [item.product_check_status]: Math.max(0, (prev[item.product_check_status] ?? 0) - 1),
      }))
    } finally {
      setActionLoading(null)
    }
  }

  const filteredItems =
    activeTab === 'all' ? items : items.filter((i) => i.product_check_status === activeTab)

  return (
    <div className="p-6">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ürün Stok Kontrolü</h1>
        <p className="text-sm text-gray-500 mt-1">
          Otomatik kontrol mekanizmasının yayından kaldırdığı sanal paylaşımlar. Yayına al veya sil.
        </p>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition"
          onClick={() => setActiveTab('all')}
        >
          <div className="text-2xl font-bold text-gray-800">{counts.all ?? 0}</div>
          <div className="text-xs text-gray-500 mt-1">Tüm İnceleme</div>
        </div>
        {ALL_STATUSES.map((s) => (
          <div
            key={s}
            className={`border rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-blue-300 transition ${STATUS_COLORS[s]}`}
            onClick={() => setActiveTab(s)}
          >
            <div className="text-2xl font-bold">{counts[s] ?? 0}</div>
            <div className="text-xs mt-1">{STATUS_LABELS[s]}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          Tümü ({counts.all ?? 0})
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              activeTab === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {STATUS_LABELS[s]} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Manuel kontrol yenileme */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchItems}
          disabled={loading}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Yükleniyor...' : '↺ Yenile'}
        </button>
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-500">Bu kategoride inceleme bekleyen kayıt yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ürün</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">
                  Kaynak
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Durum</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">
                  Kontrol
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const key = `${item.table_name}-${item.id}`
                const isActing = actionLoading === `publish-${item.id}` || actionLoading === `delete-${item.id}`
                const isExpanded = expandedNotesId === key
                return (
                  <>
                    <tr key={key} className="hover:bg-gray-50 transition">
                      {/* Ürün */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                          {item.title || '(başlık yok)'}
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
                          <button
                            onClick={() => setExpandedNotesId(isExpanded ? null : key)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                          >
                            {isExpanded ? '▼ Detayları Gizle' : '▶ Kontrol Detayları'}
                          </button>
                        )}
                      </td>

                      {/* Kaynak tablo */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.table_name === 'sightings'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-violet-50 text-violet-700'
                          }`}
                        >
                          {item.table_name === 'sightings' ? 'Yardım' : 'Nadir'}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {item.marketplace || item.source_domain || '—'}
                        </div>
                      </td>

                      {/* Durum */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded border text-xs font-semibold ${
                            STATUS_COLORS[item.product_check_status]
                          }`}
                        >
                          {STATUS_LABELS[item.product_check_status]}
                        </span>
                      </td>

                      {/* Son kontrol */}
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
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

                      {/* Aksiyonlar */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePublish(item)}
                            disabled={isActing}
                            className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                          >
                            Yayına Al
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={isActing}
                            className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 border border-red-200 rounded-md hover:bg-red-200 disabled:opacity-50 transition"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="space-y-3">
                            {/* Kontrol Notu */}
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                              <div className="font-semibold text-amber-900 text-sm">📋 Otomatik Kontrol Notu:</div>
                              <div className="text-amber-800 text-sm mt-2 whitespace-pre-wrap break-words leading-relaxed">
                                {item.product_check_notes}
                              </div>
                            </div>

                            {/* Bilgi Paneli */}
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                              <div className="font-semibold text-blue-900 text-sm">ℹ️ Manuel Kontrol Gerektirir:</div>
                              <div className="text-blue-800 text-sm mt-2 leading-relaxed">
                                <p>
                                  Otomatik stok kontrolü yapılamadığından, lütfen ürünü manuel olarak kontrol ettikten sonra işlem yapınız:
                                </p>
                                <ul className="mt-2 ml-4 space-y-1 list-disc">
                                  <li>
                                    <strong>Yayına Al:</strong> Ürün stokta ve satışta ise butonuna basınız. Otomatik kontrol geçenleri ile beraber yayınlanacaktır.
                                  </li>
                                  <li>
                                    <strong>Sil:</strong> Ürün stokta değil, sayfa kaldırılmış veya silinmiş ise sil butonuna basınız.
                                  </li>
                                </ul>
                                <p className="mt-3">
                                  Kontrol işlemi tamamlandığında, onaylanan kayıtlar otomatik olarak yayınlanacaktır.
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

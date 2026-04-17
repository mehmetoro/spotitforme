'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { buildRareSightingPath, buildSightingPath } from '@/lib/sighting-slug'

interface VirtualSpotHelp {
  id: string
  title: string
  notes: string | null
  location_description: string
  price: string | null
  image_url: string | null
  product_url: string | null
  marketplace: string | null
  seller_name: string | null
  source_domain: string | null
  link_preview_title: string | null
  link_preview_image: string | null
  link_preview_currency: string | null
  created_at: string
  spotter: { full_name: string; avatar_url: string | null } | null
  spot: { title: string } | null
}

interface VirtualRare {
  id: string
  title: string | null
  description: string
  photo_url: string | null
  product_url: string | null
  marketplace: string | null
  seller_name: string | null
  source_domain: string | null
  link_preview_title: string | null
  link_preview_image: string | null
  link_preview_description: string | null
  link_preview_currency: string | null
  price: number | null
  created_at: string
  user: { full_name: string; avatar_url: string | null } | null
}

export default function VirtualSightingsPage() {
  const [tab, setTab] = useState<'virtual-helps' | 'virtual-rare'>('virtual-helps')
  const [virtualHelps, setVirtualHelps] = useState<VirtualSpotHelp[]>([])
  const [virtualRare, setVirtualRare] = useState<VirtualRare[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    searchText: '',
    marketplace: '',
    domain: '',
    seller: '',
    minPrice: '',
    maxPrice: '',
  })

  useEffect(() => {
    void fetchData()
  }, [tab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'virtual-helps') {
        const res = await fetch('/api/sightings?channel=virtual')
        const data = await res.json()
        setVirtualHelps(Array.isArray(data) ? data : [])
      } else {
        const res = await fetch('/api/quick-sightings?channel=virtual')
        const data = await res.json()
        setVirtualRare(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
    }
  }

  const marketplaceOptions = useMemo(() => {
    const source = Array.isArray(tab === 'virtual-helps' ? virtualHelps : virtualRare)
      ? (tab === 'virtual-helps' ? virtualHelps : virtualRare)
      : []
    return Array.from(new Set(source.map((item: any) => item.marketplace).filter(Boolean))).sort()
  }, [tab, virtualHelps, virtualRare])

  const domainOptions = useMemo(() => {
    const source = Array.isArray(tab === 'virtual-helps' ? virtualHelps : virtualRare)
      ? (tab === 'virtual-helps' ? virtualHelps : virtualRare)
      : []
    return Array.from(new Set(source.map((item: any) => item.source_domain).filter(Boolean))).sort()
  }, [tab, virtualHelps, virtualRare])

  const parsePrice = (value: string | number | null | undefined) => {
    if (typeof value === 'number') return value
    if (!value) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  const getCurrencyPrefix = (currency: string | null | undefined) => {
    const code = (currency || 'TRY').toUpperCase()
    if (code === 'TRY') return '₺'
    if (code === 'USD') return '$'
    if (code === 'EUR') return '€'
    if (code === 'GBP') return '£'
    return `${code} `
  }

  const filteredHelps = useMemo(() => {
    return virtualHelps.filter((item) => {
      const text = filters.searchText.toLowerCase().trim()
      if (text) {
        const haystack = [
          item.title,
          item.notes,
          item.location_description,
          item.product_url,
          item.marketplace,
          item.source_domain,
          item.seller_name,
          item.link_preview_title,
          item.spot?.title,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(text)) return false
      }

      if (filters.marketplace && item.marketplace !== filters.marketplace) return false
      if (filters.domain && item.source_domain !== filters.domain) return false
      if (filters.seller && !(item.seller_name || '').toLowerCase().includes(filters.seller.toLowerCase())) return false

      const numericPrice = parsePrice(item.price)
      if (filters.minPrice) {
        if (numericPrice == null || numericPrice < Number(filters.minPrice)) return false
      }
      if (filters.maxPrice) {
        if (numericPrice == null || numericPrice > Number(filters.maxPrice)) return false
      }

      return true
    })
  }, [virtualHelps, filters])

  const filteredRare = useMemo(() => {
    return virtualRare.filter((item) => {
      const text = filters.searchText.toLowerCase().trim()
      if (text) {
        const haystack = [
          item.title,
          item.description,
          item.product_url,
          item.marketplace,
          item.source_domain,
          item.seller_name,
          item.link_preview_title,
          item.link_preview_description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(text)) return false
      }

      if (filters.marketplace && item.marketplace !== filters.marketplace) return false
      if (filters.domain && item.source_domain !== filters.domain) return false
      if (filters.seller && !(item.seller_name || '').toLowerCase().includes(filters.seller.toLowerCase())) return false

      if (filters.minPrice) {
        if (item.price == null || item.price < Number(filters.minPrice)) return false
      }
      if (filters.maxPrice) {
        if (item.price == null || item.price > Number(filters.maxPrice)) return false
      }

      return true
    })
  }, [virtualRare, filters])

  return (
    <main className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sanal Yardimlar</h1>
        <p className="text-gray-600 mt-1">Online pazarlarda bulunan nadir urun yardimlari</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setTab('virtual-helps')}
          className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 ${tab === 'virtual-helps' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          Sanal Yardimlar
        </button>
        <button
          onClick={() => setTab('virtual-rare')}
          className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 ${tab === 'virtual-rare' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'}`}
        >
          Sanal Nadirler
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-base font-bold mb-3">🔎 Detaylı Filtreler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            placeholder="Ürün, not, link veya açıklama ara..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <select
            value={filters.marketplace}
            onChange={(e) => setFilters({ ...filters, marketplace: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Tüm Pazar Yerleri</option>
            {marketplaceOptions.map((market: any) => (
              <option key={market} value={market}>{market}</option>
            ))}
          </select>

          <select
            value={filters.domain}
            onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Tüm Domainler</option>
            {domainOptions.map((domain: any) => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>

          <input
            type="text"
            value={filters.seller}
            onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
            placeholder="Satıcıya göre filtrele"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="Min fiyat"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="Max fiyat"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Yukleniyor...</div>
      ) : tab === 'virtual-helps' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHelps.map((item) => (
            <Link key={item.id} href={buildSightingPath(item.id, item.title || item.link_preview_title || item.spot?.title)} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-2">SpotItForMe Link Kartı</div>
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate">{item.marketplace || item.source_domain || 'Online pazar'}</span>
                    <span className="text-[11px] text-gray-500">Sanal Yardım</span>
                  </div>
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-100 shrink-0 flex items-center justify-center">
                      {item.link_preview_image || item.image_url ? (
                        <img src={item.link_preview_image || item.image_url || ''} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🌐</span>
                      )}
                    </div>
                    <div className="p-3 min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{item.link_preview_title || item.title || item.spot?.title || 'Sanal Yardım'}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.notes || item.location_description || 'Ürün bağlantısı paylaşıldı.'}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                        {item.seller_name && <span className="truncate">Satıcı: {item.seller_name}</span>}
                        {item.price && <span className="font-semibold text-green-700">{getCurrencyPrefix(item.link_preview_currency)}{Number(item.price).toLocaleString('tr-TR')}</span>}
                      </div>
                    </div>
                  </div>
                  {item.product_url && (
                    <div className="px-3 py-2 border-t border-gray-100 text-xs text-blue-700 truncate">
                      {item.product_url}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {!filteredHelps.length && <p className="text-gray-500">Filtrelere uygun sanal yardım bulunamadı.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRare.map((item) => (
            <Link key={item.id} href={buildRareSightingPath(item.id, item.title || item.link_preview_title || item.description)} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-2">SpotItForMe Link Kartı</div>
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate">{item.marketplace || item.source_domain || 'Online pazar'}</span>
                    <span className="text-[11px] text-gray-500">Sanal Nadir</span>
                  </div>
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-100 shrink-0 flex items-center justify-center">
                      {item.photo_url || item.link_preview_image ? (
                        <img src={item.photo_url || item.link_preview_image || ''} alt={item.title || item.description} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">💎</span>
                      )}
                    </div>
                    <div className="p-3 min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{item.title || item.link_preview_title || item.description}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.description || item.link_preview_description || 'Ürün bağlantısı paylaşıldı.'}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                        {item.seller_name && <span className="truncate">Satıcı: {item.seller_name}</span>}
                        {item.price != null && <span className="font-semibold text-green-700">{getCurrencyPrefix(item.link_preview_currency)}{item.price.toLocaleString('tr-TR')}</span>}
                      </div>
                    </div>
                  </div>
                  {item.product_url && (
                    <div className="px-3 py-2 border-t border-gray-100 text-xs text-blue-700 truncate">
                      {item.product_url}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {!filteredRare.length && <p className="text-gray-500">Filtrelere uygun sanal nadir seyahat bulunamadı.</p>}
        </div>
      )}
    </main>
  )
}

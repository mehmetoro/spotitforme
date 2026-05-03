'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { buildRareSightingPath, buildSightingPath } from '@/lib/sighting-slug'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const vsText = {
  tr: {
    title: 'Sanal Yardımlar',
    subtitle: 'Online pazarlarda bulunan nadir ürün yardımları',
    infoBox: 'Bu bölüm, e-ticaret siteleri ve online pazar yerlerinde gördüğün ürünleri paylaşman içindir. Aranan bir ürünün linkini "Sanal Yardımlar" sekmesinde, nadir ve zor bulunan bağımsız keşifleri ise "Sanal Nadirler" sekmesinde yayınlayabilirsin.',
    tabHelps: 'Sanal Yardımlar',
    tabRare: 'Sanal Nadirler',
    filtersTitle: '🔎 Detaylı Filtreler',
    searchPlaceholder: 'Ürün, not, link veya açıklama ara...',
    allMarketplaces: 'Tüm Pazar Yerleri',
    allDomains: 'Tüm Domainler',
    sellerFilter: 'Satıcıya göre filtrele',
    minPrice: 'Min fiyat',
    maxPrice: 'Max fiyat',
    loading: 'Yükleniyor...',
    cardLabel: 'SpotItForMe Link Kartı',
    labelVirtualHelp: 'Sanal Yardım',
    labelVirtualRare: 'Sanal Nadir',
    defaultMarket: 'Online pazar',
    sellerPrefix: 'Satıcı: ',
    defaultHelpTitle: 'Sanal Yardım',
    defaultDesc: 'Ürün bağlantısı paylaşıldı.',
    emptyHelps: 'Filtrelere uygun sanal yardım bulunamadı.',
    emptyRare: 'Filtrelere uygun sanal nadir bulunamadı.',
  },
  en: {
    title: 'Virtual Sightings',
    subtitle: 'Rare product finds from online marketplaces',
    infoBox: 'This section is for sharing products you found on e-commerce sites and online marketplaces. Share a product link in "Virtual Helps" and independent rare finds in "Virtual Rares".',
    tabHelps: 'Virtual Helps',
    tabRare: 'Virtual Rares',
    filtersTitle: '🔎 Advanced Filters',
    searchPlaceholder: 'Search product, note, link or description...',
    allMarketplaces: 'All Marketplaces',
    allDomains: 'All Domains',
    sellerFilter: 'Filter by seller',
    minPrice: 'Min price',
    maxPrice: 'Max price',
    loading: 'Loading...',
    cardLabel: 'SpotItForMe Link Card',
    labelVirtualHelp: 'Virtual Help',
    labelVirtualRare: 'Virtual Rare',
    defaultMarket: 'Online marketplace',
    sellerPrefix: 'Seller: ',
    defaultHelpTitle: 'Virtual Help',
    defaultDesc: 'Product link shared.',
    emptyHelps: 'No virtual helps match the filters.',
    emptyRare: 'No virtual rares match the filters.',
  },
  de: {
    title: 'Virtuelle Sichtungen',
    subtitle: 'Seltene Produkte aus Online-Marktplätzen',
    infoBox: 'Dieser Bereich dient zum Teilen von Produkten, die du auf E-Commerce-Seiten und Online-Marktplätzen gefunden hast.',
    tabHelps: 'Virtuelle Hilfen',
    tabRare: 'Virtuelle Raritäten',
    filtersTitle: '🔎 Erweiterte Filter',
    searchPlaceholder: 'Produkt, Notiz, Link oder Beschreibung suchen...',
    allMarketplaces: 'Alle Marktplätze',
    allDomains: 'Alle Domains',
    sellerFilter: 'Nach Verkäufer filtern',
    minPrice: 'Min. Preis',
    maxPrice: 'Max. Preis',
    loading: 'Wird geladen...',
    cardLabel: 'SpotItForMe Link-Karte',
    labelVirtualHelp: 'Virtuelle Hilfe',
    labelVirtualRare: 'Virtuelle Rarität',
    defaultMarket: 'Online-Marktplatz',
    sellerPrefix: 'Verkäufer: ',
    defaultHelpTitle: 'Virtuelle Hilfe',
    defaultDesc: 'Produktlink geteilt.',
    emptyHelps: 'Keine virtuellen Hilfen entsprechen den Filtern.',
    emptyRare: 'Keine virtuellen Raritäten entsprechen den Filtern.',
  },
  fr: {
    title: 'Signalements Virtuels',
    subtitle: 'Produits rares trouvés sur les marketplaces en ligne',
    infoBox: 'Cette section est destinée au partage de produits trouvés sur des sites e-commerce et des marketplaces en ligne.',
    tabHelps: 'Aides Virtuelles',
    tabRare: 'Raretés Virtuelles',
    filtersTitle: '🔎 Filtres Avancés',
    searchPlaceholder: 'Rechercher produit, note, lien ou description...',
    allMarketplaces: 'Toutes les Marketplaces',
    allDomains: 'Tous les Domaines',
    sellerFilter: 'Filtrer par vendeur',
    minPrice: 'Prix min',
    maxPrice: 'Prix max',
    loading: 'Chargement...',
    cardLabel: 'Carte Lien SpotItForMe',
    labelVirtualHelp: 'Aide Virtuelle',
    labelVirtualRare: 'Rareté Virtuelle',
    defaultMarket: 'Marketplace en ligne',
    sellerPrefix: 'Vendeur : ',
    defaultHelpTitle: 'Aide Virtuelle',
    defaultDesc: 'Lien produit partagé.',
    emptyHelps: 'Aucune aide virtuelle ne correspond aux filtres.',
    emptyRare: 'Aucune rareté virtuelle ne correspond aux filtres.',
  },
  es: {
    title: 'Avistamientos Virtuales',
    subtitle: 'Productos raros encontrados en mercados en línea',
    infoBox: 'Esta sección es para compartir productos que encontraste en sitios de e-commerce y mercados en línea.',
    tabHelps: 'Ayudas Virtuales',
    tabRare: 'Raridades Virtuales',
    filtersTitle: '🔎 Filtros Avanzados',
    searchPlaceholder: 'Buscar producto, nota, enlace o descripción...',
    allMarketplaces: 'Todos los Mercados',
    allDomains: 'Todos los Dominios',
    sellerFilter: 'Filtrar por vendedor',
    minPrice: 'Precio mín',
    maxPrice: 'Precio máx',
    loading: 'Cargando...',
    cardLabel: 'Tarjeta de Enlace SpotItForMe',
    labelVirtualHelp: 'Ayuda Virtual',
    labelVirtualRare: 'Raridad Virtual',
    defaultMarket: 'Mercado en línea',
    sellerPrefix: 'Vendedor: ',
    defaultHelpTitle: 'Ayuda Virtual',
    defaultDesc: 'Enlace de producto compartido.',
    emptyHelps: 'No hay ayudas virtuales que coincidan con los filtros.',
    emptyRare: 'No hay raridades virtuales que coincidan con los filtros.',
  },
  ru: {
    title: 'Виртуальные Находки',
    subtitle: 'Редкие товары на онлайн-маркетплейсах',
    infoBox: 'Этот раздел предназначен для публикации товаров, найденных на сайтах электронной торговли и онлайн-маркетплейсах.',
    tabHelps: 'Виртуальная Помощь',
    tabRare: 'Виртуальные Редкости',
    filtersTitle: '🔎 Расширенные Фильтры',
    searchPlaceholder: 'Поиск товара, заметки, ссылки или описания...',
    allMarketplaces: 'Все Маркетплейсы',
    allDomains: 'Все Домены',
    sellerFilter: 'Фильтр по продавцу',
    minPrice: 'Мин. цена',
    maxPrice: 'Макс. цена',
    loading: 'Загрузка...',
    cardLabel: 'Ссылочная карточка SpotItForMe',
    labelVirtualHelp: 'Виртуальная Помощь',
    labelVirtualRare: 'Виртуальная Редкость',
    defaultMarket: 'Онлайн-маркетплейс',
    sellerPrefix: 'Продавец: ',
    defaultHelpTitle: 'Виртуальная Помощь',
    defaultDesc: 'Ссылка на товар опубликована.',
    emptyHelps: 'Нет виртуальной помощи по заданным фильтрам.',
    emptyRare: 'Нет виртуальных редкостей по заданным фильтрам.',
  },
} as const
type VSLocale = keyof typeof vsText

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
  const locale = useCurrentLocale()
  const t = vsText[(locale as VSLocale) in vsText ? (locale as VSLocale) : 'tr']
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
  }, [tab, locale])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'virtual-helps') {
        const res = await fetch(`/api/sightings?channel=virtual&locale=${locale}`)
        const data = await res.json()
        setVirtualHelps(Array.isArray(data) ? data : [])
      } else {
        const res = await fetch(`/api/quick-sightings?channel=virtual&locale=${locale}`)
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
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          {t.infoBox}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setTab('virtual-helps')}
          className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 ${tab === 'virtual-helps' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          {t.tabHelps}
        </button>
        <button
          onClick={() => setTab('virtual-rare')}
          className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 ${tab === 'virtual-rare' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'}`}
        >
          {t.tabRare}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-base font-bold mb-3">{t.filtersTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            placeholder={t.searchPlaceholder}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <select
            value={filters.marketplace}
            onChange={(e) => setFilters({ ...filters, marketplace: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">{t.allMarketplaces}</option>
            {marketplaceOptions.map((market: any) => (
              <option key={market} value={market}>{market}</option>
            ))}
          </select>

          <select
            value={filters.domain}
            onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">{t.allDomains}</option>
            {domainOptions.map((domain: any) => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>

          <input
            type="text"
            value={filters.seller}
            onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
            placeholder={t.sellerFilter}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder={t.minPrice}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder={t.maxPrice}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">{t.loading}</div>
      ) : tab === 'virtual-helps' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHelps.map((item) => (
            <Link key={item.id} href={buildSightingPath(item.id, item.title || item.link_preview_title || item.spot?.title)} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-2">{t.cardLabel}</div>
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate">{item.marketplace || item.source_domain || t.defaultMarket}</span>
                    <span className="text-[11px] text-gray-500">{t.labelVirtualHelp}</span>
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
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{item.link_preview_title || item.title || item.spot?.title || t.defaultHelpTitle}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.notes || item.location_description || t.defaultDesc}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                        {item.seller_name && <span className="truncate">{t.sellerPrefix}{item.seller_name}</span>}
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
          {!filteredHelps.length && <p className="text-gray-500">{t.emptyHelps}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRare.map((item) => (
            <Link key={item.id} href={buildRareSightingPath(item.id, item.title || item.link_preview_title || item.description)} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-2">{t.cardLabel}</div>
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate">{item.marketplace || item.source_domain || t.defaultMarket}</span>
                    <span className="text-[11px] text-gray-500">{t.labelVirtualRare}</span>
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
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.description || item.link_preview_description || t.defaultDesc}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                        {item.seller_name && <span className="truncate">{t.sellerPrefix}{item.seller_name}</span>}
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
          {!filteredRare.length && <p className="text-gray-500">{t.emptyRare}</p>}
        </div>
      )}
    </main>
  )
}

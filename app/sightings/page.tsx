// app/sightings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ResponsiveAd from '@/components/ResponsiveAd'

interface Sighting {
  id: string
  spot_id: string
  spotter_id: string
  image_url: string | null
  location_description: string
  price: string | null
  notes: string | null
  category: string | null
  hashtags: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  spotter: { full_name: string; avatar_url: string | null } | null
  spot: { title: string } | null
}

interface RareSighting {
  id: string
  user_id: string
  description: string
  category: string | null
  price: number | null
  has_photo: boolean
  photo_url: string | null
  location_name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  city: string | null
  district: string | null
  points_earned: number
  status: string
  created_at: string
  user: { full_name: string; avatar_url: string | null } | null
}

const CATEGORIES = [
  { value: 'electronics', label: 'Elektronik' },
  { value: 'fashion', label: 'Giyim & Aksesuar' },
  { value: 'home', label: 'Ev & Bahçe' },
  { value: 'collectible', label: 'Koleksiyon' },
  { value: 'vehicle', label: 'Araç & Parça' },
  { value: 'other', label: 'Diğer' },
]



export default function SightingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'sightings' | 'rare'>('sightings');

  // Ortak filtre state'i, searchText her zaman boş başlar
  const [filters, setFilters] = useState({
    hasLocation: 'all',
    hasPrice: 'all',
    category: '',
    searchText: '',
    hashtag: '',
  });
  // searchText'i sadece ilk mount'ta searchParams ile başlatmak için flag
  // (Çift tanım kaldırıldı, sadece aşağıdaki satır kullanılacak)
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [sightingsLoading, setSightingsLoading] = useState(false);
  const [rareSightings, setRareSightings] = useState<RareSighting[]>([]);
  const [rareLoading, setRareLoading] = useState(false);


  // searchText'i sadece ilk mount'ta searchParams ile başlat
  // İlk mount'ta search paramı varsa, filtre state'i set edilir ve fetch fonksiyonları search paramı ile tetiklenir
  const [didInitSearchText, setDidInitSearchText] = useState(false);
  useEffect(() => {
    const search = searchParams.get('search') || '';
    if (!didInitSearchText) {
      setDidInitSearchText(true);
      if (search) {
        setFilters((prev) => ({ ...prev, searchText: search }));
        setActiveTab('sightings');
        fetchSightingsWithSearch(search);
        fetchRareSightingsWithSearch(search);
      }
    }
    // tab paramı için ayrı effect var
  }, [searchParams, didInitSearchText]);

  // searchText ile fetch fonksiyonları (ilk mount için)
  const fetchSightingsWithSearch = async (searchText: string) => {
    try {
      setSightingsLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.hasLocation !== 'all') params.append('hasLocation', filters.hasLocation);
      if (filters.hasPrice !== 'all') params.append('hasPrice', filters.hasPrice);
      if (searchText) params.append('search', searchText);
      if (filters.hashtag) params.append('hashtag', filters.hashtag);
      const res = await fetch(`/api/sightings?${params.toString()}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setSightings(
        data.map((item: any) => ({
          ...item,
          spotter: Array.isArray(item.spotter) ? item.spotter[0] : item.spotter,
          spot: Array.isArray(item.spot) ? item.spot[0] : item.spot,
        }))
      );
    } catch (e) {
      console.error('Sightings fetch error:', e);
    } finally {
      setSightingsLoading(false);
    }
  };

  const fetchRareSightingsWithSearch = async (searchText: string) => {
    try {
      setRareLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.hasLocation !== 'all') params.append('hasLocation', filters.hasLocation);
      if (filters.hasPrice !== 'all') params.append('hasPrice', filters.hasPrice);
      if (searchText) params.append('search', searchText);
      const res = await fetch(`/api/quick-sightings?${params.toString()}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setRareSightings(data);
    } catch (e) {
      console.error('Rare sightings fetch error:', e);
    } finally {
      setRareLoading(false);
    }
  };


  // Filtreler değişince fetch tetikle (ilk mount hariç)
  useEffect(() => {
    if (didInitSearchText) {
      fetchSightings();
      fetchRareSightings();
    }
  }, [filters.searchText, filters.category, filters.hasLocation, filters.hasPrice, filters.hashtag, didInitSearchText]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('tr-TR')

  // ---- Fetch sightings ----
  const fetchSightings = async () => {
    try {
      setSightingsLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.hasLocation !== 'all') params.append('hasLocation', filters.hasLocation);
      if (filters.hasPrice !== 'all') params.append('hasPrice', filters.hasPrice);
      if (filters.searchText) params.append('search', filters.searchText);
      if (filters.hashtag) params.append('hashtag', filters.hashtag);

      const res = await fetch(`/api/sightings?${params.toString()}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setSightings(
        data.map((item: any) => ({
          ...item,
          spotter: Array.isArray(item.spotter) ? item.spotter[0] : item.spotter,
          spot: Array.isArray(item.spot) ? item.spot[0] : item.spot,
        }))
      );
    } catch (e) {
      console.error('Sightings fetch error:', e);
    } finally {
      setSightingsLoading(false);
    }
  };

  // ---- Fetch rare sightings ----
  const fetchRareSightings = async () => {
    try {
      setRareLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.hasLocation !== 'all') params.append('hasLocation', filters.hasLocation);
      if (filters.hasPrice !== 'all') params.append('hasPrice', filters.hasPrice);
      if (filters.searchText) params.append('search', filters.searchText);

      const res = await fetch(`/api/quick-sightings?${params.toString()}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setRareSightings(data);
    } catch (e) {
      console.error('Rare sightings fetch error:', e);
    } finally {
      setRareLoading(false);
    }
  };

  // Eski sightingFilters ve rareFilters bağımlılıklarını kaldırdık, sadece filters ile fetch tetikleniyor

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'rare') {
      setActiveTab('rare')
    } else if (tab === 'sightings') {
      setActiveTab('sightings')
    }
  }, [searchParams])

  useEffect(() => {
    if (activeTab === 'sightings' && sightings.length === 0) fetchSightings()
    if (activeTab === 'rare' && rareSightings.length === 0) fetchRareSightings()
  }, [activeTab])

  return (
    <main className="container-custom py-8 overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🤝 Yardımlar</h1>
        <p className="text-gray-600 mt-1">Kullanıcıların bildirdiği ürünler ve konumlar</p>
      </div>

      {/* Ortak Arama ve Filtreler */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-base font-bold mb-3">🔍 Arama & Filtreler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Ürün, konum, not, başlık veya hashtag ara..."
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Kategoriler</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={filters.hasPrice}
            onChange={(e) => setFilters({ ...filters, hasPrice: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Fiyat: Tümü</option>
            <option value="with">💰 Fiyat İçeren</option>
            <option value="without">Fiyat Yok</option>
          </select>
          <input
            type="text"
            placeholder="Hashtag (# olmadan)"
            value={filters.hashtag}
            onChange={(e) => setFilters({ ...filters, hashtag: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sightings')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'sightings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📍 Spot Yardımları
        </button>
        <button
          onClick={() => setActiveTab('rare')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'rare'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          💎 Nadir Görülenler
        </button>
      </div>

      {/* Sekme İçerikleri */}
      {activeTab === 'sightings' ? (
        <>
          <div className="mb-4">
            <ResponsiveAd placement="inline" />
          </div>
          {sightingsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
            </div>
          ) : sightings.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Yardım bulunamadı</h2>
              <p className="text-gray-500 text-sm">Filtrelerinizi değiştirip tekrar deneyin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sightings.map((s) => (
                <Link
                  key={s.id}
                  href={`/sightings/${s.id}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="h-44 bg-gray-100 overflow-hidden relative">
                    {s.image_url ? (
                      <img src={s.image_url} alt="Sighting" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📷</div>
                    )}
                    {s.latitude && s.longitude && (
                      <span className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">📍 GPS</span>
                    )}
                    {s.price && (
                      <span className="absolute top-2 left-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-sm font-bold">₺{s.price}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate mb-1">{s.title || 'Bilinmeyen Ürün'}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">📍 {s.location_description}</p>
                    {s.notes && <p className="text-sm text-gray-500 line-clamp-2 mb-2">{s.notes}</p>}
                    {s.hashtags && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {s.hashtags.split(' ').filter((h) => h.startsWith('#')).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 min-w-0">
                        {s.spotter?.avatar_url && (
                          <img src={s.spotter.avatar_url} alt="" className="w-6 h-6 rounded-full shrink-0" />
                        )}
                        <span className="text-xs text-gray-600 truncate">{s.spotter?.full_name || 'Kullanıcı'}</span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(s.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <span className="text-2xl shrink-0">💎</span>
              <div>
                <p className="font-semibold text-purple-900">Nadir Ürün Bildirimleri</p>
                <p className="text-sm text-purple-700 mt-0.5">
                  Kullanıcılar henüz spotu olmayan nadir ürünleri bir yerde gördüklerinde buraya bildiriyor.
                  İstediğiniz ürünü bulursanız satıcıya ulaşmak için bir spot oluşturabilirsiniz.
                </p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <ResponsiveAd placement="inline" />
          </div>
          {rareLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600" />
            </div>
          ) : rareSightings.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-4xl mb-4">💎</div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Nadir görülen bulunamadı</h2>
              <p className="text-gray-500 text-sm">
                Henüz bildirim yok. Ana sayfadaki "Nadir Gördüm" butonuyla siz de ekleyin!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rareSightings.map((s) => (
                <Link
                  key={s.id}
                  href={`/sightings/rare/${s.id}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group"
                >
                  <div className="h-44 bg-gradient-to-br from-purple-50 to-indigo-100 overflow-hidden relative">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt="Nadir görülen" className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-purple-300 gap-2">
                        <span className="text-5xl">💎</span>
                        <span className="text-xs text-purple-400">Fotoğraf yok</span>
                      </div>
                    )}
                    {/* Badges */}
                    {s.price != null && (
                      <span className="absolute top-2 left-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-sm font-bold">
                        ₺{s.price.toLocaleString('tr-TR')}
                      </span>
                    )}
                    {s.latitude && s.longitude && (
                      <span className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">📍 GPS</span>
                    )}
                    {/* Nadir badge */}
                    <span className="absolute bottom-2 right-2 bg-purple-700 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      NADİR
                    </span>
                  </div>
                  <div className="p-4">
                    {/* Category */}
                    {s.category && (
                      <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mb-2">
                        {CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category}
                      </span>
                    )}
                    {/* Description */}
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 break-words">{s.description}</h3>
                    {/* Location */}
                    <p className="text-sm text-gray-600 truncate mb-1">📍 {s.location_name}{s.city ? `, ${s.city}` : ''}</p>
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 min-w-0">
                        {s.user?.avatar_url && (
                          <img src={s.user.avatar_url} alt="" className="w-6 h-6 rounded-full shrink-0" />
                        )}
                        <span className="text-xs text-gray-600 truncate">{s.user?.full_name || 'Kullanıcı'}</span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(s.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

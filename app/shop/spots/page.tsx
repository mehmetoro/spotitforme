// app/shop/spots/page.tsx - DÜZELTİLMİŞ
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

interface ShopSpot {
  id: string
  title: string
  description: string
  category: string | null
  location: string | null
  status: 'active' | 'found' | 'expired'
  image_url: string | null
  views: number
  helps: number
  created_at: string
  updated_at: string
}

interface FilterState {
  status: string
  category: string
  sortBy: string
  search: string
}

// Supabase'den gelen raw spot tipi
interface RawSpot {
  id: string
  title: string
  description: string
  category: string | null
  location: string | null
  status: 'active' | 'found' | 'expired'
  image_url: string | null
  views: number
  helps: number
  created_at: string
  updated_at: string
  user_id: string
}

export default function ShopSpotsPage() {
  const router = useRouter()
  const [spots, setSpots] = useState<ShopSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState<any>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    found: 0,
    expired: 0,
    totalViews: 0,
    totalHelps: 0
  })
  
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    category: 'all',
    sortBy: 'newest',
    search: ''
  })

  const categories = [
    'Tümü', 'Elektronik', 'Fotoğraf Makineleri', 'Giyim & Aksesuar', 
    'Ev & Bahçe', 'Koleksiyon', 'Kitap & Müzik', 'Oyuncak & Oyun',
    'Spor & Outdoor', 'Araç & Parça', 'Diğer'
  ]

  useEffect(() => {
    checkAuthAndLoadSpots()
  }, [filters])

  const checkAuthAndLoadSpots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/shop/spots')
        return
      }

      // Mağazayı getir
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (!shopData) {
        router.push('/for-business')
        return
      }

      setShop(shopData)
      
      // Spot'ları getir
      await loadShopSpots(user.id)

    } catch (error) {
      console.error('Veriler yüklenemedi:', error)
      alert('Spot bilgileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadShopSpots = async (ownerId: string) => {
    try {
      // Base query
      let query = supabase
        .from('spots')
        .select('*')
        .eq('user_id', ownerId)

      // Filtreler
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      
      if (filters.category !== 'all' && filters.category !== 'Tümü') {
        query = query.eq('category', filters.category)
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Sıralama
      if (filters.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filters.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else if (filters.sortBy === 'most_viewed') {
        query = query.order('views', { ascending: false })
      } else if (filters.sortBy === 'most_helped') {
        query = query.order('helps', { ascending: false })
      }

      const { data: spotsData, error } = await query

      if (error) throw error

      // Spot'ları işle - DÜZELTİLDİ (134. satır)
      const processedSpots = (spotsData as RawSpot[] | null)?.map((spot: RawSpot) => {
        // Spot'un durumunu kontrol et (30 günden eski spot'ları expired yap)
        const createdDate = new Date(spot.created_at)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))
        
        let status = spot.status
        if (status === 'active' && daysDiff > 30) {
          status = 'expired'
        }

        return {
          id: spot.id,
          title: spot.title,
          description: spot.description,
          category: spot.category,
          location: spot.location,
          status: status,
          image_url: spot.image_url,
          views: spot.views || 0,
          helps: spot.helps || 0,
          created_at: spot.created_at,
          updated_at: spot.updated_at
        } as ShopSpot
      }) || []

      setSpots(processedSpots)

      // İstatistikleri hesapla
      calculateStats(processedSpots)

    } catch (error) {
      console.error('Spotlar yüklenemedi:', error)
    }
  }

  const calculateStats = (spots: ShopSpot[]) => {
    const total = spots.length
    const active = spots.filter(s => s.status === 'active').length
    const found = spots.filter(s => s.status === 'found').length
    const expired = spots.filter(s => s.status === 'expired').length
    const totalViews = spots.reduce((sum, spot) => sum + (spot.views || 0), 0)
    const totalHelps = spots.reduce((sum, spot) => sum + (spot.helps || 0), 0)

    setStats({
      total,
      active,
      found,
      expired,
      totalViews,
      totalHelps
    })
  }

  const handleCreateSpot = () => {
    router.push('/create-spot')
  }

  const handleEditSpot = (spotId: string) => {
    router.push(`/spots/${spotId}/edit`)
  }

  const handleRenewSpot = async (spotId: string) => {
    if (!confirm('Bu spot\'u yenilemek istediğinize emin misiniz? Spot 30 gün daha aktif kalacaktır.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('spots')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', spotId)

      if (error) throw error

      alert('Spot başarıyla yenilendi!')
      // Spot'ları yenile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        loadShopSpots(user.id)
      }
    } catch (error) {
      console.error('Spot yenilenemedi:', error)
      alert('Spot yenilenirken bir hata oluştu')
    }
  }

  const handleDeleteSpot = async (spotId: string, spotTitle: string) => {
    if (!confirm(`"${spotTitle}" spot'unu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('spots')
        .delete()
        .eq('id', spotId)

      if (error) throw error

      alert('Spot başarıyla silindi!')
      // Spot'ları yenile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        loadShopSpots(user.id)
      }
    } catch (error) {
      console.error('Spot silinemedi:', error)
      alert('Spot silinirken bir hata oluştu')
    }
  }

  const handleUpdateStatus = async (spotId: string, newStatus: 'active' | 'found') => {
    try {
      const { error } = await supabase
        .from('spots')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', spotId)

      if (error) throw error

      alert(`Spot durumu "${newStatus === 'active' ? 'Aktif' : 'Bulundu'}" olarak güncellendi!`)
      // Spot'ları yenile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        loadShopSpots(user.id)
      }
    } catch (error) {
      console.error('Spot durumu güncellenemedi:', error)
      alert('Spot durumu güncellenirken bir hata oluştu')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'found': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'found': return 'Bulundu'
      case 'expired': return 'Süresi Dolmuş'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Spot'lar yükleniyor...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mağaza Bulunamadı</h1>
          <button
            onClick={() => router.push('/for-business')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg"
          >
            Ücretsiz Mağaza Aç
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* Üst Navigasyon */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/shop/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span>›</span>
            <span className="font-medium text-gray-900">Spot'larım</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Spot'larım</h1>
              <p className="text-gray-600">
                Tüm spot'larınızı buradan yönetebilirsiniz
              </p>
            </div>
            
            <button
              onClick={handleCreateSpot}
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center"
            >
              <span className="mr-2">➕</span>
              Yeni Spot Oluştur
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Toplam Spot</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
            <div className="text-sm text-gray-600">Aktif</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.found}</div>
            <div className="text-sm text-gray-600">Bulunan</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.expired}</div>
            <div className="text-sm text-gray-600">Süresi Dolmuş</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{stats.totalViews}</div>
            <div className="text-sm text-gray-600">Toplam Görüntülenme</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">{stats.totalHelps}</div>
            <div className="text-sm text-gray-600">Toplam Yardım</div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arama
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Spot ara..."
                />
              </div>
            </div>

            {/* Durum Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="found">Bulundu</option>
                <option value="expired">Süresi Dolmuş</option>
              </select>
            </div>

            {/* Kategori Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sıralama */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sırala
              </label>
              <div className="flex space-x-2">
                {[
                  { value: 'newest', label: 'En Yeni' },
                  { value: 'oldest', label: 'En Eski' },
                  { value: 'most_viewed', label: 'En Çok Görüntülenen' },
                  { value: 'most_helped', label: 'En Çok Yardım Alan' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({...filters, sortBy: option.value})}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filters.sortBy === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtreleri Sıfırla */}
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={() => setFilters({
                  status: 'all',
                  category: 'all',
                  sortBy: 'newest',
                  search: ''
                })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          </div>
        </div>

        {/* Spot Listesi */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {spots.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filters.search || filters.status !== 'all' || filters.category !== 'all' 
                  ? 'Filtrelere uygun spot bulunamadı' 
                  : 'Henüz spot oluşturmadınız'}
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.status !== 'all' || filters.category !== 'all'
                  ? 'Filtrelerinizi değiştirmeyi deneyin veya yeni bir spot oluşturun'
                  : 'İlk spot\'unuzu oluşturarak başlayın'}
              </p>
              <button
                onClick={handleCreateSpot}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg"
              >
                İlk Spot'u Oluşturun
              </button>
            </div>
          ) : (
            <>
              {/* Mobil Görünüm */}
              <div className="md:hidden divide-y divide-gray-100">
                {spots.map((spot) => (
                  <div key={spot.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-grow">
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">
                          {spot.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(spot.status)}`}>
                          {getStatusText(spot.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{spot.views}</div>
                        <div className="text-xs text-gray-500">görüntülenme</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {spot.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{spot.category || 'Kategori yok'}</span>
                      <span>{new Date(spot.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/spots/${spot.id}`}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-center py-2 rounded-lg text-sm font-medium"
                      >
                        Görüntüle
                      </Link>
                      {spot.status === 'expired' && (
                        <button
                          onClick={() => handleRenewSpot(spot.id)}
                          className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 text-center py-2 rounded-lg text-sm font-medium"
                        >
                          Yenile
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSpot(spot.id, spot.title)}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 text-center py-2 rounded-lg text-sm font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Masaüstü Görünüm */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Spot</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Kategori</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Durum</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Görüntülenme</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Yardım</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Tarih</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {spots.map((spot) => (
                      <tr key={spot.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <Link
                              href={`/spots/${spot.id}`}
                              className="font-medium text-blue-600 hover:text-blue-800 block mb-1"
                            >
                              {spot.title.length > 50 ? spot.title.substring(0, 50) + '...' : spot.title}
                            </Link>
                            <p className="text-gray-500 text-sm line-clamp-1">
                              {spot.description?.substring(0, 60)}...
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {spot.category ? (
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                              {spot.category}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(spot.status)}`}>
                            {getStatusText(spot.status)}
                          </span>
                          {spot.status === 'expired' && (
                            <p className="text-red-600 text-xs mt-1">30 gün doldu</p>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{spot.views}</div>
                            <div className="text-xs text-gray-500">kez</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{spot.helps}</div>
                            <div className="text-xs text-gray-500">yardım</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-500">
                            <div>{new Date(spot.created_at).toLocaleDateString('tr-TR')}</div>
                            <div className="text-xs">
                              {new Date(spot.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col space-y-2">
                            <div className="flex space-x-2">
                              <Link
                                href={`/spots/${spot.id}`}
                                className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-center py-2 rounded text-sm font-medium"
                              >
                                👁️ Görüntüle
                              </Link>
                              {spot.status === 'active' && spot.helps === 0 && (
                                <button
                                  onClick={() => handleDeleteSpot(spot.id, spot.title)}
                                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 text-center py-2 rounded text-sm font-medium"
                                >
                                  🗑️ Sil
                                </button>
                              )}
                            </div>
                            
                            {spot.status === 'expired' && (
                              <button
                                onClick={() => handleRenewSpot(spot.id)}
                                className="w-full bg-green-50 text-green-600 hover:bg-green-100 text-center py-2 rounded text-sm font-medium"
                              >
                                🔄 Yenile (30 gün)
                              </button>
                            )}
                            
                            {spot.status === 'active' && (
                              <button
                                onClick={() => handleUpdateStatus(spot.id, 'found')}
                                className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 text-center py-2 rounded text-sm font-medium"
                              >
                                ✅ Bulundu İşaretle
                              </button>
                            )}
                            
                            {spot.status === 'found' && (
                              <button
                                onClick={() => handleUpdateStatus(spot.id, 'active')}
                                className="w-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 text-center py-2 rounded text-sm font-medium"
                              >
                                ↩️ Aktif Yap
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Sayfalama ve Bilgi */}
        {spots.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600">
            <div>
              Toplam <span className="font-bold">{spots.length}</span> spot gösteriliyor
            </div>
            <div className="mt-2 md:mt-0">
              {/* Basit sayfalama - ileride geliştirilebilir */}
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">
                  ← Önceki
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">1</span>
                <button className="px-3 py-1 border border-gray-300 rounded">
                  Sonraki →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* İpuçları ve Bilgiler */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center">
              <span className="text-blue-600 mr-2">💡</span>
              Spot Yönetimi İpuçları
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Süresi dolan spot'ları "Yenile" butonuyla 30 gün uzatabilirsiniz</li>
              <li>• Bulunan spot'ları "Bulundu" olarak işaretleyin</li>
              <li>• Yardım alınmayan spot'ları silebilirsiniz</li>
              <li>• Resimli spot'lar daha hızlı bulunuyor</li>
              <li>• Açıklamalar ne kadar detaylı olursa o kadar iyi</li>
            </ul>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="font-bold text-green-900 mb-3 flex items-center">
              <span className="text-green-600 mr-2">⚡</span>
              Hızlı Eylemler
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleCreateSpot}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center"
              >
                <span className="mr-2">➕</span>
                Yeni Spot Oluştur
              </button>
              
              <Link
                href="/shop/dashboard"
                className="block w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-lg border border-gray-300 text-center"
              >
                ← Dashboard'a Dön
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
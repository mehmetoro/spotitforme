// app/shop/dashboard/page.tsx - GÜNCELLENMİŞ VERSİYON
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

interface Shop {
  id: string
  shop_name: string
  description: string
  city: string
  subscription_type: string
  free_images_used: number
  total_images: number
  is_verified: boolean
  created_at: string
  email: string
  phone: string
  address: string
}

interface ShopStat {
  total_spots: number
  active_spots: number
  found_spots: number
  total_views: number
  total_helps: number
  monthly_spots: number
}

interface RecentSpot {
  id: string
  title: string
  status: string
  created_at: string
  views: number
  helps: number
}

export default function ShopDashboardPage() {
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [stats, setStats] = useState<ShopStat | null>(null)
  const [recentSpots, setRecentSpots] = useState<RecentSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'spots' | 'settings' | 'analytics'>('overview')

  useEffect(() => {
    checkAuthAndLoadShop()
  }, [])

  const checkAuthAndLoadShop = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/shop/dashboard')
        return
      }

      // Mağazayı getir
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (shopError) {
        // Mağaza yoksa oluşturma sayfasına yönlendir
        if (shopError.code === 'PGRST116') {
          router.push('/for-business')
          return
        }
        throw shopError
      }

      setShop(shopData)

      // İstatistikleri ve spot'ları getir
      await loadShopData(shopData.id, user.id)

    } catch (error) {
      console.error('Mağaza yüklenemedi:', error)
      alert('Mağaza bilgileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadShopData = async (shopId: string, ownerId: string) => {
    try {
      // İstatistikleri getir
      const { count: totalSpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ownerId)

      const { count: activeSpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ownerId)
        .eq('status', 'active')

      const { count: foundSpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ownerId)
        .eq('status', 'found')

      const { data: spotStats } = await supabase
        .from('spots')
        .select('views, helps')
        .eq('user_id', ownerId)

      const totalViews = spotStats?.reduce((sum, spot) => sum + (spot.views || 0), 0) || 0
      const totalHelps = spotStats?.reduce((sum, spot) => sum + (spot.helps || 0), 0) || 0

      // Bu ayki spot sayısı
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: monthlySpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ownerId)
        .gte('created_at', startOfMonth.toISOString())

      setStats({
        total_spots: totalSpots || 0,
        active_spots: activeSpots || 0,
        found_spots: foundSpots || 0,
        total_views: totalViews,
        total_helps: totalHelps,
        monthly_spots: monthlySpots || 0
      })

      // Son spot'ları getir
      const { data: spotsData } = await supabase
        .from('spots')
        .select('id, title, status, created_at, views, helps')
        .eq('user_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentSpots(spotsData || [])

    } catch (error) {
      console.error('Veriler yüklenemedi:', error)
    }
  }

  const handleCreateSpot = () => {
    router.push('/create-spot')
  }

  const handleViewShop = () => {
    if (shop) {
      router.push(`/shop/${shop.id}`)
    }
  }

  const handleUpgrade = () => {
    router.push('/for-business?upgrade=true')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Mağaza yükleniyor...</p>
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
          <p className="text-gray-600 mb-8">Henüz bir mağazanız yok. Hemen ücretsiz oluşturun!</p>
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
        {/* Mağaza Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-white text-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold mr-4">
                  {shop.shop_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{shop.shop_name}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {shop.city}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      shop.is_verified 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}>
                      {shop.is_verified ? '✓ Doğrulanmış' : 'Doğrulanmamış'}
                    </span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {shop.subscription_type === 'free' ? 'Ücretsiz Paket' : shop.subscription_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleViewShop}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg"
              >
                👁️ Mağazayı Görüntüle
              </button>
              <button
                onClick={handleUpgrade}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-3 rounded-lg"
              >
                ⭐ Paketi Yükselt
              </button>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total_spots}</div>
              <div className="text-sm text-gray-600">Toplam Spot</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.active_spots}</div>
              <div className="text-sm text-gray-600">Aktif Spot</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.found_spots}</div>
              <div className="text-sm text-gray-600">Bulunan</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.total_views}</div>
              <div className="text-sm text-gray-600">Görüntülenme</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-red-600 mb-1">{stats.total_helps}</div>
              <div className="text-sm text-gray-600">Yardım</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-indigo-600 mb-1">{stats.monthly_spots}</div>
              <div className="text-sm text-gray-600">Bu Ay</div>
            </div>
          </div>
        )}

        {/* Resim Limiti */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Resim Limiti</h3>
              <p className="text-gray-600 text-sm">
                {shop.free_images_used}/{shop.total_images} resim kullanıldı
              </p>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${
                shop.free_images_used >= shop.total_images 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {shop.total_images - shop.free_images_used} resim kaldı
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${
                shop.free_images_used >= shop.total_images 
                  ? 'bg-red-600' 
                  : 'bg-blue-600'
              }`}
              style={{ 
                width: `${Math.min(100, (shop.free_images_used / shop.total_images) * 100)}%` 
              }}
            ></div>
          </div>
          
          {shop.free_images_used >= shop.total_images && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                ⚠️ Resim limitiniz doldu. Yeni resim yüklemek için paketinizi yükseltin.
              </p>
            </div>
          )}
        </div>

        {/* Hızlı Eylemler */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={handleCreateSpot}
            className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition hover:border-blue-400"
          >
            <div className="text-3xl mb-3">➕</div>
            <h4 className="font-bold text-gray-900 mb-2">Yeni Spot</h4>
            <p className="text-gray-600 text-sm">Ürün ekle, satış yap</p>
          </button>
          
          <button
            onClick={() => router.push('/shop/analytics')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center transition hover:border-green-400"
          >
            <div className="text-3xl mb-3">📈</div>
            <h4 className="font-bold text-gray-900 mb-2">Analitik</h4>
            <p className="text-gray-600 text-sm">Performans raporları</p>
          </button>

          <button
            onClick={() => router.push('/shop/spots')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center transition hover:border-purple-400"
          >
            <div className="text-3xl mb-3">📈</div>
            <h4 className="font-bold text-gray-900 mb-2">Spot'larım</h4>
            <p className="text-gray-600 text-sm">Tüm ürünleriniz</p>
          </button>



          
          <button
            onClick={() => setActiveTab('settings')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center transition hover:border-orange-400"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h4 className="font-bold text-gray-900 mb-2">Ayarlar</h4>
            <p className="text-gray-600 text-sm">Mağaza bilgileri</p>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex overflow-x-auto border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👁️ Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'spots'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Spot'larım
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📈 Analitik
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Ayarlar
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Hoş Geldiniz!</h3>
                  <p className="text-gray-600 mb-6">
                    Mağaza panelinize hoş geldiniz. Buradan spot'larınızı yönetebilir, 
                    istatistiklerinizi görüntüleyebilir ve mağaza ayarlarınızı düzenleyebilirsiniz.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h4 className="font-bold text-blue-900 mb-3">📈 Performans İpuçları</h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Resimli spot'lar %70 daha hızlı bulunuyor</li>
                        <li>• Detaylı açıklamalar yardım şansını artırır</li>
                        <li>• Aktif kalmak görünürlüğünüzü artırır</li>
                        <li>• Hızlı cevap vermek müşteri memnuniyetini artırır</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-xl">
                      <h4 className="font-bold text-green-900 mb-3">🚀 Hızlı Başlangıç</h4>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li>• Mağaza profilinizi tamamlayın</li>
                        <li>• İlk spot'unuzu oluşturun</li>
                        <li>• Diğer kullanıcılara yardım edin</li>
                        <li>• Müşteri yorumlarını takip edin</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Son Spot'lar */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Son Spot'lar</h3>
                    <button
                      onClick={() => setActiveTab('spots')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Tümünü Gör →
                    </button>
                  </div>
                  
                  {recentSpots.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <div className="text-4xl mb-4">📝</div>
                      <p className="text-gray-600">Henüz spot oluşturmadınız</p>
                      <button
                        onClick={handleCreateSpot}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        İlk Spot'unu Oluştur →
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Başlık</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Durum</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Görüntülenme</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Yardım</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Tarih</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {recentSpots.map((spot) => (
                            <tr key={spot.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <Link
                                  href={`/spots/${spot.id}`}
                                  className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                  {spot.title.length > 40 ? spot.title.substring(0, 40) + '...' : spot.title}
                                </Link>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  spot.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {spot.status === 'active' ? 'Aktif' : 'Bulundu'}
                                </span>
                              </td>
                              <td className="py-3 px-4">{spot.views}</td>
                              <td className="py-3 px-4">{spot.helps}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'spots' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tüm Spot'larım</h3>
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-4">🚧</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Yakında Burada!</h4>
                  <p className="text-gray-600 mb-6">
                    Tüm spot'larınızı görüntüleyeceğiniz panel yakında eklenecek.
                  </p>
                  <button
                    onClick={() => router.push('/spots')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                  >
                    Tüm Spot'ları Görüntüle
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Mağaza Analitik</h3>
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Detaylı Raporlar Yakında!</h4>
                  <p className="text-gray-600">
                    Haftalık, aylık istatistikler ve performans raporları yakında eklenecek.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Mağaza Ayarları</h3>
                
                <div className="space-y-6">
                  {/* Temel Bilgiler */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-blue-600 mr-2">🏪</span>
                      Temel Bilgiler
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mağaza Adı
                        </label>
                        <p className="font-medium">{shop.shop_name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Şehir
                        </label>
                        <p className="font-medium">{shop.city}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="font-medium">{shop.email}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <p className="font-medium">{shop.phone || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <p className="text-gray-700 whitespace-pre-line">
                        {shop.description || 'Açıklama eklenmemiş'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => router.push('/for-business?edit=true')}
                      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      Bilgileri Düzenle
                    </button>
                  </div>

                  {/* Paket Bilgileri */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-yellow-600 mr-2">⭐</span>
                      Paket Bilgileri
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Mevcut Paket</p>
                          <p className="text-sm text-gray-600">
                            {shop.subscription_type === 'free' ? 'Ücretsiz Başlangıç' : shop.subscription_type}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {shop.subscription_type === 'free' ? 'ÜCRETSİZ' : 'PREMIUM'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Resim Limiti</p>
                          <p className="text-sm text-gray-600">
                            {shop.free_images_used}/{shop.total_images} kullanıldı
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          shop.free_images_used >= shop.total_images 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {shop.total_images - shop.free_images_used} kaldı
                        </span>
                      </div>
                      
                      <button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3 rounded-lg"
                      >
                        ⭐ Premium'a Yükselt
                      </button>
                    </div>
                  </div>

                  {/* Mağaza URL'si */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-green-600 mr-2">🔗</span>
                      Mağaza Linkiniz
                    </h4>
                    
                    <div className="space-y-3">
                      <p className="text-gray-600 text-sm">
                        Müşteriler bu link üzerinden mağazanıza ulaşabilir:
                      </p>
                      
                      <div className="flex">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/shop/${shop.id}`}
                          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/shop/${shop.id}`)
                            alert('Link kopyalandı!')
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg"
                        >
                          Kopyala
                        </button>
                      </div>
                      
                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={handleViewShop}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg"
                        >
                          Mağazayı Görüntüle
                        </button>
                        <button
                          onClick={() => {
                            window.open(`/shop/${shop.id}`, '_blank')
                          }}
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 rounded-lg"
                        >
                          Yeni Sekmede Aç
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
// app/shop/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
}

interface ShopStat {
  total_spots: number
  active_spots: number
  found_spots: number
  total_views: number
  total_helps: number
  monthly_spots: number
}

export default function ShopDashboardPage() {
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [stats, setStats] = useState<ShopStat | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'spots' | 'settings'>('overview')

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
        if (shopError.code === 'PGRST116') { // No rows returned
          router.push('/for-business')
          return
        }
        throw shopError
      }

      setShop(shopData)

      // İstatistikleri getir
      await loadShopStats(shopData.id, user.id)

    } catch (error) {
      console.error('Mağaza yüklenemedi:', error)
      alert('Mağaza bilgileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadShopStats = async (shopId: string, ownerId: string) => {
    try {
      // Toplam spot sayısı
      const { count: totalSpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ownerId)

      // Aktif spot sayısı
      const { count: activeSpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ownerId)
        .eq('status', 'active')

      // Bulunan spot sayısı
      const { count: foundSpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ownerId)
        .eq('status', 'found')

      // Toplam görüntülenme ve yardım
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

    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error)
    }
  }

  const handleUpgradePlan = () => {
    router.push('/for-business?upgrade=true')
  }

  const handleCreateSpot = () => {
    router.push('/create-spot')
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
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* Mağaza Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{shop.shop_name}</h1>
              <div className="flex items-center space-x-4">
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
                <span className="px-3 py-1 rounded-full text-sm bg-white bg-opacity-20">
                  {shop.subscription_type === 'free' ? 'Ücretsiz Paket' : shop.subscription_type}
                </span>
              </div>
            </div>
            <button
              onClick={handleUpgradePlan}
              className="mt-4 md:mt-0 bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-lg"
            >
              Paketi Yükselt
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.total_spots}
              </div>
              <div className="text-sm text-gray-600">Toplam Spot</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.active_spots}
              </div>
              <div className="text-sm text-gray-600">Aktif Spot</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.found_spots}
              </div>
              <div className="text-sm text-gray-600">Bulunan Spot</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.total_views}
              </div>
              <div className="text-sm text-gray-600">Görüntülenme</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {stats.total_helps}
              </div>
              <div className="text-sm text-gray-600">Yardım</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {stats.monthly_spots}
              </div>
              <div className="text-sm text-gray-600">Bu Ay</div>
            </div>
          </div>
        )}

        {/* Resim Limiti Göstergesi */}
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleCreateSpot}
            className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition duration-200"
          >
            <div className="text-3xl mb-3">➕</div>
            <h4 className="font-bold text-gray-900 mb-2">Yeni Spot Oluştur</h4>
            <p className="text-gray-600 text-sm">Aradığınız ürünü topluluğa sorun</p>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center transition duration-200"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h4 className="font-bold text-gray-900 mb-2">Mağaza Ayarları</h4>
            <p className="text-gray-600 text-sm">Bilgilerinizi güncelleyin</p>
          </button>
          
          <button
            onClick={() => router.push(`/shop/${shop.id}`)}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center transition duration-200"
          >
            <div className="text-3xl mb-3">👁️</div>
            <h4 className="font-bold text-gray-900 mb-2">Mağazayı Görüntüle</h4>
            <p className="text-gray-600 text-sm">Müşteri gözüyle bakın</p>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'spots'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Spot'larım
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ayarlar
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
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
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h4 className="font-bold text-green-900 mb-3">🚀 Hızlı Başlangıç</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Mağaza profilinizi tamamlayın</li>
                      <li>• İlk spot'unuzu oluşturun</li>
                      <li>• Diğer kullanıcılara yardım edin</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'spots' && (
              <div>
                <p className="text-gray-600">Spot'larınız yükleniyor...</p>
                {/* Buraya SpotList component'i eklenecek */}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Mağaza Ayarları</h3>
                <p className="text-gray-600 mb-4">
                  Mağaza bilgilerinizi güncellemek için <strong>Ayarlar</strong> sayfası yakında eklenecek.
                </p>
                <button
                  onClick={() => router.push('/for-business?edit=true')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Mağaza Bilgilerini Düzenle
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
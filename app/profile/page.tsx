// app/profile/page.tsx - DÜZELTMİŞ VERSİYON
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Feed from '@/components/social/Feed'

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

interface UserSpot {
  id: string
  title: string
  status: string
  created_at: string
  helps: number
  views: number
  category: string | null
}

interface UserShop {
  id: string
  shop_name: string
  city: string
  subscription_type: string
  is_verified: boolean
}

interface SocialStats {
  totalPosts: number
  totalLikesReceived: number
  totalCommentsReceived: number
  spotsFound: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userSpots, setUserSpots] = useState<UserSpot[]>([])
  const [userShop, setUserShop] = useState<UserShop | null>(null)
  const [socialStats, setSocialStats] = useState<SocialStats>({
    totalPosts: 0,
    totalLikesReceived: 0,
    totalCommentsReceived: 0,
    spotsFound: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'spots' | 'help' | 'shop' | 'settings'>('spots')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/')
      return
    }
    
    fetchUserData(authUser.id)
  }

  const fetchUserData = async (userId: string) => {
    try {
      // Kullanıcı bilgileri
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Kullanıcının spot'ları
      const { data: spotsData } = await supabase
        .from('spots')
        .select('id, title, status, created_at, helps, views, category')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Kullanıcının mağazası
      const { data: shopData } = await supabase
        .from('shops')
        .select('id, shop_name, city, subscription_type, is_verified')
        .eq('owner_id', userId)
        .single()

      // Sosyal istatistikleri
      const [
        { data: postsData },
        { data: likesData },
        { data: commentsData },
        { data: foundData }
      ] = await Promise.all([
        // Kullanıcının postları
        supabase
          .from('social_posts')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        // Kullanıcının postlarına aldığı beğeniler
        supabase
          .from('social_likes')
          .select('id', { count: 'exact' })
          .in('post_id', (await supabase
            .from('social_posts')
            .select('id')
            .eq('user_id', userId)).data?.map((p: any) => p.id) || []),
        // Kullanıcının postlarına aldığı yorumlar
        supabase
          .from('social_comments')
          .select('id', { count: 'exact' })
          .in('post_id', (await supabase
            .from('social_posts')
            .select('id')
            .eq('user_id', userId)).data?.map((p: any) => p.id) || []),
        // Kullanıcının bulduğu spot'lar
        supabase
          .from('social_posts')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .eq('post_type', 'found')
      ])

      setSocialStats({
        totalPosts: postsData?.length || 0,
        totalLikesReceived: likesData?.length || 0,
        totalCommentsReceived: commentsData?.length || 0,
        spotsFound: foundData?.length || 0
      })

      setUser({
        id: userId,
        email: userData?.email || '',
        name: userData?.name || 'Kullanıcı',
        avatar_url: userData?.avatar_url || null,
        created_at: userData?.created_at || new Date().toISOString()
      })
      
      setUserSpots(spotsData || [])
      setUserShop(shopData || null)

    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCreateSpot = () => {
    router.push('/create-spot')
  }

  const handleOpenShopDashboard = () => {
    if (userShop) {
      router.push('/shop/dashboard')
    } else {
      router.push('/for-business')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        {/* Profil Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mr-6">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{user.name || 'Kullanıcı'}</h1>
                <p className="text-blue-100">{user.email}</p>
                <p className="text-blue-100 text-sm mt-2">
                  Üyelik: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateSpot}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg"
              >
                📝 Yeni Spot Oluştur
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg"
              >
                🚪 Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {userSpots.length}
            </div>
            <div className="text-gray-600">Spot'larım</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {userSpots.filter(s => s.status === 'found').length}
            </div>
            <div className="text-gray-600">Bulunan</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {userSpots.reduce((sum, spot) => sum + spot.views, 0)}
            </div>
            <div className="text-gray-600">Görüntülenme</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {userSpots.reduce((sum, spot) => sum + spot.helps, 0)}
            </div>
            <div className="text-gray-600">Yardım</div>
          </div>
        </div>

        {/* Sosyal Aktivite İstatistikleri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {socialStats.totalPosts}
            </div>
            <div className="text-gray-600">Paylaşım</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {socialStats.totalLikesReceived}
            </div>
            <div className="text-gray-600">Beğeni Aldı</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {socialStats.totalCommentsReceived}
            </div>
            <div className="text-gray-600">Yorum Aldı</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {socialStats.spotsFound}
            </div>
            <div className="text-gray-600">Spot Buldu</div>
          </div>
        </div>

        {/* Kullanıcının son sosyal paylaşımları */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Son Paylaşımlar</h2>
          <Feed initialUserId={user.id} />
        </div>

        {/* Mağaza Kartı */}
        {userShop && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  🏪
                </div>
                <div>
                  <h3 className="text-xl font-bold">{userShop.shop_name}</h3>
                  <p className="text-green-100">
                    {userShop.city} • {userShop.subscription_type === 'free' ? 'Ücretsiz Paket' : 'Premium'}
                    {userShop.is_verified && ' • ✓ Doğrulanmış'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenShopDashboard}
                className="bg-white text-green-600 hover:bg-green-50 font-bold px-6 py-3 rounded-lg"
              >
                Mağaza Paneline Git
              </button>
            </div>
          </div>
        )}

        {!userShop && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-2">🏪 Mağaza Sahibi misiniz?</h3>
                <p className="text-yellow-100">
                  Ücretsiz mağaza açın, müşterilerinizi artırın ve satışlarınızı büyütün!
                </p>
              </div>
              <button
                onClick={() => router.push('/for-business')}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-3 rounded-lg"
              >
                Ücretsiz Mağaza Aç
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b overflow-x-auto">
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
              onClick={() => setActiveTab('help')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'help'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🤝 Yardım Ettiklerim
            </button>
            {userShop && (
              <button
                onClick={() => setActiveTab('shop')}
                className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                  activeTab === 'shop'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏪 Mağazam
              </button>
            )}
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
            {activeTab === 'spots' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Spot'larım</h3>
                  <button
                    onClick={handleCreateSpot}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    + Yeni Spot
                  </button>
                </div>
                
                {userSpots.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Henüz spot oluşturmadınız</h4>
                    <p className="text-gray-600 mb-6">İlk spot'unuzu oluşturun ve topluluğumuzdan yardım alın</p>
                    <button
                      onClick={handleCreateSpot}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                      İlk Spot'u Oluşturun
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Başlık</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Kategori</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Durum</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Görüntülenme</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Yardım</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Tarih</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userSpots.map((spot) => (
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
                              {spot.category ? (
                                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                                  {spot.category}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
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
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Link
                                  href={`/spots/${spot.id}`}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Görüntüle
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'help' && (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Yardım Ettikleriniz</h4>
                <p className="text-gray-600 mb-6">
                  Diğer kullanıcılara yardım ettiğiniz spot'lar yakında burada görünecek.
                </p>
                <button
                  onClick={() => router.push('/spots')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Spot'lara Göz Atın
                </button>
              </div>
            )}
            
            {activeTab === 'shop' && userShop && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Mağaza Bilgilerim</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Mağaza Detayları</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Mağaza Adı</p>
                        <p className="font-medium">{userShop.shop_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Şehir</p>
                        <p className="font-medium">{userShop.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Paket</p>
                        <p className="font-medium">
                          {userShop.subscription_type === 'free' ? 'Ücretsiz Başlangıç' : 'Premium'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Durum</p>
                        <p className="font-medium">
                          {userShop.is_verified ? '✓ Doğrulanmış' : 'Doğrulanmamış'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleOpenShopDashboard}
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Mağaza Paneline Git
                    </button>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Hızlı İşlemler</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push('/for-business?edit=true')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg"
                      >
                        📝 Mağaza Bilgilerini Düzenle
                      </button>
                      <button
                        onClick={handleCreateSpot}
                        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 rounded-lg"
                      >
                        🏪 Mağaza İçin Spot Oluştur
                      </button>
                      <button
                        onClick={() => router.push(`/shop/${userShop.id}`)}
                        className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-3 rounded-lg"
                      >
                        👁️ Mağazayı Görüntüle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Hesap Ayarları</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Profil Bilgileri</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ad Soyad
                        </label>
                        <p className="font-medium">{user.name || 'Belirtilmemiş'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Üyelik Tarihi
                        </label>
                        <p className="font-medium">
                          {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Bildirimler</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className="text-sm">Yeni spot cevapları</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className="text-sm">Spot durum değişiklikleri</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-sm">Kampanya ve duyurular</span>
                      </label>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-bold text-gray-900 mb-3">Güvenlik</h4>
                      <button
                        onClick={() => router.push('/forgot-password')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg"
                      >
                        🔐 Şifre Değiştir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
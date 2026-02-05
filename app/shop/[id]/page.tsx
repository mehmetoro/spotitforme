// app/shop/[id]/page.tsx - GÜNCELLENMİŞ TAM KOD
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShopHeader from '@/components/shop/ShopHeader'
import ShopTabs from '@/components/shop/ShopTabs'
import InventoryGrid from '@/components/shop/InventoryGrid'
import ActiveSearches from '@/components/shop/ActiveSearches'
import ShopSocialFeed from '@/components/shop/ShopSocialFeed'
import ShopStatsPublic from '@/components/shop/ShopStatsPublic'

export default function ShopPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'searches' | 'social' | 'about'>('products')
  const [followersCount, setFollowersCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    fetchShopData()
    checkIfFollowing()
  }, [shopId])

  const fetchShopData = async () => {
    try {
      // 1. Mağaza bilgilerini al
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*, owner:user_profiles(*)')
        .eq('id', shopId)
        .single()

      if (shopError) {
        console.error('Shop load error:', shopError)
        setLoading(false)
        return
      }

      // 2. Takipçi sayısını al (ayrı query)
      const { count: followersCount, error: countError } = await supabase
        .from('shop_customer_relationships')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('relationship_type', 'follower')

      if (countError) {
        console.error('Followers count error:', countError)
        // Hata olsa bile devam et
      }

      setShop(shopData)
      setFollowersCount(followersCount || 0) // count null olabilir
      
    } catch (error) {
      console.error('Shop data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIfFollowing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: follow, error } = await supabase
        .from('shop_customer_relationships')
        .select('id')
        .eq('shop_id', shopId)
        .eq('customer_id', user.id)
        .eq('relationship_type', 'follower')
        .single()

      // Error handling: Eğer kayıt yoksa error gelir, bu normal
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Follow check error:', error)
        return
      }

      setIsFollowing(!!follow)
    } catch (error) {
      console.error('Follow check exception:', error)
    }
  }

  const handleFollowToggle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=' + window.location.pathname)
        return
      }

      if (isFollowing) {
        // Takibi bırak
        const { error } = await supabase
          .from('shop_customer_relationships')
          .delete()
          .eq('shop_id', shopId)
          .eq('customer_id', user.id)
          .eq('relationship_type', 'follower')

        if (error) throw error

        setFollowersCount(prev => Math.max(0, prev - 1))
        setIsFollowing(false)
      } else {
        // Takip et
        const { error } = await supabase
          .from('shop_customer_relationships')
          .insert({
            shop_id: shopId,
            customer_id: user.id,
            relationship_type: 'follower'
          })

        if (error) throw error

        setFollowersCount(prev => prev + 1)
        setIsFollowing(true)

        // Notification (opsiyonel)
        try {
          await supabase.from('shop_notifications').insert({
            shop_id: shopId,
            type: 'new_follower',
            title: 'Yeni takipçiniz var!',
            message: `Bir kullanıcı mağazanızı takip etmeye başladı.`,
            action_url: `/shop/${shopId}/followers`
          })
        } catch (notifError) {
          console.error('Notification error:', notifError)
          // Notification hatası işlemi durdurmasın
        }
      }
    } catch (error) {
      console.error('Follow toggle error:', error)
      alert('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Shop not found
  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-12 text-center">
          <div className="text-4xl mb-4">🏪</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mağaza bulunamadı</h1>
          <p className="text-gray-600 mb-8">Bu mağaza mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Ana Sayfaya Dön
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container-custom py-8">
        {/* Mağaza Header */}
        <ShopHeader
          shop={shop}
          followersCount={followersCount}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          onContact={() => console.log('contact')}
          onShare={() => console.log('share')}
        />

        {/* İstatistikler */}
        <ShopStatsPublic shopId={shopId} />

        {/* Tab Navigation */}
        <ShopTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          shopId={shopId}
        />

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'products' && (
            <InventoryGrid 
              shopId={shopId}
              limit={12}
              showFilters={true}
            />
          )}

          {activeTab === 'searches' && (
            <ActiveSearches 
              shopId={shopId}
              showCreateButton={false}
            />
          )}

          {activeTab === 'social' && (
            <ShopSocialFeed 
              shopId={shopId}
              limit={9}
            />
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-xl shadow p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Mağaza Hakkında</h3>
              
              <div className="prose max-w-none">
                {shop.description ? (
                  <div className="text-gray-700 whitespace-pre-line">
                    {shop.description}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Mağaza henüz bir açıklama eklememiş.
                  </p>
                )}
              </div>

              {/* İletişim bilgileri */}
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">📞 İletişim</h4>
                  <div className="space-y-2">
                    {shop.phone && (
                      <div className="flex items-center">
                        <span className="mr-3">📱</span>
                        <span>{shop.phone}</span>
                      </div>
                    )}
                    {shop.email && (
                      <div className="flex items-center">
                        <span className="mr-3">📧</span>
                        <span>{shop.email}</span>
                      </div>
                    )}
                    {shop.website && (
                      <div className="flex items-center">
                        <span className="mr-3">🌐</span>
                        <a 
                          href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {shop.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3">📍 Lokasyon</h4>
                  <div className="space-y-2">
                    {shop.address && (
                      <div className="flex items-start">
                        <span className="mr-3">🏠</span>
                        <span>{shop.address}</span>
                      </div>
                    )}
                    {shop.city && (
                      <div className="flex items-center">
                        <span className="mr-3">🏙️</span>
                        <span>{shop.city}</span>
                      </div>
                    )}
                    <div className="mt-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Haritada Göster →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Çalışma saatleri */}
              <div className="mt-8">
                <h4 className="font-bold text-gray-900 mb-3">🕒 Çalışma Saatleri</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">
                    {shop.business_hours || 'Pazartesi - Cumartesi: 09:00 - 19:00'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Bu mağazada aradığınız ürün mü var?</h3>
          <p className="mb-6 opacity-90">
            Direkt iletişime geçin veya mağazanın aradığı ürünler listesine göz atın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveTab('searches')}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg"
            >
              Mağazanın Aradıkları
            </button>
            <button
              onClick={() => console.log('contact shop')}
              className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-20 font-bold py-3 px-6 rounded-lg"
            >
              İletişime Geç
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
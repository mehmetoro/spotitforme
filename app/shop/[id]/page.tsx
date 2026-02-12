// app/shop/[id]/page.tsx - TAM KOD (ÜRÜNLER GÖSTERİLECEK)
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ShopPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  
  const [shop, setShop] = useState<any>(null)
  const [owner, setOwner] = useState<any>(null)
  const [inventory, setInventory] = useState<any[]>([]) // Ürünler için state ekle
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
      console.log('Fetching shop with ID:', shopId)
      
      // 1. Mağaza bilgilerini al
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .eq('is_active', true)
        .single()

      if (shopError) {
        console.error('Shop load error:', shopError)
        setLoading(false)
        return
      }

      console.log('Shop found:', shopData)
      
      setShop(shopData)
      fetchOwnerData(shopData.owner_id)
      fetchFollowersCount(shopData.id)
      fetchInventory(shopData.id) // Ürünleri getir
      
    } catch (error) {
      console.error('Shop data fetch error:', error)
      setLoading(false)
    }
  }

  const fetchOwnerData = async (ownerId: string) => {
    try {
      const { data: ownerData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', ownerId)
        .single()
      
      setOwner(ownerData || { name: 'Mağaza Sahibi', email: '' })
    } catch (error) {
      console.error('Owner fetch error:', error)
      setOwner({ name: 'Mağaza Sahibi', email: '' })
    }
  }

  const fetchInventory = async (shopId: string) => {
    try {
      console.log('Fetching inventory for shop:', shopId)
      
      // shop_inventory tablosundan ürünleri getir
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('shop_inventory')
        .select('*')
        .eq('shop_id', shopId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12)

      if (inventoryError) {
        console.error('Inventory load error:', inventoryError)
        setInventory([])
        return
      }

      console.log('Inventory found:', inventoryData?.length || 0, 'items')
      setInventory(inventoryData || [])
    } catch (error) {
      console.error('Inventory fetch error:', error)
      setInventory([])
    }
  }

  const fetchFollowersCount = async (shopId: string) => {
    try {
      const { count } = await supabase
        .from('shop_customer_relationships')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('relationship_type', 'follower')

      setFollowersCount(count || 0)
    } catch (error) {
      console.error('Followers count error:', error)
      setFollowersCount(0)
    } finally {
      setLoading(false)
    }
  }

  const checkIfFollowing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: follow } = await supabase
        .from('shop_customer_relationships')
        .select('id')
        .eq('shop_id', shopId)
        .eq('customer_id', user.id)
        .eq('relationship_type', 'follower')
        .single()

      setIsFollowing(!!follow)
    } catch (error) {
      console.log('Follow check - not following')
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
        await supabase
          .from('shop_customer_relationships')
          .delete()
          .eq('shop_id', shopId)
          .eq('customer_id', user.id)
          .eq('relationship_type', 'follower')

        setFollowersCount(prev => Math.max(0, prev - 1))
        setIsFollowing(false)
      } else {
        // Takip et
        await supabase
          .from('shop_customer_relationships')
          .insert({
            shop_id: shopId,
            customer_id: user.id,
            relationship_type: 'follower'
          })

        setFollowersCount(prev => prev + 1)
        setIsFollowing(true)
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
      </div>
    )
  }

  // Shop not found
  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12 text-center">
          <div className="text-4xl mb-4">🏪</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mağaza bulunamadı</h1>
          <p className="text-gray-600 mb-8">
            ID: <code className="bg-gray-200 px-2 py-1 rounded">{shopId}</code> ile mağaza bulunamadı.
          </p>
          
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Geri dön butonu */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>

        {/* Mağaza Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {shop.cover_url ? (
              <img 
                src={shop.cover_url} 
                alt={shop.shop_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-4xl">🏪</span>
              </div>
            )}
            
            {/* Logo */}
            <div className="absolute -bottom-8 left-8">
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg border-4 border-white flex items-center justify-center">
                {shop.logo_url ? (
                  <img 
                    src={shop.logo_url} 
                    alt={shop.shop_name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-3xl text-blue-600">🏬</span>
                )}
              </div>
            </div>
          </div>

          {/* Shop Info */}
          <div className="pt-12 pb-6 px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {shop.shop_name}
                  </h1>
                  {shop.is_verified && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                      ✔ Doğrulanmış
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">
                  {shop.description || 'Mağaza açıklaması bulunmuyor.'}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span>{shop.city || 'Konum belirtilmemiş'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">👤</span>
                    <span>{owner?.name || 'Mağaza Sahibi'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">📅</span>
                    <span>
                      {new Date(shop.created_at).toLocaleDateString('tr-TR')} tarihinde açıldı
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <span className="mr-2">
                    {isFollowing ? '✓' : '+'}
                  </span>
                  {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                  <span className="ml-2 text-sm opacity-80">
                    ({followersCount})
                  </span>
                </button>
                
                <button
                  onClick={() => console.log('Contact shop')}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
                >
                  📞 İletişim
                </button>
                
                <button
                  onClick={() => console.log('Share shop')}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  📤 Paylaş
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{inventory.length}</div>
            <div className="text-sm text-blue-600">Ürün</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-700">0</div>
            <div className="text-sm text-green-600">Arama</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{followersCount}</div>
            <div className="text-sm text-purple-600">Takipçi</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">
              {new Date(shop.created_at).toLocaleDateString('tr-TR')}
            </div>
            <div className="text-sm text-orange-600">Açılma</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b">
            {['products', 'searches', 'social', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-4 font-medium ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab === 'products' && '📦 Ürünler'}
                {tab === 'searches' && '🔍 Aradıkları'}
                {tab === 'social' && '💬 Sosyal'}
                {tab === 'about' && 'ℹ️ Hakkında'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'products' && (
            <div>
              {/* Ürünler Grid */}
              {inventory.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz ürün eklenmemiş</h3>
                  <p className="text-gray-600 mb-8">
                    Bu mağaza henüz ürün eklememiş. Ürün eklemek için mağaza dashboard'una gidin.
                  </p>
                  <button
                    onClick={() => router.push(`/dashboard/shop/${shopId}`)}
                    className="btn-primary"
                  >
                    Mağaza Dashboard'una Git
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {inventory.map((product) => (
                    <div 
                      key={product.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer"
                      onClick={() => router.push(`/shop/${shopId}/products/${product.id}`)}
                    >
                      {/* Ürün Resmi */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="text-center">
                              <span className="text-3xl text-gray-400">📦</span>
                              <p className="text-sm text-gray-500 mt-2">Resim Yok</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Ürün Durumu */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.condition === 'new' ? 'bg-green-100 text-green-800' :
                            product.condition === 'used' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {product.condition === 'new' ? 'Yeni' : 
                             product.condition === 'used' ? 'Kullanılmış' : 'Diğer'}
                          </span>
                        </div>
                        
                        {/* Görüntülenme Sayısı */}
                        {product.view_count > 0 && (
                          <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs">
                            👁️ {product.view_count}
                          </div>
                        )}
                      </div>

                      {/* Ürün Bilgileri */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600">
                          {product.title}
                        </h3>
                        
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg text-gray-900">
                            {product.price ? `${product.price.toLocaleString('tr-TR')} ${product.currency || '₺'}` : 'Fiyat Belirtilmemiş'}
                          </div>
                          
                          {product.location && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <span className="mr-1">📍</span>
                              {product.location.split(',')[0]}
                            </div>
                          )}
                        </div>

                        {/* Ürün Detayları */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              {product.category || 'Kategori yok'}
                            </span>
                            <span>
                              {new Date(product.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Daha Fazla Ürün Butonu */}
              {inventory.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => router.push(`/shop/${shopId}/products`)}
                    className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-8 rounded-lg"
                  >
                    Tüm Ürünleri Gör ({inventory.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'searches' && (
            <div className="bg-white rounded-xl shadow p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🔍 Mağazanın Aradıkları</h3>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Henüz arama eklenmemiş</h4>
                <p className="text-gray-600">
                  Mağaza henüz ne aradığını belirtmemiş.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-white rounded-xl shadow p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">💬 Sosyal Paylaşımlar</h3>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Henüz paylaşım yok</h4>
                <p className="text-gray-600">
                  Mağaza henüz sosyal paylaşım yapmamış.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-xl shadow p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">ℹ️ Mağaza Hakkında</h3>
              
              <div className="prose max-w-none mb-8">
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
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📞</span> İletişim Bilgileri
                  </h4>
                  <div className="space-y-3">
                    {shop.phone && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="mr-3 text-xl">📱</span>
                        <div>
                          <div className="font-medium">Telefon</div>
                          <div className="text-gray-600">{shop.phone}</div>
                        </div>
                      </div>
                    )}
                    {shop.email && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="mr-3 text-xl">📧</span>
                        <div>
                          <div className="font-medium">E-posta</div>
                          <div className="text-gray-600">{shop.email}</div>
                        </div>
                      </div>
                    )}
                    {shop.website && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="mr-3 text-xl">🌐</span>
                        <div>
                          <div className="font-medium">Website</div>
                          <a 
                            href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {shop.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📍</span> Lokasyon
                  </h4>
                  <div className="space-y-3">
                    {shop.address && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start">
                          <span className="mr-3 text-xl">🏠</span>
                          <div>
                            <div className="font-medium">Adres</div>
                            <div className="text-gray-600">{shop.address}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {shop.city && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="mr-3 text-xl">🏙️</span>
                        <div>
                          <div className="font-medium">Şehir</div>
                          <div className="text-gray-600">{shop.city}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => console.log('Show map')}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                      🗺️ Haritada Göster
                    </button>
                  </div>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-6">📊 Mağaza İstatistikleri</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">{inventory.length}</div>
                    <div className="text-sm text-blue-600">Ürün</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">0</div>
                    <div className="text-sm text-green-600">Arama</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700">{followersCount}</div>
                    <div className="text-sm text-purple-600">Takipçi</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-700">
                      {new Date(shop.created_at).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="text-sm text-orange-600">Açılma Tarihi</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Bu mağazayla iletişime geçmek ister misiniz?</h3>
          <p className="mb-6 opacity-90">
            Ürün satın almak, satmak veya işbirliği yapmak için direkt iletişime geçin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveTab('searches')}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg"
            >
              🔍 Neler Arıyor?
            </button>
            <button
              onClick={() => console.log('contact shop')}
              className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-20 font-bold py-3 px-6 rounded-lg"
            >
              📞 İletişime Geç
            </button>
            <button
              onClick={handleFollowToggle}
              className={`border-2 font-bold py-3 px-6 rounded-lg ${
                isFollowing
                  ? 'border-white text-white'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
            >
              {isFollowing ? '✓ Takip Ediliyor' : '+ Takip Et'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
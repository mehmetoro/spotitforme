// app/shop/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Shop {
  id: string
  shop_name: string
  description: string
  address: string
  city: string
  phone: string
  website: string
  email: string
  subscription_type: string
  is_verified: boolean
  created_at: string
}

interface ShopSpot {
  id: string
  title: string
  description: string
  category: string
  status: string
  created_at: string
  views: number
  helps: number
}

export default function ShopProfilePage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  
  const [shop, setShop] = useState<Shop | null>(null)
  const [spots, setSpots] = useState<ShopSpot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (shopId) {
      fetchShopData()
    }
  }, [shopId])

  const fetchShopData = async () => {
    try {
      // Mağaza bilgilerini getir
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single()

      if (shopError) throw shopError
      setShop(shopData)

      // Mağazanın spot'larını getir
      const { data: spotsData } = await supabase
        .from('spots')
        .select('id, title, description, category, status, created_at, views, helps')
        .eq('user_id', shopData.owner_id)
        .order('created_at', { ascending: false })
        .limit(20)

      setSpots(spotsData || [])

    } catch (error) {
      console.error('Mağaza verileri yüklenemedi:', error)
      router.push('/404')
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    if (shop?.phone) {
      window.location.href = `tel:${shop.phone}`
    } else if (shop?.email) {
      window.location.href = `mailto:${shop.email}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mağaza bulunamadı</h1>
          <button
            onClick={() => router.push('/spots')}
            className="btn-primary"
          >
            Spot'lara Göz At
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
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mr-6">
                {shop.shop_name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {shop.shop_name}
                  {shop.is_verified && (
                    <span className="ml-3 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      ✓ Doğrulanmış Mağaza
                    </span>
                  )}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">📍 {shop.city}</span>
                  <span className="text-gray-600">🏪 {shop.subscription_type === 'free' ? 'Ücretsiz Paket' : 'Premium'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleContact}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                İletişime Geç
              </button>
            </div>
          </div>

          {/* Mağaza Açıklaması */}
          {shop.description && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Hakkımızda</h3>
              <p className="text-gray-700 whitespace-pre-line">{shop.description}</p>
            </div>
          )}

          {/* İletişim Bilgileri */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">📞 İletişim</h4>
              {shop.phone && (
                <p className="text-gray-700 mb-2">
                  <strong>Telefon:</strong> {shop.phone}
                </p>
              )}
              {shop.email && (
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> {shop.email}
                </p>
              )}
              {shop.address && (
                <p className="text-gray-700">
                  <strong>Adres:</strong> {shop.address}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-3">🔗 Bağlantılar</h4>
              {shop.website ? (
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 block mb-2"
                >
                  🌐 {shop.website}
                </a>
              ) : (
                <p className="text-gray-500">Website bilgisi yok</p>
              )}
            </div>
          </div>
        </div>

        {/* Mağazanın Spot'ları */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Mağazanın Spot'ları ({spots.length})
            </h2>
          </div>

          {spots.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Henüz spot oluşturulmamış
              </h3>
              <p className="text-gray-600">
                Bu mağaza henüz bir spot oluşturmadı.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spots.map((spot) => (
                <div key={spot.id} className="bg-white rounded-xl shadow hover:shadow-lg transition duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        spot.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {spot.status === 'active' ? 'Aktif' : 'Bulundu'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {spot.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {spot.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>👁️ {spot.views}</span>
                        <span>🤝 {spot.helps}</span>
                      </div>
                      <a
                        href={`/spots/${spot.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Detay →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Çağrı */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Siz de mağaza olmak ister misiniz?</h3>
          <p className="mb-6 opacity-90">
            SpotItForMe'de mağaza olun, müşterilerinizi artırın ve satışlarınızı büyütün.
          </p>
          <a
            href="/for-business"
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg"
          >
            Ücretsiz Mağaza Aç
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
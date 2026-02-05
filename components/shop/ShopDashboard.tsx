// components/shop/ShopDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ShopStats from './ShopStats'
import RecentMatches from './RecentMatches'
import QuickActions from './QuickActions'
import InventoryOverview from './InventoryOverview'
import SearchOverview from './SearchOverview'

interface ShopDashboardProps {
  shopId: string
}

export default function ShopDashboard({ shopId }: ShopDashboardProps) {
  const router = useRouter()
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeSearches: 0,
    totalMatches: 0,
    pendingMatches: 0,
    totalFollowers: 0,
    revenue: 0
  })

  useEffect(() => {
    fetchShopData()
  }, [shopId])

  const fetchShopData = async () => {
    try {
      // Mağaza bilgileri
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single()

      // İstatistikler (paralel olarak)
      const [
        { count: productCount },
        { count: searchCount },
        { count: matchCount },
        { count: pendingMatchCount },
        { count: followerCount },
        { data: revenueData }
      ] = await Promise.all([
        supabase
          .from('shop_inventory')
          .select('count', { count: 'exact', head: true })
          .eq('shop_id', shopId)
          .eq('status', 'active'),
        supabase
          .from('shop_searches')
          .select('count', { count: 'exact', head: true })
          .eq('shop_id', shopId)
          .eq('status', 'active'),
        supabase
          .from('shop_search_matches')
          .select('count', { count: 'exact', head: true })
          .eq('search_id', shopId),
        supabase
          .from('shop_search_matches')
          .select('count', { count: 'exact', head: true })
          .eq('search_id', shopId)
          .eq('status', 'pending'),
        supabase
          .from('shop_customer_relationships')
          .select('count', { count: 'exact', head: true })
          .eq('shop_id', shopId)
          .eq('relationship_type', 'follower'),
        supabase
          .from('shop_analytics_daily')
          .select('revenue')
          .eq('shop_id', shopId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ])

      const totalRevenue = revenueData?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0

      setShop(shopData)
      setStats({
        totalProducts: productCount || 0,
        activeSearches: searchCount || 0,
        totalMatches: matchCount || 0,
        pendingMatches: pendingMatchCount || 0,
        totalFollowers: followerCount || 0,
        revenue: totalRevenue
      })
    } catch (error) {
      console.error('Mağaza verileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🏪</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Mağaza bulunamadı</h3>
        <p className="text-gray-600 mb-6">Bu mağaza mevcut değil veya silinmiş</p>
        <button
          onClick={() => router.push('/for-business')}
          className="btn-primary"
        >
          Yeni Mağaza Aç
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{shop.shop_name}</h1>
          <p className="text-gray-600">
            {shop.city} • {shop.subscription_type === 'free' ? 'Ücretsiz' : 'Premium'} Mağaza
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            shop.is_verified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {shop.is_verified ? '✅ Doğrulanmış' : '🔍 Doğrulanmadı'}
          </span>
          <button
            onClick={() => router.push(`/shop/${shop.id}/edit`)}
            className="btn-secondary"
          >
            Mağazayı Düzenle
          </button>
        </div>
      </div>

      {/* Hızlı İstatistikler */}
      <ShopStats stats={stats} shopId={shopId} />

      {/* Hızlı Aksiyonlar */}
      <QuickActions 
        shopId={shopId}
        onActionComplete={fetchShopData}
      />

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sol Kolon */}
        <div className="space-y-8">
          {/* Son Eşleşmeler */}
          <RecentMatches shopId={shopId} />
          
          {/* Stok Özeti */}
          <InventoryOverview shopId={shopId} />
        </div>

        {/* Sağ Kolon */}
        <div className="space-y-8">
          {/* Arama Özeti */}
          <SearchOverview shopId={shopId} />
          
          {/* Hızlı Bağlantılar */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">🚀 Hızlı Bağlantılar</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push(`/shop/${shopId}/inventory/new`)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 text-center"
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="font-medium">Yeni Ürün Ekle</div>
              </button>
              <button
                onClick={() => router.push(`/shop/${shopId}/searches/new`)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 text-center"
              >
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium">Arama Oluştur</div>
              </button>
              <button
                onClick={() => router.push(`/shop/${shopId}/social/new`)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 text-center"
              >
                <div className="text-2xl mb-2">📢</div>
                <div className="font-medium">Paylaşım Yap</div>
              </button>
              <button
                onClick={() => router.push(`/shop/${shopId}/analytics`)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 text-center"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">Analizleri Gör</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface ShopAnalytics {
  totalProducts: number
  totalSales: number
  revenue: number
  socialLikes: number
  socialComments: number
  socialPosts: number
  totalViews: number
  avgRating: number
}

interface DailySales {
  date: string
  amount: number
  count: number
}

export default function ShopAnalytics() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  
  const [isOwner, setIsOwner] = useState(false)
  const [analytics, setAnalytics] = useState<ShopAnalytics>({
    totalProducts: 0,
    totalSales: 0,
    revenue: 0,
    socialLikes: 0,
    socialComments: 0,
    socialPosts: 0,
    totalViews: 0,
    avgRating: 0
  })
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [loading, setLoading] = useState(true)
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    checkOwnerAndFetchData()
  }, [shopId])

  const checkOwnerAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Shop bilgisi ve sahip kontrolü
      const { data: shop } = await supabase
        .from('shops')
        .select('owner_id')
        .eq('id', shopId)
        .single()

      if (!shop || shop.owner_id !== user.id) {
        setIsOwner(false)
        router.push(`/shop/${shopId}`)
        return
      }

      setIsOwner(true)
      await fetchAnalytics(shopId)
    } catch (error) {
      console.error('Analytics yükleme hatası:', error)
    }
  }

  const fetchAnalytics = async (shopIdParam: string) => {
    try {
      setLoading(true)

      // Paralel sorgular
      const [
        { data: products },
        { data: orders },
        { data: likeData },
        { data: commentData },
        { data: postsData },
        { data: reviewData = [] }
      ] = await Promise.all([
        supabase
          .from('products')
          .select('id, title, view_count, sales_count', { count: 'exact' })
          .eq('shop_id', shopIdParam),
        supabase
          .from('orders')
          .select('id, total_amount, created_at')
          .eq('shop_id', shopIdParam),
        supabase
          .from('shop_social_likes')
          .select('id', { count: 'exact' })
          .eq('post_id', shopIdParam),
        supabase
          .from('shop_social_comments')
          .select('id', { count: 'exact' })
          .eq('post_id', shopIdParam),
        supabase
          .from('shop_social_posts')
          .select('id', { count: 'exact' })
          .eq('shop_id', shopIdParam),
        supabase
          .from('shop_reviews')
          .select('rating')
          .eq('shop_id', shopIdParam)
      ])

      // Hesaplayıcılar
      const totalViews = (products || []).reduce((sum: number, p: any) => sum + (p.view_count || 0), 0)
      const totalSales = (products || []).reduce((sum: number, p: any) => sum + (p.sales_count || 0), 0)
      const totalRevenue = (orders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
      const avgRating = (reviewData?.length || 0) > 0
        ? (reviewData!.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewData!.length).toFixed(1)
        : 0

      // Günlük satış grafiği (son 7 gün)
      const last7Days = getLast7Days()
      const dailySalesData = last7Days.map(date => {
        const dayOrders = (orders || []).filter(o => {
          const orderDate = new Date(o.created_at).toISOString().split('T')[0]
          return orderDate === date
        })
        return {
          date,
          amount: dayOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
          count: dayOrders.length
        }
      })

      // Top 5 ürün (satışa göre)
      const topProductsData = ((products || []) as any[])
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 5)

      setAnalytics({
        totalProducts: products?.length || 0,
        totalSales,
        revenue: totalRevenue,
        socialLikes: likeData?.length || 0,
        socialComments: commentData?.length || 0,
        socialPosts: postsData?.length || 0,
        totalViews,
        avgRating: Number(avgRating) || 0
      })

      setDailySales(dailySalesData)
      setTopProducts(topProductsData)
    } catch (error) {
      console.error('Analytics hesaplama hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLast7Days = (): string[] => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  if (!isOwner && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bu sayfaya erişimin yok</p>
          <Link href={`/shop/${shopId}`} className="text-blue-600 hover:underline">
            Mağazaya Dön
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mağaza Analytics</h1>
        <p className="text-gray-600 mt-2">Satış ve sosyal etkileşim istatistiklerinizi görüntüleyin</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Ürünler */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Ürün</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalProducts}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        {/* Satışlar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Satış</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalSales}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Gelir */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Gelir</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">₺{analytics.revenue.toLocaleString('tr-TR')}</p>
            </div>
            <div className="text-4xl">💳</div>
          </div>
        </div>

        {/* Ziyaretler */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Ziyaret</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalViews}</p>
            </div>
            <div className="text-4xl">👁️</div>
          </div>
        </div>
      </div>

      {/* Sosyal Etkileşim Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Beğeni */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sosyal Beğeni</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{analytics.socialLikes}</p>
            </div>
            <div className="text-4xl">❤️</div>
          </div>
        </div>

        {/* Yorumlar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sosyal Yorumlar</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{analytics.socialComments}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        {/* Paylaşımlar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sosyal Paylaşımlar</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{analytics.socialPosts}</p>
            </div>
            <div className="text-4xl">📱</div>
          </div>
        </div>
      </div>

      {/* Günlük Satış Grafiği */}
      {dailySales.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Son 7 Günün Satışları</h2>
          <div className="space-y-4">
            {dailySales.map((day, idx) => {
              const maxAmount = Math.max(...dailySales.map(d => d.amount))
              const barWidth = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">
                      {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₺{day.amount.toLocaleString('tr-TR')} ({day.count} satış)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top 5 Ürünler */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">En Çok Satan Ürünler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 text-gray-700 font-semibold">#</th>
                  <th className="text-left py-2 px-4 text-gray-700 font-semibold">Ürün Adı</th>
                  <th className="text-center py-2 px-4 text-gray-700 font-semibold">Satış</th>
                  <th className="text-center py-2 px-4 text-gray-700 font-semibold">Görünümler</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{idx + 1}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{product.title}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{product.sales_count || 0}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{product.view_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* İşlemler */}
      <div className="flex gap-4">
        <Link
          href={`/shop/${shopId}/social`}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          📱 Sosyal Paylaşımları Yönet
        </Link>
        <Link
          href={`/shop/${shopId}`}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          🏪 Mağazaya Dön
        </Link>
      </div>
    </div>
  )
}

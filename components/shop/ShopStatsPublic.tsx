// components/shop/ShopStatsPublic.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ShopStatsPublicProps {
  shopId: string
}

// Review interface'ini tanımlayalım
interface ShopReview {
  rating: number | null
  response_time: number | null
  [key: string]: any // Diğer alanlar için
}

interface ShopStats {
  productCount: number
  searchCount: number
  followerCount: number
  matchCount: number
  rating: number
  responseTime: number
}

export default function ShopStatsPublic({ shopId }: ShopStatsPublicProps) {
  const [stats, setStats] = useState<ShopStats>({
    productCount: 0,
    searchCount: 0,
    followerCount: 0,
    matchCount: 0,
    rating: 0,
    responseTime: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [shopId])

  const fetchStats = async () => {
    try {
      const [
        { count: productCount },
        { count: searchCount },
        { count: followerCount },
        { count: matchCount },
        { data: reviewsData }
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
          .from('shop_customer_relationships')
          .select('count', { count: 'exact', head: true })
          .eq('shop_id', shopId)
          .eq('relationship_type', 'follower'),
        supabase
          .from('shop_search_matches')
          .select('count', { count: 'exact', head: true })
          .eq('search_id', shopId)
          .eq('status', 'pending'),
        supabase
          .from('shop_reviews')
          .select('rating, response_time')
          .eq('shop_id', shopId)
          .limit(50)
      ])

      // Calculate average rating and response time with proper typing
      const reviews: ShopReview[] = reviewsData || []
      
      // DÜZELTİLMİŞ KISIM - TypeScript hataları giderildi
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum: number, r: ShopReview) => {
            const rating = r.rating || 0
            return sum + rating
          }, 0) / reviews.length 
        : 0
      
      const avgResponseTime = reviews.length > 0
        ? reviews.reduce((sum: number, r: ShopReview) => {
            const responseTime = r.response_time || 0
            return sum + responseTime
          }, 0) / reviews.length
        : 0

      setStats({
        productCount: productCount || 0,
        searchCount: searchCount || 0,
        followerCount: followerCount || 0,
        matchCount: matchCount || 0,
        rating: avgRating,
        responseTime: avgResponseTime
      })
    } catch (error) {
      console.error('Mağaza istatistikleri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} dk`
    if (minutes < 1440) return `${Math.round(minutes / 60)} saat`
    return `${Math.round(minutes / 1440)} gün`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-24"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
      <div className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition-shadow">
        <div className="text-2xl font-bold text-blue-600 mb-1">
          {stats.productCount}
        </div>
        <div className="text-sm text-gray-600">Ürün</div>
        <div className="text-xs text-gray-400 mt-1">Stokta</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition-shadow">
        <div className="text-2xl font-bold text-green-600 mb-1">
          {stats.searchCount}
        </div>
        <div className="text-sm text-gray-600">Arama</div>
        <div className="text-xs text-gray-400 mt-1">Aktif</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition-shadow">
        <div className="text-2xl font-bold text-purple-600 mb-1">
          {stats.followerCount}
        </div>
        <div className="text-sm text-gray-600">Takipçi</div>
        <div className="text-xs text-gray-400 mt-1">Toplam</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition-shadow">
        <div className="text-2xl font-bold text-orange-600 mb-1">
          {stats.matchCount}
        </div>
        <div className="text-sm text-gray-600">Eşleşme</div>
        <div className="text-xs text-gray-400 mt-1">Bekleyen</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition-shadow">
        <div className="text-2xl font-bold text-yellow-600 mb-1">
          {stats.rating.toFixed(1)}
        </div>
        <div className="text-sm text-gray-600">Puan</div>
        <div className="text-xs text-gray-400 mt-1">Ortalama</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition-shadow">
        <div className="text-2xl font-bold text-teal-600 mb-1">
          {formatResponseTime(stats.responseTime)}
        </div>
        <div className="text-sm text-gray-600">Yanıt</div>
        <div className="text-xs text-gray-400 mt-1">Ortalama</div>
      </div>
    </div>
  )
}
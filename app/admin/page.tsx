// app/admin/page.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RecentSpots from '@/components/admin/RecentSpots'
import RevenueChart from '@/components/admin/RevenueChart'
import AdSenseStatus from '@/components/admin/AdSenseStatus'

interface DashboardStats {
  totalUsers: number
  totalSpots: number
  totalShops: number
  revenue: number
  activeAds: number
  socialPosts: number
  totalLikes: number
  totalComments: number
  avgUserRating: number
}

// Payment interface'ini tanımla
interface Payment {
  amount: number
  status?: string
  [key: string]: any
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSpots: 0,
    totalShops: 0,
    revenue: 0,
    activeAds: 0,
    socialPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    avgUserRating: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Paralel olarak tüm verileri çek
      const [
        usersData,
        spotsData,
        shopsData,
        revenueData,
        socialPostsData,
        likesData,
        commentsData,
        reviewsData
      ] = await Promise.all([
        supabase.from('user_profiles').select('count', { count: 'exact', head: true }),
        supabase.from('spots').select('count', { count: 'exact', head: true }),
        supabase.from('shops').select('count', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('social_posts').select('count', { count: 'exact', head: true }),
        supabase.from('social_likes').select('count', { count: 'exact', head: true }),
        supabase.from('social_comments').select('count', { count: 'exact', head: true }),
        supabase.from('shop_reviews').select('rating')
      ])

      // DÜZELTİLMİŞ KISIM: reduce fonksiyonuna tipleri ekle
      const totalRevenue = revenueData.data?.reduce(
        (sum: number, payment: Payment) => sum + (payment.amount || 0), 
        0
      ) || 0

      const avgRating = reviewsData.data && reviewsData.data.length > 0
        ? reviewsData.data.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.data.length
        : 0

      setStats({
        totalUsers: usersData.count || 0,
        totalSpots: spotsData.count || 0,
        totalShops: shopsData.count || 0,
        revenue: totalRevenue,
        activeAds: 3,
        socialPosts: socialPostsData.count || 0,
        totalLikes: likesData.count || 0,
        totalComments: commentsData.count || 0,
        avgUserRating: parseFloat(avgRating.toFixed(1))
      })
    } catch (error) {
      console.error('Dashboard verileri alınamadı:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Üst Bilgi */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">SpotItForMe yönetim paneline hoş geldiniz</p>
      </div>

      {/* Temel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Kullanıcılar</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '-' : stats.totalUsers}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Spot'lar</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '-' : stats.totalSpots}</p>
            </div>
            <div className="text-4xl">📍</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Mağazalar</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '-' : stats.totalShops}</p>
            </div>
            <div className="text-4xl">🏪</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sosyal Paylaşımlar</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '-' : stats.socialPosts}</p>
            </div>
            <div className="text-4xl">📱</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Gelir</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '-' : '₺' + stats.revenue.toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Sosyal Aktivite */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Beğeni</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{loading ? '-' : stats.totalLikes}</p>
            </div>
            <div className="text-4xl">❤️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Yorumlar</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{loading ? '-' : stats.totalComments}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ort. Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {loading ? '-' : stats.avgUserRating.toFixed(1)} ⭐
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* AdSense Durumu */}
      <AdSenseStatus />

      {/* Grafikler ve Tablolar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <RecentSpots />
      </div>
    </div>
  )
}
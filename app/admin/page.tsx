// app/admin/page.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardStats from '@/components/admin/DashboardStats'
import RecentSpots from '@/components/admin/RecentSpots'
import RevenueChart from '@/components/admin/RevenueChart'
import AdSenseStatus from '@/components/admin/AdSenseStatus'

interface DashboardStats {
  totalUsers: number
  totalSpots: number
  totalShops: number
  revenue: number
  activeAds: number
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
    activeAds: 0
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
        revenueData
      ] = await Promise.all([
        supabase.from('user_profiles').select('count', { count: 'exact', head: true }),
        supabase.from('spots').select('count', { count: 'exact', head: true }),
        supabase.from('shops').select('count', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'completed')
      ])

      // DÜZELTİLMİŞ KISIM: reduce fonksiyonuna tipleri ekle
      const totalRevenue = revenueData.data?.reduce(
        (sum: number, payment: Payment) => sum + (payment.amount || 0), 
        0
      ) || 0

      setStats({
        totalUsers: usersData.count || 0,
        totalSpots: spotsData.count || 0,
        totalShops: shopsData.count || 0,
        revenue: totalRevenue,
        activeAds: 3 // Hardcoded şimdilik
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

      {/* İstatistik Kartları */}
      <DashboardStats stats={stats} loading={loading} />

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
// lib/types/admin.ts
export interface AdUnit {
  id: string
  name: string
  type: 'display' | 'in-article' | 'in-feed' | 'video'
  size: string
  position: string
  status: 'active' | 'paused' | 'pending'
  revenue: number
  impressions: number
  clicks: number
  ctr: number
  created_at: string
}

export interface AdSenseConfig {
  clientId: string
  isActive: boolean
  autoAds: boolean
  adUnits: AdUnit[]
  lastSync: string
}

export interface AdminStats {
  totalUsers: number
  totalSpots: number
  totalShops: number
  activeUsers: number
  revenue: number
  adRevenue: number
  conversionRate: number
}
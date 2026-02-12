// components/admin/RecentSpots.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Spot {
  id: string
  title: string
  user_id: string
  status: string
  created_at: string
  user?: {
    id: string
    name: string
  }
}

interface UserProfile {
  id: string
  name: string
}

export default function RecentSpots() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentSpots()
  }, [])

  const fetchRecentSpots = async () => {
    try {
      const { data } = await supabase
        .from('spots')
        .select('id, title, user_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      // Kullanıcı isimlerini getir
      if (data) {
        const userIds = data.map((spot: Spot) => spot.user_id)
        const { data: users } = await supabase
          .from('user_profiles')
          .select('id, name')
          .in('id', userIds)

        const spotsWithUsers = data.map((spot: Spot) => ({
          ...spot,
          user: (users as UserProfile[] | null)?.find((u: UserProfile) => u.id === spot.user_id)
        }))

        setSpots(spotsWithUsers)
      }
    } catch (error) {
      console.error('Spotlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'found': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Son Spot'lar</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i: number) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Son Spot'lar</h3>
        <Link
          href="/admin/spots"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Tümünü Gör →
        </Link>
      </div>

      <div className="space-y-4">
        {spots.map((spot: Spot) => (
          <div key={spot.id} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link
                  href={`/spots/${spot.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {spot.title.length > 50 ? spot.title.substring(0, 50) + '...' : spot.title}
                </Link>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-600">
                    {spot.user?.name || 'Anonim'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(spot.status)}`}>
                {spot.status === 'active' ? 'Aktif' : 
                 spot.status === 'found' ? 'Bulundu' : spot.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {spots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz spot oluşturulmamış
        </div>
      )}
    </div>
  )
}
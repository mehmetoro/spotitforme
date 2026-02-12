// components/social/SuggestedUsers.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SuggestedUsers() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuggestedUsers()
  }, [])

  const fetchSuggestedUsers = async () => {
    try {
      // En aktif 5 kullanıcı
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false })

      setUsers(data || [])
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId: string) => {
    // Takip etme işlemi
    console.log('Takip ediliyor:', userId)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-gray-900 mb-4">👥 Önerilen Kullanıcılar</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">👥 Önerilen Kullanıcılar</h3>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.name?.[0] || 'K'}
              </div>
              <div>
                <div className="font-medium">{user.name}</div>
                {user.bio && (
                  <div className="text-xs text-gray-500 truncate max-w-[120px]">
                    {user.bio}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => handleFollow(user.id)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
            >
              Takip Et
            </button>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          Henüz önerilecek kullanıcı yok
        </p>
      )}
    </div>
  )
}
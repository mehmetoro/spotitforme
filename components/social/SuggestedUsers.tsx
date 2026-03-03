// components/social/SuggestedUsers.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SuggestedUsers() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetchSuggestedUsers()
  }, [])

  const fetchSuggestedUsers = async () => {
    try {
      // Mevcut kullanıcıyı al
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUsers([])
        return
      }
      const currentId = user.id

      // En fazla 10 kullanıcı getir
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .limit(10)
        .order('created_at', { ascending: false })

      if (profileError) {
        console.warn('Profil yüklemede hata:', profileError)
      }

      // Mevcut kullanıcıdan başka - sadece gerçek kullanıcılar
      let list: any[] = (data || [])
        .filter(u => u.id !== currentId)
        .slice(0, 4) // Max 4 önerilmiş

      // hangi kullanıcıları takip ettiğimizi öğren
      let followingSet = new Set<string>()
      try {
        const { data: follows, error: followErr } = await supabase
          .from('social_follows')
          .select('following_id')
          .eq('follower_id', currentId)
          .in('following_id', list.map(u => u.id))

        if (followErr) {
          console.warn('Takip bilgileri yüklenemedi:', followErr)
        } else {
          followingSet = new Set<string>((follows || []).map((f: any) => f.following_id))
        }
      } catch (e) {
        console.warn('Takip sorgusu başarısız:', e)
      }

      const enriched = list.map(u => ({
        ...u,
        isFollowing: followingSet.has(u.id)
      }))

      setUsers(enriched)
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error)
    }
  }

  const handleFollow = async (userId: string, currentlyFollowing: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (currentlyFollowing) {
        await supabase
          .from('social_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId)
      } else {
        await supabase
          .from('social_follows')
          .insert({ follower_id: user.id, following_id: userId })
      }

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isFollowing: !currentlyFollowing } : u
        )
      )

      router.refresh()
    } catch (error) {
      console.error('Takip işlemi başarısız:', error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">👥 Önerilen Kullanıcılar</h3>
      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-4 text-sm">Henüz önerilmiş kullanıcı yok</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:opacity-70 transition"
                onClick={() => router.push(`/profile/${user.id}`)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user.full_name?.[0] || 'K'}
                </div>
                <div>
                  <div className="font-medium">{user.full_name || 'Kullanıcı'}</div>
                </div>
              </div>
              
              <button
                onClick={() => handleFollow(user.id, user.isFollowing)}
                className={`px-3 py-1 text-sm rounded-lg transition ${
                  user.isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {user.isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
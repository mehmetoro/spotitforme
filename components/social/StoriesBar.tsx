// components/social/StoriesBar.tsx - TAKIP ETTİKLERİNDEN STORIES
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Story {
  id: string
  full_name: string
  avatar_url: string | null
  hasNew: boolean
}

export default function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFollowingStories()
  }, [])

  const fetchFollowingStories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Takip ettiği kişileri al
      const { data: follows } = await supabase
        .from('social_follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .limit(10)

      if (!follows || follows.length === 0) {
        setStories([])
        return
      }

      const followingIds = follows.map((f: any) => f.following_id)

      // Takip edilen kişilerin profil bilgilerini al
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .in('id', followingIds)

      const storiesData = (profiles || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name || 'Kullanıcı',
        avatar_url: p.avatar_url,
        hasNew: Math.random() > 0.5 // Demo için rastgele
      }))

      setStories(storiesData)
    } catch (error) {
      console.error('Stories yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {/* Kendi story */}
        <button className="flex-shrink-0 text-center">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center text-2xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
            +
          </div>
          <div className="text-xs mt-2">Sen</div>
        </button>

        {/* Takip edilen kişilerin stories */}
        {!loading && stories.length === 0 && (
          <div className="text-gray-500 text-sm p-4">
            Henüz birini takip etmiyorsun
          </div>
        )}

        {stories.map((story) => (
          <Link key={story.id} href={`/profile/${story.id}`}>
            <button className="flex-shrink-0 text-center hover:opacity-80 transition">
              <div className={`w-20 h-20 rounded-full ${story.hasNew ? 'border-4 border-green-500' : 'border-2 border-gray-300'} overflow-hidden`}>
                {story.avatar_url ? (
                  <img 
                    src={story.avatar_url} 
                    alt={story.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {story.full_name[0]}
                  </div>
                )}
              </div>
              <div className="text-xs mt-2 truncate w-20">{story.full_name}</div>
            </button>
          </Link>
        ))}
      </div>
    </div>
  )
}
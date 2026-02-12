// components/social/TrendingHashtags.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function TrendingHashtags() {
  const router = useRouter()
  const [hashtags, setHashtags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingHashtags()
  }, [])

  const fetchTrendingHashtags = async () => {
    try {
      // Bu haftanın popüler hashtag'leri
      const { data } = await supabase
        .from('social_hashtags')
        .select('*')
        .order('post_count', { ascending: false })
        .limit(8)

      setHashtags(data || [])
    } catch (error) {
      console.error('Hashtag yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-gray-900 mb-4">🔥 Popüler Hashtag'ler</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">🔥 Popüler Hashtag'ler</h3>
      <div className="space-y-3">
        {hashtags.map((hashtag, index) => (
          <button
            key={hashtag.name}
            onClick={() => router.push(`/discovery/tags/${hashtag.name.replace('#', '')}`)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <span className="text-lg mr-3">{index < 3 ? '🔥' : '#'}</span>
              <div>
                <div className="font-medium text-left">{hashtag.name}</div>
                <div className="text-xs text-gray-500 text-left">
                  {hashtag.post_count} paylaşım
                </div>
              </div>
            </div>
            <div className="text-blue-600 text-sm">→</div>
          </button>
        ))}
      </div>
      
      {hashtags.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          Henüz popüler hashtag yok
        </p>
      )}
    </div>
  )
}
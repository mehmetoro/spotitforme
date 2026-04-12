// app/admin/social/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface SocialPost {
  id: string
  user_id: string
  content: string
  created_at: string
  likes_count: number
  comments_count: number
  is_reported: boolean
  user_profiles?: {
    name: string
    email: string
  }
}

export default function AdminSocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    reportedPosts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'reported'>('all')

  useEffect(() => {
    fetchSocialData()
  }, [filter])

  const fetchSocialData = async () => {
    try {
      setLoading(true)

      // İstatistikler
      const [postsCount, likesCount, commentsCount] = await Promise.all([
        supabase.from('social_posts').select('count', { count: 'exact', head: true }),
        supabase.from('social_likes').select('count', { count: 'exact', head: true }),
        supabase.from('social_comments').select('count', { count: 'exact', head: true }),
      ])

      setStats({
        totalPosts: postsCount.count || 0,
        totalLikes: likesCount.count || 0,
        totalComments: commentsCount.count || 0,
        reportedPosts: 0,
      })

      // Postlar
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          user_profiles (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      const { data } = await query
      setPosts(data || [])

    } catch (error) {
      console.error('Sosyal içerik yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch('/api/admin/delete-record', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_name: 'social_posts', id: postId }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result?.error || 'Gönderi silinemedi')

      alert('Gönderi silindi')
      fetchSocialData()
    } catch (error) {
      console.error('Gönderi silinemedi:', error)
      alert('Bir hata oluştu')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sosyal İçerik Yönetimi</h1>
        <p className="text-gray-600">Kullanıcı paylaşımlarını ve etkileşimlerini yönetin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Gönderi</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPosts}</p>
            </div>
            <div className="text-4xl">📱</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Beğeni</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.totalLikes}</p>
            </div>
            <div className="text-4xl">❤️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Yorum</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalComments}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Raporlananlar</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.reportedPosts}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Gönderi Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Tüm Gönderiler
            </button>
            <button
              onClick={() => setFilter('reported')}
              className={`px-4 py-2 rounded-lg ${filter === 'reported' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
            >
              Raporlananlar
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">Yükleniyor...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Gönderi bulunamadı</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {post.user_profiles?.name || post.user_profiles?.email || 'Anonim'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>❤️ {post.likes_count || 0} beğeni</span>
                      <span>💬 {post.comments_count || 0} yorum</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

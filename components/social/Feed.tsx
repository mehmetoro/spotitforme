// components/social/Feed.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import FeedPost from './FeedPost'
import FeedFilters, { FilterType } from './FeedFilters'
import CreatePostButton from './CreatePostButton'
import StoriesBar from './StoriesBar'
import { useInView } from 'react-intersection-observer'

interface FeedProps {
  initialUserId?: string
  type?: FilterType
}

// FOLLOWING İÇİN TİP TANIMI
interface FollowingData {
  following_id: string
}

export default function Feed({ initialUserId, type = 'for-you' }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [activeFilter, setActiveFilter] = useState<FilterType>(type)
  
  const { ref, inView } = useInView()
  const PAGE_SIZE = 10

  const fetchPosts = useCallback(async (pageNum: number, refresh = false) => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          user:user_profiles(*),
          shop:shops(*),
          likes:social_likes(count),
          comments:social_comments(count),
          saves:social_saves(count)
        `)
        .eq('status', 'active')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      // Filtreler
      switch (activeFilter) {
        case 'following':
          if (initialUserId) {
            const { data: following } = await supabase
              .from('social_follows')
              .select('following_id')
              .eq('follower_id', initialUserId)

            if (following && following.length > 0) {
              // DÜZELTME: 'f' parametresine tip ekle
              const followingIds = following.map((f: FollowingData) => f.following_id)
              query = query.in('user_id', followingIds)
            } else {
              setPosts([])
              setHasMore(false)
              return
            }
          }
          break
        
        case 'popular':
          query = query.order('like_count', { ascending: false })
          break
        
        case 'category':
          // Kategori filtresi
          break
      }

      // Sayfalama
      const from = pageNum * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      
      query = query.range(from, to)

      const { data, error } = await query

      if (error) throw error

      if (data) {
        if (refresh) {
          setPosts(data)
        } else {
          setPosts(prev => [...prev, ...data])
        }
        
        setHasMore(data.length === PAGE_SIZE)
      }
    } catch (error) {
      console.error('Feed yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }, [activeFilter, initialUserId])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage)
    }
  }, [inView, hasMore, loading, fetchPosts, page])

  // Filtre değişince yenile
  useEffect(() => {
    setPage(0)
    setPosts([])
    fetchPosts(0, true)
  }, [activeFilter, fetchPosts])

  // İlk yükleme
  useEffect(() => {
    fetchPosts(0, true)
  }, [])

  const handleLike = async (postId: string, liked: boolean): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (liked) {
        await supabase
          .from('social_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('social_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        // Bildirim gönder
        const post = posts.find(p => p.id === postId)
        if (post && post.user_id !== user.id) {
          await supabase.from('social_notifications').insert({
            user_id: post.user_id,
            type: 'like',
            actor_id: user.id,
            post_id: postId,
            message: 'paylaşımını beğendi'
          })
        }
      }

      // UI güncelle
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            like_count: liked ? post.like_count - 1 : post.like_count + 1,
            is_liked: !liked
          }
        }
        return post
      }))

    } catch (error) {
      console.error('Like hatası:', error)
    }
  }

  const handleSave = async (postId: string, saved: boolean): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (saved) {
        await supabase
          .from('social_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('social_saves')
          .insert({
            post_id: postId,
            user_id: user.id
          })
      }

      // UI güncelle
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            save_count: saved ? post.save_count - 1 : post.save_count + 1,
            is_saved: !saved
          }
        }
        return post
      }))

    } catch (error) {
      console.error('Save hatası:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stories Bar */}
      <StoriesBar />

      {/* Create Post Button */}
      <CreatePostButton />

      {/* Filters */}
      <FeedFilters 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Feed Posts */}
      <div className="space-y-6 mt-6">
        {posts.map((post) => (
          <FeedPost
            key={post.id}
            post={post}
            onLike={handleLike}
            onSave={handleSave}
            onComment={() => console.log('comment')}
            onShare={() => console.log('share')}
          />
        ))}
      </div>

      {/* Loading & Infinite Scroll */}
      {loading && (
        <div className="mt-8 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
              </div>
              <div className="mt-4 h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && !loading && (
        <div ref={ref} className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* No Posts */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz paylaşım yok</h3>
          <p className="text-gray-600 mb-6">
            {activeFilter === 'following' 
              ? 'Takip ettiğin kişiler henüz paylaşım yapmamış'
              : 'İlk paylaşımı sen yap!'}
          </p>
          <CreatePostButton variant="primary" />
        </div>
      )}
    </div>
  )
}
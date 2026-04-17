// components/social/Feed.tsx - GÜNCELLENMİŞ VE HATA AYIKLAMALI VERSİYON
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import FeedPost from './FeedPost'
import { buildSocialPath } from '@/lib/sighting-slug'
import FeedFilters, { FilterType } from './FeedFilters'
import CreatePostButton from './CreatePostButton'
import CreatePostModal from './CreatePostModal'
import SearchBar from './SearchBar'
import StoriesBar from './StoriesBar'
import { useInView } from 'react-intersection-observer'
import { getCategoryMatchValues } from '@/lib/social-categories'

export type PopularWindow = '24h' | '3d' | '7d' | '30d' | 'all'
export type PopularSort = 'engagement' | 'likes' | 'comments' | 'saves' | 'recent'

interface FeedProps {
  initialUserId?: string
  type?: FilterType
  category?: string // Kategori filtresi için
  city?: string // Şehir filtresi için
  initialSearch?: string // Arama sorgusu için
  popularWindow?: PopularWindow
  popularSort?: PopularSort
}

export default function Feed({ initialUserId, type, category, city, initialSearch, popularWindow = '7d', popularSort = 'engagement' }: FeedProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [activeFilter, setActiveFilter] = useState<FilterType>(type || 'for-you')
  const [error, setError] = useState<string | null>(null)
  const [foundSpot, setFoundSpot] = useState<any | null>(null)
  const [showFoundModal, setShowFoundModal] = useState(false)
  const [hasIsPublicColumn, setHasIsPublicColumn] = useState<boolean | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearch || '')

  const { ref, inView } = useInView()
  const PAGE_SIZE = 10

  const fetchPosts = useCallback(async (pageNum: number, refresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Aynı request içinde auth kilit yarışlarını önlemek için user'ı bir kez al
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser()
      const currentUserId = currentUser?.id || null
      
      // ÖNCE: Ana postları getir (ilişkisiz)
      let query = supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false })

      // Eğer bir kullanıcı profili sayfasında kullanılıyorsa, sadece onun postlarını al
      if (initialUserId) {
        query = query.eq('user_id', initialUserId)
      }

      // STATUS ve IS_PUBLIC kontrolü
      // - is_public alanı olmayan eski tablolar için hata vermesin
      // - gizli ben gördüm paylaşımları yalnızca sahibi görsün
      if (hasIsPublicColumn) {
        try {
          if (currentUserId) {
            // izin verilenleri OR ile belirt
            query = query.or(
              `is_public.eq.true,user_id.eq.${currentUserId}`
            )
          } else {
            query = query.eq('is_public', true)
          }
        } catch (e) {
          // is_public yoksa supabase hata fırlatabilir, göz ardı et
          console.warn('is_public filtresi uygulanamadı:', e)
        }
      }

      // hasIsPublicColumn === null -> henüz bilmiyoruz, filtre uygulama

      // Filtreler
      switch (activeFilter) {
        case 'following':
          // profil sayfasında initialUserId, discovery'de giriş yapan kullanıcı kullanılır
          {
            const followerId = initialUserId || currentUserId

            if (!followerId) {
              setPosts([])
              setHasMore(false)
              return
            }

            const { data: following, error: followErr } = await supabase
              .from('social_follows')
              .select('following_id')
              .eq('follower_id', followerId)

            if (followErr) {
              console.error('Takip edilenler alınamadı:', followErr)
              setPosts([])
              setHasMore(false)
              return
            }

            if (following && following.length > 0) {
              const ids = following.map((f: any) => f.following_id)
              query = query.in('user_id', ids)
            } else {
              // takip ettiği kimse yoksa boş feed
              setPosts([])
              setHasMore(false)
              return
            }
          }
          break

        case 'popular':
          // En güncel havuzdan çekip etkileşim skoruna göre aşağıda sıralıyoruz.
          if (popularWindow !== 'all') {
            const start = new Date()
            if (popularWindow === '24h') {
              start.setHours(start.getHours() - 24)
            } else if (popularWindow === '3d') {
              start.setDate(start.getDate() - 3)
            } else if (popularWindow === '7d') {
              start.setDate(start.getDate() - 7)
            } else {
              start.setDate(start.getDate() - 30)
            }
            query = query.gte('created_at', start.toISOString())
          }
          query = query.order('created_at', { ascending: false })
          break

        default:
          // 'for-you' veya 'category' - varsayılan sıralama
          break
      }


      // Kategori filtresi varsa uygula
      if (category && category !== 'all') {
        const categoryValues = getCategoryMatchValues(category)
        const categoryConditions = categoryValues
          .map((value) => `category.ilike.${value.replace(/,/g, '\\,')}`)
          .join(',')

        if (categoryConditions) {
          query = query.or(categoryConditions)
        } else {
          query = query.eq('category', category)
        }
      }

      // Şehir filtresi varsa uygula (artık normalize edilerek kaydediliyor, doğrudan eşleşme yeterli)
      if (city && city !== 'all') {
        query = query.eq('city', city);
      }

      // Sayfalama
      const from = pageNum * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      
      query = query.range(from, to)

      console.log('Sorgu çalıştırılıyor...')
      const { data, error } = await query

      if (error) {
        console.error('Sorgu hatası:', error)
        throw error
      }

      console.log(`Gelen post sayısı:`, data?.length || 0)
      if (data && data.length > 0) {
        console.log('İlk post:', data[0])
      }

      if (data) {
        // SONRA: Her post için kullanıcı bilgilerini ayrı ayrı getir
        const postsWithUsers = await Promise.all(
          data.map(async (post) => {
            // Kullanıcı profilini getir
            const { data: userData, error: userError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', post.user_id)
              .maybeSingle()

            if (userError) {
              console.error('Kullanıcı bilgisi alınamadı:', userError)
            }

            // Beğeni sayısını getir
            const { count: likesCount, error: likesError } = await supabase
              .from('social_likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)

            if (likesError) {
              console.error('Beğeni sayısı alınamadı:', likesError)
            }

            // Yorum sayısını getir
            const { count: commentsCount, error: commentsError } = await supabase
              .from('social_comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)

            if (commentsError) {
              console.error('Yorum sayısı alınamadı:', commentsError)
            }

            // Kaydetme sayısını getir (tablo yoksa sorun değil)
            let saveCount = 0
            try {
              const { count: savesCount, error: savesError } = await supabase
                .from('social_saves')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', post.id)
              if (savesError) {
                console.error('Save sayısı alınamadı:', savesError)
              } else {
                saveCount = savesCount || 0
              }
            } catch (_e) {
              // tablo yoksa atla
            }

            // beğeni / kaydetme durumu için ön tanım
            let isLiked = false
            let isSaved = false

            if (currentUserId) {
              const { data: likeData } = await supabase
                .from('social_likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', currentUserId)
                .maybeSingle()
              
              isLiked = !!likeData

              try {
                const { data: saveData } = await supabase
                  .from('social_saves')
                  .select('id')
                  .eq('post_id', post.id)
                  .eq('user_id', currentUserId)
                  .maybeSingle()
                isSaved = !!saveData
              } catch (e) {
                // tablonun olmaması durumunda hata alınabilir, görmezden gel
                console.warn('save sorgusu başarısız:', e)
                isSaved = false
              }
            }

            return {
              ...post,
              user: userData || {
                id: post.user_id,
                full_name: 'Bilinmeyen Kullanıcı',
                username: 'kullanici',
                avatar_url: null
              },
              like_count: likesCount || 0,
              comment_count: commentsCount || 0,
              save_count: saveCount || 0,
              is_liked: isLiked,
              is_saved: isSaved
            }
          })
        )

        const normalizedPosts =
          activeFilter === 'popular'
            ? [...postsWithUsers].sort((a, b) => {
                const scoreByMode = (post: any) => {
                  switch (popularSort) {
                    case 'likes':
                      return post.like_count || 0
                    case 'comments':
                      return post.comment_count || 0
                    case 'saves':
                      return post.save_count || 0
                    case 'recent':
                      return new Date(post.created_at).getTime()
                    default:
                      return (post.like_count || 0) * 2 + (post.comment_count || 0) * 1.5 + (post.save_count || 0)
                  }
                }

                const aScore = scoreByMode(a)
                const bScore = scoreByMode(b)

                if (bScore !== aScore) {
                  return bScore - aScore
                }

                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              })
            : postsWithUsers

        if (refresh) {
          setPosts(normalizedPosts)
        } else {
          setPosts(prev => [...prev, ...normalizedPosts])
        }
        
        setHasMore(data.length === PAGE_SIZE)
      } else {
        setHasMore(false)
      }
    } catch (error: any) {
      console.error('Feed yüklenemedi:', error)
      if (error?.name === 'AbortError') {
        // Hızlı filtre değişimlerinde iptal edilen request'ler için kullanıcıya hata gösterme
        return
      }
      setError(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
    // Şehir filtresi uygula kodu kaldırıldı, bu filtre fetchPosts fonksiyonu içinde zaten uygulanıyor
  }, [activeFilter, initialUserId, category, city, popularWindow, popularSort])

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
    setHasMore(true)
    fetchPosts(0, true)
  }, [activeFilter, category, city, fetchPosts])

  // Parent filtre gönderiyorsa senkron tut
  useEffect(() => {
    if (type && type !== activeFilter) {
      setActiveFilter(type)
    }
  }, [type, activeFilter])

  // URL'den gelen arama sorgusunu uygula
  useEffect(() => {
    if (initialSearch && initialSearch !== searchQuery) {
      setSearchQuery(initialSearch)
    }
  }, [initialSearch])

  // İlk yükleme - also check column existence once before fetching
  useEffect(() => {
    const init = async () => {
      try {
        await supabase.from('social_posts').select('is_public').limit(1)
        setHasIsPublicColumn(true)
      } catch (e: any) {
        console.warn('is_public kolonu yok veya erişilemez:', e.message || e)
        setHasIsPublicColumn(false)
      }
      fetchPosts(0, true)
    }

    init()
  }, [])

  const handleLike = async (postId: string, liked: boolean): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Beğenmek için giriş yapmalısınız')
        return
      }

      if (liked) {
        // Beğeniyi kaldır
        await supabase
          .from('social_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        // Beğen
        await supabase
          .from('social_likes')
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
      if (!user) {
        alert('Kaydetmek için giriş yapmalısınız')
        return
      }

      if (saved) {
        // kaydı kaldır
        await supabase
          .from('social_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        // kaydet
        await supabase
          .from('social_saves')
          .insert({ post_id: postId, user_id: user.id })
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Bir hata oluştu</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => fetchPosts(0, true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto w-full min-w-0">
      {/* Stories Bar */}
      <StoriesBar />

      {/* Create Post Button */}
      <CreatePostButton />

      {/* Search & Filter Bar */}
      {!initialUserId && (
        <SearchBar
          onSearch={setSearchQuery}
          initialValue={searchQuery}
        />
      )}

      {/* Filters */}
      {!type && (
        <FeedFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      {/* Feed Posts */}
      <div className="space-y-6 mt-6 min-w-0">
        {posts
          .filter((post) => {
            // Arama filtresi
            if (searchQuery) {
              const query = searchQuery.toLowerCase()
              
              // Hashtag araması (#ile başlıyorsa)
              if (query.startsWith('#')) {
                const hashtag = query.substring(1)
                const postHashtags = (post.hashtags || []).map((h: string) => 
                  h.replace('#', '').toLowerCase()
                )
                return postHashtags.some((h: string) => h.includes(hashtag))
              }
              
              // Normal arama (başlık ve içerik)
              const title = (post.title || '').toLowerCase()
              const content = (post.content || '').toLowerCase()
              if (!title.includes(query) && !content.includes(query)) {
                return false
              }
            }

            return true
          })
          .map((post) => (
            <div
              key={post.id}
              className="block"
              role="link"
              tabIndex={0}
              onClick={() => router.push(buildSocialPath(post.id, post.title || post.content || post.description || post.location))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  router.push(buildSocialPath(post.id, post.title || post.content || post.description || post.location))
                }
              }}
            >
              <FeedPost
                post={post}
                onLike={handleLike}
                onSave={handleSave}
                onComment={() => console.log('comment')}
                onShare={() => console.log('share')}
                onFound={(p) => {
                  setFoundSpot(p)
                  setShowFoundModal(true)
              }}
            />
          </div>
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
      {hasMore && !loading && posts.length > 0 && (
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

      {/* Found modal */}
      <CreatePostModal
        isOpen={showFoundModal}
        onClose={() => setShowFoundModal(false)}
        onPostCreated={() => {
          setShowFoundModal(false)
          // optionally refresh feed
          fetchPosts(0, true)
        }}
        initialType="found"
        parentSpotId={foundSpot?.id}
      />
    </div>
  )
}
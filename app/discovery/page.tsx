// app/discovery/page.tsx - SEKMELÜ VERSİYON
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Feed from '@/components/social/Feed'
import CreatePostModal from '@/components/social/CreatePostModal'
import FeedFilters, { FilterType } from '@/components/social/FeedFilters'
import CategoryGrid from '@/components/social/CategoryGrid'
import { supabase } from '@/lib/supabase'
import SuggestedUsers from '@/components/social/SuggestedUsers'

const ISTANBUL_TIMEZONE = 'Europe/Istanbul'

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(date)

  const map: Record<string, string> = {}
  parts.forEach(({ type, value }) => {
    map[type] = value
  })

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  )

  return asUtc - date.getTime()
}

function getStartOfTodayInTimezoneISO(timeZone: string): string {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now)

  const map: Record<string, string> = {}
  parts.forEach(({ type, value }) => {
    map[type] = value
  })

  const utcMidnightGuess = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    0,
    0,
    0
  )
  const offset = getTimeZoneOffsetMs(new Date(utcMidnightGuess), timeZone)

  return new Date(utcMidnightGuess - offset).toISOString()
}

// Takip Ettiklerim - Takip ettiğin kullanıcılar
function FollowingList() {
  const [following, setFollowing] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Kullanıcının takip ettiği kişileri al
        const { data: follows } = await supabase
          .from('social_follows')
          .select('following_id')
          .eq('follower_id', user.id)

        if (!follows || follows.length === 0) {
          setFollowing([])
          return
        }

        const followingIds = follows.map((f: any) => f.following_id)

        // Takip edilen kullanıcıların profil bilgilerini al
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .in('id', followingIds)

        setFollowing(profiles || [])
      } catch (error) {
        console.error('Takip ettiklerim yüklenemedi:', error)
      }
    }

    fetchFollowing()
  }, [])

  const handleUnfollow = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('social_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId)

      setFollowing(following.filter(f => f.id !== userId))
      router.refresh()
    } catch (error) {
      console.error('Takipten çıkılırken hata:', error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">👥 Takip Ettiklerim</h3>
      {following.length === 0 ? (
        <p className="text-gray-500 text-center py-4 text-sm">Henüz kimseyi takip etmiyorsun</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {following.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user.full_name?.[0] || 'K'
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{user.full_name || 'Kullanıcı'}</div>
                </div>
              </div>
              <button
                onClick={() => handleUnfollow(user.id)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition whitespace-nowrap ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// TrendingHashtags - Gerçek verilerle çalışır
function TrendingHashtags() {
  const router = useRouter()
  const [hashtags, setHashtags] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      try {
        setLoading(true)
        
        // Tüm postlardan hashtag'leri al
        const { data: posts, error } = await supabase
          .from('social_posts')
          .select('hashtags')
          .not('hashtags', 'is', null)
        
        if (error) throw error
        
        // Hashtag'leri say
        const hashtagCounts: { [key: string]: number } = {}
        
        posts?.forEach((post: any) => {
          if (post.hashtags && Array.isArray(post.hashtags)) {
            post.hashtags.forEach((tag: string) => {
              // # işareti olmadan normalize et
              const normalizedTag = tag.replace('#', '').toLowerCase()
              if (normalizedTag) {
                hashtagCounts[normalizedTag] = (hashtagCounts[normalizedTag] || 0) + 1
              }
            })
          }
        })
        
        // En popüler 6 hashtag'i sırala
        const sortedHashtags = Object.entries(hashtagCounts)
          .map(([name, count]) => ({ name: `#${name}`, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
        
        setHashtags(sortedHashtags)
      } catch (error) {
        console.error('Hashtag\'ler yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingHashtags()
  }, [])

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">🔥 Popüler Hashtag'ler</h3>
      <div className="space-y-2">
        {loading ? (
          // Yükleniyor skeleton
          [...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse flex justify-between p-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))
        ) : hashtags.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Henüz hashtag yok. İlk paylaşımı yapan sen ol! 🚀
          </p>
        ) : (
          hashtags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => router.push(`/discovery?search=${encodeURIComponent(tag.name)}`)}
              className="w-full flex justify-between items-center p-2 hover:bg-gray-50 rounded transition"
            >
              <span className="text-blue-600 font-medium">{tag.name}</span>
              <span className="text-sm text-gray-500">{tag.count} paylaşım</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}


export default function DiscoveryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchFromUrl = searchParams.get('search') || ''
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('for-you')
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  })
  const [todayStats, setTodayStats] = useState({
    newPosts: 0,
    newLikes: 0,
    newUsers: 0,
    foundItems: 0
  })
  const [userProfile, setUserProfile] = useState<{ name: string | null; avatar_url: string | null } | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingTodayStats, setLoadingTodayStats] = useState(true)

  // Kullanıcı istatistiklerini yükle
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoadingStats(false)
          return
        }

        const [
          postsResult,
          followersResult,
          followingResult,
          profileResult
        ] = await Promise.all([
          supabase
            .from('social_posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('social_follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', user.id),
          supabase
            .from('social_follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', user.id),
          supabase
            .from('user_profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single()
        ])

        const { count: postsCount, error: postsError } = postsResult
        const { count: followersCount, error: followersError } = followersResult
        const { count: followingCount, error: followingError } = followingResult
        const { data: profile, error: profileError } = profileResult as any

        if (postsError) {
          console.warn('Paylaşım sayısı yüklemede hata:', postsError)
        }
        if (followersError) {
          console.warn('Takipçi sayısı yüklemede hata:', followersError)
        }
        if (followingError) {
          console.warn('Takip sayısı yüklemede hata:', followingError)
        }

        if (profileError) {
          console.warn('Profil yüklemede hata:', profileError)
        }

        setUserStats({
          postsCount: postsCount || 0,
          followersCount: followersCount || 0,
          followingCount: followingCount || 0
        })
        setUserProfile({ name: profile?.full_name || null, avatar_url: profile?.avatar_url || null })
      } catch (error) {
        console.error('İstatistikler yüklenemedi:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchUserStats()
  }, [])

  // Bugünün istatistiklerini yükle
  useEffect(() => {
    const fetchTodayStats = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoadingTodayStats(true)
        }

        const startIso = getStartOfTodayInTimezoneISO(ISTANBUL_TIMEZONE)
        const nowIso = new Date().toISOString()

        const [postsResult, usersResult, foundResult] = await Promise.all([
          supabase
            .from('social_posts')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startIso)
            .lt('created_at', nowIso),
          supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startIso)
            .lt('created_at', nowIso),
          supabase
            .from('social_posts')
            .select('*', { count: 'exact', head: true })
            .eq('post_type', 'found')
            .gte('created_at', startIso)
            .lt('created_at', nowIso)
        ])

        const { count: newPosts, error: postsError } = postsResult
        const { count: newUsers, error: usersError } = usersResult
        const { count: foundItems, error: foundError } = foundResult

        if (postsError) {
          console.warn('Günlük paylaşım istatistiği alınamadı:', postsError)
        }
        if (usersError) {
          console.warn('Günlük kullanıcı istatistiği alınamadı:', usersError)
        }
        if (foundError) {
          console.warn('Günlük bulunan ürün istatistiği alınamadı:', foundError)
        }

        // social_likes.created_at yoksa fallback olarak bugünün gönderilerine gelen beğenileri say
        let newLikes = 0
        const likesByDateResult = await supabase
          .from('social_likes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startIso)
          .lt('created_at', nowIso)

        if (!likesByDateResult.error) {
          newLikes = likesByDateResult.count || 0
        } else {
          const { data: todayPosts, error: todayPostsError } = await supabase
            .from('social_posts')
            .select('id')
            .gte('created_at', startIso)
            .lt('created_at', nowIso)

          if (!todayPostsError && todayPosts && todayPosts.length > 0) {
            const postIds = todayPosts.map((post: any) => post.id)
            const likesByPostResult = await supabase
              .from('social_likes')
              .select('*', { count: 'exact', head: true })
              .in('post_id', postIds)

            if (!likesByPostResult.error) {
              newLikes = likesByPostResult.count || 0
            }
          }
        }

        setTodayStats({
          newPosts: newPosts || 0,
          newLikes,
          newUsers: newUsers || 0,
          foundItems: foundItems || 0
        })
      } catch (error) {
        console.error('Bugünün istatistikleri yüklenemedi:', error)
      } finally {
        if (showLoading) {
          setLoadingTodayStats(false)
        }
      }
    }

    fetchTodayStats(true)

    const intervalId = window.setInterval(() => {
      fetchTodayStats(false)
    }, 60000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTodayStats(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Sekmeye göre başlık ve açıklamayı dinamik yap
  const getHeaderContent = () => {
    const headers: { [key in FilterType]: { title: string; desc: string; icon: string } } = {
      'for-you': {
        title: 'Sana Özel',
        desc: 'Senin ilgi alanlarına göre seçilmiş paylaşımları keşfet',
        icon: '🎯'
      },
      'following': {
        title: 'Takip Edilenler',
        desc: 'Takip ettiğin kişilerin en son paylaşımları',
        icon: '👥'
      },
      'popular': {
        title: 'Popüler',
        desc: 'En çok beğenilen ve paylaşılan içerikler',
        icon: '🔥'
      },
      'rare': {
        title: 'Nadir Gördüm',
        desc: 'Topluluğun nadir bulduğu ürün ve yerler',
        icon: '👁️'
      },
      'spots': {
        title: 'Spotlar',
        desc: 'Aradığı ürünü paylaşan spot ilanları',
        icon: '📍'
      },
      'found': {
        title: 'Ben Gördüm',
        desc: 'Bulunmuş ürün ve yer bildirimleri',
        icon: '🔍'
      },
      'products': {
        title: 'Ürünler',
        desc: 'Mağazaların sattığı ürünler',
        icon: '🛍️'
      },
      'category': {
        title: 'Kategoriler',
        desc: 'Kategoriye göre göz at',
        icon: '🏷️'
      }
    }
    return headers[activeFilter] || headers['for-you']
  }

  const header = getHeaderContent()

  const handlePostCreated = () => {
    // Paylaşım yapıldıktan sonra feed'i yenile
    console.log('Yeni paylaşım yapıldı, feed yenileniyor...')
    router.refresh()
    // Modal'ı kapat
    setShowCreateModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />

      <div className="container-custom py-8">
        {/* Üst Başlık - Sekmeye göre dinamik */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {header.icon} {header.title}
          </h1>
          <p className="text-lg text-gray-600">
            {header.desc}
          </p>
        </div>

        {/* Sekme Filtreleri */}
        <div className="mb-8">
          <FeedFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Ana Feed (2/3 genişlik) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hızlı Paylaşım Kartı */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl">
                    {header.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Bir şey mi gördün?</h3>
                    <p className="text-blue-100">Hemen paylaş, puan kazan, topluluğa ilham ver!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl whitespace-nowrap transition transform hover:scale-105"
                >
                  ✨ Paylaşım Yap
                </button>
              </div>
            </div>

            {/* Feed Bileşeni - Aktif filtreye göre */}
            {activeFilter === 'category' ? (
              <CategoryGrid />
            ) : (
              <Feed type={activeFilter} initialSearch={searchFromUrl} />
            )}
          </div>

          {/* Sağ Taraf - Sidebar (1/3 genişlik) */}
          <div className="space-y-6">
            {/* Hızlı Profil Kartı */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt={userProfile.name || 'Profil'} className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.name ? userProfile.name[0] : 'S'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{userProfile?.name || 'Profilin'}</h3>
                  <p className="text-sm text-gray-600">Keşfet, paylaş, puan kazan</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2 text-center py-3 border-y border-gray-100">
                <div>
                  <div className="font-bold text-xl text-gray-900">
                    {loadingStats ? '-' : userStats.postsCount}
                  </div>
                  <div className="text-xs text-gray-500">Paylaşım</div>
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-900">
                    {loadingStats ? '-' : userStats.followersCount}
                  </div>
                  <div className="text-xs text-gray-500">Takipçi</div>
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-900">
                    {loadingStats ? '-' : userStats.followingCount}
                  </div>
                  <div className="text-xs text-gray-500">Takip</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition"
                >
                  Profili Görüntüle
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                >
                  ✨ Hızlı Paylaş
                </button>
              </div>
            </div>

            {/* Popüler Hashtag'ler */}
            <TrendingHashtags />

            {/* Takip Ettiklerim */}
            <FollowingList />

            {/* Önerilen Kullanıcılar */}
            <SuggestedUsers />

            {/* Keşif İpuçları */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h4 className="font-bold text-gray-900 mb-3">💡 Keşif İpuçları</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="mr-3 text-green-600">✅</span>
                  <span className="text-gray-700">
                    <span className="font-medium">Hashtag kullan:</span> Daha çok kişiye ulaş
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-green-600">✅</span>
                  <span className="text-gray-700">
                    <span className="font-medium">Fotoğraf ekle:</span> 2x daha fazla etkileşim
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-green-600">✅</span>
                  <span className="text-gray-700">
                    <span className="font-medium">Konum belirt:</span> Yerel keşifleri artır
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-green-600">✅</span>
                  <span className="text-gray-700">
                    <span className="font-medium">Günlük paylaşım:</span> Her paylaşımda puan kazan
                  </span>
                </li>
              </ul>
            </div>

            {/* İstatistik Banner */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">📊 Bugünün İstatistikleri</h4>
                <span className="text-2xl">📈</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {loadingTodayStats ? '-' : todayStats.newPosts}
                  </div>
                  <div className="text-xs text-gray-600">Yeni Paylaşım</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">
                    {loadingTodayStats ? '-' : todayStats.newLikes}
                  </div>
                  <div className="text-xs text-gray-600">Beğeni</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {loadingTodayStats ? '-' : todayStats.newUsers}
                  </div>
                  <div className="text-xs text-gray-600">Yeni Kullanıcı</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {loadingTodayStats ? '-' : todayStats.foundItems}
                  </div>
                  <div className="text-xs text-gray-600">Bulunan Ürün</div>
                </div>
              </div>
            </div>

            {/* Sekmeye Göre Bilgi Kartı */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start space-x-3">
                <span className="text-3xl">ℹ️</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    {activeFilter === 'for-you' && 'Özel Seçilmiş İçerikler'}
                    {activeFilter === 'following' && 'Takip Ettiklerinin Paylaşımları'}
                    {activeFilter === 'popular' && 'En Popüler İçerikler'}
                    {activeFilter === 'rare' && 'Nadir Buluşlar'}
                    {activeFilter === 'spots' && 'Aradığı Ürünler'}
                    {activeFilter === 'found' && 'Bulunmuş Ürünler'}
                    {activeFilter === 'products' && 'Mağaza Ürünleri'}
                    {activeFilter === 'category' && 'Kategorilere Göz At'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {activeFilter === 'for-you' && 'İlgi alanlarına göre hazırlanmış içerikleri keşfet'}
                    {activeFilter === 'following' && 'Takip ettiğin kişilerin en son paylaşımlarını gör'}
                    {activeFilter === 'popular' && 'Topluluğun en beğendiği içerikleri açılımda bul'}
                    {activeFilter === 'rare' && 'Ender rastlanan ürünler ve yerler hakkında bilgi al'}
                    {activeFilter === 'spots' && 'Aranan ürünlere yardımcı olmak için bul'}
                    {activeFilter === 'found' && 'Bulduğun ürünleri paylaş ve ödüle erişin'}
                    {activeFilter === 'products' && 'Mağazaların satış listesini gözden geçir'}
                    {activeFilter === 'category' && 'Farklı kategorilerdeki içerikleri filtrele'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
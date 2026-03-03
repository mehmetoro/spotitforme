// app/discovery/page.tsx - SEKMELÜ VERSİYON
'use client'

import { useState, useEffect } from 'react'
import Feed from '@/components/social/Feed'
import CreatePostModal from '@/components/social/CreatePostModal'
import FeedFilters, { FilterType } from '@/components/social/FeedFilters'
import CategoryGrid from '@/components/social/CategoryGrid'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SuggestedUsers from '@/components/social/SuggestedUsers'

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

// TrendingHashtags - Gerçek verilerle çalışacak şekilde hazırlandı
function TrendingHashtags() {
  const router = useRouter()
  
  // Örnek hashtag'ler - gerçek veritabanından gelecek
  const hashtags = [
    { name: '#vintage', count: 42 },
    { name: '#kamera', count: 38 },
    { name: '#antika', count: 27 },
    { name: '#koleksiyon', count: 23 },
    { name: '#plak', count: 19 },
    { name: '#saat', count: 15 }
  ]

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">🔥 Popüler Hashtag'ler</h3>
      <div className="space-y-2">
        {hashtags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => router.push(`/discovery/tags/${tag.name.replace('#', '')}`)}
            className="w-full flex justify-between items-center p-2 hover:bg-gray-50 rounded transition"
          >
            <span className="text-blue-600 font-medium">{tag.name}</span>
            <span className="text-sm text-gray-500">{tag.count} paylaşım</span>
          </button>
        ))}
      </div>
    </div>
  )
}


export default function DiscoveryPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('for-you')
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  })
  const [userProfile, setUserProfile] = useState<{ name: string | null; avatar_url: string | null } | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const router = useRouter()

  // Kullanıcı istatistiklerini yükle
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Kullanıcının kendi postlarını say
        const { count: postsCount } = await supabase
          .from('social_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Kullanıcı profilini getir (isim, avatar)
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single() as any

        if (profileError) {
          console.warn('Profil yüklemede hata:', profileError)
        }

        setUserStats({
          postsCount: postsCount || 0,
          followersCount: 0, // TODO: Takipçi sayısını hesapla
          followingCount: 0 // TODO: Takip sayısını hesapla
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
              <Feed type={activeFilter} />
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
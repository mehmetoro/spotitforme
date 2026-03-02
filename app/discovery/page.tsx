// app/discovery/page.tsx - GÜNCELLENMİŞ
'use client'

import { useState } from 'react'
import Feed from '@/components/social/Feed'
import CreatePostModal from '@/components/social/CreatePostModal'
import { useRouter } from 'next/navigation'

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

// SuggestedUsers - Gerçek verilerle çalışacak şekilde hazırlandı
function SuggestedUsers() {
  const router = useRouter()
  
  // Örnek kullanıcılar - gerçek veritabanından gelecek
  const users = [
    { name: 'Ahmet Y.', avatar: null, followers: 234, isFollowing: false },
    { name: 'Zeynep K.', avatar: null, followers: 189, isFollowing: false },
    { name: 'Mehmet T.', avatar: null, followers: 156, isFollowing: true },
    { name: 'Ayşe D.', avatar: null, followers: 142, isFollowing: false }
  ]

  const handleFollow = (userName: string) => {
    console.log(`Takip ediliyor: ${userName}`)
    // Takip işlemi burada yapılacak
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">👥 Önerilen Kullanıcılar</h3>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.name[0]}
              </div>
              <div>
                <span className="font-medium text-gray-900">{user.name}</span>
                <p className="text-xs text-gray-500">{user.followers} takipçi</p>
              </div>
            </div>
            <button
              onClick={() => handleFollow(user.name)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                user.isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {user.isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
            </button>
          </div>
        ))}
        
        <button
          onClick={() => router.push('/discovery/users')}
          className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium pt-3 border-t"
        >
          Tümünü Gör →
        </button>
      </div>
    </div>
  )
}

export default function DiscoveryPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

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
        {/* Üst Başlık */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            👁️ Nadir Gördüm
          </h1>
          <p className="text-lg text-gray-600">
            Topluluğumuzun keşiflerini, koleksiyonlarını ve nadir buluşlarını keşfedin
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Ana Feed (2/3 genişlik) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hızlı Paylaşım Kartı */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl">
                    📸
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Nadir bir şey mi gördün?</h3>
                    <p className="text-blue-100">Hemen paylaş, puan kazan, topluluğa ilham ver!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl whitespace-nowrap transition transform hover:scale-105"
                >
                  📸 Paylaşım Yap
                </button>
              </div>
            </div>

            {/* Feed Bileşeni */}
            <Feed type="for-you" />
          </div>

          {/* Sağ Taraf - Sidebar (1/3 genişlik) */}
          <div className="space-y-6">
            {/* Hızlı Profil Kartı */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Profilin</h3>
                  <p className="text-sm text-gray-600">Keşfet, paylaş, puan kazan</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2 text-center py-3 border-y border-gray-100">
                <div>
                  <div className="font-bold text-xl text-gray-900">0</div>
                  <div className="text-xs text-gray-500">Paylaşım</div>
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-900">0</div>
                  <div className="text-xs text-gray-500">Takipçi</div>
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-900">0</div>
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
                  <div className="text-2xl font-bold text-purple-600">124</div>
                  <div className="text-xs text-gray-600">Yeni Paylaşım</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">1.2k</div>
                  <div className="text-xs text-gray-600">Beğeni</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-xs text-gray-600">Yeni Kullanıcı</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-xs text-gray-600">Bulunan Ürün</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
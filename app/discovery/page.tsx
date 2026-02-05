// app/discovery/page.tsx - DÜZELTİLMİŞ
'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Feed from '@/components/social/Feed'
import CreatePostModal from '@/components/social/CreatePostModal'

// Basit placeholder component'ler
function TrendingHashtags() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">🔥 Popüler Hashtag'ler</h3>
      <div className="space-y-2">
        {['#vintage', '#kamera', '#antika', '#koleksiyon'].map((tag) => (
          <div key={tag} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
            <span className="text-blue-600">{tag}</span>
            <span className="text-sm text-gray-500">42 paylaşım</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SuggestedUsers() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-4">👥 Önerilen Kullanıcılar</h3>
      <div className="space-y-3">
        {['Ahmet Y.', 'Zeynep K.', 'Mehmet T.'].map((user) => (
          <div key={user} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100"></div>
              <span>{user}</span>
            </div>
            <button className="text-blue-600 text-sm">Takip Et</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DiscoveryPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={() => console.log('post created')}
      />

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ana Feed */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Keşfet
              </h1>
              <p className="text-gray-600">
                Topluluğumuzun keşiflerini, koleksiyonlarını ve nadir buluşlarını takip edin
              </p>
            </div>

            {/* CTA Butonu */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Nadir bir şey mi gördün?</h3>
                  <p>Paylaş, topluluğa ilham ver, puan kazan!</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg"
                >
                  📸 Paylaşım Yap
                </button>
              </div>
            </div>

            {/* Feed */}
            <Feed type="for-you" />
          </div>

          {/* Sağ Sidebar */}
          <div className="space-y-6">
            {/* Profil kartı */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                <div>
                  <h3 className="font-bold text-gray-900">Profilin</h3>
                  <p className="text-sm text-gray-600">Keşfet, paylaş, puan kazan</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-bold text-lg">0</div>
                  <div className="text-xs text-gray-600">Paylaşım</div>
                </div>
                <div>
                  <div className="font-bold text-lg">0</div>
                  <div className="text-xs text-gray-600">Takipçi</div>
                </div>
                <div>
                  <div className="font-bold text-lg">0</div>
                  <div className="text-xs text-gray-600">Takip</div>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
              >
                Paylaşım Yap
              </button>
            </div>

            {/* Trending Hashtags */}
            <TrendingHashtags />

            {/* Önerilen Kullanıcılar */}
            <SuggestedUsers />

            {/* Hızlı İpuçları */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h4 className="font-bold text-gray-900 mb-3">💡 Keşif İpuçları</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Hashtag kullan daha çok kişiye ulaş</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Fotoğraflı paylaşımlar 2x daha fazla etkileşim alır</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Günlük paylaşım yaparak puan kazan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
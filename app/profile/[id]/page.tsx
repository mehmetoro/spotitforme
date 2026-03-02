// app/profile/[id]/page.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import UserProfileCard from '@/components/UserProfileCard'
import SimpleTabs from '@/components/SimpleTabs'
import Feed from '@/components/social/Feed'

type TabType = 'sightings' | 'spots' | 'reputation' | 'social'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  created_at: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [sightings, setSightings] = useState<any[]>([])
  const [spots, setSpots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('sightings')
  const [isCurrentUser, setIsCurrentUser] = useState(false)

  // Tab tanımları - tip güvenli
  const tabs: { id: TabType; label: string }[] = [
    { id: 'sightings', label: `👁️ Görülenler (${sightings.length})` },
    { id: 'spots', label: `📍 Spot'lar (${spots.length})` },
    { id: 'reputation', label: '🏆 Puan & Rozetler' },
    { id: 'social', label: '💬 Paylaşımlar' }
  ]

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const fetchUserData = async () => {
    try {
      // Mevcut kullanıcı kontrolü
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setIsCurrentUser(currentUser?.id === userId)

      // Kullanıcı bilgileri
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Sightings
      const { data: sightingsData } = await supabase
        .from('quick_sightings')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Spots
      const { data: spotsData } = await supabase
        .from('spots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setUser(userData)
      setSightings(sightingsData || [])
      setSpots(spotsData || [])
    } catch (error) {
      console.error('Profil yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Tab değiştirme fonksiyonu - tip güvenli
  const handleTabChange = (tabId: string) => {
    // Type assertion ile tip güvenli hale getir
    if (tabId === 'sightings' || tabId === 'spots' || tabId === 'reputation') {
      setActiveTab(tabId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kullanıcı bulunamadı</h1>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Ana sayfaya dön
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* Üst Bilgi */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl font-bold text-blue-600">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  👁️ {sightings.length}
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                {user.bio && <p className="text-blue-100">{user.bio}</p>}
                {user.location && (
                  <p className="text-blue-100 text-sm mt-2">📍 {user.location}</p>
                )}
                <p className="text-blue-100 text-sm mt-2">
                  Üyelik: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
            
            {isCurrentUser && (
              <button
                onClick={() => router.push('/profile/edit')}
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-2 px-6 rounded-lg"
              >
                Profili Düzenle
              </button>
            )}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {sightings.length}
            </div>
            <div className="text-gray-600">Görülen Ürün</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {spots.length}
            </div>
            <div className="text-gray-600">Oluşturulan Spot</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {sightings.filter(s => s.has_photo).length}
            </div>
            <div className="text-gray-600">Fotoğraflı Bildirim</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {sightings.reduce((sum, s) => sum + s.points_earned, 0)}
            </div>
            <div className="text-gray-600">Toplam Puan</div>
          </div>
        </div>

        {/* Tab'ler */}
        <div className="bg-white rounded-xl shadow mb-6">
          <SimpleTabs 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* İçerik */}
        <div className="min-h-[400px]">
          {activeTab === 'sightings' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sightings.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-4xl mb-4">👁️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Henüz görülen ürün yok
                  </h3>
                  <p className="text-gray-600">
                    {isCurrentUser 
                      ? 'İlk "Nadir Gördüm" bildirimini sen yap!'
                      : 'Bu kullanıcı henüz bildirim yapmamış'}
                  </p>
                </div>
              ) : (
                sightings.map((sighting) => (
                  <div
                    key={sighting.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
                  >
                    {sighting.photo_url && (
                      <div className="h-48">
                        <img
                          src={sighting.photo_url}
                          alt={sighting.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <p className="font-medium mb-3 line-clamp-2">
                        {sighting.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <span className="mr-2">📍</span>
                        <span className="truncate">{sighting.location_name}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {new Date(sighting.created_at).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-green-600 font-bold">
                          +{sighting.points_earned} puan
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'spots' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-lg mb-4">📍 Spot'lar</h3>
              {spots.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📍</div>
                  <p className="text-gray-600">
                    Henüz spot oluşturulmamış
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {spots.map((spot) => (
                    <div 
                      key={spot.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/spots/${spot.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{spot.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {spot.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          spot.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {spot.status === 'active' ? 'Aktif' : 'Bulundu'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-3">
                        <span className="mr-4">👁️ {spot.views || 0}</span>
                        <span>🤝 {spot.helps || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reputation' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-lg mb-4">🏆 Puan & Rozetler</h3>
              <UserProfileCard userId={userId} />
            </div>
          )}

          {activeTab === 'social' && (
            <div className="mb-8">
              <Feed initialUserId={userId} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
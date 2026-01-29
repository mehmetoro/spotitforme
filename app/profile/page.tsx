// app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface UserProfile {
  id: string
  email: string
  name: string | null
  created_at: string
}

interface UserSpot {
  id: string
  title: string
  status: string
  created_at: string
  helps: number
  views: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userSpots, setUserSpots] = useState<UserSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'spots' | 'help'>('spots')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/')
      return
    }
    
    fetchUserData(user.id)
  }

  const fetchUserData = async (userId: string) => {
    try {
      // Kullanıcı bilgileri
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Kullanıcının spot'ları
      const { data: spotsData } = await supabase
        .from('spots')
        .select('id, title, status, created_at, helps, views')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setUser({
        id: userId,
        email: userData?.email || '',
        name: userData?.name || 'Kullanıcı',
        created_at: userData?.created_at || new Date().toISOString()
      })
      
      setUserSpots(spotsData || [])
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* Profil Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.name || 'Kullanıcı'}</h1>
                <p className="text-blue-100">{user.email}</p>
                <p className="text-blue-100 text-sm mt-2">
                  Üyelik: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-red-600 hover:bg-red-50 font-medium px-6 py-3 rounded-lg"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {userSpots.length}
            </div>
            <div className="text-gray-600">Oluşturulan Spot</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {userSpots.filter(s => s.status === 'found').length}
            </div>
            <div className="text-gray-600">Bulunan Spot</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {userSpots.reduce((sum, spot) => sum + spot.views, 0)}
            </div>
            <div className="text-gray-600">Toplam Görüntülenme</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {userSpots.reduce((sum, spot) => sum + spot.helps, 0)}
            </div>
            <div className="text-gray-600">Alınan Yardım</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'spots'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Spot'larım
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'help'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yardım Ettiklerim
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'spots' ? (
          <div className="bg-white rounded-xl shadow">
            {userSpots.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Henüz spot oluşturmadınız
                </h3>
                <p className="text-gray-600 mb-6">
                  İlk spot'unuzu oluşturun ve topluluğumuzdan yardım alın
                </p>
                <button
                  onClick={() => router.push('/create-spot')}
                  className="btn-primary"
                >
                  İlk Spot'u Oluşturun
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-6 text-left text-gray-700 font-medium">Başlık</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-medium">Durum</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-medium">Görüntülenme</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-medium">Yardım</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-medium">Tarih</th>
                      <th className="py-4 px-6 text-left text-gray-700 font-medium">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userSpots.map((spot) => (
                      <tr key={spot.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <a
                            href={`/spots/${spot.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {spot.title.length > 50 ? spot.title.substring(0, 50) + '...' : spot.title}
                          </a>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            spot.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {spot.status === 'active' ? 'Aktif' : 'Bulundu'}
                          </span>
                        </td>
                        <td className="py-4 px-6">{spot.views}</td>
                        <td className="py-4 px-6">{spot.helps}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <a
                              href={`/spots/${spot.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Görüntüle
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Yakında Burada Olacak!
            </h3>
            <p className="text-gray-600 mb-6">
              Yardım ettikleriniz listesi yakında eklenecek. Geliştirmelerimiz devam ediyor.
            </p>
            <button
              onClick={() => router.push('/spots')}
              className="btn-primary"
            >
              Spot'lara Göz Atın
            </button>
          </div>
        )}

        {/* Ayarlar */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Ayarlar</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Bildirimler</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-sm">Yeni spot cevapları</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-sm">Spot durum değişiklikleri</span>
                </label>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Gizlilik</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-sm">Profilimi herkese açık göster</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-sm">E-posta adresimi gizle</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
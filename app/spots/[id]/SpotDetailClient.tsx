'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import SightingModal from '@/components/SightingModal'
import SimpleMap from '@/components/SimpleMap'
import SimpleShareButtons from '@/components/SimpleShareButtons'
import { useToast } from '@/hooks/useToast'
import { buildSeoImageAlt } from '@/lib/content-seo'
import { buildSpotPath, extractSightingIdFromParam } from '@/lib/sighting-slug'
import { supabase } from '@/lib/supabase'

interface Spot {
  id: string
  title: string
  description: string
  category: string | null
  location: string | null
  image_url: string | null
  status: string
  created_at: string
  user_id: string
  views: number
  total_helps: number
  user?: {
    full_name: string | null
  }
}

export default function SpotDetailClient() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id
  const spotId = rawId ? extractSightingIdFromParam(rawId) : ''

  const [spot, setSpot] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSightingModal, setShowSightingModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (spotId) {
      fetchSpotDetails()
    }
  }, [spotId])

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
    }

    loadCurrentUser()
  }, [])

  const fetchSpotDetails = async () => {
    try {
      const { data: spotData, error: spotError } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spotId)
        .single()

      if (spotError) {
        console.error('Spot bulunamadi:', spotError)
        return
      }

      const { data: userData } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', spotData.user_id)
        .single()

      await supabase
        .from('spots')
        .update({ views: (spotData.views || 0) + 1 })
        .eq('id', spotId)

      setSpot({
        ...spotData,
        user: userData || { full_name: null },
      })
    } catch (error) {
      console.error('Spot detaylari yuklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Mesaj talebi icin giris yapmaniz gerekir')
        router.push('/auth/login')
        return
      }

      if (!spot?.user_id) {
        toast.error('Spot sahibi bilgisi bulunamadi')
        return
      }

      if (spot.user_id === user.id) {
        toast.error('Kendi spotunuza mesaj talebi gonderemezsiniz.')
        return
      }

      const draft = `Merhaba, \"${spot.title}\" spotunuz icin size yardimci olabilirim. Bu urunu bulmaniza yardim etmek isterim.`
      const searchParams = new URLSearchParams({
        receiver: spot.user_id,
        type: 'help',
        draft,
      })

      router.push(`/messages?${searchParams.toString()}`)
    } catch (error) {
      console.error('Spot message request navigation error:', error)
      toast.error('Mesaj talebi baslatilamadi')
    }
  }

  const handleSightingSuccess = () => {
    setShowSightingModal(false)
    fetchSpotDetails()
    toast.success('Tesekkurler! Yardim bildiriminiz inceleme icin gonderildi. Onaylandiginda Spot odulu islenecek.', 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yukleniyor...</p>
        </main>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Spot bulunamadi</h1>
          <p className="text-gray-600 mb-8">Bu spot silinmis veya mevcut degil.</p>
          <button onClick={() => router.push('/spots')} className="btn-primary">
            Tum Spot'lara Don
          </button>
        </main>
      </div>
    )
  }

  const seoAlt = buildSeoImageAlt({ title: spot.title, category: spot.category, location: spot.location })

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        <div className="mb-6">
          <button onClick={() => router.push('/spots')} className="text-blue-600 hover:text-blue-800 flex items-center">
            ← Tum Spot'lara Don
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${spot.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {spot.status === 'active' ? 'Aktif' : 'Bulundu'}
                    </span>
                    <span className="text-gray-500 text-sm">{new Date(spot.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{spot.title}</h1>
                </div>
              </div>

              {spot.image_url && (
                <div className="mb-6">
                  <div className="relative h-96 w-full rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={spot.image_url}
                      alt={seoAlt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Aciklama</h2>
                <p className="text-gray-700 whitespace-pre-line">{spot.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Kategori</h3>
                  <p className="font-medium">{spot.category || 'Belirtilmemis'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Konum</h3>
                  <p className="font-medium">{spot.location || 'Belirtilmemis'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Goruntulenme</h3>
                  <p className="font-medium">{spot.views} kez</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Yardim</h3>
                  <p className="font-medium">{spot.total_helps} kisi yardim etti</p>
                </div>
              </div>
            </div>

            {spot.location && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Konum Bilgisi</h2>
                <SimpleMap location={spot.location} />
              </div>
            )}

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Bu urunu gordunuz mu?</h3>
              <p className="mb-6 opacity-90">Topluluga yardim edin, baskalarini mutlu edin</p>
              <button onClick={() => setShowSightingModal(true)} className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg">
                Evet, Ben Gordum!
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <SimpleShareButtons url={buildSpotPath(spot.id, spot.title)} title={spot.title} />

            {spot.user_id !== currentUserId && (
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-white mb-3">💬 Yardim Teklif Et</h3>
                <p className="text-emerald-50 text-sm mb-4">Bu urunu bulmada yardimci olabilir misiniz? Spot sahibine mesaj gonderin.</p>
                <button onClick={handleMessageRequest} className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-3 rounded-xl transition-colors">
                  Mesaj Gonder
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Spot Sahibi</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {spot.user?.full_name?.[0]?.toUpperCase() || 'K'}
                </div>
                <div>
                  <p className="font-medium">{spot.user?.full_name || 'Kullanici'}</p>
                  <p className="text-sm text-gray-500">Topluluk uyesi</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Istatistikler</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Goruntulenme:</span><span className="font-bold">{spot.views}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Yardim Edenler:</span><span className="font-bold">{spot.total_helps}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Olusturulma:</span><span className="font-bold">{new Date(spot.created_at).toLocaleDateString('tr-TR')}</span></div>
              </div>
            </div>

            {spot.category && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Kategori</h3>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {spot.category === 'Elektronik' && '🔌'}
                    {spot.category === 'Fotoğraf Makineleri' && '📷'}
                    {spot.category === 'Giyim & Aksesuar' && '👕'}
                    {spot.category === 'Ev & Bahçe' && '🏠'}
                    {spot.category === 'Koleksiyon' && '🎨'}
                    {spot.category === 'Kitap & Müzik' && '📚'}
                    {spot.category === 'Diğer' && '📦'}
                  </span>
                  <span className="font-medium">{spot.category}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showSightingModal && (
        <SightingModal
          spotId={spotId}
          spotTitle={spot.title}
          onClose={() => setShowSightingModal(false)}
          onSuccess={handleSightingSuccess}
        />
      )}
    </div>
  )
}

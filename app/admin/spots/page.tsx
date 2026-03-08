// app/admin/spots/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Spot {
  id: string
  name: string
  description: string
  user_id: string
  created_at: string
  status: string
  latitude: number
  longitude: number
  category: string
  user_profiles?: {
    name: string
    email: string
  }
}

export default function AdminSpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSpots()
  }, [filter])

  const fetchSpots = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('spots')
        .select(`
          *,
          user_profiles (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setSpots(data || [])
    } catch (error) {
      console.error('Spotlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSpotStatus = async (spotId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('spots')
        .update({ status: newStatus })
        .eq('id', spotId)

      if (error) throw error

      alert(`Spot ${newStatus} olarak işaretlendi`)
      fetchSpots()
    } catch (error) {
      console.error('Spot güncellenemedi:', error)
      alert('Bir hata oluştu')
    }
  }

  const deleteSpot = async (spotId: string) => {
    if (!confirm('Bu spotu silmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('spots')
        .delete()
        .eq('id', spotId)

      if (error) throw error

      alert('Spot silindi')
      fetchSpots()
    } catch (error) {
      console.error('Spot silinemedi:', error)
      alert('Bir hata oluştu')
    }
  }

  const filteredSpots = spots.filter(spot =>
    spot.name?.toLowerCase().includes(search.toLowerCase()) ||
    spot.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Spot Yönetimi</h1>
        <p className="text-gray-600">Kullanıcıların oluşturduğu spotları yönetin</p>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Spot ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] border rounded-lg px-4 py-2"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Tümü ({spots.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              Aktif
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
            >
              Beklemede
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
            >
              Reddedilen
            </button>
          </div>
        </div>
      </div>

      {/* Spot Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spot Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">Yükleniyor...</td>
              </tr>
            ) : filteredSpots.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Spot bulunamadı</td>
              </tr>
            ) : (
              filteredSpots.map((spot) => (
                <tr key={spot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{spot.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{spot.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{spot.category || 'Yok'}</td>
                  <td className="px-6 py-4 text-sm">
                    {spot.user_profiles?.name || spot.user_profiles?.email || 'Bilinmiyor'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      spot.status === 'active' ? 'bg-green-100 text-green-800' :
                      spot.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {spot.status === 'active' ? 'Aktif' : spot.status === 'pending' ? 'Beklemede' : 'Reddedildi'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {spot.status !== 'active' && (
                        <button
                          onClick={() => updateSpotStatus(spot.id, 'active')}
                          className="text-green-600 hover:text-green-800"
                        >
                          Onayla
                        </button>
                      )}
                      {spot.status !== 'rejected' && (
                        <button
                          onClick={() => updateSpotStatus(spot.id, 'rejected')}
                          className="text-red-600 hover:text-red-800"
                        >
                          Reddet
                        </button>
                      )}
                      <button
                        onClick={() => deleteSpot(spot.id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// app/admin/shops/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Shop {
  id: string
  name: string
  description: string
  owner_id: string
  created_at: string
  status: string
  category: string
  rating: number
  total_products: number
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all')

  useEffect(() => {
    fetchShops()
  }, [filter])

  const fetchShops = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setShops(data || [])
    } catch (error) {
      console.error('Mağazalar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateShopStatus = async (shopId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shops')
        .update({ status: newStatus })
        .eq('id', shopId)

      if (error) throw error

      alert(`Mağaza ${newStatus} olarak işaretlendi`)
      fetchShops()
    } catch (error) {
      console.error('Mağaza güncellenemedi:', error)
      alert('Bir hata oluştu')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mağaza Yönetimi</h1>
        <p className="text-gray-600">Platform üzerindeki mağazaları yönetin</p>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Tümü ({shops.length})
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
            onClick={() => setFilter('suspended')}
            className={`px-4 py-2 rounded-lg ${filter === 'suspended' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
          >
            Askıya Alınmış
          </button>
        </div>
      </div>

      {/* Mağaza Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mağaza Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün Sayısı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">Yükleniyor...</td>
              </tr>
            ) : shops.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Mağaza bulunamadı</td>
              </tr>
            ) : (
              shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{shop.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{shop.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{shop.category || 'Yok'}</td>
                  <td className="px-6 py-4 text-sm">{shop.total_products || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    ⭐ {shop.rating?.toFixed(1) || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      shop.status === 'active' ? 'bg-green-100 text-green-800' :
                      shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {shop.status !== 'active' && (
                        <button
                          onClick={() => updateShopStatus(shop.id, 'active')}
                          className="text-green-600 hover:text-green-800"
                        >
                          Aktifleştir
                        </button>
                      )}
                      {shop.status !== 'suspended' && (
                        <button
                          onClick={() => updateShopStatus(shop.id, 'suspended')}
                          className="text-red-600 hover:text-red-800"
                        >
                          Askıya Al
                        </button>
                      )}
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

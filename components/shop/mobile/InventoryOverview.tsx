// components/shop/InventoryOverview.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface InventoryOverviewProps {
  shopId: string
}

export default function InventoryOverview({ shopId }: InventoryOverviewProps) {
  const router = useRouter()
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    active: 0,
    draft: 0,
    outOfStock: 0,
    total: 0
  })

  useEffect(() => {
    fetchInventory()
  }, [shopId])

  const fetchInventory = async () => {
    try {
      const { data } = await supabase
        .from('shop_inventory')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(5)

      const { count: activeCount } = await supabase
        .from('shop_inventory')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('status', 'active')

      const { count: draftCount } = await supabase
        .from('shop_inventory')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('status', 'draft')

      const { count: outOfStockCount } = await supabase
        .from('shop_inventory')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('status', 'out_of_stock')

      const { count: totalCount } = await supabase
        .from('shop_inventory')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', shopId)

      setInventory(data || [])
      setStats({
        active: activeCount || 0,
        draft: draftCount || 0,
        outOfStock: outOfStockCount || 0,
        total: totalCount || 0
      })
    } catch (error) {
      console.error('Inventory yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">📦 Envanter Özeti</h3>
        <button
          onClick={() => router.push(`/shop/${shopId}/inventory`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Tümünü Gör →
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Aktif</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-600">{stats.draft}</div>
          <div className="text-sm text-gray-600">Taslak</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-600">{stats.outOfStock}</div>
          <div className="text-sm text-gray-600">Stok Yok</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Toplam</div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="space-y-3">
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📭</div>
            <h4 className="font-bold text-gray-900 mb-2">Henüz ürün eklenmemiş</h4>
            <p className="text-gray-600 mb-4">İlk ürününüzü ekleyerek başlayın</p>
            <button
              onClick={() => router.push(`/shop/${shopId}/inventory/new`)}
              className="btn-primary"
            >
              İlk Ürünü Ekle
            </button>
          </div>
        ) : (
          <>
            {inventory.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => router.push(`/shop/${shopId}/inventory/${item.id}`)}
              >
                <div className="flex items-center space-x-3">
                  {item.images && item.images.length > 0 ? (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">📦</span>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.price.toLocaleString('tr-TR')} {item.currency}
                    </p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status === 'active' ? 'Aktif' : 
                   item.status === 'draft' ? 'Taslak' : 
                   item.status === 'out_of_stock' ? 'Stok Yok' : item.status}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
// components/shop/SearchOverview.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface SearchOverviewProps {
  shopId: string
}

// Arama verisi tipini tanımla
interface SearchItem {
  id: string
  title: string
  category?: string
  brand?: string
  min_price?: number
  max_price?: number
  priority_level: number
  status: string
  created_at: string
  matches?: Array<{ count: number }>
}

export default function SearchOverview({ shopId }: SearchOverviewProps) {
  const router = useRouter()
  const [searches, setSearches] = useState<SearchItem[]>([])
  const [stats, setStats] = useState({
    active: 0,
    totalMatches: 0,
    highPriority: 0,
    recentMatches: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSearchesData()
  }, [shopId])

  const fetchSearchesData = async () => {
    try {
      // Aktif aramaları getir
      const { data: searchesData, error } = await supabase
        .from('shop_searches')
        .select('*, matches:shop_search_matches(count)')
        .eq('shop_id', shopId)
        .eq('status', 'active')
        .order('priority_level', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      // İstatistikleri hesapla - DÜZELTİLDİ: 's' parametresine tip eklendi
      const activeSearches = searchesData?.length || 0
      const highPriority = searchesData?.filter((s: SearchItem) => s.priority_level >= 4).length || 0
      
      // Toplam eşleşme sayısını hesapla - DÜZELTİLDİ: search_id yerine shop_id kontrol et
      const { count: totalMatchesCount } = await supabase
        .from('shop_search_matches')
        .select('*', { count: 'exact', head: true })
        .eq('search.shop_id', shopId) // Düzeltildi: search.shop_id kontrolü

      // Son 7 gündeki eşleşmeler
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: recentMatchesCount } = await supabase
        .from('shop_search_matches')
        .select('*', { count: 'exact', head: true })
        .eq('search.shop_id', shopId) // Düzeltildi: search.shop_id kontrolü
        .gte('created_at', weekAgo)

      setSearches(searchesData || [])
      setStats({
        active: activeSearches,
        totalMatches: totalMatchesCount || 0,
        highPriority,
        recentMatches: recentMatchesCount || 0
      })
    } catch (error) {
      console.error('Arama verileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (level: number) => {
    switch(level) {
      case 5: return 'bg-red-100 text-red-800'
      case 4: return 'bg-orange-100 text-orange-800'
      case 3: return 'bg-green-100 text-green-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 1: return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (level: number) => {
    switch(level) {
      case 5: return 'ÇOK ACİL'
      case 4: return 'ACİL'
      case 3: return 'NORMAL'
      case 2: return 'DÜŞÜK'
      case 1: return 'ÇOK DÜŞÜK'
      default: return 'BELİRSİZ'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">🔍 Aktif Aramalar</h3>
          <p className="text-sm text-gray-600">{stats.active} aktif arama</p>
        </div>
        <button
          onClick={() => router.push(`/shop/${shopId}/searches`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Tümünü Gör →
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{stats.active}</div>
          <div className="text-sm text-blue-600">Aktif Arama</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{stats.totalMatches}</div>
          <div className="text-sm text-green-600">Toplam Eşleşme</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-700">{stats.highPriority}</div>
          <div className="text-sm text-orange-600">Acil Arama</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{stats.recentMatches}</div>
          <div className="text-sm text-purple-600">Son 7 Gün</div>
        </div>
      </div>

      {/* Aramalar Listesi */}
      <div className="space-y-4">
        {searches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600 mb-4">Henüz aktif aramanız yok</p>
            <button
              onClick={() => router.push(`/shop/${shopId}/searches/new`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              İlk Arama Oluştur
            </button>
          </div>
        ) : (
          searches.map((search) => (
            <div 
              key={search.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
              onClick={() => router.push(`/shop/${shopId}/searches/${search.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                    {search.title}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>{search.category}</span>
                    {search.brand && <span>• {search.brand}</span>}
                    {search.min_price && search.max_price && (
                      <span>• {search.min_price} - {search.max_price} ₺</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {search.matches?.[0]?.count || 0}
                    </div>
                    <div className="text-xs text-gray-500">eşleşme</div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(search.priority_level)}`}>
                    {getPriorityText(search.priority_level)}
                  </span>
                </div>
              </div>
              
              {/* Match progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Eşleşme oranı</span>
                  <span className="font-medium">
                    {Math.round(((search.matches?.[0]?.count || 0) / 10) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(100, ((search.matches?.[0]?.count || 0) / 10) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Yeni arama butonu */}
      <div className="mt-6 pt-6 border-t">
        <button
          onClick={() => router.push(`/shop/${shopId}/searches/new`)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600"
        >
          + Yeni Arama Oluştur
        </button>
      </div>
    </div>
  )
}
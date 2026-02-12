// components/shop/ActiveSearches.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface ActiveSearchesProps {
  shopId: string
  showCreateButton?: boolean
  limit?: number
}

export default function ActiveSearches({ 
  shopId, 
  showCreateButton = true,
  limit = 6 
}: ActiveSearchesProps) {
  const [searches, setSearches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveSearches()
  }, [shopId])

  const fetchActiveSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_searches')
        .select('*')
        .eq('shop_id', shopId)
        .eq('status', 'active')
        .order('priority_level', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setSearches(data || [])
    } catch (error) {
      console.error('Aramalar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (level: number) => {
    switch(level) {
      case 1: return 'bg-gray-100 text-gray-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-green-100 text-green-800'
      case 4: return 'bg-orange-100 text-orange-800'
      case 5: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (level: number) => {
    switch(level) {
      case 1: return 'Çok Düşük'
      case 2: return 'Düşük'
      case 3: return 'Normal'
      case 4: return 'Yüksek'
      case 5: return 'Çok Yüksek'
      default: return 'Belirtilmemiş'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">🔍 Aktif Aramalar</h3>
            <p className="text-sm text-gray-600">{searches.length} aktif arama</p>
          </div>
          {showCreateButton && (
            <Link
              href={`/shop/${shopId}/searches/new`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
            >
              + Yeni Arama
            </Link>
          )}
        </div>
      </div>

      {searches.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h4 className="font-bold text-gray-900 mb-2">Henüz aktif aramanız yok</h4>
          <p className="text-gray-600 mb-6">Aradığınız ürünleri listeleyin, otomatik eşleşmeleri bulalım</p>
          {showCreateButton && (
            <Link
              href={`/shop/${shopId}/searches/new`}
              className="btn-primary inline-block"
            >
              İlk Aramayı Oluşturun
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {searches.map((search) => (
            <div key={search.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(search.priority_level)}`}>
                      {getPriorityText(search.priority_level)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {search.match_count || 0} eşleşme
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-gray-900 mb-1">{search.title}</h4>
                  
                  {search.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {search.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {search.category && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {search.category}
                      </span>
                    )}
                    {search.brand && (
                      <span className="flex items-center">
                        <span className="mr-1">🏷️</span>
                        {search.brand}
                      </span>
                    )}
                    {(search.min_price || search.max_price) && (
                      <span className="flex items-center">
                        <span className="mr-1">💰</span>
                        {search.min_price || 0} - {search.max_price || '∞'} TL
                      </span>
                    )}
                    {search.location && (
                      <span className="flex items-center">
                        <span className="mr-1">📍</span>
                        {search.location}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/shop/${shopId}/searches/${search.id}`}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                >
                  Detay →
                </Link>
              </div>

              {/* Progress bar for days left */}
              {search.expire_date && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">
                      {Math.ceil((new Date(search.expire_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} gün kaldı
                    </span>
                    <span className="font-medium">Sona eriyor: {new Date(search.expire_date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ 
                        width: `${Math.min(100, 
                          (1 - (new Date(search.expire_date).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {searches.length > 0 && showCreateButton && (
        <div className="p-6 border-t text-center">
          <Link
            href={`/shop/${shopId}/searches`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Tüm Aramaları Gör →
          </Link>
        </div>
      )}
    </div>
  )
}
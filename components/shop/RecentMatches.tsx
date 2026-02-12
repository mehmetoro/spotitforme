// components/shop/RecentMatches.tsx - DÜZELTİLMİŞ VERSİYON
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface RecentMatchesProps {
  shopId: string
  limit?: number
}

export default function RecentMatches({ shopId, limit = 5 }: RecentMatchesProps) {
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentMatches()
  }, [shopId])

  const fetchRecentMatches = async () => {
    try {
      const { data } = await supabase
        .from('shop_search_matches')
        .select(`
          *,
          search:shop_searches(*),
          inventory:shop_inventory(*),
          spot:spots(*)
        `)
        .eq('search_id', shopId)
        .order('created_at', { ascending: false })
        .limit(limit)

      setMatches(data || [])
    } catch (error) {
      console.error('Recent matches yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMatchType = (match: any) => {
    if (match.inventory_id) return 'inventory'
    if (match.spot_id) return 'spot'
    return 'unknown'
  }

  const getMatchSource = (match: any) => {
    if (match.inventory) return 'Başka Mağaza'
    if (match.spot) return 'Kullanıcı Spot\'u'
    return 'Bilinmeyen'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-gray-900 mb-6">✅ Son Eşleşmeler</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🤝</div>
          <h4 className="font-bold text-gray-900 mb-2">Henüz eşleşme yok</h4>
          <p className="text-gray-600">
            Arama oluşturduğunuzda eşleşmeler burada görünecek
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">✅ Son Eşleşmeler</h3>
        <button
          onClick={() => router.push(`/shop/${shopId}/matches`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Tümünü Gör →
        </button>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div 
            key={match.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              if (match.inventory_id) {
                router.push(`/shop/${shopId}/matches/inventory/${match.inventory_id}`)
              } else if (match.spot_id) {
                router.push(`/spots/${match.spot_id}`)
              }
            }}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  match.match_score >= 80 ? 'bg-green-100 text-green-600' :
                  match.match_score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {match.match_score >= 80 ? '🔥' :
                   match.match_score >= 60 ? '✅' : '🔍'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {match.search?.title || 'Arama'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getMatchSource(match)} • %{match.match_score} eşleşme
                  </p>
                </div>
              </div>

              {match.match_reasons && match.match_reasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {match.match_reasons.slice(0, 3).map((reason: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border">
                      {reason}
                    </span>
                  ))}
                  {match.match_reasons.length > 3 && (
                    <span className="px-2 py-1 bg-white text-gray-500 text-xs rounded-full border">
                      +{match.match_reasons.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                match.status === 'notified' ? 'bg-blue-100 text-blue-800' :
                match.status === 'contacted' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {match.status === 'pending' ? 'Bekliyor' :
                 match.status === 'notified' ? 'Bildirildi' :
                 match.status === 'contacted' ? 'İletişimde' : match.status}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(match.created_at).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
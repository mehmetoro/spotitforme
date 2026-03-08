'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface DiscountRequestsPanelProps {
  shopId: string
  limit?: number
}

interface DiscountRequestRow {
  id: string
  product_id: string
  buyer_id: string
  spot_amount: number
  discount_amount_usd: number
  discount_amount_local: number
  original_price: number
  final_price: number
  currency: string
  exchange_rate: number
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  created_at: string
}

export default function DiscountRequestsPanel({ shopId, limit = 6 }: DiscountRequestsPanelProps) {
  const [requests, setRequests] = useState<DiscountRequestRow[]>([])
  const [productTitles, setProductTitles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const pendingCount = useMemo(() => requests.filter((request) => request.status === 'pending').length, [requests])

  useEffect(() => {
    fetchRequests()
  }, [shopId])

  const fetchRequests = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('shop_product_discount_requests')
        .select('id, product_id, buyer_id, spot_amount, discount_amount_usd, discount_amount_local, original_price, final_price, currency, exchange_rate, status, created_at')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Discount requests load error:', error)
        return
      }

      const rows = (data || []) as DiscountRequestRow[]
      setRequests(rows)

      const productIds = Array.from(new Set(rows.map((row) => row.product_id)))
      if (productIds.length === 0) {
        setProductTitles({})
        return
      }

      const { data: productsData, error: productsError } = await supabase
        .from('shop_inventory')
        .select('id, title')
        .in('id', productIds)

      if (productsError) {
        console.error('Product titles load error:', productsError)
        return
      }

      const titleMap = (productsData || []).reduce((acc: Record<string, string>, product: any) => {
        acc[product.id] = product.title
        return acc
      }, {})

      setProductTitles(titleMap)
    } catch (error) {
      console.error('Discount requests fetch failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(requestId)

      const { error } = await supabase
        .from('shop_product_discount_requests')
        .update({
          status,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      if (error) {
        console.error('Discount request update error:', error)
        alert('Talep durumu güncellenemedi')
        return
      }

      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status } : request
        )
      )
    } catch (error) {
      console.error('Status update failed:', error)
      alert('Talep durumu güncellenemedi')
    } finally {
      setProcessingId(null)
    }
  }

  const statusBadgeClass = (status: DiscountRequestRow['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-2/5"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">💸 İndirim Talepleri</h3>
          <p className="text-sm text-gray-600">Spot bazlı gelen son talepler</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          {pendingCount} bekliyor
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600 text-sm">
          Henüz indirim talebi yok.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const localCurrency = request.currency || 'TRY'
            const productTitle = productTitles[request.product_id] || 'Ürün'

            return (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/product/${request.product_id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                        {productTitle}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {request.spot_amount} Spot = ${Number(request.discount_amount_usd || 0).toFixed(2)} = {Number(request.discount_amount_local || 0).toFixed(2)} {localCurrency}
                    </p>
                    <p className="text-xs text-gray-500">
                      Kur: 1 USD = {Number(request.exchange_rate || 1).toFixed(2)} {localCurrency} • Fiyat: {Number(request.original_price || 0).toFixed(2)} → {Number(request.final_price || 0).toFixed(2)} {localCurrency}
                    </p>
                    <p className="text-xs text-gray-500">
                      Talep No: {request.id.slice(0, 8)} • {new Date(request.created_at).toLocaleString('tr-TR')}
                    </p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        disabled={processingId === request.id}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        disabled={processingId === request.id}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// app/admin/payments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  status: string
  created_at: string
  description: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

  useEffect(() => {
    fetchPayments()
  }, [filter])

  const fetchPayments = async () => {
    try {
      setLoading(true)

      // İstatistikler
      const { data: allPayments } = await supabase
        .from('payments')
        .select('amount, status')

      const totalRevenue = allPayments
        ?.filter(p => p.status === 'completed')
        ?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      const pendingCount = allPayments?.filter(p => p.status === 'pending').length || 0
      const completedCount = allPayments?.filter(p => p.status === 'completed').length || 0
      const failedCount = allPayments?.filter(p => p.status === 'failed').length || 0

      setStats({
        totalRevenue,
        pendingPayments: pendingCount,
        completedPayments: completedCount,
        failedPayments: failedCount,
      })

      // Ödemeler listesi
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data } = await query
      setPayments(data || [])

    } catch (error) {
      console.error('Ödemeler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ödeme Yönetimi</h1>
        <p className="text-gray-600">Platform ödemelerini ve geliri yönetin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Gelir</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ₺{stats.totalRevenue.toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Bekleyen</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingPayments}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tamamlanan</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedPayments}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Başarısız</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.failedPayments}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
          >
            Tamamlanan
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
          >
            Bekleyen
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg ${filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
          >
            Başarısız
          </button>
        </div>
      </div>

      {/* Ödeme Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">Yükleniyor...</td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Ödeme bulunamadı</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {payment.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {payment.amount.toLocaleString('tr-TR')} {payment.currency || 'TRY'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.description || 'Açıklama yok'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString('tr-TR')}
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

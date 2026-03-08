// app/admin/messaging/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface MessageThread {
  id: string
  participant1_id: string
  participant2_id: string
  thread_type: string
  request_status: string
  created_at: string
  last_message_at: string
  last_message_preview: string
}

interface ReportedMessage {
  id: string
  message_id: string
  reported_by: string
  reason: string
  created_at: string
}

export default function AdminMessagingPage() {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [stats, setStats] = useState({
    totalThreads: 0,
    pendingRequests: 0,
    acceptedThreads: 0,
    rejectedRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'pending' | 'reported'>('overview')

  useEffect(() => {
    fetchMessagingData()
  }, [tab])

  const fetchMessagingData = async () => {
    try {
      setLoading(true)

      // İstatistikler
      const [totalCount, pendingCount, acceptedCount, rejectedCount] = await Promise.all([
        supabase.from('message_threads').select('count', { count: 'exact', head: true }),
        supabase.from('message_threads').select('count', { count: 'exact', head: true }).eq('request_status', 'pending'),
        supabase.from('message_threads').select('count', { count: 'exact', head: true }).eq('request_status', 'accepted'),
        supabase.from('message_threads').select('count', { count: 'exact', head: true }).eq('request_status', 'rejected'),
      ])

      setStats({
        totalThreads: totalCount.count || 0,
        pendingRequests: pendingCount.count || 0,
        acceptedThreads: acceptedCount.count || 0,
        rejectedRequests: rejectedCount.count || 0,
      })

      // Thread listesi
      let query = supabase
        .from('message_threads')
        .select('*')
        .order('last_message_at', { ascending: false })
        .limit(50)

      if (tab === 'pending') {
        query = query.eq('request_status', 'pending')
      }

      const { data } = await query
      setThreads(data || [])

    } catch (error) {
      console.error('Mesajlaşma verileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mesajlaşma Yönetimi</h1>
        <p className="text-gray-600">Kullanıcı mesajlaşmalarını ve taleplerini yönetin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Konuşma</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalThreads}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Bekleyen Talepler</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingRequests}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Kabul Edilenler</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.acceptedThreads}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reddedilenler</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejectedRequests}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setTab('overview')}
              className={`px-6 py-3 font-medium ${tab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setTab('pending')}
              className={`px-6 py-3 font-medium ${tab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Bekleyen Talepler
            </button>
            <button
              onClick={() => setTab('reported')}
              className={`px-6 py-3 font-medium ${tab === 'reported' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Raporlanan Mesajlar
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : tab === 'reported' ? (
            <div className="text-center py-8 text-gray-500">
              Henüz raporlanmış mesaj yok
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tür</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Son Mesaj</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {threads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Konuşma bulunamadı
                      </td>
                    </tr>
                  ) : (
                    threads.map((thread) => (
                      <tr key={thread.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-mono text-gray-600">
                          {thread.id.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {thread.thread_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            thread.request_status === 'accepted' ? 'bg-green-100 text-green-800' :
                            thread.request_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {thread.request_status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 truncate max-w-xs">
                          {thread.last_message_preview || 'Mesaj yok'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(thread.last_message_at).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

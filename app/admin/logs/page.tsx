// app/admin/logs/page.tsx
'use client'

import { useState, useEffect } from 'react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error'
  action: string
  user_id: string
  details: string
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      action: 'User Login',
      user_id: 'user_123',
      details: 'Successful login from IP 192.168.1.1'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: 'warning',
      action: 'Failed Login Attempt',
      user_id: 'user_456',
      details: 'Multiple failed login attempts detected'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      level: 'error',
      action: 'Payment Failed',
      user_id: 'user_789',
      details: 'Payment gateway timeout error'
    }
  ])
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all')

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sistem Logları</h1>
        <p className="text-gray-600">Sistem aktivitelerini ve hataları izleyin</p>
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
            onClick={() => setFilter('info')}
            className={`px-4 py-2 rounded-lg ${filter === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Bilgi
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-4 py-2 rounded-lg ${filter === 'warning' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
          >
            Uyarı
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-lg ${filter === 'error' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
          >
            Hata
          </button>
        </div>
      </div>

      {/* Log Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zaman</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seviye</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksiyon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detaylar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(log.timestamp).toLocaleString('tr-TR')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                    log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.user_id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

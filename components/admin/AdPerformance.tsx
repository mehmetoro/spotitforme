// components/admin/AdPerformance.tsx
'use client'

import { useState } from 'react'

interface AdPerformanceData {
  name: string
  impressions: number
  clicks: number
  revenue: number
  ctr: number
  rpm: number
}

export default function AdPerformance() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week')

  const performanceData: AdPerformanceData[] = [
    {
      name: 'Header Reklam',
      impressions: 3245,
      clicks: 58,
      revenue: 24.50,
      ctr: 1.79,
      rpm: 7.55
    },
    {
      name: 'Sidebar Reklam',
      impressions: 2890,
      clicks: 42,
      revenue: 18.75,
      ctr: 1.45,
      rpm: 6.49
    },
    {
      name: 'In-Article Reklam',
      impressions: 1567,
      clicks: 31,
      revenue: 15.20,
      ctr: 1.98,
      rpm: 9.70
    },
    {
      name: 'Footer Reklam',
      impressions: 4321,
      clicks: 65,
      revenue: 28.90,
      ctr: 1.50,
      rpm: 6.69
    },
    {
      name: 'Mobile Banner',
      impressions: 2789,
      clicks: 49,
      revenue: 21.30,
      ctr: 1.76,
      rpm: 7.64
    }
  ]

  const totals = performanceData.reduce(
    (acc, item) => ({
      impressions: acc.impressions + item.impressions,
      clicks: acc.clicks + item.clicks,
      revenue: acc.revenue + item.revenue
    }),
    { impressions: 0, clicks: 0, revenue: 0 }
  )

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Reklam Performansı</h3>
          <p className="text-gray-600">Reklam ünitelerinin performansı</p>
        </div>
        <div className="flex space-x-2">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'today' ? 'Bugün' : range === 'week' ? 'Bu Hafta' : 'Bu Ay'}
            </button>
          ))}
        </div>
      </div>

      {/* Performans Tablosu */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Reklam Adı</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Gösterim</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Tıklama</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">CTR</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Gelir</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">RPM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {performanceData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{item.name}</td>
                <td className="py-3 px-4">{item.impressions.toLocaleString()}</td>
                <td className="py-3 px-4">{item.clicks}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {item.ctr}%
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">{item.revenue.toFixed(2)} ₺</td>
                <td className="py-3 px-4">{item.rpm.toFixed(2)} ₺</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-bold">
            <tr>
              <td className="py-3 px-4">TOPLAM</td>
              <td className="py-3 px-4">{totals.impressions.toLocaleString()}</td>
              <td className="py-3 px-4">{totals.clicks}</td>
              <td className="py-3 px-4">
                {((totals.clicks / totals.impressions) * 100).toFixed(2)}%
              </td>
              <td className="py-3 px-4">{totals.revenue.toFixed(2)} ₺</td>
              <td className="py-3 px-4">
                {((totals.revenue / totals.impressions) * 1000).toFixed(2)} ₺
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Özet */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">Ortalama CTR</p>
          <p className="text-xl font-bold">
            {(
              performanceData.reduce((sum, item) => sum + item.ctr, 0) / performanceData.length
            ).toFixed(2)}%
          </p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600">Ortalama RPM</p>
          <p className="text-xl font-bold">
            {(
              performanceData.reduce((sum, item) => sum + item.rpm, 0) / performanceData.length
            ).toFixed(2)} ₺
          </p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600">Günlük Ortalama</p>
          <p className="text-xl font-bold">
            {(totals.revenue / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 1)).toFixed(2)} ₺
          </p>
        </div>
      </div>
    </div>
  )
}
// components/admin/RevenueChart.tsx
'use client'

import { useState } from 'react'

export default function RevenueChart() {
  const [timeRange, setTimeRange] = useState<'7gün' | '30gün' | '90gün'>('30gün')
  
  // Örnek veri
  const chartData = {
    '7gün': [120, 190, 300, 500, 200, 300, 450],
    '30gün': Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 500) + 100),
    '90gün': Array.from({ length: 90 }, (_, i) => Math.floor(Math.random() * 500) + 100)
  }

  const data = chartData[timeRange]
  const maxValue = Math.max(...data)
  const total = data.reduce((sum, value) => sum + value, 0)

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Gelir Grafiği</h3>
          <p className="text-gray-600">Toplam: <span className="font-bold">{total.toFixed(2)} ₺</span></p>
        </div>
        <div className="flex space-x-2">
          {(['7gün', '30gün', '90gün'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Basit Chart */}
      <div className="h-64 flex items-end space-x-1">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center"
            title={`${value} ₺`}
          >
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg hover:opacity-80 transition-opacity"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-500 mt-1">
              {timeRange === '7gün' ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][index] : index + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Ortalama Günlük</p>
            <p className="text-lg font-bold">{(total / data.length).toFixed(2)} ₺</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">En Yüksek Gün</p>
            <p className="text-lg font-bold">{maxValue.toFixed(2)} ₺</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Tahmini Aylık</p>
            <p className="text-lg font-bold">{(total * 1.15).toFixed(2)} ₺</p>
          </div>
        </div>
      </div>
    </div>
  )
}
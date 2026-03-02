// components/shop/ShopStats.tsx
'use client'

interface ShopStatsProps {
  stats: {
    totalProducts: number
    activeSearches: number
    totalMatches: number
    pendingMatches: number
    totalFollowers: number
    revenue: number
  }
  shopId: string
}

export default function ShopStats({ stats, shopId }: ShopStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getGrowthColor = (current: number, previous: number) => {
    if (previous === 0) return 'text-green-600'
    const growth = ((current - previous) / previous) * 100
    if (growth > 20) return 'text-green-600'
    if (growth > 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Ürünler */}
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500">📦</div>
          <div className={`text-sm font-medium ${getGrowthColor(stats.totalProducts, stats.totalProducts * 0.9)}`}>
            +12%
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {stats.totalProducts}
        </div>
        <div className="text-sm text-gray-600">Aktif Ürün</div>
        <div className="mt-4 h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${Math.min(100, (stats.totalProducts / 100) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Aramalar */}
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500">🔍</div>
          <div className={`text-sm font-medium ${getGrowthColor(stats.activeSearches, stats.activeSearches * 0.8)}`}>
            +8%
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {stats.activeSearches}
        </div>
        <div className="text-sm text-gray-600">Aktif Arama</div>
        <div className="mt-4 h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"
            style={{ width: `${Math.min(100, (stats.activeSearches / 20) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Eşleşmeler */}
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500">🤝</div>
          <div className={`text-sm font-medium ${getGrowthColor(stats.totalMatches, stats.totalMatches * 0.7)}`}>
            +24%
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {stats.totalMatches}
        </div>
        <div className="text-sm text-gray-600">Toplam Eşleşme</div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-green-600 font-medium">
            {stats.pendingMatches} yeni
          </span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-600">
            {(stats.totalMatches > 0 ? (stats.pendingMatches / stats.totalMatches * 100).toFixed(0) : 0)}% bekliyor
          </span>
        </div>
      </div>

      {/* Takipçiler */}
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500">👥</div>
          <div className={`text-sm font-medium ${getGrowthColor(stats.totalFollowers, stats.totalFollowers * 0.85)}`}>
            +15%
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {stats.totalFollowers}
        </div>
        <div className="text-sm text-gray-600">Takipçi</div>
        <div className="mt-4">
          <div className="flex -space-x-2">
            {[...Array(Math.min(5, stats.totalFollowers))].map((_, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-500"
              ></div>
            ))}
            {stats.totalFollowers > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium">
                +{stats.totalFollowers - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gelir */}
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500">💰</div>
          <div className={`text-sm font-medium ${getGrowthColor(stats.revenue, stats.revenue * 0.6)}`}>
            +42%
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {formatCurrency(stats.revenue)}
        </div>
        <div className="text-sm text-gray-600">Toplam Gelir</div>
        <div className="mt-4">
          <div className="text-xs text-gray-500">
            Bu ay: {formatCurrency(stats.revenue * 0.3)}
          </div>
        </div>
      </div>

      {/* Dönüşüm Oranı */}
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500">📊</div>
          <div className="text-sm font-medium text-green-600">
            +5%
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {stats.totalProducts > 0 ? ((stats.totalMatches / stats.totalProducts) * 100).toFixed(1) : '0'}%
        </div>
        <div className="text-sm text-gray-600">Dönüşüm Oranı</div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className="text-gray-600 mr-2">Hedef:</span>
            <span className="font-medium text-green-600">%25</span>
          </div>
        </div>
      </div>
    </div>
  )
}
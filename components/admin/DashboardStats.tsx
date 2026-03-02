// components/admin/DashboardStats.tsx
interface DashboardStatsProps {
  stats: {
    totalUsers: number
    totalSpots: number
    totalShops: number
    revenue: number
    activeAds: number
  }
  loading: boolean
}

export default function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Aktif Spot',
      value: stats.totalSpots,
      icon: '📍',
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Kayıtlı Mağaza',
      value: stats.totalShops,
      icon: '🏪',
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      title: 'Toplam Gelir',
      value: `${stats.revenue.toFixed(2)} ₺`,
      icon: '💰',
      color: 'bg-yellow-500',
      change: '+23%'
    },
    {
      title: 'Aktif Reklam',
      value: stats.activeAds,
      icon: '📢',
      color: 'bg-red-500',
      change: '+3'
    },
    {
      title: 'Bugünkü Ziyaret',
      value: '1,234',
      icon: '👁️',
      color: 'bg-indigo-500',
      change: '+15%'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">{stat.change} geçen aya göre</p>
            </div>
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
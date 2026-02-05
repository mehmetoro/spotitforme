// components/shop/QuickActions.tsx
'use client'

import { useRouter } from 'next/navigation'

interface QuickActionsProps {
  shopId: string
  onActionComplete?: () => void
}

export default function QuickActions({ shopId, onActionComplete }: QuickActionsProps) {
  const router = useRouter()

  const quickActions = [
    {
      title: 'Ürün Ekle',
      description: 'Yeni ürün listele',
      icon: '📦',
      color: 'bg-blue-100 text-blue-600',
      action: () => router.push(`/shop/${shopId}/inventory/new`)
    },
    {
      title: 'Arama Oluştur',
      description: 'Aradığınızı bulun',
      icon: '🔍',
      color: 'bg-green-100 text-green-600',
      action: () => router.push(`/shop/${shopId}/searches/new`)
    },
    {
      title: 'Paylaşım Yap',
      description: 'Toplulukla paylaş',
      icon: '📢',
      color: 'bg-purple-100 text-purple-600',
      action: () => router.push(`/shop/${shopId}/social/new`)
    },
    {
      title: 'Rapor Al',
      description: 'Performans analizi',
      icon: '📈',
      color: 'bg-orange-100 text-orange-600',
      action: () => router.push(`/shop/${shopId}/analytics`)
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">🚀 Hızlı İşlemler</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.action()
              if (onActionComplete) onActionComplete()
            }}
            className={`${action.color} rounded-xl p-6 text-center hover:opacity-90 transition-opacity`}
          >
            <div className="text-3xl mb-3">{action.icon}</div>
            <div className="font-bold text-gray-900 mb-1">{action.title}</div>
            <div className="text-sm text-gray-700">{action.description}</div>
          </button>
        ))}
      </div>

      {/* Premium özellikler banner */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">🚀 Premium'a Yükseltin</h4>
            <p className="text-gray-600 text-sm">
              Daha fazla ürün, gelişmiş eşleşme sistemi ve premium özellikler için yükseltin
            </p>
          </div>
          <button
            onClick={() => router.push(`/shop/${shopId}/upgrade`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Yükselt
          </button>
        </div>
      </div>
    </div>
  )
}
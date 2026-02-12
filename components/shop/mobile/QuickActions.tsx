// components/shop/QuickActions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface QuickActionsProps {
  shopId: string
  onActionComplete?: () => void
}

export default function QuickActions({ shopId, onActionComplete }: QuickActionsProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const actions = [
    {
      id: 'add-product',
      label: 'Ürün Ekle',
      description: 'Yeni ürünü envantere ekle',
      icon: '📦',
      color: 'blue',
      action: () => router.push(`/shop/${shopId}/inventory/new`)
    },
    {
      id: 'create-search',
      label: 'Arama Oluştur',
      description: 'Aradığınız ürünü tanımlayın',
      icon: '🔍',
      color: 'green',
      action: () => router.push(`/shop/${shopId}/searches/new`)
    },
    {
      id: 'social-post',
      label: 'Paylaşım Yap',
      description: 'Müşterilerle etkileşim kurun',
      icon: '📢',
      color: 'purple',
      action: () => router.push(`/shop/${shopId}/social/new`)
    },
    {
      id: 'view-analytics',
      label: 'Analizleri Gör',
      description: 'Performans istatistikleri',
      icon: '📊',
      color: 'orange',
      action: () => router.push(`/shop/${shopId}/analytics`)
    }
  ]

  const handleAction = async (actionId: string, action: () => void) => {
    setLoadingAction(actionId)
    try {
      action()
      if (onActionComplete) {
        setTimeout(() => onActionComplete(), 500)
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-900 mb-6">🚀 Hızlı İşlemler</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id, action.action)}
            disabled={loadingAction === action.id}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
              loadingAction === action.id
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-blue-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`text-2xl bg-${action.color}-100 text-${action.color}-600 p-3 rounded-lg`}>
                {action.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{action.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              </div>
            </div>
            
            {loadingAction === action.id && (
              <div className="mt-3 text-center">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
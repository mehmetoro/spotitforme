// components/shop/ShopTabs.tsx
'use client'

interface ShopTabsProps {
  activeTab: 'products' | 'searches' | 'social' | 'about'
  onTabChange: (tab: 'products' | 'searches' | 'social' | 'about') => void
  shopId: string
}

export default function ShopTabs({ activeTab, onTabChange, shopId }: ShopTabsProps) {
  const tabs = [
    { id: 'products', label: '📦 Ürünler', countKey: 'products' },
    { id: 'searches', label: '🔍 Aradıklarım', countKey: 'searches' },
    { id: 'social', label: '📱 Paylaşımlar', countKey: 'social' },
    { id: 'about', label: 'ℹ️ Hakkında', countKey: 'about' }
  ]

  return (
    <div className="bg-white rounded-xl shadow p-2">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`flex-1 whitespace-nowrap px-6 py-3 text-center font-medium rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
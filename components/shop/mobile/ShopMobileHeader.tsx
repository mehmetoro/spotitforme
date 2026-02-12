// components/shop/mobile/ShopMobileHeader.tsx - DÜZELTİLMİŞ
'use client'

interface ShopMobileHeaderProps {
  shopId: string
  activeView: 'products' | 'searches' | 'info'
  onViewChange: (view: 'products' | 'searches' | 'info') => void
}

export default function ShopMobileHeader({ 
  shopId, 
  activeView, 
  onViewChange 
}: ShopMobileHeaderProps) {
  // Geri kalan kod aynı...
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-40">
      {/* Header içeriği */}
      <div className="flex justify-around py-3">
        {(['products', 'searches', 'info'] as const).map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`px-4 py-2 font-medium ${
              activeView === view 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            {view === 'products' ? '📦 Ürünler' :
             view === 'searches' ? '🔍 Aramalar' : 'ℹ️ Bilgi'}
          </button>
        ))}
      </div>
    </div>
  )
}
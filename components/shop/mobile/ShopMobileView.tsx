// components/shop/mobile/ShopMobileView.tsx
'use client'

import { useState } from 'react'
import ShopMobileHeader from './ShopMobileHeader'
import ShopMobileProducts from './ShopMobileProducts'
import ShopMobileSearches from './ShopMobileSearches'
import ShopMobileActions from './ShopMobileActions'

export default function ShopMobileView({ shopId }: { shopId: string }) {
  const [activeView, setActiveView] = useState<'products' | 'searches' | 'info'>('products')

  return (
    <div className="md:hidden">
      {/* Fixed Header */}
      <ShopMobileHeader 
        shopId={shopId}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Content */}
      <div className="pt-16 pb-20"> {/* Header ve bottom nav için padding */}
        {activeView === 'products' && <ShopMobileProducts shopId={shopId} />}
        {activeView === 'searches' && <ShopMobileSearches shopId={shopId} />}
        {activeView === 'info' && (
          <div className="p-4">
            {/* Shop info */}
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <ShopMobileActions 
        shopId={shopId}
        onContact={() => console.log('contact')}
        onFollow={() => console.log('follow')}
        onShare={() => console.log('share')}
      />
    </div>
  )
}
// app/shop/[id]/social/page.tsx
'use client'

import { useParams } from 'next/navigation'
import ShopSocialFeed from '@/components/shop/ShopSocialFeed'

export default function ShopSocialListingPage() {
  const params = useParams()
  const shopId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-6">Mağaza Paylaşımları</h1>
        <ShopSocialFeed shopId={shopId} limit={100} compact={false} />
      </main>
    </div>
  )
}

'use client'

import dynamic from 'next/dynamic'

const RareSightingsMap = dynamic(() => import('@/components/RareSightingsMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 p-6 text-sm text-gray-500">Harita yukleniyor...</div>
  ),
})

export default function RareMapPage() {
  return (
    <main className="container-custom py-6 md:py-8">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nadir Haritasi</h1>
        <p className="mt-1 text-sm text-gray-600">
          Fiziksel nadir urun paylasimlarinin konumlarini tek haritada gorun.
        </p>
      </div>

      <RareSightingsMap />
    </main>
  )
}

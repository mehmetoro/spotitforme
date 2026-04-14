'use client'

import dynamic from 'next/dynamic'

const RareTravelPlanner = dynamic(() => import('@/components/RareTravelPlanner'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 p-6 text-sm text-gray-500">Seyahat plani yukleniyor...</div>
  ),
})

export default function RareTravelPlanPage() {
  return (
    <main className="container-custom py-6 md:py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Nadir Seyahat Plani</h1>
        <p className="mt-1 text-sm text-gray-600">
          OSRM rota altyapisi ile secilen guzergah boyunca ugranmaya deger nadir sosyal paylasimlari kesfet.
        </p>
      </div>

      <RareTravelPlanner />
    </main>
  )
}

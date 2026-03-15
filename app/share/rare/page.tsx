'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import QuickSightingModal from '@/components/QuickSightingModal'

export default function ShareRarePage() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(true)

  const handleCloseModal = () => {
    setModalOpen(false)
    router.push('/sightings?tab=rare')
  }

  return (
    <main className="container-custom py-8">
      <QuickSightingModal isOpen={modalOpen} onClose={handleCloseModal} />

      <div className="max-w-2xl mx-auto rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Nadir Gördüm Paylaşımı</h1>
        <p className="mt-2 text-sm text-gray-600">
          Nadir paylaşım formu açıldı. Formu kapatırsanız Nadir Görülenler akışına dönersiniz.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Formu Yeniden Aç
          </button>
          <Link
            href="/sightings?tab=rare"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Nadir Akışına Dön
          </Link>
        </div>
      </div>
    </main>
  )
}

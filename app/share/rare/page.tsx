'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import QuickSightingModal from '@/components/QuickSightingModal'

function extractFirstUrl(input: string) {
  const match = input.match(/https?:\/\/[^\s<>"]+/i)
  return match?.[0] || ''
}

export default function ShareRarePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalOpen, setModalOpen] = useState(true)
  const rawSharedUrl = searchParams.get('url') || ''
  const sharedTitle = searchParams.get('title') || ''
  const sharedText = searchParams.get('text') || ''
  const extractedUrlFromText = extractFirstUrl([rawSharedUrl, sharedText, sharedTitle].filter(Boolean).join(' '))
  const sharedUrl = rawSharedUrl || extractedUrlFromText
  const sharedDescription = [sharedTitle, sharedText].filter(Boolean).join(' - ')

  const handleCloseModal = () => {
    setModalOpen(false)
    router.push('/sightings?tab=rare')
  }

  return (
    <main className="container-custom py-8">
      <QuickSightingModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initialSourceType={sharedUrl ? 'virtual' : 'physical'}
        initialProductUrl={sharedUrl}
        initialDescription={sharedDescription}
      />

      <div className="max-w-2xl mx-auto rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Nadir Seyahat Paylaşımı</h1>
        <p className="mt-2 text-sm text-gray-600">
          Nadir seyahat formu açıldı. Formu kapatırsanız Nadir Görülenler akışına dönersiniz.
        </p>
        {sharedUrl && (
          <p className="mt-2 text-xs text-emerald-700 break-all">
            Paylaşılan link algılandı: {sharedUrl}
          </p>
        )}

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

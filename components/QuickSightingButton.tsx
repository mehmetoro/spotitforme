'use client'

import { useState } from 'react'
import QuickSightingModal from './QuickSightingModal'

export default function QuickSightingButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        aria-label="Nadir gördüm bildirimi oluştur"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 md:p-4 rounded-full shadow-xl transition-all duration-200 md:hover:scale-105 active:scale-95 group"
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">👁️</span>
          <span className="font-bold hidden md:inline-block group-hover:inline-block transition-all">
            Nadir Gördüm!
          </span>
        </div>
        
        {/* Puan gösterimi */}
        <div className="hidden sm:flex absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          +5-25
        </div>
      </button>

      {/* Modal */}
      <QuickSightingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Bildirim başarılı olduğunda sayfayı yenile
          window.location.reload()
        }}
      />
    </>
  )
}
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
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">👁️</span>
          <span className="font-bold hidden md:inline-block group-hover:inline-block transition-all">
            Nadir Gördüm!
          </span>
        </div>
        
        {/* Puan gösterimi */}
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
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
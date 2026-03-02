// components/social/CreatePostButton.tsx - GÜNCELLENMİŞ
'use client'

import { useState } from 'react'
import CreatePostModal from './CreatePostModal'
import { useRouter } from 'next/navigation'

export default function CreatePostButton({ variant = 'default' }: { variant?: 'default' | 'primary' }) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const handlePostCreated = () => {
    // Yeni paylaşım yapıldıktan sonra sayfayı yenile
    console.log('Yeni paylaşım yapıldı, sayfa yenileniyor...')
    router.refresh()
    // Modal'ı kapat
    setShowModal(false)
  }

  if (variant === 'primary') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
        >
          📝 Yeni Paylaşım
        </button>
        
        <CreatePostModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onPostCreated={handlePostCreated}
        />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">✏️</span>
          <span className="font-bold hidden md:inline">Paylaş</span>
        </div>
      </button>
      
      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  )
}
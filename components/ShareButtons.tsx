// components/SimpleShareButtons.tsx
'use client'

import { useState } from 'react'

export default function SimpleShareButtons({ url, title }: { url: string, title: string }) {
  const [copied, setCopied] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? window.location.origin + url : url
  
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank')
  }
  
  const shareOnWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + currentUrl)}`, '_blank')
  }
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Kopyalama hatası:', err)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="font-bold text-gray-900 mb-4">Paylaş</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={shareOnFacebook}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">📘</span> Facebook
        </button>
        <button
          onClick={shareOnWhatsApp}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">💚</span> WhatsApp
        </button>
        <button
          onClick={copyToClipboard}
          className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">{copied ? '✅' : '📋'}</span> {copied ? 'Kopyalandı!' : 'Kopyala'}
        </button>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Link:</p>
        <div className="bg-gray-100 p-3 rounded-lg text-sm break-all">
          {currentUrl}
        </div>
      </div>
    </div>
  )
}
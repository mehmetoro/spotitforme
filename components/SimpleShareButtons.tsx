// components/SimpleShareButtons.tsx
'use client'

import { useState } from 'react'

export default function SimpleShareButtons({ 
  url, 
  title 
}: { 
  url: string 
  title: string 
}) {
  const [copied, setCopied] = useState(false)
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + url : url

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Paylaş</h3>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">📘</span>
          <span className="hidden sm:inline">Facebook</span>
        </a>
        
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">💚</span>
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
        
        <button
          onClick={copyToClipboard}
          className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">{copied ? '✅' : '📋'}</span>
          <span className="hidden sm:inline">{copied ? 'Kopya' : 'Kopya'}</span>
        </button>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 mb-2">Link:</p>
        <div className="relative">
          <input
            type="text"
            value={currentUrl}
            readOnly
            className="w-full px-4 py-3 pr-24 bg-gray-50 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
          >
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>
      </div>
    </div>
  )
}
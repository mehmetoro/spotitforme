// components/messaging/SecurityDisclaimer.tsx
'use client'

import { useState } from 'react'
import { MESSAGING_DISCLAIMERS } from '@/lib/messaging/disclaimer'

interface SecurityDisclaimerProps {
  variant?: 'full' | 'mini' | 'inline'
  onAccept?: () => void
  showAcceptButton?: boolean
}

export default function SecurityDisclaimer({ 
  variant = 'full', 
  onAccept,
  showAcceptButton = false 
}: SecurityDisclaimerProps) {
  const [accepted, setAccepted] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleAccept = () => {
    setAccepted(true)
    if (onAccept) onAccept()
  }

  if (variant === 'mini') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start">
          <span className="text-yellow-600 mr-2">⚠️</span>
          <p className="text-sm text-yellow-800">
            <strong>Güvenlik Uyarısı:</strong> Platform dışı ödemelerden sorumlu değiliz.
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 text-yellow-700 underline text-xs"
            >
              Detaylar
            </button>
          </p>
        </div>
        
        {showDetails && (
          <div className="mt-2 pl-6 border-l-2 border-yellow-300">
            <ul className="text-xs text-yellow-700 space-y-1">
              {MESSAGING_DISCLAIMERS.SAFETY_TIPS.slice(0, 3).map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="text-sm text-gray-600 italic">
        ⚠️ Ödemeler platform dışında yapılır. Güvenli alışveriş için dikkatli olun.
      </div>
    )
  }

  // Full variant
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
      <div className="flex items-start mb-4">
        <div className="bg-yellow-100 p-3 rounded-lg mr-4">
          <span className="text-2xl">🛡️</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {MESSAGING_DISCLAIMERS.GENERAL_DISCLAIMER.title}
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            {MESSAGING_DISCLAIMERS.GENERAL_DISCLAIMER.content.split('\n').map((line, i) => (
              <p key={i} className={i === 0 ? 'font-medium' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Güvenlik ipuçları */}
      <div className="mt-6">
        <h4 className="font-bold text-gray-900 mb-3">🔒 Güvenli Alışveriş İpuçları:</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {MESSAGING_DISCLAIMERS.SAFETY_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start bg-white bg-opacity-50 p-3 rounded-lg">
              <span className="text-green-600 mr-2 mt-1">✓</span>
              <span className="text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kabul butonu (isteğe bağlı) */}
      {showAcceptButton && !accepted && (
        <div className="mt-6 pt-6 border-t border-yellow-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptDisclaimer"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 text-blue-600 mr-3"
              />
              <label htmlFor="acceptDisclaimer" className="text-sm font-medium text-gray-900">
                Yukarıdaki güvenlik uyarılarını okudum ve kabul ediyorum
              </label>
            </div>
            <button
              onClick={handleAccept}
              disabled={!accepted}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg"
            >
              Devam Et
            </button>
          </div>
        </div>
      )}

      {/* Şüpheli durum bildirimi */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Şüpheli bir mesaj veya kullanıcı gördünüz mü?
        </p>
        <button className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
          🚨 Hemen Bildir
        </button>
      </div>
    </div>
  )
}
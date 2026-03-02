// components/EmailSuccessModal.tsx (TAM VERSİYON)
'use client'

import { useState } from 'react'

interface EmailSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  spotId: string
  spotTitle: string
  isHelpNotification?: boolean  // ✅ OPTIONAL yaptık
}

export default function EmailSuccessModal({ 
  isOpen, 
  onClose, 
  spotId, 
  spotTitle,
  isHelpNotification = false  // ✅ Default değer
}: EmailSuccessModalProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/spots/${spotId}`
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const getTitle = () => {
    if (isHelpNotification) {
      return '🎯 Yardım Bildirimi Gönderildi!'
    }
    return '🎉 Spot Oluşturuldu!'
  }

  const getDescription = () => {
    if (isHelpNotification) {
      return 'Spot sahibine anında email bildirimi iletildi. Teşekkür ederiz!'
    }
    return 'Email bildirim sisteminiz aktif. Yardım gelince anında haberiniz olacak.'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className={`p-8 text-center text-white ${
          isHelpNotification 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
        }`}>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">{isHelpNotification ? '🎯' : '🎉'}</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">{getTitle()}</h2>
          <p className="text-lg opacity-90">
            {getDescription()}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Sol - Email Bilgileri */}
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${
                isHelpNotification ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <div className="flex items-start mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    isHelpNotification ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      {isHelpNotification ? 'Yardım Email\'i Gönderildi' : 'Onay Email\'i Gönderildi'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {isHelpNotification 
                        ? 'Spot sahibi email adresine iletildi' 
                        : 'Email adresinize spot oluşturma onayı iletildi'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-gray-600 text-xl">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Hızlı Bildirim</h4>
                    <p className="text-sm text-gray-600">
                      {isHelpNotification 
                        ? 'Spot sahibi 5 saniye içinde haberdar olacak' 
                        : 'Yardım geldiğinde anında haberdar olacaksınız'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ - Spot Bilgileri */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4">Spot Bilgileri</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Başlık:</span>
                  <span className="font-medium">{spotTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spot ID:</span>
                  <span className="font-mono text-sm">{spotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zaman:</span>
                  <span>{new Date().toLocaleTimeString('tr-TR')}</span>
                </div>
              </div>

              {/* Link Paylaşımı */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Spot linkini paylaş:</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`"${spotTitle}" ürününü SpotItForMe'de arıyorum. Yardım edebilir misiniz? ${shareUrl}`)}`)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
                    title="WhatsApp'ta Paylaş"
                  >
                    💚
                  </button>
                  <button
                    onClick={() => window.open(`https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(`"${spotTitle}" ürününü arıyorum`)}`)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
                    title="Telegram'da Paylaş"
                  >
                    📱
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${spotTitle}" ürününü SpotItForMe'de arıyorum. Yardım edebilir misiniz?`)}&url=${shareUrl}`)}
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg"
                    title="Twitter'da Paylaş"
                  >
                    🐦
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Link Kopyalama */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spot Linki
            </label>
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className={`px-6 py-3 rounded-r-lg font-medium ${
                  copySuccess 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 hover:bg-gray-900 text-white'
                }`}
              >
                {copySuccess ? '✅ Kopyalandı!' : '📋 Kopyala'}
              </button>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.href = `/spots/${spotId}`}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-lg"
            >
              👁️ Spot'u Görüntüle
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-lg"
            >
              {isHelpNotification ? 'Kapat' : 'Diğer Spot\'ları Gör'}
            </button>
            
            {!isHelpNotification && (
              <button
                onClick={() => window.location.href = '/create-spot'}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-lg"
              >
                🚀 Yeni Spot Oluştur
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t">
          <p className="text-sm text-gray-600">
            {isHelpNotification 
              ? '🎯 Yardımınız sayesinde spot sahibi ürününü bulabilecek!' 
              : '💡 Spot\'u ne kadar çok paylaşırsanız, o kadar hızlı yardım alırsınız!'}
          </p>
        </div>
      </div>
    </div>
  )
}
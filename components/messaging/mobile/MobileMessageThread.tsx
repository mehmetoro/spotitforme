// components/messaging/mobile/MobileMessageThread.tsx
'use client'

import { useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'

interface MobileMessageThreadProps {
  threadId: string;
  userId: string;
  onBack: () => void;
}

export default function MobileMessageThread({ 
  threadId, 
  userId, 
  onBack 
}: MobileMessageThreadProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim()) return
    console.log('Mobil mesaj gönder:', { threadId, message, userId })
    setMessage('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="font-semibold text-blue-600 text-sm">A</span>
          </div>
          <div>
            <h3 className="font-semibold">Ahmet Yılmaz</h3>
            <p className="text-xs text-green-600">Çevrimiçi</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Alınan mesaj */}
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2">
            <p>Merhaba, o vintage Walkman'i nerede bulabilirim?</p>
            <span className="text-xs text-gray-500 block mt-1">10:00</span>
          </div>
        </div>

        {/* Gönderilen mesaj */}
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-blue-500 text-white rounded-2xl rounded-br-none px-4 py-2">
            <p>Kadıköy çarşısında bir antikacıda görmüştüm</p>
            <span className="text-xs text-white/80 block mt-1">10:05</span>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend()
              }
            }}
            placeholder="Mesaj yaz..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
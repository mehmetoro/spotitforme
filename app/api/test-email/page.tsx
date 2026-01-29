// app/test-email/page.tsx
'use client'

import { useState } from 'react'
import { sendWelcomeEmail, sendSpotCreatedEmail } from '@/lib/email'

export default function TestEmailPage() {
  const [email, setEmail] = useState('test@email.com')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testWelcomeEmail = async () => {
    setLoading(true)
    setResult('Test başlatıldı...')
    
    const success = await sendWelcomeEmail(email, 'Test Kullanıcı')
    
    setResult(success ? '✅ Email gönderildi (simülasyon)' : '❌ Email gönderilemedi')
    setLoading(false)
  }

  const testSpotEmail = async () => {
    setLoading(true)
    setResult('Spot email testi başlatıldı...')
    
    const success = await sendSpotCreatedEmail(email, 'Test Spot', 'test-id-123')
    
    setResult(success ? '✅ Spot emaili gönderildi' : '❌ Spot emaili gönderilemedi')
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Email Sistemi Testi</h1>
      
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@email.com"
          className="border p-2 rounded w-full max-w-md"
        />
      </div>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testWelcomeEmail}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Hoşgeldin Email Testi
        </button>
        
        <button 
          onClick={testSpotEmail}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Spot Email Testi
        </button>
      </div>
      
      {result && (
        <div className={`p-4 rounded ${result.includes('✅') ? 'bg-green-100' : 'bg-red-100'}`}>
          {result}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Terminal'de görmeniz gerekenler:</h3>
        <pre className="text-sm">
          📤 Email gönderiliyor: test@email.com<br/>
          📦 Request body: {"{ to: 'test@email.com', ... }"}<br/>
          🔧 SMTP Config: {"{ host: 'smtp.gmail.com', ... }"}<br/>
          🎭 DEV MOD: Email simülasyonu<br/>
          📨 API Response: {"{ success: true, simulated: true }"}<br/>
        </pre>
      </div>
    </div>
  )
}
// app/test/page.tsx - EMAIL TEST SAYFASI
'use client'

import { useState } from 'react'
import { sendWelcomeEmail, sendSpotCreatedEmail, sendPasswordResetEmail } from '@/lib/email'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TestPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 10)])
  }

  const testWelcomeEmail = async () => {
    if (!email) {
      setResult('❌ Lütfen email adresi girin')
      return
    }

    setLoading(true)
    setResult('Test başlatılıyor...')
    addLog('Hoşgeldin email testi başlatıldı')
    
    try {
      const success = await sendWelcomeEmail(email, 'Test Kullanıcı')
      
      if (success) {
        setResult('✅ Email gönderimi BAŞARILI! (simülasyon veya gerçek)')
        addLog('Hoşgeldin emaili başarıyla gönderildi')
      } else {
        setResult('❌ Email gönderilemedi')
        addLog('Hoşgeldin emaili gönderilemedi')
      }
    } catch (error: any) {
      setResult(`❌ Hata: ${error.message}`)
      addLog(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testSpotEmail = async () => {
    if (!email) {
      setResult('❌ Lütfen email adresi girin')
      return
    }

    setLoading(true)
    setResult('Spot email testi başlatılıyor...')
    addLog('Spot email testi başlatıldı')
    
    try {
      const success = await sendSpotCreatedEmail(email, 'Test Spot Başlığı', 'test-spot-123')
      
      if (success) {
        setResult('✅ Spot emaili BAŞARILI!')
        addLog('Spot emaili başarıyla gönderildi')
      } else {
        setResult('❌ Spot emaili gönderilemedi')
        addLog('Spot emaili gönderilemedi')
      }
    } catch (error: any) {
      setResult(`❌ Hata: ${error.message}`)
      addLog(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testPasswordResetEmail = async () => {
    if (!email) {
      setResult('❌ Lütfen email adresi girin')
      return
    }

    setLoading(true)
    setResult('Şifre sıfırlama testi başlatılıyor...')
    addLog('Şifre sıfırlama testi başlatıldı')
    
    try {
      const resetLink = `${window.location.origin}/reset-password?token=test123&email=${encodeURIComponent(email)}`
      const success = await sendPasswordResetEmail(email, resetLink)
      
      if (success) {
        setResult('✅ Şifre sıfırlama emaili BAŞARILI!')
        addLog('Şifre sıfırlama emaili başarıyla gönderildi')
      } else {
        setResult('❌ Şifre sıfırlama emaili gönderilemedi')
        addLog('Şifre sıfırlama emaili gönderilemedi')
      }
    } catch (error: any) {
      setResult(`❌ Hata: ${error.message}`)
      addLog(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAPIDirectly = async () => {
    setLoading(true)
    setResult('API doğrudan test ediliyor...')
    addLog('API doğrudan test ediliyor')
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email || 'test@example.com',
          subject: '📧 Direct API Test',
          html: '<h1>Direct API Test</h1><p>Bu bir doğrudan API testidir.</p>'
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setResult(`✅ API DOĞRUDAN ÇALIŞIYOR! ${data.simulated ? '(Simülasyon)' : '(Gerçek)'}`)
        addLog(`API başarılı: ${JSON.stringify(data)}`)
      } else {
        setResult(`❌ API hatası: ${data.error || 'Bilinmeyen hata'}`)
        addLog(`API hatası: ${JSON.stringify(data)}`)
      }
    } catch (error: any) {
      setResult(`❌ API çağrı hatası: ${error.message}`)
      addLog(`API çağrı hatası: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setResult('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Email Sistemi Test Sayfası</h1>
          <p className="text-gray-600 mb-8">
            Email sistemini test etmek için bu sayfayı kullanın. Terminal'de log'ları izleyin.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Sol Kolon - Testler */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Email Testleri</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Email Adresi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Kendi email adresinizi girin veya test@example.com bırakın
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={testWelcomeEmail}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? '⏳ Test Ediliyor...' : '🤝 Hoşgeldin Email Testi'}
                  </button>
                  
                  <button
                    onClick={testSpotEmail}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg disabled:opacity-50"
                  >
                    🎉 Spot Oluşturma Email Testi
                  </button>
                  
                  <button
                    onClick={testPasswordResetEmail}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg disabled:opacity-50"
                  >
                    🔐 Şifre Sıfırlama Email Testi
                  </button>
                  
                  <button
                    onClick={testAPIDirectly}
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg disabled:opacity-50"
                  >
                    ⚡ API Doğrudan Test
                  </button>
                </div>

                {/* Sonuç */}
                {result && (
                  <div className={`mt-6 p-4 rounded-lg ${result.includes('✅') ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
                    <p className={`font-medium ${result.includes('✅') ? 'text-green-800' : 'text-red-800'}`}>
                      {result}
                    </p>
                  </div>
                )}
              </div>

              {/* Environment Bilgisi */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Sistem Bilgisi</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>NODE_ENV:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NODE_ENV}</code></p>
                  <p><strong>App Password Format:</strong> <code className="bg-gray-100 px-2 py-1 rounded">ahfd vrzy kuen opmj</code></p>
                  <p><strong>SMTP_HOST:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{process.env.SMTP_HOST || 'AYARLANMADI'}</code></p>
                  <p><strong>Test URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/test</code></p>
                </div>
              </div>
            </div>

            {/* Sağ Kolon - Log'lar */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">📝 Canlı Log'lar</h2>
                <button
                  onClick={clearLogs}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Temizle
                </button>
              </div>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-400">Test başlatın, log'lar burada görünecek...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-2">
                      {log.includes('Hata:') ? (
                        <span className="text-red-400">❌ {log}</span>
                      ) : log.includes('başarı') ? (
                        <span className="text-green-400">✅ {log}</span>
                      ) : (
                        <span>📋 {log}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>💡 Terminal'de de görmeniz gerekenler:</strong></p>
                <ul className="mt-2 space-y-1">
                  <li>• "📧 Email API çağrıldı"</li>
                  <li>• "🔧 SMTP Config: {`{ host: 'smtp.gmail.com', ... }`}"</li>
                  <li>• "🎭 DEV MOD: Email simülasyonu" (development'da)</li>
                  <li>• "✅ Email gönderildi" (production'da)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Talimatları */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3">🧪 Test Talimatları</h3>
            <ol className="text-blue-800 space-y-2">
              <li>1. Email adresinizi girin (veya boş bırakın)</li>
              <li>2. Herhangi bir test butonuna tıklayın</li>
              <li>3. <strong>Terminal'i açın ve log'ları izleyin</strong></li>
              <li>4. Bu sayfadaki log'ları kontrol edin</li>
              <li>5. Başarılıysa, AuthModal ve CreateSpot'u test edin</li>
            </ol>
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Önemli:</strong> Development modunda email'ler <strong>sadece simüle edilir</strong>, 
                gerçekten gönderilmez. Terminal'de log'ları görürsünüz.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
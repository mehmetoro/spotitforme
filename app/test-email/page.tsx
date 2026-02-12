// app/test-email/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { 
  sendSpotCreatedEmail, 
  sendSightingNotificationEmail, 
  sendWelcomeEmail,
  sendTestEmail 
} from '@/lib/email'

export default function TestEmailPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [results, setResults] = useState<Array<{type: string, success: boolean, message: string}>>([])
  const [spotId, setSpotId] = useState('test-spot-123')
  const [spotTitle, setSpotTitle] = useState('Test Spot Başlığı')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user?.email) {
      setTestEmail(user.email)
    }
  }

  const addResult = (type: string, success: boolean, message: string = '') => {
    setResults(prev => [...prev, { type, success, message }])
  }

  const clearResults = () => {
    setResults([])
  }

  const testSpotCreatedEmail = async () => {
    setLoading(true)
    addResult('Spot Oluşturuldu', false, 'Gönderiliyor...')
    
    try {
      const success = await sendSpotCreatedEmail(
        testEmail,
        spotTitle,
        spotId
      )
      
      addResult('Spot Oluşturuldu', success, 
        success ? '✅ Email başarıyla gönderildi!' : '❌ Gönderilemedi'
      )
    } catch (error: any) {
      addResult('Spot Oluşturuldu', false, `❌ Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testSightingNotification = async () => {
    setLoading(true)
    addResult('Yardım Bildirimi', false, 'Gönderiliyor...')
    
    try {
      const success = await sendSightingNotificationEmail(
        testEmail,
        spotTitle,
        'Test Kullanıcı',
        spotId
      )
      
      addResult('Yardım Bildirimi', success,
        success ? '✅ Yardım bildirimi gönderildi!' : '❌ Gönderilemedi'
      )
    } catch (error: any) {
      addResult('Yardım Bildirimi', false, `❌ Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testWelcomeEmail = async () => {
    setLoading(true)
    addResult('Hoşgeldin', false, 'Gönderiliyor...')
    
    try {
      const success = await sendWelcomeEmail(
        testEmail,
        'Test Kullanıcı Adı'
      )
      
      addResult('Hoşgeldin', success,
        success ? '✅ Hoşgeldin emaili gönderildi!' : '❌ Gönderilemedi'
      )
    } catch (error: any) {
      addResult('Hoşgeldin', false, `❌ Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAllEmails = async () => {
    clearResults()
    await testSpotCreatedEmail()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testSightingNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testWelcomeEmail()
  }

  const testCustomEmail = async () => {
    if (!testEmail.includes('@')) {
      addResult('Özel Test', false, '❌ Geçerli bir email adresi girin')
      return
    }

    setLoading(true)
    addResult('Özel Test', false, 'Gönderiliyor...')
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          template: 'welcome',
          data: { name: 'Özel Test Kullanıcısı' }
        })
      })

      const result = await response.json()
      
      addResult('Özel Test', response.ok,
        response.ok ? `✅ Test emaili gönderildi! (${result.messageId || 'ID yok'})` 
        : `❌ Hata: ${result.error || 'Bilinmeyen hata'}`
      )
    } catch (error: any) {
      addResult('Özel Test', false, `❌ Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkEmailConfig = () => {
    const config = {
      gmailUser: process.env.NEXT_PUBLIC_GMAIL_USER || 'Tanımlanmamış',
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Tanımlanmamış',
      apiUrl: typeof window !== 'undefined' ? window.location.origin : 'Tanımlanmamış'
    }
    
    alert(`
📧 Email Konfigürasyonu:
------------------------
Gmail User: ${config.gmailUser}
NODE_ENV: ${config.nodeEnv}
Site URL: ${config.siteUrl}
API URL: ${config.apiUrl}
------------------------
Not: GMAIL_APP_PASS environment variable'ı kontrol edilmiyor (güvenlik için)
    `)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              📧 Email Sistemi Test Sayfası
            </h1>
            <p className="text-gray-600">
              SpotItForMe email sistemini test edin. Tüm email'ler {testEmail} adresine gönderilecek.
            </p>
          </div>

          {/* Kullanıcı Bilgisi */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Kullanıcı Bilgisi</h3>
                <p className="text-gray-600">
                  {user ? `Giriş yapılmış: ${user.email}` : 'Giriş yapılmamış'}
                </p>
              </div>
              <button
                onClick={checkEmailConfig}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
              >
                Konfigürasyonu Gör
              </button>
            </div>

            {/* Email Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Adresi
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="test@example.com"
              />
              <p className="text-sm text-gray-500 mt-2">
                Tüm test email'leri bu adrese gönderilecek
              </p>
            </div>

            {/* Spot Bilgileri */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spot ID
                </label>
                <input
                  type="text"
                  value={spotId}
                  onChange={(e) => setSpotId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spot Başlığı
                </label>
                <input
                  type="text"
                  value={spotTitle}
                  onChange={(e) => setSpotTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Test Butonları */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={testSpotCreatedEmail}
              disabled={loading || !testEmail}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 flex flex-col items-center"
            >
              <span className="text-2xl mb-2">📝</span>
              <span>Spot Oluşturma</span>
              <span className="text-xs opacity-75">(Template 1)</span>
            </button>

            <button
              onClick={testSightingNotification}
              disabled={loading || !testEmail}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 flex flex-col items-center"
            >
              <span className="text-2xl mb-2">🎯</span>
              <span>Yardım Bildirimi</span>
              <span className="text-xs opacity-75">(Template 2)</span>
            </button>

            <button
              onClick={testWelcomeEmail}
              disabled={loading || !testEmail}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 flex flex-col items-center"
            >
              <span className="text-2xl mb-2">👋</span>
              <span>Hoşgeldin</span>
              <span className="text-xs opacity-75">(Template 3)</span>
            </button>

            <button
              onClick={testCustomEmail}
              disabled={loading || !testEmail}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 flex flex-col items-center"
            >
              <span className="text-2xl mb-2">🔧</span>
              <span>API Test</span>
              <span className="text-xs opacity-75">(Direct API)</span>
            </button>
          </div>

          {/* Tümünü Test Et Butonu */}
          <div className="text-center mb-8">
            <button
              onClick={testAllEmails}
              disabled={loading || !testEmail}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:opacity-50"
            >
              {loading ? 'Test Ediliyor...' : 'TÜM EMAİL\'LERİ TEST ET'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              3 farklı email template'ini sırayla test eder
            </p>
          </div>

          {/* Sonuçlar */}
          <div className="bg-white rounded-xl shadow">
            <div className="border-b p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Test Sonuçları</h3>
                <button
                  onClick={clearResults}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Temizle
                </button>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">📨</div>
                <p>Henüz test yapılmadı</p>
                <p className="text-sm mt-2">Yukarıdaki butonlardan birine tıklayarak test başlatın</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${
                        result.success 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {result.success ? (
                            <span className="text-green-600 mr-3">✅</span>
                          ) : (
                            <span className="text-red-600 mr-3">❌</span>
                          )}
                          <div>
                            <h4 className="font-medium">{result.type}</h4>
                            <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                              {result.message}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* İstatistikler */}
                {results.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-bold text-gray-900 mb-4">Test İstatistikleri</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.length}
                        </div>
                        <div className="text-sm text-gray-600">Toplam Test</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {results.filter(r => r.success).length}
                        </div>
                        <div className="text-sm text-gray-600">Başarılı</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {results.filter(r => !r.success).length}
                        </div>
                        <div className="text-sm text-gray-600">Başarısız</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Debug Bilgileri */}
          <div className="mt-8 bg-gray-900 text-white rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">🔍 Debug Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Kullanıcı Durumu:</span>
                <span className={user ? 'text-green-400' : 'text-red-400'}>
                  {user ? 'Giriş Yapılmış' : 'Giriş Yapılmamış'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email Adresi:</span>
                <span className="font-mono">{testEmail || 'Belirtilmemiş'}</span>
              </div>
              <div className="flex justify-between">
                <span>API URL:</span>
                <span className="font-mono text-sm">
                  {typeof window !== 'undefined' ? window.location.origin + '/api/send-email' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="font-mono">{process.env.NODE_ENV}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="font-bold mb-3">🎯 Hızlı Test Komutları (Console)</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const commands = `
// Console'da test etmek için:
await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '${testEmail}',
    template: 'welcome',
    data: { name: 'Console Test' }
  })
}).then(r => r.json()).then(console.log)
                    `.trim()
                    
                    navigator.clipboard.writeText(commands)
                    alert('Komutlar kopyalandı! Console\'a yapıştırın.')
                  }}
                  className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg w-full text-left font-mono"
                >
                  📋 Test Komutlarını Kopyala
                </button>
              </div>
            </div>
          </div>

          {/* Nasıl Kullanılır */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📖 Nasıl Kullanılır</h3>
            <ol className="space-y-3 list-decimal list-inside text-gray-700">
              <li>Gmail App Password'unuzu aldığınızdan emin olun</li>
              <li><code>.env.local</code> dosyasında <code>GMAIL_USER</code> ve <code>GMAIL_APP_PASS</code> değişkenlerini ayarlayın</li>
              <li>Test email adresinizi girin (kendi email'iniz)</li>
              <li>Test butonlarından birine tıklayın</li>
              <li>Email'inizi kontrol edin (Spam klasörüne de bakın)</li>
              <li>Vercel'de environment variables'ları ayarlayın</li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
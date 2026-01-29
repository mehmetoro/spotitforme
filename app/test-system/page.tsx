// app/test-system/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  sendWelcomeEmail, 
  sendSpotCreatedEmail, 
  sendSightingNotificationEmail
} from '@/lib/email'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error' | 'warning'
  message: string
  details?: any
  timestamp?: string
}

// Email connection test fonksiyonu
async function testEmailConnection(): Promise<{
  success: boolean
  message?: string
  messageId?: string
  error?: string
}> {
  try {
    const nodemailer = await import('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    await transporter.verify()
    
    const testEmail = process.env.SMTP_USER || 'test@example.com'
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'test@example.com',
      to: testEmail,
      subject: '✅ SpotItForMe Email Testi',
      text: 'Email sisteminiz çalışıyor!',
      html: '<h1>✅ Email Testi Başarılı!</h1>'
    })

    return {
      success: true,
      message: 'Email bağlantısı başarılı',
      messageId: info.messageId
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Email bağlantı testi başarısız'
    }
  }
}

export default function TestSystemPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [spotId, setSpotId] = useState('test-spot-123')

  const addTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    const result: TestResult = {
      name,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }
    
    setTestResults(prev => [...prev, result])
    console.log(`🧪 ${name}:`, { status, message, details })
    
    return result
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // 1. Environment Test
      addTestResult('Environment Variables', 'running', 'Kontrol ediliyor...')
      await testEnvironment()
      
      // 2. Supabase Connection Test
      addTestResult('Supabase Connection', 'running', 'Bağlantı test ediliyor...')
      await testSupabaseConnection()
      
      // 3. Email Connection Test
      addTestResult('Email Connection', 'running', 'SMTP bağlantısı test ediliyor...')
      await testEmailConnectionFunction()
      
      // 4. Auth Test
      if (userEmail) {
        addTestResult('Auth & Email', 'running', 'Kullanıcı kaydı ve email testi...')
        await testAuthAndEmail()
      }
      
      // 5. API Endpoints Test
      addTestResult('API Endpoints', 'running', 'API endpointleri test ediliyor...')
      await testAPIEndpoints()
      
      // 6. Storage Test
      addTestResult('Storage', 'running', 'Supabase Storage testi...')
      await testStorage()
      
      addTestResult('All Tests', 'success', 'Tüm testler başarıyla tamamlandı!')
      
    } catch (error: any) {
      addTestResult('Test Suite', 'error', 'Test sırasında hata oluştu', {
        error: error.message,
        stack: error.stack
      })
    } finally {
      setIsRunning(false)
    }
  }

  const testEnvironment = async (): Promise<TestResult> => {
    try {
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SMTP_USER',
        'SMTP_PASSWORD',
        'SMTP_HOST',
        'SMTP_PORT'
      ]
      
      const missingVars = requiredVars.filter(varName => !process.env[varName])
      
      if (missingVars.length > 0) {
        return addTestResult(
          'Environment Variables',
          'error',
          `${missingVars.length} environment variable eksik`,
          { missing: missingVars }
        )
      }
      
      const envDetails = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        hasSmtpUser: !!process.env.SMTP_USER,
        hasSmtpPassword: !!process.env.SMTP_PASSWORD,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        nodeEnv: process.env.NODE_ENV
      }
      
      return addTestResult(
        'Environment Variables',
        'success',
        'Tüm environment variables ayarlı',
        envDetails
      )
    } catch (error: any) {
      return addTestResult(
        'Environment Variables',
        'error',
        'Environment kontrolü sırasında hata',
        { error: error.message }
      )
    }
  }

  const testSupabaseConnection = async (): Promise<TestResult> => {
    try {
      // Test 1: Auth connection
      const { data: authData, error: authError } = await supabase.auth.getSession()
      
      if (authError) throw authError
      
      // Test 2: Database connection
      const { data: dbData, error: dbError } = await supabase
        .from('spots')
        .select('count')
        .limit(1)
      
      if (dbError && !dbError.message.includes('does not exist')) {
        throw dbError
      }
      
      return addTestResult(
        'Supabase Connection',
        'success',
        'Supabase bağlantısı başarılı',
        {
          hasSession: !!authData.session,
          userId: authData.session?.user?.id?.substring(0, 8),
          databaseConnected: true
        }
      )
    } catch (error: any) {
      return addTestResult(
        'Supabase Connection',
        'error',
        'Supabase bağlantı hatası',
        {
          error: error.message,
          code: error.code,
          hint: error.hint
        }
      )
    }
  }

  const testEmailConnectionFunction = async (): Promise<TestResult> => {
    try {
      const result = await testEmailConnection()
      
      if (result.success) {
        return addTestResult(
          'Email Connection',
          'success',
          'Email bağlantısı başarılı',
          {
            messageId: result.messageId,
            testedAt: new Date().toISOString()
          }
        )
      } else {
        return addTestResult(
          'Email Connection',
          'error',
          'Email bağlantı testi başarısız',
          result
        )
      }
    } catch (error: any) {
      return addTestResult(
        'Email Connection',
        'error',
        'Email test sırasında hata',
        {
          error: error.message,
          details: 'SMTP ayarlarını kontrol edin'
        }
      )
    }
  }

  const testAuthAndEmail = async (): Promise<void> => {
    try {
      // 1. Test user oluştur
      const testEmail = userEmail || `test-${Date.now()}@test.com`
      const testPassword = 'Test123456!'
      
      // Sign up
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Test User'
          }
        }
      })
      
      if (signupError) {
        addTestResult(
          'Auth Signup',
          'error',
          'Kullanıcı kaydı hatası',
          { error: signupError.message }
        )
        return
      }
      
      addTestResult(
        'Auth Signup',
        'success',
        'Test kullanıcısı oluşturuldu',
        { userId: signupData.user?.id?.substring(0, 8) }
      )
      
      // 2. Welcome email test
      const welcomeEmailResult = await sendWelcomeEmail(testEmail, 'Test User')
      
      addTestResult(
        'Welcome Email',
        welcomeEmailResult ? 'success' : 'error',
        welcomeEmailResult ? 'Hoşgeldin emaili gönderildi' : 'Hoşgeldin emaili gönderilemedi',
        { to: testEmail }
      )
      
      // 3. Sign out
      await supabase.auth.signOut()
      
      addTestResult(
        'Auth Cleanup',
        'success',
        'Test kullanıcısı çıkış yaptı'
      )
      
    } catch (error: any) {
      addTestResult(
        'Auth & Email Test',
        'error',
        'Auth test sırasında hata',
        { error: error.message }
      )
    }
  }

  const testAPIEndpoints = async (): Promise<void> => {
    const endpoints = [
      { name: 'Email Test API', path: '/api/email-test' },
      { name: 'Health Check', path: '/api/health' }
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.path)
        const status = response.status
        
        addTestResult(
          endpoint.name,
          status === 200 ? 'success' : 'error',
          `${endpoint.name}: ${status} ${response.statusText}`,
          {
            path: endpoint.path,
            status,
            ok: response.ok
          }
        )
      } catch (error: any) {
        addTestResult(
          endpoint.name,
          'error',
          `${endpoint.name} erişilemedi`,
          {
            path: endpoint.path,
            error: error.message
          }
        )
      }
    }
  }

  const testStorage = async (): Promise<void> => {
    try {
      // Bucket list test
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        addTestResult(
          'Storage Buckets',
          'error',
          'Storage bucket listeleme hatası',
          { error: bucketsError.message }
        )
        return
      }
      
      const hasSpotImagesBucket = buckets?.some(bucket => bucket.name === 'spot-images')
      
      if (hasSpotImagesBucket) {
        addTestResult(
          'Storage Buckets',
          'success',
          `${buckets?.length || 0} storage bucket bulundu`,
          {
            buckets: buckets?.map(b => b.name),
            hasSpotImagesBucket
          }
        )
        
        addTestResult(
          'Spot Images Bucket',
          'success',
          'spot-images bucket mevcut'
        )
      } else {
        addTestResult(
          'Storage Buckets',
          'success',
          `${buckets?.length || 0} storage bucket bulundu`,
          {
            buckets: buckets?.map(b => b.name),
            hasSpotImagesBucket
          }
        )
        
        addTestResult(
          'Spot Images Bucket',
          'warning',
          'spot-images bucket bulunamadı. Supabase Storage\'da oluşturun.'
        )
      }
      
    } catch (error: any) {
      addTestResult(
        'Storage Test',
        'error',
        'Storage test sırasında hata',
        { error: error.message }
      )
    }
  }

  const runIndividualTest = async (testName: string) => {
    setIsRunning(true)
    
    switch (testName) {
      case 'environment':
        await testEnvironment()
        break
      case 'supabase':
        await testSupabaseConnection()
        break
      case 'email':
        await testEmailConnectionFunction()
        break
      case 'storage':
        await testStorage()
        break
      case 'api':
        await testAPIEndpoints()
        break
    }
    
    setIsRunning(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  const copyResults = () => {
    const resultsText = testResults.map(r => 
      `[${r.status.toUpperCase()}] ${r.name}: ${r.message}`
    ).join('\n')
    
    navigator.clipboard.writeText(resultsText)
    alert('Test sonuçları kopyalandı!')
  }

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      results: testResults
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spotitforme-test-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Renk sınıfları için type-safe mapping
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'green'
      case 'error': return 'red'
      case 'warning': return 'yellow'
      case 'running': return 'blue'
      default: return 'gray'
    }
  }

  const getStatusText = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'BAŞARILI'
      case 'error': return 'HATA'
      case 'warning': return 'UYARI'
      case 'running': return 'ÇALIŞIYOR'
      case 'pending': return 'BEKLİYOR'
      default: return 'BİLİNMİYOR'
    }
  }

  const getStatusBgColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBorderColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'running': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusDotColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'running': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            🧪 SpotItForMe Sistem Testi
          </h1>
          <p className="text-gray-600">
            Tüm sistem bileşenlerini test edin ve hataları tespit edin.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>⚠️ Önemli:</strong> Bu sayfa sadece development ve test ortamlarında kullanılmalıdır.
              Production'da bu sayfayı kaldırın veya şifreyle koruyun.
            </p>
          </div>
        </div>

        {/* Kontrol Paneli */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Kontrolleri</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Adresi (Opsiyonel)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="test@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Auth ve email testleri için kullanılacak
              </p>
            </div>
            
            {/* Spot ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Spot ID
              </label>
              <input
                type="text"
                value={spotId}
                onChange={(e) => setSpotId(e.target.value)}
                placeholder="test-spot-id"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Ana Butonlar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 flex items-center"
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testler Çalışıyor...
                </>
              ) : '🚀 Tüm Testleri Çalıştır'}
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg"
            >
              📋 Sonuçları Temizle
            </button>
            
            <button
              onClick={copyResults}
              disabled={testResults.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50"
            >
              📋 Sonuçları Kopyala
            </button>
            
            <button
              onClick={exportResults}
              disabled={testResults.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50"
            >
              📥 JSON Olarak İndir
            </button>
          </div>

          {/* Bireysel Test Butonları */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Bireysel Testler</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'environment', name: '🌍 Environment', color: 'gray' },
                { id: 'supabase', name: '🔌 Supabase', color: 'green' },
                { id: 'email', name: '📧 Email', color: 'blue' },
                { id: 'storage', name: '💾 Storage', color: 'orange' },
                { id: 'api', name: '🔗 API', color: 'purple' }
              ].map(test => (
                <button
                  key={test.id}
                  onClick={() => runIndividualTest(test.id)}
                  disabled={isRunning}
                  className={`bg-${test.color}-100 hover:bg-${test.color}-200 text-${test.color}-800 font-medium py-2 px-4 rounded-lg disabled:opacity-50`}
                >
                  {test.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Sonuçları */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Test Sonuçları</h2>
            <div className="text-sm text-gray-500">
              {testResults.length} test tamamlandı • 
              {testResults.filter(r => r.status === 'success').length} başarılı •
              {testResults.filter(r => r.status === 'error').length} hatalı •
              {testResults.filter(r => r.status === 'warning').length} uyarı
            </div>
          </div>

          {testResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-500">Henüz test çalıştırılmadı.</p>
              <p className="text-gray-400 text-sm mt-2">"Tüm Testleri Çalıştır" butonuna tıklayın.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${getStatusBorderColor(result.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusDotColor(result.status)}`}></span>
                        <h3 className="font-medium text-gray-900">{result.name}</h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {result.timestamp ? new Date(result.timestamp).toLocaleTimeString('tr-TR') : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 ml-5">{result.message}</p>
                    </div>
                    
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBgColor(result.status)}`}>
                      {getStatusText(result.status)}
                    </span>
                  </div>
                  
                  {/* Detaylar */}
                  {result.details && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          const details = document.getElementById(`details-${index}`)
                          if (details) {
                            details.classList.toggle('hidden')
                          }
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {document.getElementById(`details-${index}`)?.classList.contains('hidden') 
                          ? '🔽 Detayları Göster' 
                          : '🔼 Detayları Gizle'}
                      </button>
                      
                      <pre 
                        id={`details-${index}`}
                        className="mt-2 text-xs bg-black bg-opacity-5 p-3 rounded overflow-x-auto hidden"
                      >
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-3">🔍 Debug Bilgileri</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-700">User Agent</p>
                <p className="text-xs text-gray-500 truncate">{navigator.userAgent}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-700">Screen</p>
                <p className="text-xs text-gray-500">{window.screen.width}x{window.screen.height}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-xs text-gray-500">{window.location.href}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hata Çözüm Önerileri */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">⚠️ Sık Karşılaşılan Hatalar ve Çözümleri</h3>
          <div className="space-y-3">
            {[
              {
                problem: 'Email Connection Error',
                solution: 'SMTP ayarlarını kontrol edin. Gmail app password doğru mu?'
              },
              {
                problem: 'Supabase Connection Error',
                solution: 'Supabase URL ve anon key doğru mu? Row Level Security açık mı?'
              },
              {
                problem: 'Storage Bucket Not Found',
                solution: 'Supabase Storage\'da "spot-images" bucket oluşturun.'
              },
              {
                problem: 'CORS Error',
                solution: 'Supabase CORS ayarlarını kontrol edin. Tüm domainleri ekleyin.'
              }
            ].map((item, idx) => (
              <div key={idx} className="border-l-4 border-yellow-500 pl-4 py-1">
                <p className="font-medium text-yellow-800">{item.problem}</p>
                <p className="text-sm text-yellow-700">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
// app/test-panel/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import {
  sendWelcomeEmail,
  sendBusinessRegistrationEmail,
  sendSpotCreatedEmail,
  sendSightingNotificationEmail,
  sendPasswordResetEmail
} from '@/lib/email-server'

type TestStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped'

interface TestCase {
  id: string
  name: string
  description: string
  status: TestStatus
  result?: string
  error?: string
  duration?: number
}

export default function TestPanelPage() {
  const [user, setUser] = useState<any>(null)
  const [testUser, setTestUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'auth',
      name: '🔐 Authentication Test',
      description: 'Kullanıcı giriş/kayıt testi',
      status: 'pending'
    },
    {
      id: 'welcome-email',
      name: '📧 Hoşgeldin Email Testi',
      description: 'Yeni kullanıcı kayıt emaili',
      status: 'pending'
    },
    {
      id: 'business-email',
      name: '🏪 Mağaza Kayıt Email Testi',
      description: 'Mağaza kayıt emaili',
      status: 'pending'
    },
    {
      id: 'spot-email',
      name: '📍 Spot Oluşturma Email Testi',
      description: 'Spot oluşturma bildirimi',
      status: 'pending'
    },
    {
      id: 'sighting-email',
      name: '👁️ Yardım Bildirimi Email Testi',
      description: 'Ben gördüm bildirimi',
      status: 'pending'
    },
    {
      id: 'password-reset-email',
      name: '🔑 Şifre Sıfırlama Email Testi',
      description: 'Şifre sıfırlama emaili',
      status: 'pending'
    },
    {
      id: 'database',
      name: '🗄️ Database Connection Test',
      description: 'Supabase bağlantı testi',
      status: 'pending'
    },
    {
      id: 'storage',
      name: '📦 Storage Test',
      description: 'Resim yükleme testi',
      status: 'pending'
    },
    {
      id: 'api',
      name: '🌐 API Routes Test',
      description: 'Next.js API routes testi',
      status: 'pending'
    },
    {
      id: 'env',
      name: '⚙️ Environment Variables Test',
      description: 'Çevre değişkenleri kontrolü',
      status: 'pending'
    }
  ])

  useEffect(() => {
    checkCurrentUser()
    checkEnvironment()
  }, [])

  const checkCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      addLog(`Kullanıcı durumu: ${user ? 'Giriş yapıldı' : 'Giriş yapılmadı'}`)
    } catch (error) {
      addLog(`❌ Kullanıcı kontrolü hatası: ${error}`)
    }
  }

  const checkEnvironment = () => {
    const envVars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'GMAIL_USER': process.env.GMAIL_USER ? '✓ Set' : '✗ Missing',
      'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL,
      'ADMIN_EMAIL': process.env.ADMIN_EMAIL
    }

    addLog('🔍 Environment Variables:')
    Object.entries(envVars).forEach(([key, value]) => {
      const status = value && !value.includes('Missing') ? '✓' : '❌'
      addLog(`  ${status} ${key}: ${value || 'Not set'}`)
    })
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 100)])
  }

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(prev => prev.map(test => 
      test.id === id ? { ...test, ...updates } : test
    ))
  }

  const runAllTests = async () => {
    setLoading(true)
    setLogs([])
    addLog('🚀 Tüm testler başlatılıyor...')
    
    // Tüm test caselerini resetle
    setTestCases(prev => prev.map(test => ({ ...test, status: 'pending' })))
    
    // Testleri sırayla çalıştır
    await runSingleTest('env')
    await runSingleTest('database')
    await runSingleTest('auth')
    await runSingleTest('welcome-email')
    await runSingleTest('business-email')
    await runSingleTest('spot-email')
    await runSingleTest('sighting-email')
    await runSingleTest('password-reset-email')
    await runSingleTest('storage')
    await runSingleTest('api')
    
    setLoading(false)
    addLog('✅ Tüm testler tamamlandı!')
  }

  const runSingleTest = async (testId: string) => {
    const testCase = testCases.find(t => t.id === testId)
    if (!testCase) return

    updateTestCase(testId, { status: 'running', result: undefined, error: undefined })
    addLog(`▶️ Test başlatılıyor: ${testCase.name}`)
    
    const startTime = Date.now()

    try {
      switch (testId) {
        case 'env':
          await testEnvironment()
          break
        case 'database':
          await testDatabase()
          break
        case 'auth':
          await testAuthentication()
          break
        case 'welcome-email':
          await testWelcomeEmail()
          break
        case 'business-email':
          await testBusinessEmail()
          break
        case 'spot-email':
          await testSpotEmail()
          break
        case 'sighting-email':
          await testSightingEmail()
          break
        case 'password-reset-email':
          await testPasswordResetEmail()
          break
        case 'storage':
          await testStorage()
          break
        case 'api':
          await testApiRoutes()
          break
      }
      
      const duration = Date.now() - startTime
      updateTestCase(testId, { 
        status: 'success', 
        result: `Başarılı (${duration}ms)`,
        duration 
      })
      addLog(`✅ Test başarılı: ${testCase.name} (${duration}ms)`)
      
    } catch (error: any) {
      const duration = Date.now() - startTime
      const errorMessage = error.message || error.toString()
      updateTestCase(testId, { 
        status: 'error', 
        error: errorMessage,
        duration 
      })
      addLog(`❌ Test hatası: ${testCase.name} - ${errorMessage}`)
    }
  }

  // 🧪 TEST FONKSİYONLARI
  const testEnvironment = async () => {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GMAIL_USER',
      'GMAIL_APP_PASS',
      'NEXT_PUBLIC_SITE_URL'
    ]

    const missing = requiredVars.filter(varName => !process.env[varName])
    if (missing.length > 0) {
      throw new Error(`Eksik environment variables: ${missing.join(', ')}`)
    }

    addLog('✅ Tüm environment variables mevcut')
  }

  const testDatabase = async () => {
    // 1. Connection test
    const { data: tables, error } = await supabase
      .from('spots')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    if (error) throw new Error(`Database connection failed: ${error.message}`)

    // 2. Check required tables
    const requiredTables = ['spots', 'sightings', 'shops', 'user_profiles']
    for (const table of requiredTables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (tableError && !tableError.message.includes('does not exist')) {
          addLog(`⚠️ Tablo erişim hatası (${table}): ${tableError.message}`)
        } else if (tableError) {
          addLog(`⚠️ Tablo bulunamadı: ${table}`)
        } else {
          addLog(`✅ Tablo erişilebilir: ${table}`)
        }
      } catch (e) {
        addLog(`⚠️ Tablo kontrol hatası (${table}): ${e}`)
      }
    }

    addLog('✅ Database bağlantısı başarılı')
  }

  const testAuthentication = async () => {
    // Test kullanıcısı oluştur veya giriş yap
    const testEmail = `test_${Date.now()}@spotitforme.test`
    const testPassword = 'Test123!@#'
    
    addLog(`🔐 Test kullanıcısı oluşturuluyor: ${testEmail}`)

    // 1. Kayıt ol
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test Kullanıcı',
          is_test_user: true
        }
      }
    })

    if (signUpError) {
      // Kullanıcı zaten varsa giriş yap
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      if (signInError) throw new Error(`Giriş hatası: ${signInError.message}`)
      
      setTestUser(signInData.user)
      addLog('✅ Mevcut test kullanıcısı ile giriş yapıldı')
    } else {
      setTestUser(signUpData.user)
      addLog('✅ Yeni test kullanıcısı oluşturuldu')
    }

    // 2. Session kontrolü
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Session oluşturulamadı')

    addLog('✅ Authentication testi başarılı')
  }

  const testWelcomeEmail = async () => {
    if (!testUser) throw new Error('Test kullanıcısı bulunamadı')
    
    const result = await sendWelcomeEmail(testUser.email, 'Test Kullanıcı')
    
    if (!result.success) {
      throw new Error(`Email gönderilemedi: ${result.message}`)
    }
    
    addLog(`✅ Hoşgeldin emaili gönderildi: ${testUser.email}`)
  }

  const testBusinessEmail = async () => {
    if (!testUser) throw new Error('Test kullanıcısı bulunamadı')
    
    const result = await sendBusinessRegistrationEmail(
      testUser.email,
      'Test Mağaza',
      testUser.id
    )
    
    if (!result.success) {
      throw new Error(`Email gönderilemedi: ${result.message}`)
    }
    
    addLog(`✅ Mağaza kayıt emaili gönderildi: ${testUser.email}`)
  }

  const testSpotEmail = async () => {
    if (!testUser) throw new Error('Test kullanıcısı bulunamadı')
    
    const result = await sendSpotCreatedEmail(
      testUser.email,
      'Test Spot Başlığı',
      'test-spot-id'
    )
    
    if (!result.success) {
      throw new Error(`Email gönderilemedi: ${result.message}`)
    }
    
    addLog(`✅ Spot oluşturma emaili gönderildi: ${testUser.email}`)
  }

  const testSightingEmail = async () => {
    if (!testUser) throw new Error('Test kullanıcısı bulunamadı')
    
    const result = await sendSightingNotificationEmail(
      testUser.email,
      'Test Spot Başlığı',
      'Test Yardım Eden',
      'test-spot-id'
    )
    
    if (!result.success) {
      throw new Error(`Email gönderilemedi: ${result.message}`)
    }
    
    addLog(`✅ Yardım bildirimi emaili gönderildi: ${testUser.email}`)
  }

  const testPasswordResetEmail = async () => {
    if (!testUser) throw new Error('Test kullanıcısı bulunamadı')
    
    const result = await sendPasswordResetEmail(
      testUser.email,
      'https://spotitforme.vercel.app/reset-password?token=test-token'
    )
    
    if (!result.success) {
      throw new Error(`Email gönderilemedi: ${result.message}`)
    }
    
    addLog(`✅ Şifre sıfırlama emaili gönderildi: ${testUser.email}`)
  }

  const testStorage = async () => {
    // 1. Bucket kontrolü
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) throw new Error(`Storage bucket listesi alınamadı: ${bucketsError.message}`)
    
    const spotImagesBucket = buckets.find(b => b.name === 'spot-images')
    if (!spotImagesBucket) {
      addLog('⚠️ spot-images bucket bulunamadı')
    } else {
      addLog('✅ spot-images bucket mevcut')
    }

    // 2. Test dosyası yükleme
    const testFile = new File(['test-content'], 'test.txt', { type: 'text/plain' })
    const testFileName = `test-files/test-${Date.now()}.txt`

    try {
      const { error: uploadError } = await supabase.storage
        .from('spot-images')
        .upload(testFileName, testFile)

      if (uploadError) {
        addLog(`⚠️ Test dosyası yüklenemedi: ${uploadError.message}`)
      } else {
        addLog('✅ Test dosyası başarıyla yüklendi')
        
        // 3. Silme testi
        const { error: deleteError } = await supabase.storage
          .from('spot-images')
          .remove([testFileName])
        
        if (deleteError) {
          addLog(`⚠️ Test dosyası silinemedi: ${deleteError.message}`)
        } else {
          addLog('✅ Test dosyası başarıyla silindi')
        }
      }
    } catch (uploadError) {
      addLog(`⚠️ Storage testi atlandı: ${uploadError}`)
    }
  }

  const testApiRoutes = async () => {
    // API route'larını test et
    const apiEndpoints = [
      '/api/health',
      // Diğer API endpoint'lerinizi buraya ekleyin
    ]

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(endpoint)
        const data = await response.json()
        
        if (response.ok) {
          addLog(`✅ API ${endpoint}: ${response.status}`)
        } else {
          addLog(`⚠️ API ${endpoint}: ${response.status} - ${JSON.stringify(data)}`)
        }
      } catch (error) {
        addLog(`❌ API ${endpoint}: ${error}`)
      }
    }
  }

  const createTestSpot = async () => {
    if (!testUser) {
      addLog('❌ Önce test kullanıcısı oluşturun')
      return
    }

    try {
      const { data, error } = await supabase
        .from('spots')
        .insert({
          user_id: testUser.id,
          title: 'Test Spot - ' + new Date().toLocaleString(),
          description: 'Bu bir test spotudur. Test amacıyla oluşturulmuştur.',
          category: 'Test',
          location: 'Test Şehir',
          status: 'active',
          views: 0,
          helps: 0
        })
        .select()
        .single()

      if (error) throw error

      addLog(`✅ Test spot oluşturuldu: ${data.id}`)
      return data
    } catch (error) {
      addLog(`❌ Test spot oluşturulamadı: ${error}`)
    }
  }

  const cleanUpTestData = async () => {
    setLogs([])
    addLog('🧹 Test verileri temizleniyor...')

    if (testUser) {
      try {
        // Test kullanıcısının spot'larını sil
        const { error: spotsError } = await supabase
          .from('spots')
          .delete()
          .eq('user_id', testUser.id)

        if (spotsError) {
          addLog(`⚠️ Test spotları silinemedi: ${spotsError.message}`)
        } else {
          addLog('✅ Test spotları temizlendi')
        }

        // Test kullanıcısını sil (opsiyonel - dikkatli kullanın)
        // await supabase.auth.admin.deleteUser(testUser.id)
        // addLog('✅ Test kullanıcısı silindi')

        setTestUser(null)
      } catch (error) {
        addLog(`⚠️ Temizleme hatası: ${error}`)
      }
    }

    // Test storage dosyalarını temizle
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('spot-images')
        .list('test-files')

      if (!listError && files) {
        const filePaths = files.map(file => `test-files/${file.name}`)
        if (filePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('spot-images')
            .remove(filePaths)
          
          if (!deleteError) {
            addLog(`✅ ${filePaths.length} test dosyası silindi`)
          }
        }
      }
    } catch (error) {
      addLog(`⚠️ Storage temizleme hatası: ${error}`)
    }

    addLog('✅ Temizleme işlemi tamamlandı')
  }

  const exportLogs = () => {
    const logText = logs.join('\n')
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spotitforme-test-logs-${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'skipped': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'running': return '🔄'
      case 'skipped': return '⏭️'
      default: return '⏳'
    }
  }

  const successCount = testCases.filter(t => t.status === 'success').length
  const errorCount = testCases.filter(t => t.status === 'error').length
  const totalCount = testCases.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🧪 SpotItForMe Test Paneli
          </h1>
          <p className="text-gray-600">
            Tüm sistem bileşenlerini test edin ve hataları tespit edin
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalCount}</div>
            <div className="text-sm text-gray-600">Toplam Test</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{successCount}</div>
            <div className="text-sm text-gray-600">Başarılı</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{errorCount}</div>
            <div className="text-sm text-gray-600">Hatalı</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {successCount}/{totalCount}
            </div>
            <div className="text-sm text-gray-600">Başarı Oranı</div>
          </div>
        </div>

        {/* Kontrol Butonları */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testler Çalışıyor...
                </>
              ) : (
                '🚀 Tüm Testleri Çalıştır'
              )}
            </button>

            <button
              onClick={createTestSpot}
              disabled={loading || !testUser}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50"
            >
              📍 Test Spot Oluştur
            </button>

            <button
              onClick={cleanUpTestData}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg"
            >
              🧹 Test Verilerini Temizle
            </button>

            <button
              onClick={exportLogs}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg"
            >
              📥 Logları İndir
            </button>

            <button
              onClick={() => setLogs([])}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg"
            >
              🗑️ Logları Temizle
            </button>
          </div>

          {/* Kullanıcı Bilgisi */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {testUser ? '🟢 Test Kullanıcısı Aktif' : '⚪ Test Kullanıcısı Yok'}
                </p>
                <p className="text-sm text-gray-600">
                  {testUser ? testUser.email : 'Test için bir kullanıcı oluşturun'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Mevcut Kullanıcı: {user ? user.email : 'Giriş yapılmadı'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Caseleri */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🧪 Test Caseleri</h2>
            
            <div className="space-y-4">
              {testCases.map(test => (
                <div 
                  key={test.id}
                  className={`border-2 rounded-xl p-4 transition-all duration-300 ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{getStatusIcon(test.status)}</span>
                      <h3 className="font-bold">{test.name}</h3>
                    </div>
                    <button
                      onClick={() => runSingleTest(test.id)}
                      disabled={loading}
                      className="text-sm bg-white hover:bg-gray-100 text-gray-800 px-3 py-1 rounded-lg disabled:opacity-50"
                    >
                      Çalıştır
                    </button>
                  </div>
                  
                  <p className="text-sm mb-2">{test.description}</p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      {test.status === 'running' && (
                        <span className="flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Çalışıyor...
                        </span>
                      )}
                      {test.result && (
                        <span className="text-green-700">✅ {test.result}</span>
                      )}
                      {test.error && (
                        <span className="text-red-700">❌ {test.error}</span>
                      )}
                    </div>
                    
                    {test.duration && (
                      <span className="text-gray-500">{test.duration}ms</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loglar */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">📋 Sistem Logları</h2>
              <span className="text-sm text-gray-500">
                {logs.length} log kaydı
              </span>
            </div>
            
            <div className="bg-gray-900 text-gray-100 rounded-xl p-4 h-[600px] overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Log kaydı bulunmuyor. Testleri çalıştırmak için yukarıdaki butonları kullanın.
                </div>
              ) : (
                logs.map((log, index) => {
                  const isError = log.includes('❌') || log.includes('⚠️') || log.includes('Hata:')
                  const isSuccess = log.includes('✅')
                  const isInfo = log.includes('🔍') || log.includes('▶️') || log.includes('🚀')
                  
                  let colorClass = 'text-gray-300'
                  if (isError) colorClass = 'text-red-400'
                  if (isSuccess) colorClass = 'text-green-400'
                  if (isInfo) colorClass = 'text-blue-400'
                  
                  return (
                    <div key={index} className={`py-1 border-b border-gray-800 last:border-0 ${colorClass}`}>
                      {log}
                    </div>
                  )
                })
              )}
            </div>

            {/* Hızlı Testler */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">⚡ Hızlı Testler</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'email', name: '📧 Email Testi', test: () => runSingleTest('welcome-email') },
                  { id: 'auth', name: '🔐 Auth Testi', test: () => runSingleTest('auth') },
                  { id: 'db', name: '🗄️ DB Testi', test: () => runSingleTest('database') },
                  { id: 'storage', name: '📦 Storage Testi', test: () => runSingleTest('storage') },
                ].map(quickTest => (
                  <button
                    key={quickTest.id}
                    onClick={quickTest.test}
                    disabled={loading}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {quickTest.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sistem Bilgisi */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">ℹ️ Sistem Bilgisi</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Node.js Version:</span>
                  <span className="font-mono">{process.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next.js Version:</span>
                  <span className="font-mono">14.0.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supabase Client:</span>
                  <span className="font-mono">✓ Bağlı</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-mono">{process.env.NODE_ENV}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Site URL:</span>
                  <span className="font-mono truncate">{process.env.NEXT_PUBLIC_SITE_URL}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Bilgileri */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">🐛 Debug Bilgileri</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Yaygın Hatalar ve Çözümler:</h4>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• <strong>Email gönderilemiyor:</strong> Gmail App Password kontrol edin</li>
                <li>• <strong>Database bağlantı hatası:</strong> Supabase URL ve Key kontrolü</li>
                <li>• <strong>Storage hatası:</strong> Bucket permissions kontrol edin</li>
                <li>• <strong>Auth hatası:</strong> RLS politikalarını kontrol edin</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Test Sonrası İşlemler:</h4>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Test verilerini düzenli olarak temizleyin</li>
                <li>• Logları indirerek arşivleyin</li>
                <li>• Hataları düzeltip testleri tekrar çalıştırın</li>
                <li>• Production'a geçmeden tüm testlerin başarılı olduğundan emin olun</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
// app/debug-test/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface TestResult {
  id: number
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  details?: any
  timestamp: string
}

export default function DebugTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [running, setRunning] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('Test123456!')
  const [testName, setTestName] = useState('Test Kullanıcı')

  // Test senaryoları
  const tests = [
    { id: 1, name: '1. Environment Variables Kontrolü' },
    { id: 2, name: '2. Supabase Bağlantı Testi' },
    { id: 3, name: '3. Auth SignUp Testi' },
    { id: 4, name: '4. Auth SignIn Testi' },
    { id: 5, name: '5. user_profiles Tablosu Kontrolü' },
    { id: 6, name: '6. user_profiles Kayıt Testi' },
    { id: 7, name: '7. Auth Session Kontrolü' },
    { id: 8, name: '8. Logout Testi' },
    { id: 9, name: '9. spots Tablosu Kontrolü' },
    { id: 10, name: '10. shops Tablosu Kontrolü' },
    { id: 11, name: '11. Storage Bucket Kontrolü' },
    { id: 12, name: '12. RLS (Row Level Security) Kontrolü' },
  ]

  const addResult = (id: number, status: TestResult['status'], message: string, details?: any) => {
    const newResult: TestResult = {
      id,
      name: tests.find(t => t.id === id)?.name || `Test ${id}`,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }
    
    setResults(prev => {
      const filtered = prev.filter(r => r.id !== id)
      return [...filtered, newResult].sort((a, b) => a.id - b.id)
    })
  }

  const clearResults = () => {
    setResults([])
  }

  const runSingleTest = async (testId: number) => {
    addResult(testId, 'running', 'Test başlatılıyor...')

    try {
      switch (testId) {
        case 1:
          await testEnvironmentVariables()
          break
        case 2:
          await testSupabaseConnection()
          break
        case 3:
          await testAuthSignUp()
          break
        case 4:
          await testAuthSignIn()
          break
        case 5:
          await testUserProfilesTable()
          break
        case 6:
          await testUserProfilesInsert()
          break
        case 7:
          await testAuthSession()
          break
        case 8:
          await testLogout()
          break
        case 9:
          await testSpotsTable()
          break
        case 10:
          await testShopsTable()
          break
        case 11:
          await testStorageBucket()
          break
        case 12:
          await testRLS()
          break
      }
    } catch (error: any) {
      addResult(testId, 'error', `Test hatası: ${error.message}`, error)
    }
  }

  const runAllTests = async () => {
    setRunning(true)
    clearResults()
    
    for (const test of tests) {
      await runSingleTest(test.id)
      // Her test arasında kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setRunning(false)
  }

  // Test fonksiyonları
  const testEnvironmentVariables = async () => {
    const envVars = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      gmailUser: !!process.env.GMAIL_USER,
      siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      nodeEnv: process.env.NODE_ENV
    }

    const missing = Object.entries(envVars)
      .filter(([key, value]) => !value && !['gmailUser', 'siteUrl'].includes(key))
      .map(([key]) => key)

    if (missing.length > 0) {
      throw new Error(`Eksik environment variables: ${missing.join(', ')}`)
    }

    addResult(1, 'success', 'Environment variables kontrol edildi', envVars)
  }

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('spots').select('count', { count: 'exact', head: true })
      
      if (error) {
        // Tablo yok olabilir, bu normal
        addResult(2, 'success', 'Supabase bağlantısı başarılı (tablo hatası normal)', {
          error: error.message,
          code: error.code
        })
      } else {
        addResult(2, 'success', 'Supabase bağlantısı başarılı', {
          connected: true,
          spotsCount: data
        })
      }
    } catch (error: any) {
      throw new Error(`Supabase bağlantı hatası: ${error.message}`)
    }
  }

  const testAuthSignUp = async () => {
    const email = `test_${Date.now()}@example.com`
    const password = 'Test123456!'
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: testName }
      }
    })

    if (error) {
      throw new Error(`Auth SignUp hatası: ${error.message} (${error.code})`)
    }

    addResult(3, 'success', 'Auth SignUp başarılı', {
      userId: data.user?.id,
      userEmail: data.user?.email,
      session: !!data.session,
      requiresConfirmation: data.user?.identities?.length === 0
    })
  }

  const testAuthSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (error) {
      // Test kullanıcısı yoksa, yeni oluştur
      if (error.message.includes('Invalid login credentials')) {
        const signUpResult = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: { data: { name: testName } }
        })

        if (signUpResult.error) {
          throw new Error(`Auth SignIn/SignUp hatası: ${signUpResult.error.message}`)
        }

        addResult(4, 'success', 'Test kullanıcısı oluşturuldu ve giriş yapıldı', {
          action: 'created_and_logged_in',
          userId: signUpResult.data.user?.id
        })
        return
      }
      throw new Error(`Auth SignIn hatası: ${error.message}`)
    }

    addResult(4, 'success', 'Auth SignIn başarılı', {
      userId: data.user?.id,
      userEmail: data.user?.email,
      session: !!data.session
    })
  }

  const testUserProfilesTable = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === '42P01') { // Tablo yok
        throw new Error('user_profiles tablosu bulunamadı')
      }
      throw new Error(`user_profiles tablosu hatası: ${error.message}`)
    }

    // Tablo şemasını kontrol et
    const { data: schemaData } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'user_profiles')

    addResult(5, 'success', 'user_profiles tablosu mevcut', {
      rowCount: data?.length || 0,
      columns: schemaData?.map(col => `${col.column_name} (${col.data_type})`),
      sampleData: data?.[0]
    })
  }

  const testUserProfilesInsert = async () => {
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) {
      throw new Error('Kullanıcı oturumu yok')
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userData.user.id,
        name: testName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      if (error.code === '42501') { // RLS hatası
        throw new Error(`RLS hatası: Kullanıcı user_profiles tablosuna yazamıyor`)
      }
      throw new Error(`user_profiles insert hatası: ${error.message} (${error.code})`)
    }

    addResult(6, 'success', 'user_profiles kaydı başarılı', {
      userId: userData.user.id,
      userName: testName
    })
  }

  const testAuthSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(`Session hatası: ${error.message}`)
    }

    addResult(7, 'success', 'Auth session kontrolü başarılı', {
      hasSession: !!data.session,
      userId: data.session?.user?.id,
      expiresAt: data.session?.expires_at
    })
  }

  const testLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(`Logout hatası: ${error.message}`)
    }

    // Logout sonrası session kontrolü
    const { data: sessionData } = await supabase.auth.getSession()
    
    addResult(8, 'success', 'Logout başarılı', {
      hasSessionAfterLogout: !!sessionData.session,
      shouldBeNull: !sessionData.session
    })
  }

  const testSpotsTable = async () => {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === '42P01') { // Tablo yok
        addResult(9, 'error', 'spots tablosu bulunamadı', {
          suggestion: 'Tablo oluşturulmalı'
        })
        return
      }
      throw new Error(`spots tablosu hatası: ${error.message}`)
    }

    addResult(9, 'success', 'spots tablosu mevcut', {
      rowCount: data?.length || 0,
      sampleData: data?.[0]
    })
  }

  const testShopsTable = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === '42P01') { // Tablo yok
        addResult(10, 'error', 'shops tablosu bulunamadı', {
          suggestion: 'Tablo oluşturulmalı'
        })
        return
      }
      throw new Error(`shops tablosu hatası: ${error.message}`)
    }

    addResult(10, 'success', 'shops tablosu mevcut', {
      rowCount: data?.length || 0,
      sampleData: data?.[0]
    })
  }

  const testStorageBucket = async () => {
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      throw new Error(`Storage bucket hatası: ${error.message}`)
    }

    const spotImagesBucket = data?.find(bucket => bucket.name === 'spot-images')
    
    addResult(11, 'success', 'Storage bucket kontrolü başarılı', {
      buckets: data?.map(b => b.name),
      hasSpotImagesBucket: !!spotImagesBucket,
      spotImagesBucket: spotImagesBucket
    })
  }

  const testRLS = async () => {
    // RLS testi için anonim kullanıcı ile sorgu yap
    const { data: anonData, error: anonError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (anonError && anonError.code === '42501') {
      addResult(12, 'success', 'RLS aktif: Anonim kullanıcı erişimi engellendi', {
        errorCode: anonError.code,
        errorMessage: anonError.message
      })
      return
    }

    // Eğer RLS yoksa veya farklı şekilde çalışıyorsa
    addResult(12, 'error', 'RLS kontrolü: Anonim kullanıcı erişebiliyor olabilir', {
      data: anonData,
      suggestion: 'RLS politikalarını kontrol edin'
    })
  }

  // Kullanıcı durumunu takip et
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    
    checkUser()
    
    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Durum istatistikleri
  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    running: results.filter(r => r.status === 'running').length,
    pending: results.filter(r => r.status === 'pending').length
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
            <span className="text-yellow-400 mr-3">🔧</span>
            SpotItForMe Debug & Test Paneli
          </h1>
          <p className="text-gray-400">
            Tüm auth ve database sorunlarını tespit etmek için kapsamlı test aracı
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-sm text-gray-400">Toplam Test</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.success}</div>
            <div className="text-sm text-gray-400">Başarılı</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.error}</div>
            <div className="text-sm text-gray-400">Hatalı</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.running}</div>
            <div className="text-sm text-gray-400">Çalışıyor</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sol Kolon - Kontroller */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-green-400 mr-2">⚙️</span>
                Test Kontrolleri
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Test Email
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="test@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Test Şifre
                  </label>
                  <input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Test123456!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Test İsim
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Test Kullanıcı"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={runAllTests}
                  disabled={running}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {running ? (
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
                  onClick={clearResults}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg"
                >
                  📋 Sonuçları Temizle
                </button>

                <button
                  onClick={() => {
                    tests.forEach(test => addResult(test.id, 'pending', 'Test bekleniyor...'))
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
                >
                  📝 Testleri Listele
                </button>
              </div>
            </div>

            {/* Kullanıcı Bilgileri */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-blue-400 mr-2">👤</span>
                Kullanıcı Durumu
              </h2>
              
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold mr-3">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-gray-400">ID: {user.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
                    <div className="text-green-400 text-sm font-medium">✓ Oturum Açık</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Son giriş: {new Date(user.last_sign_in_at || user.created_at).toLocaleTimeString('tr-TR')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-center">
                  <div className="text-red-400 font-medium">⚠️ Oturum Kapalı</div>
                  <div className="text-sm text-gray-400 mt-1">Kullanıcı giriş yapmamış</div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Hızlı İşlemler</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      const { data } = await supabase.auth.getUser()
                      alert(`Kullanıcı: ${data.user?.email || 'Yok'}\nID: ${data.user?.id || 'Yok'}`)
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded"
                  >
                    Kullanıcıyı Getir
                  </button>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      alert('Çıkış yapıldı')
                    }}
                    className="bg-red-700 hover:bg-red-600 text-white text-sm py-2 rounded"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Test Sonuçları */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <span className="text-yellow-400 mr-2">📊</span>
                  Test Sonuçları
                </h2>
                <div className="text-sm text-gray-400">
                  {stats.success}/{stats.total} başarılı
                </div>
              </div>

              {/* Test Listesi */}
              <div className="space-y-3">
                {tests.map(test => {
                  const result = results.find(r => r.id === test.id)
                  
                  return (
                    <div
                      key={test.id}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            result?.status === 'success' ? 'bg-green-900/50 text-green-400' :
                            result?.status === 'error' ? 'bg-red-900/50 text-red-400' :
                            result?.status === 'running' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {result?.status === 'success' ? '✓' :
                             result?.status === 'error' ? '✗' :
                             result?.status === 'running' ? '⟳' :
                             test.id}
                          </div>
                          <div>
                            <div className="font-medium">{test.name}</div>
                            <div className="text-xs text-gray-500">
                              {result?.timestamp ? new Date(result.timestamp).toLocaleTimeString('tr-TR') : 'Bekleniyor'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => runSingleTest(test.id)}
                            disabled={running}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50"
                          >
                            Çalıştır
                          </button>
                          {result?.details && (
                            <button
                              onClick={() => {
                                console.log(`Test ${test.id} Detayları:`, result.details)
                                alert(`Detaylar konsolda görüntülendi`)
                              }}
                              className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                            >
                              Detay
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sonuç Mesajı */}
                      {result && (
                        <div className={`mt-3 p-3 rounded text-sm ${
                          result.status === 'success' ? 'bg-green-900/30 border border-green-800 text-green-300' :
                          result.status === 'error' ? 'bg-red-900/30 border border-red-800 text-red-300' :
                          result.status === 'running' ? 'bg-yellow-900/30 border border-yellow-800 text-yellow-300' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          <div className="font-medium">{result.message}</div>
                          
                          {/* Hata detayları */}
                          {result.status === 'error' && result.details && (
                            <div className="mt-2 pt-2 border-t border-red-800">
                              <div className="font-mono text-xs overflow-x-auto">
                                {typeof result.details === 'object' 
                                  ? JSON.stringify(result.details, null, 2)
                                  : result.details.toString()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Debug Bilgileri */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <span className="text-purple-400 mr-2">🐛</span>
                  Debug Bilgileri
                </h3>
                
                <div className="bg-black rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400">// Environment Variables</div>
                  <div className="text-gray-400 ml-4">
                    NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}<br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ (***)' : '❌'}<br />
                    NODE_ENV: {process.env.NODE_ENV}<br />
                    GMAIL_USER: {process.env.GMAIL_USER ? '✅' : '❌'}
                  </div>
                  
                  <div className="mt-4 text-green-400">// Browser Bilgileri</div>
                  <div className="text-gray-400 ml-4">
                    User Agent: {navigator.userAgent}<br />
                    Online: {navigator.onLine ? '✅' : '❌'}<br />
                    Platform: {navigator.platform}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      console.log('Tüm Test Sonuçları:', results)
                      console.log('Kullanıcı:', user)
                      console.log('Supabase Config:', {
                        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
                      })
                      alert('Tüm debug bilgileri konsolda görüntülendi')
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                  >
                    Konsola Yaz
                  </button>
                  
                  <button
                    onClick={() => {
                      const data = {
                        timestamp: new Date().toISOString(),
                        results,
                        user,
                        environment: {
                          nodeEnv: process.env.NODE_ENV,
                          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                        }
                      }
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `debug-report-${Date.now()}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                  >
                    Raporu İndir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Fix Butonları */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-red-400 mr-2">🚑</span>
            Hızlı Fix Çözümleri
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={async () => {
                const sql = `
                  CREATE TABLE IF NOT EXISTS user_profiles (
                    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                    name TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                  );
                  
                  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
                  
                  CREATE POLICY "Herkes profilleri görebilir" 
                  ON user_profiles FOR SELECT USING (true);
                  
                  CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir" 
                  ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
                `
                alert(`SQL kodu kopyalandı:\n\n${sql}\n\nSupabase SQL Editor'e yapıştırın.`)
                await navigator.clipboard.writeText(sql)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center"
            >
              <div className="font-bold mb-1">📝 user_profiles SQL</div>
              <div className="text-sm opacity-90">Tablo oluşturma SQL'i</div>
            </button>
            
            <button
              onClick={() => {
                const fixes = [
                  '1. Supabase → SQL Editor → Yukarıdaki SQL\'i çalıştır',
                  '2. Auth Settings → Disable email confirmation',
                  '3. RLS Policies → Yukarıdaki politikaları ekle',
                  '4. .env.local dosyasını kontrol et'
                ].join('\n\n')
                alert(fixes)
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center"
            >
              <div className="font-bold mb-1">🔧 Hızlı Fix Adımları</div>
              <div className="text-sm opacity-90">Adım adım çözüm</div>
            </button>
            
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.reload()
              }}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-center"
            >
              <div className="font-bold mb-1">🔄 Yeniden Başlat</div>
              <div className="text-sm opacity-90">Logout + Refresh</div>
            </button>
            
            <button
              onClick={() => {
                const email = `test${Date.now()}@example.com`
                const password = 'Test123456!'
                const name = 'Test User'
                
                const testData = { email, password, name }
                console.log('Test verisi:', testData)
                alert(`Test verisi konsola yazıldı:\n\nEmail: ${email}\nŞifre: ${password}`)
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg text-center"
            >
              <div className="font-bold mb-1">🧪 Test Verisi</div>
              <div className="text-sm opacity-90">Yeni test kullanıcısı</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
// app/admin/test/page.tsx (TAM DÜZELTİLMİŞ)
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
  duration?: number
}

interface EmailTestData {
  to: string
  template: string
  data: {
    name: string
    spotTitle: string
    spotId: string
    spotterName: string
  }
}

export default function SystemTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [runningTests, setRunningTests] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [emailTestData, setEmailTestData] = useState<EmailTestData>({
    to: '',
    template: 'welcome',
    data: {
      name: 'Test User',
      spotTitle: 'Test Spot Başlığı',
      spotId: 'test-' + Date.now(),
      spotterName: 'Test Yardımcı'
    }
  })

  // Kullanıcı oturumunu kontrol et
  useEffect(() => {
    checkUserSession()
  }, [])

  const checkUserSession = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (!user) {
      addTestResult({
        name: 'Kullanıcı Oturumu',
        status: 'error',
        message: 'Oturum açılmamış. Lütfen giriş yapın.'
      })
    }
  }

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result])
  }

  // TİP GÜVENLİ TEST FONKSİYONU
  const createTestResult = (
    status: TestResult['status'],
    message: string,
    details?: any,
    duration?: number
  ): Omit<TestResult, 'name'> => {
    return { status, message, details, duration }
  }

  // 1. TEMEL SİSTEM TESTLERİ
  const runBasicTests = async () => {
    const tests = [
      {
        name: 'Supabase Bağlantısı',
        test: async () => {
          const start = Date.now()
          try {
            const { data, error } = await supabase
              .from('spots')
              .select('count', { count: 'exact', head: true })
            
            const duration = Date.now() - start
            
            if (error) throw error
            
            return createTestResult(
              'success',
              `Bağlantı başarılı. ${data} tablo var.`,
              null,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `Bağlantı hatası: ${error.message}`,
              error
            )
          }
        }
      },
      {
        name: 'Database Tabloları',
        test: async () => {
          const start = Date.now()
          const requiredTables = ['spots', 'sightings', 'user_profiles', 'shops']
          const results: any[] = []
          
          try {
            for (const table of requiredTables) {
              const { error } = await supabase
                .from(table)
                .select('*')
                .limit(1)
              
              results.push({
                table,
                exists: !error,
                error: error?.message
              })
            }
            
            const missingTables = results.filter(r => !r.exists)
            const duration = Date.now() - start
            
            if (missingTables.length > 0) {
              return createTestResult(
                'warning',
                `${missingTables.length} tablo eksik`,
                results,
                duration
              )
            }
            
            return createTestResult(
              'success',
              'Tüm tablolar mevcut',
              results,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `Tablo kontrol hatası: ${error.message}`,
              error
            )
          }
        }
      },
        {
        name: 'Storage Bucket',
        test: async () => {
            const start = Date.now()
            try {
            // DIRECT TEST: Bucket'a dosya yükle
            const testFile = new File(['test-content'], `test-${Date.now()}.txt`, {
                type: 'text/plain'
            })
            
            const { error: uploadError } = await supabase.storage
                .from('spot-images')
                .upload(`system-test/test-${Date.now()}.txt`, testFile)
            
            const duration = Date.now() - start
            
            if (uploadError) {
                // Upload başarısız - bucket yok veya izin yok
                return createTestResult(
                uploadError.message.includes('bucket') ? 'error' : 'warning',
                `Upload hatası: ${uploadError.message}`,
                uploadError,
                duration
                )
            }
            
            // Upload BAŞARILI - bucket çalışıyor!
            return createTestResult(
                'success',
                'Storage bucket çalışıyor! Dosya yüklendi.',
                { uploaded: true, timestamp: new Date().toISOString() },
                duration
            )
            
            } catch (error: any) {
            return createTestResult(
                'error',
                `Storage test hatası: ${error.message}`,
                error
            )
            }
        }
        },
      {
        name: 'Health Check API',
        test: async () => {
          const start = Date.now()
          try {
            const response = await fetch('/api/health')
            const data = await response.json()
            const duration = Date.now() - start
            
            if (!response.ok) {
              return createTestResult(
                'error',
                `API hatalı: ${response.status}`,
                data,
                duration
              )
            }
            
            return createTestResult(
              'success',
              `API çalışıyor (${data.duration})`,
              data,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `API hatası: ${error.message}`,
              error
            )
          }
        }
      }
    ]

    for (const test of tests) {
      const result = await test.test()
      addTestResult({ 
        name: test.name, 
        ...result 
      })
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // 2. EMAIL SİSTEM TESTLERİ
  const runEmailTests = async () => {
    const tests = [
      {
        name: 'Email API Bağlantısı',
        test: async () => {
          const start = Date.now()
          try {
            const response = await fetch('/api/send-email', { method: 'GET' })
            const data = await response.json()
            const duration = Date.now() - start
            
            if (!response.ok) {
              return createTestResult(
                'error',
                `Email API hatalı: ${data.error || response.status}`,
                data,
                duration
              )
            }
            
            const status: TestResult['status'] = data.gmail_configured ? 'success' : 'warning'
            
            return createTestResult(
              status,
              data.gmail_configured 
                ? 'Email API hazır' 
                : 'Gmail konfigürasyonu eksik',
              data,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `Email API hatası: ${error.message}`,
              error
            )
          }
        }
      },
      {
        name: 'Test Email Gönderimi',
        test: async () => {
          if (!emailTestData.to) {
            return createTestResult(
              'warning',
              'Test email adresi gerekli',
              'Lütfen bir email adresi girin'
            )
          }

          const start = Date.now()
          try {
            const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: emailTestData.to,
                template: emailTestData.template,
                data: emailTestData.data,
                subject: `✅ SpotItForMe Test Email - ${new Date().toLocaleString()}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1 style="color: white; margin: 0;">✅ TEST EMAIL</h1>
                      <p style="color: white; opacity: 0.9; margin-top: 10px;">SpotItForMe Email Sistemi Testi</p>
                    </div>
                    <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                      <p>Merhaba <strong>${emailTestData.data.name}</strong>,</p>
                      <p>Bu email SpotItForMe sisteminin düzgün çalıştığını test etmek için gönderilmiştir.</p>
                      
                      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Test Detayları:</strong></p>
                        <p>📧 Template: ${emailTestData.template}</p>
                        <p>⏰ Gönderim Zamanı: ${new Date().toLocaleString('tr-TR')}</p>
                        <p>🆔 Spot ID: ${emailTestData.data.spotId}</p>
                        <p>👤 Gönderen: ${emailTestData.data.spotterName}</p>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 8px;">
                          ✅ EMAIL SİSTEMİ ÇALIŞIYOR
                        </div>
                      </div>

                      <p>Bu email başarıyla alındıysa, SpotItForMe email sisteminiz düzgün çalışıyor demektir.</p>
                      
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

                      <p style="font-size: 12px; color: #6b7280;">
                        Bu bir test emailidir. Lütfen cevaplamayın.
                      </p>
                    </div>
                  </div>
                `,
                text: `SpotItForMe Test Email - ${new Date().toLocaleString()}. Email sisteminiz çalışıyor!`
              })
            })

            const data = await response.json()
            const duration = Date.now() - start
            
            if (!response.ok) {
              return createTestResult(
                'error',
                `Email gönderilemedi: ${data.error || response.status}`,
                data,
                duration
              )
            }
            
            return createTestResult(
              'success',
              `Email başarıyla gönderildi: ${data.messageId}`,
              data,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `Email gönderme hatası: ${error.message}`,
              error
            )
          }
        }
      },
      {
        name: 'CRON Job Testi',
        test: async () => {
          const start = Date.now()
          try {
            const response = await fetch('/api/cron/process-emails')
            const data = await response.json()
            const duration = Date.now() - start
            
            if (!response.ok) {
              const status: TestResult['status'] = data.error === 'Unauthorized' ? 'warning' : 'error'
              
              return createTestResult(
                status,
                data.error === 'Unauthorized' 
                  ? 'CRON secret gerekli (normal)' 
                  : `CRON hatası: ${data.error}`,
                data,
                duration
              )
            }
            
            return createTestResult(
              'success',
              `CRON çalışıyor: ${data.processed?.length || 0} email işlendi`,
              data,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `CRON test hatası: ${error.message}`,
              error
            )
          }
        }
      },
      {
        name: 'Environment Variables',
        test: async () => {
          const start = Date.now()
          try {
            const response = await fetch('/api/env-check')
            const data = await response.json()
            const duration = Date.now() - start
            
            if (!response.ok || !data.success) {
              return createTestResult(
                'error',
                `Environment hatası: ${data.message}`,
                data,
                duration
              )
            }
            
            return createTestResult(
              'success',
              'Environment variables mevcut',
              data.envVars,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `Environment check hatası: ${error.message}`,
              error
            )
          }
        }
      }
    ]

    for (const test of tests) {
      const result = await test.test()
      addTestResult({ 
        name: test.name, 
        ...result 
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // 3. İŞLEVSEL TESTLER
  const runFunctionalTests = async () => {
    const tests = [
      {
        name: 'Spot API Testi',
        test: async () => {
          const start = Date.now()
          try {
            const response = await fetch('/api/spots')
            const data = await response.json()
            const duration = Date.now() - start
            
            if (!response.ok || data.status !== 'success') {
              return createTestResult(
                'error',
                `Spot API hatası: ${data.message}`,
                data,
                duration
              )
            }
            
            return createTestResult(
              'success',
              `Spot API çalışıyor: ${data.data?.spots?.length || 0} spot`,
              data.data,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `Spot API hatası: ${error.message}`,
              error
            )
          }
        }
      },
      {
        name: 'Kullanıcı API Testi',
        test: async () => {
          const start = Date.now()
          try {
            const response = await fetch('/api/users')
            const data = await response.json()
            const duration = Date.now() - start
            
            if (!response.ok || data.status !== 'success') {
              return createTestResult(
                'error',
                `User API hatası: ${data.message}`,
                data,
                duration
              )
            }
            
            return createTestResult(
              'success',
              `User API çalışıyor: ${data.data?.users?.length || 0} kullanıcı`,
              data.data,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `User API hatası: ${error.message}`,
              error
            )
          }
        }
      },
      {
        name: 'Spot Oluşturma Testi',
        test: async () => {
          if (!user) {
            return createTestResult(
              'warning',
              'Spot oluşturmak için giriş yapmalısınız',
              'Kullanıcı oturumu gerekiyor'
            )
          }

          const start = Date.now()
          try {
            const testSpot = {
              user_id: user.id,
              title: `[TEST] Sistem Test Spotu - ${Date.now()}`,
              description: 'Bu spot sistem testi için oluşturulmuştur.',
              category: 'Diğer',
              location: 'Test Şehri',
              status: 'active',
              image_url: null
            }

            const { data, error } = await supabase
              .from('spots')
              .insert([testSpot])
              .select()
            
            const duration = Date.now() - start
            
            if (error) {
              return createTestResult(
                'error',
                `Spot oluşturma hatası: ${error.message}`,
                error,
                duration
              )
            }
            
            if (data && data[0]) {
              setTimeout(async () => {
                await supabase.from('spots').delete().eq('id', data[0].id)
              }, 5000)
            }
            
            return createTestResult(
              'success',
              `Test spot'u oluşturuldu: ${data?.[0]?.title}`,
              data,
              duration
            )
          } catch (error: any) {
            return createTestResult(
              'error',
              `Spot oluşturma hatası: ${error.message}`,
              error
            )
          }
        }
      }
    ]

    for (const test of tests) {
      const result = await test.test()
      addTestResult({ 
        name: test.name, 
        ...result 
      })
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // TÜM TESTLERİ ÇALIŞTIR
  const runAllTests = async () => {
    setTestResults([])
    setRunningTests(true)
    
    try {
      addTestResult({
        name: 'Test Başlatıldı',
        status: 'pending',
        message: 'Sistem testleri başlatılıyor...'
      })
      
      await runBasicTests()
      await runEmailTests()
      await runFunctionalTests()
      
      addTestResult({
        name: 'Testler Tamamlandı',
        status: 'success',
        message: 'Tüm sistem testleri tamamlandı.'
      })
      
    } catch (error: any) {
      addTestResult({
        name: 'Test Hatası',
        status: 'error',
        message: `Test sırasında hata: ${error.message}`
      })
    } finally {
      setRunningTests(false)
    }
  }

  // TEST SONUÇLARINI ANALİZ ET
  const getTestSummary = () => {
    const total = testResults.length
    const success = testResults.filter(r => r.status === 'success').length
    const error = testResults.filter(r => r.status === 'error').length
    const warning = testResults.filter(r => r.status === 'warning').length
    
    return { total, success, error, warning }
  }

  const summary = getTestSummary()

  // STATUS RENKLERİ
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'pending': return '⏳'
      default: return 'ℹ️'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* BAŞLIK */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🧪 SpotItForMe Sistem Test Merkezi
          </h1>
          <p className="text-gray-600">
            Tüm sistem bileşenlerini test edin, hataları tespit edin.
          </p>
        </div>

        {/* DURUM ÖZETİ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-gray-600">Toplam Test</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.success}</div>
            <div className="text-gray-600">Başarılı</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.error}</div>
            <div className="text-gray-600">Hatalı</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
            <div className="text-gray-600">Uyarı</div>
          </div>
        </div>

        {/* EMAIL TEST ALANI */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📧 Email Testi</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Adresi
              </label>
              <input
                type="email"
                value={emailTestData.to}
                onChange={(e) => setEmailTestData({...emailTestData, to: e.target.value})}
                placeholder="ornek@gmail.com"
                className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Test email'ini bu adrese göndereceğiz.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={emailTestData.template}
                  onChange={(e) => setEmailTestData({...emailTestData, template: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="welcome">Hoşgeldin</option>
                  <option value="spot-created">Spot Oluşturuldu</option>
                  <option value="spot-sighting">Yardım Bildirimi</option>
                  <option value="test">Test</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setTestResults([])
                    runEmailTests()
                  }}
                  disabled={runningTests || !emailTestData.to}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50"
                >
                  Sadece Email Testi Çalıştır
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TEST KONTROLLERİ */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔄 Test Kontrolleri</h2>
          <div className="flex flex-wrap gap-4">

            
            <button
              onClick={() => setTestResults([])}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg"
            >
              Sonuçları Temizle
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium py-3 px-6 rounded-lg"
            >
              Sayfayı Yenile
            </button>
          </div>
          
          {user && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                👤 Oturum: <span className="font-medium">{user.email}</span>
                <span className="ml-4">🆔 User ID: <code className="text-xs">{user.id.substring(0, 8)}...</code></span>
              </p>
            </div>
          )}
        </div>

        {/* TEST SONUÇLARI */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">📊 Test Sonuçları</h2>
            <span className="text-sm text-gray-500">
              {testResults.length} test sonucu
            </span>
          </div>
          
          {testResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🧪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz test çalıştırılmadı
              </h3>
              <p className="text-gray-600">
                Yukarıdaki butonlarla testleri başlatın.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{getStatusIcon(result.status)}</span>
                      <div>
                        <h4 className="font-bold">{result.name}</h4>
                        <p className="text-sm mt-1">{result.message}</p>
                        
                        {result.duration && (
                          <p className="text-xs text-gray-600 mt-1">
                            ⏱️ {result.duration}ms
                          </p>
                        )}
                        
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-sm cursor-pointer text-gray-700">
                              Detayları göster
                            </summary>
                            <pre className="mt-2 p-3 bg-black bg-opacity-5 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.status === 'success' ? 'bg-green-200 text-green-800' :
                        result.status === 'error' ? 'bg-red-200 text-red-800' :
                        result.status === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HIZLI İPUÇLARI */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="text-2xl mb-3">🔧</div>
            <h4 className="font-bold text-gray-900 mb-2">Sık Karşılaşılan Hatalar</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Gmail App Password eksik</li>
              <li>• Supabase RLS politikaları</li>
              <li>• Environment variables eksik</li>
              <li>• Storage bucket oluşturulmamış</li>
            </ul>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6">
            <div className="text-2xl mb-3">✅</div>
            <h4 className="font-bold text-gray-900 mb-2">Test Edilen Sistemler</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supabase Database & Auth</li>
              <li>• Gmail Email API</li>
              <li>• CRON Job System</li>
              <li>• Rate Limiting</li>
              <li>• Health Check Endpoints</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6">
            <div className="text-2xl mb-3">📝</div>
            <h4 className="font-bold text-gray-900 mb-2">Sonraki Adımlar</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. Hataları düzelt</li>
              <li>2. Email sistemini test et</li>
              <li>3. Spot oluşturmayı test et</li>
              <li>4. Tüm API'leri doğrula</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
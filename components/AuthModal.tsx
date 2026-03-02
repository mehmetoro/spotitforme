// components/AuthModal.tsx - DEBUG VERSİYON
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email-server'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [debugLog, setDebugLog] = useState<string[]>([])

  const addDebugLog = (message: string) => {
    console.log(`🔍 DEBUG: ${message}`)
    setDebugLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`])
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')
    setDebugLog([])

    addDebugLog('Form submit başladı')
    addDebugLog(`Mode: ${isLogin ? 'Login' : 'Register'}`)
    addDebugLog(`Email: ${email}, Name: ${name}`)

    try {
      if (isLogin) {
        // GİRİŞ YAP
        addDebugLog('Supabase signInWithPassword çağrılıyor...')
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        addDebugLog(`SignIn response: ${error ? 'Error: ' + error.message : 'Success'}`)
        console.log('SignIn full response:', { data, error })
        
        if (error) throw error
        
        setSuccessMessage('Başarıyla giriş yaptınız!')
        addDebugLog('Giriş başarılı, yönlendirme bekleniyor...')
        
        setTimeout(() => {
          onClose()
          if (onSuccess) {
            onSuccess()
          } else {
            window.location.reload()
          }
        }, 1500)
        
      } else {
        // KAYIT OL
        addDebugLog('Kayıt işlemi başlatılıyor...')
        
        // 1. Önce auth kaydı
        addDebugLog('Supabase signUp çağrılıyor...')
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        
        addDebugLog(`Auth signUp response: ${authError ? 'Error: ' + authError.message : 'Success'}`)
        console.log('Auth signUp full response:', { authData, authError })
        
        if (authError) {
          addDebugLog(`Auth error details: ${JSON.stringify(authError, null, 2)}`)
          throw authError
        }
        
        if (authData?.user) {
          addDebugLog(`Auth başarılı! User ID: ${authData.user.id}`)
          addDebugLog(`User confirmed: ${authData.user.confirmed_at ? 'Evet' : 'Hayır'}`)
          
          // 2. user_profiles tablosuna kayıt
          try {
            addDebugLog('user_profiles tablosuna kayıt yapılıyor...')
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: authData.user.id,
                name: name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
            
            addDebugLog(`Profile insert response: ${profileError ? 'Error: ' + profileError.message : 'Success'}`)
            console.log('Profile insert full response:', { profileData, profileError })
            
            if (profileError) {
              addDebugLog(`Profile error (devam ediliyor): ${profileError.message}`)
              // Profile kaydı başarısız olsa bile devam et
            } else {
              addDebugLog('Profile kaydı başarılı!')
            }
          } catch (profileErr: any) {
            addDebugLog(`Profile exception: ${profileErr.message}`)
            console.warn('Profile kaydı exception:', profileErr)
          }
          
          // 3. Email gönder
          try {
            addDebugLog('Welcome email gönderiliyor...')
            const result = await sendWelcomeEmail(email, name)
            addDebugLog(`Email gönderim sonucu: ${result.success ? 'Başarılı' : 'Başarısız'}`)
            
            if (result.success) {
              setSuccessMessage(`🎉 Hoş geldiniz ${name}! Kaydınız başarıyla oluşturuldu.`)
            } else {
              setSuccessMessage(`✅ Kaydınız başarıyla oluşturuldu ${name}! (Email gönderilemedi)`)
            }
          } catch (emailError: any) {
            addDebugLog(`Email error: ${emailError.message}`)
            console.warn('Email gönderilemedi:', emailError)
            setSuccessMessage(`✅ Kaydınız başarıyla oluşturuldu ${name}!`)
          }
          
          addDebugLog('Kayıt tamamlandı, yönlendirme bekleniyor...')
          setTimeout(() => {
            onClose()
            if (onSuccess) {
              onSuccess()
            } else {
              window.location.href = '/profile'
            }
          }, 2000)
        } else {
          addDebugLog('Auth data var ama user yok!')
          throw new Error('Kullanıcı oluşturulamadı')
        }
      }

    } catch (err: any) {
      console.error('Auth error details:', err)
      addDebugLog(`Catch error: ${err.message}`)
      addDebugLog(`Error stack: ${err.stack}`)
      
      let errorMessage = err.message || 'Bir hata oluştu'
      
      // Detaylı hata mesajları
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Geçersiz email veya şifre'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Lütfen email adresinizi doğrulayın (spam klasörünüzü kontrol edin)'
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Bu email adresi zaten kayıtlı. Lütfen giriş yapın veya şifrenizi sıfırlayın.'
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'Şifre en az 6 karakter olmalıdır'
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Geçersiz email adresi formatı'
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'Çok fazla deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.'
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Ağ hatası. Lütfen internet bağlantınızı kontrol edin.'
      } else if (errorMessage.includes('duplicate key')) {
        errorMessage = 'Bu kullanıcı zaten kayıtlı'
      } else if (errorMessage.includes('JWT')) {
        errorMessage = 'Kimlik doğrulama hatası. Lütfen sayfayı yenileyin.'
      }
      
      setError(`${errorMessage} (Lütfen browser konsolunu kontrol edin)`)
      
    } finally {
      setLoading(false)
      addDebugLog('İşlem tamamlandı (finally)')
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setSuccessMessage('')
    setDebugLog([])
    onClose()
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccessMessage('')
    setDebugLog([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {isLogin 
              ? 'Spot oluşturmak ve yardım etmek için giriş yapın' 
              : 'Topluluğumuza katılın, kayıp ürünleri birlikte bulalım'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ahmet Yılmaz"
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ornek@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              minLength={6}
              required
              disabled={loading}
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Şifreniz en az 6 karakter olmalıdır
              </p>
            )}
          </div>

          {/* Debug Log (sadece development'da) */}
          {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg border border-gray-700 max-h-40 overflow-y-auto">
              <div className="text-xs font-mono">
                <div className="font-bold mb-1">🔍 DEBUG LOG:</div>
                {debugLog.map((log, index) => (
                  <div key={index} className="mb-1 border-b border-gray-800 pb-1 last:border-0">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Başarı Mesajı */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <div className="font-medium mb-1">Hata:</div>
              <div>{error}</div>
              <div className="mt-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    console.log('DEBUG LOG:', debugLog)
                    alert(`Debug log konsolda görüntülendi. Lütfen F12 ile konsolu açın.`)
                  }}
                  className="text-red-600 hover:text-red-800 underline mr-4"
                >
                  Debug Log'u Gör
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const testData = { email, name, isLogin }
                    console.log('TEST DATA:', testData)
                    alert(`Test data: ${JSON.stringify(testData)}`)
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Test Data'yı Gör
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </>
            ) : (
              isLogin ? 'Giriş Yap' : 'Hesap Oluştur'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="border-t p-6 text-center">
          <p className="text-gray-600">
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            <button
              onClick={switchMode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 font-medium ml-2 disabled:opacity-50"
            >
              {isLogin ? 'Kayıt Olun' : 'Giriş Yapın'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
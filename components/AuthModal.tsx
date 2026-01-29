// components/AuthModal.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      if (isLogin) {
        // GİRİŞ YAP
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        setSuccessMessage('✅ Başarıyla giriş yaptınız! Yönlendiriliyorsunuz...')
        
        // 1.5 saniye sonra modal'ı kapat ve sayfayı yenile
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1500)
        
      } else {
        // KAYIT OL
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          },
        })
        
        if (error) throw error
        
        // KAYIT BAŞARILI - HOŞGELDİN EMAIL'İ GÖNDER
        if (data.user) {
          try {
            // EMAIL GÖNDERMEYİ DENE
            console.log('📧 Hoşgeldin emaili gönderiliyor...')
            const emailSent = await sendWelcomeEmail(email, name)
            
            if (emailSent) {
              setSuccessMessage(`
                🎉 Tebrikler ${name}!
                
                • Hesabınız başarıyla oluşturuldu
                • Hoş geldin email'i gönderildi
                • Email doğrulama linki gönderildi
                
                Lütfen email'inizi kontrol edin (spam klasörüne bakın).
                Email doğrulama sayfasına yönlendiriliyorsunuz...
              `)
            } else {
              setSuccessMessage(`
                ✅ Hesabınız oluşturuldu ${name}!
                
                Ancak teknik bir nedenden email gönderilemedi.
                Giriş yapıp profilinizi düzenleyebilirsiniz.
                
                Yönlendiriliyorsunuz...
              `)
            }
          } catch (emailError) {
            console.warn('⚠️ Email gönderilemedi:', emailError)
            setSuccessMessage(`
              ✅ Hesabınız oluşturuldu ${name}!
              
              Giriş yapıp profilinizi düzenleyebilirsiniz.
              
              Yönlendiriliyorsunuz...
            `)
          }
          
          // 3 saniye sonra modal'ı kapat ve yönlendir
          setTimeout(() => {
            onClose()
            // Email doğrulama bekleme sayfasına yönlendir
            window.location.href = '/verify-email'
          }, 3000)
        }
      }

    } catch (err: any) {
      console.error('Auth error:', err)
      
      // Hata mesajlarını Türkçe'ye çevir
      let errorMessage = err.message || 'Bir hata oluştu'
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Geçersiz email veya şifre'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Lütfen email adresinizi doğrulayın'
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Bu email adresi zaten kayıtlı'
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'Şifre en az 6 karakter olmalıdır'
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Geçersiz email adresi'
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'Çok fazla deneme yaptınız, lütfen bekleyin'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setSuccessMessage('')
    onClose()
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccessMessage('')
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Başarı Mesajı */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg whitespace-pre-line">
              {successMessage}
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
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

          {/* Şifremi Unuttum (sadece girişte) */}
          {isLogin && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  window.location.href = '/forgot-password'
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
                disabled={loading}
              >
                Şifremi unuttum
              </button>
            </div>
          )}
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

          {/* Sosyal Giriş (Gelecekte eklenecek) */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500 mb-3">Veya sosyal medya ile devam edin</p>
            <div className="flex justify-center space-x-4">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 flex items-center"
                disabled
                title="Yakında eklenecek"
              >
                <span className="mr-2">🔵</span>
                Google
              </button>
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 flex items-center"
                disabled
                title="Yakında eklenecek"
              >
                <span className="mr-2">⚫</span>
                GitHub
              </button>
            </div>
          </div>

          {/* Gizlilik Politikası */}
          <div className="mt-6 text-xs text-gray-500">
            Devam ederek{' '}
            <button 
              className="text-blue-600 hover:underline"
              onClick={() => window.open('/terms', '_blank')}
              type="button"
            >
              Kullanım Koşulları
            </button>
            {' '}ve{' '}
            <button 
              className="text-blue-600 hover:underline"
              onClick={() => window.open('/privacy', '_blank')}
              type="button"
            >
              Gizlilik Politikası
            </button>
            {' '}nı kabul etmiş olursunuz.
          </div>
        </div>
      </div>

      {/* Email Sistemi Bilgilendirme (Sadece Development) */}
      {process.env.NODE_ENV === 'development' && !isLogin && (
        <div className="fixed bottom-4 left-4 bg-blue-100 text-blue-800 p-3 rounded-lg text-sm max-w-xs">
          <div className="font-bold mb-1">🔧 Development Modu</div>
          <div>Email: {email || '(boş)'}</div>
          <div>Şifre: {password ? '••••••' : '(boş)'}</div>
          <div className="mt-2 text-xs">
            App Password: <code className="bg-blue-200 px-1 rounded">ahfd vrzy kuen opmj</code>
          </div>
        </div>
      )}
    </div>
  )
}
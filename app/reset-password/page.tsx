// app/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const type = searchParams.get('type') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    // Token geçerliliğini kontrol et
    checkToken()
  }, [token])

  const checkToken = async () => {
    if (!token) {
      setIsValidToken(false)
      return
    }

    try {
      // Token'ı kontrol et
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })

      if (error) {
        console.error('Token geçersiz:', error)
        setIsValidToken(false)
      } else {
        setIsValidToken(true)
      }
    } catch (err) {
      console.error('Token kontrol hatası:', err)
      setIsValidToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validasyon
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    try {
      // Şifreyi güncelle
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
      
      // 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (err: any) {
      console.error('Şifre güncelleme hatası:', err)
      
      let errorMessage = err.message || 'Bir hata oluştu'
      
      if (errorMessage.includes('password')) {
        errorMessage = 'Geçersiz şifre formatı'
      } else if (errorMessage.includes('session')) {
        errorMessage = 'Oturum süresi doldu. Lütfen yeni bir şifre sıfırlama linki talep edin.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Token geçersizse
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container-custom py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                ⚠️
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Geçersiz veya Süresi Dolmuş Link
              </h1>
              <p className="text-gray-600 mb-6">
                Bu şifre sıfırlama linki geçersiz veya süresi dolmuş.
                Lütfen yeni bir şifre sıfırlama talebinde bulunun.
              </p>
              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
                >
                  Yeni Şifre Sıfırlama Linki İste
                </Link>
                <Link
                  href="/login"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg"
                >
                  Giriş Sayfasına Dön
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Başlık */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🔐
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Yeni Şifre Belirleyin
              </h1>
              <p className="text-gray-600">
                Yeni şifrenizi belirleyin ve hesabınıza giriş yapın
              </p>
            </div>

            {/* Başarı Mesajı */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">✅</span>
                  <div>
                    <p className="font-medium">Şifreniz başarıyla güncellendi!</p>
                    <p className="text-sm mt-1">
                      Yeni şifrenizle giriş yapabilirsiniz. 3 saniye içinde giriş sayfasına yönlendirileceksiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-600 mr-3">❌</span>
                  <div>
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Güçlü bir şifre seçin (harf, rakam, özel karakter kombinasyonu)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifreyi Tekrar Girin *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Şifreyi tekrar girin"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Şifrenizi doğrulamak için tekrar girin
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isValidToken}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Güncelleniyor...
                    </>
                  ) : (
                    'Şifremi Güncelle'
                  )}
                </button>
              </form>
            )}

            {/* Ek Bilgiler */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">⚠️ Güvenlik Uyarısı:</span> Şifrenizi kimseyle paylaşmayın. 
                    Hesabınızda şüpheli bir aktivite görürseniz hemen bizimle iletişime geçin.
                  </p>
                </div>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Giriş sayfasına dön
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Şifre Önerileri */}
          <div className="mt-8 bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-2">💡</span>
              Güçlü Şifre İpuçları
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>En az 8 karakter kullanın</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Büyük ve küçük harf karışımı kullanın</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Rakam ve özel karakter ekleyin (!@#$%^&*)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Kişisel bilgilerinizi (doğum tarihi, isim) kullanmayın</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Farklı hesaplar için farklı şifreler kullanın</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
// app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/email-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Supabase'den reset linki al
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) throw resetError

      // 2. Email gönder
      const resetLink = `${window.location.origin}/reset-password`
      const emailResult = await sendPasswordResetEmail(email, resetLink)

      if (!emailResult.success) {
        console.warn('Email gönderilemedi ama reset linki oluşturuldu')
      }

      setSuccess(true)
      
    } catch (err: any) {
      console.error('Şifre sıfırlama hatası:', err)
      
      let errorMessage = err.message || 'Bir hata oluştu'
      
      if (errorMessage.includes('rate limit')) {
        errorMessage = 'Çok fazla deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.'
      } else if (errorMessage.includes('email')) {
        errorMessage = 'Geçersiz email adresi'
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'Bu email adresiyle kayıtlı kullanıcı bulunamadı'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Başlık */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🔐
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Şifremi Unuttum
              </h1>
              <p className="text-gray-600">
                Email adresinizi girerek şifre sıfırlama linki alabilirsiniz
              </p>
            </div>

            {/* Başarı Mesajı */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">✅</span>
                  <div>
                    <p className="font-medium">Şifre sıfırlama linki gönderildi!</p>
                    <p className="text-sm mt-1">
                      <strong>{email}</strong> adresine şifre sıfırlama linkini gönderdik.
                      Email'inizi kontrol edin ve gelen linke tıklayın.
                    </p>
                    <p className="text-xs mt-2 text-green-600">
                      📧 Email gelmedi mi? Spam klasörünüzü kontrol edin.
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
                    Email Adresiniz *
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
                  <p className="text-gray-500 text-xs mt-2">
                    Kayıtlı olduğunuz email adresini girin
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gönderiliyor...
                    </>
                  ) : (
                    'Şifre Sıfırlama Linki Gönder'
                  )}
                </button>
              </form>
            )}

            {/* Ek Bilgiler */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">💡 Bilgilendirme:</span> Şifre sıfırlama linki 24 saat geçerlidir. 
                    Link'e tıkladıktan sonra yeni şifrenizi belirleyebilirsiniz.
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

                <div className="text-center text-sm text-gray-500">
                  Hesabınız yok mu?{' '}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Yeni hesap oluşturun
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Güvenlik İpuçları */}
          <div className="mt-8 bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-2">🔒</span>
              Güvenlik İpuçları
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Güçlü şifreler kullanın (en az 8 karakter, harf, rakam, özel karakter)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Farklı platformlarda aynı şifreyi kullanmayın</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Şifre sıfırlama linkini kimseyle paylaşmayın</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Şüpheli aktivitelerde hemen bizimle iletişime geçin</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
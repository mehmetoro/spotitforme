// app/forgot-password/page.tsx - SERVER ACTION KULLAN
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/email-server' // SERVER ACTION
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Supabase şifre sıfırlama linki oluştur
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectTo = `${siteUrl}/auth/callback`
      
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (resetError) {
        if (resetError.message?.includes('user not found')) {
          throw new Error('Bu email adresi ile kayıtlı kullanıcı bulunamadı')
        }
        throw resetError
      }

      // 2. EMAIL GÖNDER - SERVER ACTION
      const result = await sendPasswordResetEmail(email, redirectTo, 'Kullanıcı')
      
      if (!result.success) {
        console.warn('⚠️ Email gönderilemedi ama reset linki oluşturuldu:', result.message)
      }

      // 3. BAŞARILI
      setSuccess(true)

    } catch (err: any) {
      console.error('Şifre sıfırlama hatası:', err)
      
      let errorMessage = err.message || 'Bir hata oluştu'
      
      if (errorMessage.includes('rate limit')) {
        errorMessage = 'Çok fazla deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.'
      } else if (errorMessage.includes('not found') || errorMessage.includes('user not found')) {
        errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
      } else if (errorMessage.includes('email')) {
        errorMessage = 'Geçersiz email adresi'
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
          {!success ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
              <p className="text-gray-600 mb-8">
                Email adresinizi girin, size şifre sıfırlama linki gönderelim.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Adresiniz *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="ornek@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-red-600 mr-3">❌</span>
                      <span>{error}</span>
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
                      Gönderiliyor...
                    </>
                  ) : (
                    'Şifre Sıfırlama Linki Gönder'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <Link 
                  href="/" 
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Ana sayfaya dön
                </Link>
              </div>
            </div>
          ) : (
            /* Başarılı Mesajı */
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                ✅
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Gönderildi!</h2>
              <p className="text-gray-600 mb-6">
                <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik.
                Lütfen email kutunuzu kontrol edin.
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                >
                  Ana Sayfaya Dön
                </Link>
                
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg"
                >
                  Başka Email Gönder
                </button>
              </div>
            </div>
          )}

          {/* Yardım Bölümü */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="font-bold text-gray-900 mb-3">📧 Yardıma mı ihtiyacınız var?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Şifre sıfırlama linki email kutunuzda görünmüyorsa <strong>spam klasörünü</strong> kontrol edin</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Link <strong>1 saat</strong> içinde geçerlidir</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Hala sorun yaşıyorsanız: <a href="mailto:destek@spotitforme.com" className="text-blue-600 underline">destek@spotitforme.com</a></span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
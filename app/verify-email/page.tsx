// app/verify-email/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUserEmail(user.email || null)
      
      // Eğer email zaten doğrulanmışsa profile yönlendir
      if (user.email_confirmed_at) {
        router.push('/profile')
      }
    }
    
    setLoading(false)
  }

  const resendVerificationEmail = async () => {
    if (!userEmail) return
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      alert('✅ Doğrulama emaili tekrar gönderildi! Lütfen kontrol edin.')
    } catch (error) {
      console.error('Doğrulama emaili gönderilemedi:', error)
      alert('❌ Doğrulama emaili gönderilemedi. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            
            {/* Başarı İkonu */}
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✉️
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Email Doğrulama Gerekli
            </h1>
            
            {loading ? (
              <p className="text-gray-600">Yükleniyor...</p>
            ) : userEmail ? (
              <>
                <p className="text-gray-600 mb-6">
                  <strong>{userEmail}</strong> adresine bir doğrulama linki gönderdik.
                  Lütfen email'inizi kontrol edin ve linke tıklayarak hesabınızı doğrulayın.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-blue-800 mb-2">📋 Yapmanız Gerekenler:</h3>
                  <ol className="text-left text-blue-700 space-y-2 ml-4">
                    <li>1. Email kutunuzu açın</li>
                    <li>2. "SpotItForMe" email'ini bulun</li>
                    <li>3. "Hesabını Doğrula" butonuna tıklayın</li>
                    <li>4. Otomatik olarak yönlendirileceksiniz</li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={resendVerificationEmail}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
                  >
                    Doğrulama Email'ini Tekrar Gönder
                  </button>
                  
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg"
                  >
                    Daha Sonra Doğrularım → Profilime Git
                  </button>
                  
                  <a 
                    href="https://mail.google.com" 
                    target="_blank" 
                    className="inline-block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ↗️ Gmail'imi Aç
                  </a>
                </div>
              </>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Lütfen önce giriş yapın veya kayıt olun.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            )}
            
            {/* Yardım */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">Yardıma mı ihtiyacınız var?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Email'i bulamıyorsanız spam/junk klasörünü kontrol edin</li>
                <li>• Doğrulama linki 24 saat geçerlidir</li>
                <li>• Sorun devam ederse: destek@spotitforme.com</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
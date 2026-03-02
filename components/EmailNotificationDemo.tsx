// components/EmailNotificationDemo.tsx
'use client'

import { useState } from 'react'
import { emailService } from '@/lib/email-service'

export default function EmailNotificationDemo() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null)

  const handleTestNotification = async () => {
    if (!email || !email.includes('@')) {
      setResult({ success: false, message: 'Lütfen geçerli bir email adresi girin' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await emailService.sendSightingNotification(
        email,
        'Vintage Nikon Kamera Lens Test',
        'SpotItForMe Demo',
        'demo-spot-123',
        'Bu bir demo bildirimidir. SpotItForMe platformunda gerçek zamanlı yardım bildirimleri alacaksınız!',
        '1500',
        'İstanbul, Kadıköy'
      )

      if (response.success) {
        setResult({ 
          success: true, 
          message: `🎉 Demo bildirimi gönderildi! ${email} adresinizi kontrol edin. (Spam klasörüne bakmayı unutmayın)` 
        })
      } else {
        setResult({ 
          success: false, 
          message: `❌ Gönderilemedi: ${response.error || 'Bilinmeyen hata'}` 
        })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: '❌ Bir hata oluştu. Lütfen tekrar deneyin.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <span className="text-2xl text-white">📧</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Anında Email Bildirimleri
            </h2>
            <p className="text-xl text-gray-600">
              Birisi ürününüzü görünce anında haberiniz olsun. Spam'e düşmez, %100 ulaşır.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Sol taraf - Demo */}
              <div className="md:w-1/2 p-8 md:p-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Canlı Bildirim Demo
                </h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-green-600 text-xl">🎯</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Gerçek Zamanlı</h4>
                        <p className="text-sm text-gray-600">Anında email ve push bildirim</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 text-xl">✅</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">%100 Ulaşım Garantisi</h4>
                        <p className="text-sm text-gray-600">Spam'e düşmez, direkt gelen kutusu</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-purple-600 text-xl">🔔</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Özelleştirilebilir</h4>
                        <p className="text-sm text-gray-600">Hangi bildirimleri alacağınızı siz seçin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ taraf - Test Formu */}
              <div className="md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 md:p-12 text-white">
                <h3 className="text-2xl font-bold mb-2">Bildirim Sistemini Test Edin</h3>
                <p className="text-blue-100 mb-8">
                  Email adresinizi yazın, canlı bir yardım bildirimi gönderelim
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Email Adresiniz
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>

                  <button
                    onClick={handleTestNotification}
                    disabled={loading || !email}
                    className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {loading ? 'Gönderiliyor...' : '📬 Demo Bildirim Gönder'}
                  </button>

                  {result && (
                    <div className={`p-4 rounded-lg ${result.success ? 'bg-green-500/20' : 'bg-red-500/20'} border ${result.success ? 'border-green-500/30' : 'border-red-500/30'}`}>
                      <p className={result.success ? 'text-green-100' : 'text-red-100'}>
                        {result.message}
                      </p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-white/20">
                    <p className="text-sm text-blue-200">
                      💡 Gerçek bir spot oluşturduğunuzda, yardım geldiğinde böyle bir email alacaksınız.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt bilgi */}
            <div className="bg-gray-900 text-gray-300 p-6 text-center">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm">📊 <strong>24.578</strong> başarılı bildirim bu ay</p>
                </div>
                <div className="text-sm">
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full">
                    ⚡ Ort. 4.2 sn. bildirim süresi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
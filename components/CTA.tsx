'use client'

import { useRouter } from 'next/navigation'

export default function CTA() {
  const router = useRouter()

  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium mb-6">
            🎯 HEMEN BAŞLAYIN
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Aradığınız Ürünü Hemen Bulun
          </h2>
          
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Binlerce göz sizin için arasın. Ücretsiz kaydolun, spot oluşturun ve 
            kayıp ürünlerinizi topluluğumuzla bulun.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => router.push('/create-spot')}
              className="group bg-white hover:bg-gray-100 text-blue-900 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center"
            >
              <span className="mr-3">🚀</span>
              Ücretsiz Spot Oluştur
              <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
            </button>
            
            <button
              onClick={() => router.push('/spots')}
              className="group bg-transparent hover:bg-white hover:bg-opacity-10 text-white font-semibold py-4 px-8 rounded-xl border-2 border-white border-opacity-30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <span className="mr-3">🔍</span>
              Spot'ları İncele
              <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>

          {/* Özellikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl mb-4">🎁</div>
              <h4 className="text-white font-bold mb-2">Tamamen Ücretsiz</h4>
              <p className="text-blue-200 text-sm">
                Spot oluşturmak, yardım etmek, topluluğa katılmak tamamen ücretsiz
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="text-white font-bold mb-2">Hızlı Yardım</h4>
              <p className="text-blue-200 text-sm">
                Ortalama 24 saat içinde ilk yardım cevabını alırsınız
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl mb-4">🔒</div>
              <h4 className="text-white font-bold mb-2">Güvenli & Gizli</h4>
              <p className="text-blue-200 text-sm">
                Kişisel bilgileriniz güvende, sadece gerekli bilgiler paylaşılır
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
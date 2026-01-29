'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/spots?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const popularSearches = [
    'vintage kamera lensi',
    'eski çay makinesi parçası',
    'retro oyun konsolu',
    'antika saat',
    'yedek parça'
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Arka plan gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      
      {/* Dekoratif öğeler */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
      
      <div className="relative container-custom py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Ana başlık */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Bulunması zor ürünleri{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  toplulukla bulun
                </span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-100 -z-10 rounded-full"></span>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Aradığınız nadir, vintage veya üretimi durmuş ürünleri binlerce göz sizin için arasın. 
              Topluluğumuzun gücüyle imkansızı mümkün kılın.
            </p>
          </div>

          {/* ARAMA ÇUBUĞU - YENİ ve MODERN */}
          <div className="max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-2 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-grow relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ne aramıştınız? Örnek: 'vintage Nikon kamera lensi', 'eski Arçelik çay makinesi parçası'"
                      className="w-full pl-12 pr-4 py-4 text-lg border-0 focus:ring-0 focus:outline-none rounded-l-2xl"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Ara
                  </button>
                </div>
              </div>
              
              {/* Popüler aramalar */}
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-3">Popüler aramalar:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSearchQuery(search)}
                      className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200 transition-all duration-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* CTA Butonları */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/create-spot')}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <span className="mr-3">✨</span>
              Ücretsiz Spot Oluştur
              <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <button
              onClick={() => router.push('/spots')}
              className="group bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <span className="mr-3">🔍</span>
              Spot'ları Keşfet
              <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Güven işaretleri */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-6">Milyonlarca kullanıcıya güvenilen platform</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span className="text-sm font-medium">%100 Ücretsiz</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">🔒</span>
                </div>
                <span className="text-sm font-medium">Güvenli & Gizli</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">🤝</span>
                </div>
                <span className="text-sm font-medium">Topluluk Desteği</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">⚡</span>
                </div>
                <span className="text-sm font-medium">Hızlı Yardım</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
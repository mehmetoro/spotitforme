// app/spots/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SpotList from '@/components/SpotList'
import SearchFilters from '@/components/SearchFilters'
import EmailNotificationSettings from '@/components/EmailNotificationSettings'
import { supabase } from '@/lib/supabase'

export default function SpotsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : ''
  const [user, setUser] = useState<any>(null)
  const [showEmailSettings, setShowEmailSettings] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* BAŞLIK BÖLÜMÜ */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm Spot\'lar'}
              </h1>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Aradığınız ürünü bulmak için filtreleri kullanın' 
                  : 'Yardım edin, email bildirimleriyle anında haberdar olun'}
              </p>
            </div>
            
            {user && (
              <button
                onClick={() => setShowEmailSettings(!showEmailSettings)}
                className="inline-flex items-center bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 font-medium px-6 py-3 rounded-lg border border-blue-200"
              >
                <span className="mr-2">⚙️</span>
                Email Bildirim Ayarları
              </button>
            )}
          </div>

          {/* Email Ayarları Modal */}
          {showEmailSettings && (
            <div className="mb-6">
              <EmailNotificationSettings />
            </div>
          )}

          {/* İSTATİSTİK BANNER */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Aktif Spot</div>
              <div className="text-xs text-blue-500 mt-1">📧 Email bildirimli</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">2K+</div>
              <div className="text-sm text-gray-600">Topluluk Üyesi</div>
              <div className="text-xs text-green-500 mt-1">✅ Email aktif</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">150+</div>
              <div className="text-sm text-gray-600">Günlük Bildirim</div>
              <div className="text-xs text-purple-500 mt-1">⚡ Anında ulaşım</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">50+</div>
              <div className="text-sm text-gray-600">Şehir</div>
              <div className="text-xs text-orange-500 mt-1">📍 Konum bazlı</div>
            </div>
          </div>
          
          {/* ÇAĞRI KARTI */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-6">
                  <span className="text-3xl">📧</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Email Bildirim Sistemi Aktif!</h3>
                  <p className="text-blue-100">
                    Spot oluşturun, yardım gelince anında email alın. %100 ulaşım garantisi.
                  </p>
                </div>
              </div>
              <a
                href="/create-spot"
                className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg whitespace-nowrap text-center"
              >
                🚀 Spot Oluştur
              </a>
            </div>
          </div>
        </div>

        {/* ARA ÇUBUĞU */}
        <div className="mb-8">
          <form action="/spots" method="GET" className="relative">
            <div className="flex shadow-lg rounded-xl overflow-hidden">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Ne aramıştınız? Ürün adı, marka, model..."
                className="flex-grow px-6 py-4 text-lg border-0 focus:ring-0 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4"
              >
                🔍 Ara
              </button>
            </div>
          </form>
        </div>

        {/* FİLTRELER */}
        <div className="mb-8">
          <SearchFilters />
        </div>

        {/* SPOT LİSTESİ */}
        <div className="mb-12">
          <SpotList />
        </div>

        {/* EMAİL SİSTEMİ TANITIM */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8 md:p-12 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                📧 Neden Email Bildirim Sistemi?
              </h2>
              <p className="text-gray-300 text-xl">
                Anında haberdar olun, ürününüzü daha hızlı bulun
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-3">Anlık Bildirim</h3>
                <p className="text-gray-300">
                  Birisi ürününüzü görünce 5 saniye içinde email alırsınız
                </p>
              </div>
              
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-3">Spam Değil</h3>
                <p className="text-gray-300">
                  Özel DKIM imzalı email'ler, direkt gelen kutusuna ulaşır
                </p>
              </div>
              
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">Detaylı Bilgi</h3>
                <p className="text-gray-300">
                  Fotoğraf, konum, fiyat - tüm detaylar email'de
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              {user ? (
                <button
                  onClick={() => setShowEmailSettings(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-xl text-lg"
                >
                  ⚙️ Bildirim Ayarlarını Yap
                </button>
              ) : (
                <a
                  href="/login"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-12 rounded-xl text-lg inline-block"
                >
                  👤 Giriş Yap ve Email Aktif Et
                </a>
              )}
            </div>
          </div>
        </div>

        {/* BAŞARI HİKAYELERİ */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">🎯 Email ile Bulunan Ürünler</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                product: 'Vintage Kamera Lens',
                time: '2 saat',
                user: 'Ahmet Y.',
                story: 'Email bildirimi geldi, ertesi gün ürünü aldım!'
              },
              {
                product: 'Eski Model Saat',
                time: '6 saat', 
                user: 'Zeynep K.',
                story: 'Spam\'e düşmeden direkt ulaştı, çok memnunum.'
              },
              {
                product: 'Antika Vazo',
                time: '1 gün',
                user: 'Mehmet T.',
                story: 'Fotoğraf ve konum bilgisi email\'de vardı, kolayca buldum.'
              }
            ].map((story, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">📧</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{story.product}</h4>
                    <p className="text-sm text-gray-600">⏱️ {story.time} içinde bulundu</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{story.story}"</p>
                <div className="text-right">
                  <span className="text-sm text-gray-500">- {story.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
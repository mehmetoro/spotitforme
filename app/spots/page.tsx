// app/spots/page.tsx (GÜNCELLENMİŞ)
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SpotList from '@/components/SpotList'
import SearchFilters from '@/components/SearchFilters'
import { Suspense } from 'react'

export default function SpotsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* BAŞLIK BÖLÜMÜ */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm Spot\'lar'}
          </h1>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Aradığınız ürünü bulmak için filtreleri kullanın' 
              : 'Topluluğumuzun aradığı tüm ürünleri keşfedin ve yardım edin'}
          </p>
        </div>

        {/* ARA ÇUBUĞU */}
        <div className="mb-8">
          <form action="/spots" method="GET" className="relative">
            <div className="flex">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Ne aramıştınız? Ürün adı, marka, model..."
                className="flex-grow px-6 py-4 text-lg border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-r-xl"
              >
                Ara
              </button>
            </div>
          </form>
        </div>

        {/* FİLTRELER */}
        <Suspense fallback={<div>Filtreler yükleniyor...</div>}>
          <SearchFilters />
        </Suspense>

        {/* SPOT LİSTESİ */}
        <SpotList />

        {/* HIZLI İŞLEMLER */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Aradığınızı Bulamadınız mı?</h3>
            <p className="mb-6 opacity-90">
              Topluluğumuza sorun! Binlerce kullanıcı sizin için göz kulak olacak.
            </p>
            <a
              href="/create-spot"
              className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg"
            >
              Ücretsiz Spot Oluşturun
            </a>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Sık Aradıklarınızı Kaydedin</h3>
            <p className="mb-6 opacity-90">
              Favori aramalarınızı kaydedin, yeni spot'lar eklenince haber verelim.
            </p>
            <button className="inline-block bg-white text-green-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg">
              🛑 Yakında Eklenecek
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
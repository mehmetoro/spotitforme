// app/spots/page.tsx (GÜNCELLENMİŞ)
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SpotList from '@/components/SpotList'
import SearchFilters from '@/components/SearchFilters'

export default function SpotsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // SearchParams'ı doğru şekilde al
  const getSearchParam = (key: string): string => {
    const param = searchParams[key]
    if (Array.isArray(param)) {
      return param[0] || ''
    }
    return param || ''
  }

  const searchQuery = getSearchParam('search')
  const category = getSearchParam('category')
  const location = getSearchParam('location')
  const status = getSearchParam('status')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        {/* BAŞLIK BÖLÜMÜ */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {searchQuery 
              ? `"${searchQuery}" için sonuçlar` 
              : category !== 'all' && category 
                ? `${category} Spot'ları` 
                : location !== 'all' && location 
                  ? `${location} Spot'ları` 
                  : 'Tüm Spot\'lar'}
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
        <SearchFilters />

        {/* SPOT LİSTESİ */}
        <SpotList />

        {/* ÇAĞRI KARTI */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-2xl font-bold mb-2">Aradığınızı bulamadınız mı?</h3>
              <p className="opacity-90">
                Topluluğumuza sorun! Binlerce kullanıcı sizin için göz kulak olacak.
              </p>
            </div>
            <a
              href="/create-spot"
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl whitespace-nowrap"
            >
              Ücretsiz Spot Oluşturun
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
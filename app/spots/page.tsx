// app/spots/page.tsx - BASİTLEŞTİRİLMİŞ
import SpotList from '@/components/SpotList'
import SearchFilters from '@/components/SearchFilters'

export default function SpotsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
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
      <main className="container-custom py-4 md:py-8">
        {/* Layout'ta zaten header reklamı var */}
        
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
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

        {/* Arama çubuğu */}
        <div className="mb-6">
          <form action="/spots" method="GET" className="relative">
            <div className="flex">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Ne aramıştınız? Ürün adı, marka, model..."
                className="flex-grow px-4 md:px-6 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 md:px-8 py-3 md:py-4 rounded-r-xl"
              >
                Ara
              </button>
            </div>
          </form>
        </div>

        <SearchFilters />

        {/* Spot listesi (içinde native reklamlar var) */}
        <div className="mt-6">
          <SpotList />
        </div>

        {/* Layout'ta zaten footer reklamı var */}
      </main>
    </div>
  )
}
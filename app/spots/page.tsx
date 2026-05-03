// app/spots/page.tsx - BASİTLEŞTİRİLMİŞ
import { cookies, headers } from 'next/headers'
import type { Metadata } from 'next'
import SpotList from '@/components/SpotList'
import SearchFilters from '@/components/SearchFilters'
import ResponsiveAd from '@/components/ResponsiveAd'

const textByLocale = {
  tr: {
    allSpots: "Tum Spot'lar",
    resultsFor: (q: string) => `"${q}" icin sonuclar`,
    spotsByCategory: (c: string) => `${c} Spot'lari`,
    spotsByLocation: (l: string) => `${l} Spot'lari`,
    descSearch: 'Aradiginiz urunu bulmak icin filtreleri kullanin',
    descAll: 'Toplulugumuzun aradigi tum urunleri kesfedin ve yardim edin',
    searchPlaceholder: 'Ne aramistik? Urun adi, marka, model...',
    searchButton: 'Ara',
  },
  en: {
    allSpots: 'All Spots',
    resultsFor: (q: string) => `Results for "${q}"`,
    spotsByCategory: (c: string) => `${c} Spots`,
    spotsByLocation: (l: string) => `${l} Spots`,
    descSearch: 'Use filters to find the item you are searching for',
    descAll: 'Explore all items requested by the community and help out',
    searchPlaceholder: 'What were you looking for? Product, brand, model...',
    searchButton: 'Search',
  },
  de: {
    allSpots: 'Alle Spots',
    resultsFor: (q: string) => `Ergebnisse fur "${q}"`,
    spotsByCategory: (c: string) => `${c} Spots`,
    spotsByLocation: (l: string) => `${l} Spots`,
    descSearch: 'Nutze Filter, um dein gesuchtes Produkt zu finden',
    descAll: 'Entdecke alle von der Community gesuchten Produkte',
    searchPlaceholder: 'Wonach suchst du? Produkt, Marke, Modell...',
    searchButton: 'Suchen',
  },
  fr: {
    allSpots: 'Tous les spots',
    resultsFor: (q: string) => `Resultats pour "${q}"`,
    spotsByCategory: (c: string) => `Spots ${c}`,
    spotsByLocation: (l: string) => `Spots ${l}`,
    descSearch: 'Utilisez les filtres pour trouver votre produit',
    descAll: 'Explorez tous les produits recherches par la communaute',
    searchPlaceholder: 'Que cherchez-vous ? Produit, marque, modele...',
    searchButton: 'Rechercher',
  },
  es: {
    allSpots: 'Todos los spots',
    resultsFor: (q: string) => `Resultados para "${q}"`,
    spotsByCategory: (c: string) => `Spots de ${c}`,
    spotsByLocation: (l: string) => `Spots de ${l}`,
    descSearch: 'Usa filtros para encontrar el producto que buscas',
    descAll: 'Explora todos los productos buscados por la comunidad',
    searchPlaceholder: 'Que buscabas? Producto, marca, modelo...',
    searchButton: 'Buscar',
  },
  ru: {
    allSpots: 'Vse spoty',
    resultsFor: (q: string) => `Rezultaty dlya "${q}"`,
    spotsByCategory: (c: string) => `${c} spoty`,
    spotsByLocation: (l: string) => `${l} spoty`,
    descSearch: 'Ispolzuyte filtry, chtoby nayti nuzhnyy tovar',
    descAll: 'Smotrite vse zaprosy soobshchestva i pomogayte',
    searchPlaceholder: 'Chto vy iskali? Tovar, brend, model...',
    searchButton: 'Iskat',
  },
} as const

const metaByLocale = {
  tr: { title: "Spot'lar | SpotItForMe", description: "Toplulukla birlikte ürün, nesne ve kişileri bul. Tüm aktif spotları keşfet." },
  en: { title: 'Spots | SpotItForMe', description: 'Find products, objects and people with community help. Explore all active spots.' },
  de: { title: 'Spots | SpotItForMe', description: 'Finde Produkte, Objekte und Personen mit Community-Hilfe. Entdecke alle aktiven Spots.' },
  fr: { title: 'Spots | SpotItForMe', description: 'Trouvez produits, objets et personnes avec l\'aide de la communauté. Explorez tous les spots actifs.' },
  es: { title: 'Spots | SpotItForMe', description: 'Encuentra productos, objetos y personas con ayuda de la comunidad. Explora todos los spots activos.' },
  ru: { title: 'Споты | SpotItForMe', description: 'Находите товары, объекты и людей с помощью сообщества. Исследуйте все активные споты.' },
}

export async function generateMetadata(): Promise<Metadata> {
  const localeFromHeader = headers().get('x-locale')
  const localeCookie = cookies().get('NEXT_LOCALE')?.value
  const locale = (localeFromHeader && localeFromHeader in metaByLocale)
    ? (localeFromHeader as keyof typeof metaByLocale)
    : (localeCookie && localeCookie in metaByLocale)
      ? (localeCookie as keyof typeof metaByLocale)
      : 'tr'
  const m = metaByLocale[locale]
  return {
    title: m.title,
    description: m.description,
    openGraph: { title: m.title, description: m.description },
  }
}

export default function SpotsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const localeFromHeader = headers().get('x-locale')
  const localeCookie = cookies().get('NEXT_LOCALE')?.value
  const locale = (localeFromHeader && localeFromHeader in textByLocale)
    ? (localeFromHeader as keyof typeof textByLocale)
    : (localeCookie && localeCookie in textByLocale)
      ? (localeCookie as keyof typeof textByLocale)
      : 'tr'
  const t = textByLocale[locale]

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
              ? t.resultsFor(searchQuery)
              : category !== 'all' && category 
                ? t.spotsByCategory(category)
                : location !== 'all' && location 
                  ? t.spotsByLocation(location)
                  : t.allSpots}
          </h1>
          
          <p className="text-gray-600">
            {searchQuery 
              ? t.descSearch
              : t.descAll}
          </p>
        </div>

        {/* Arama çubuğu */}
        <div className="mb-6">
          <form action="/search-results" method="GET" className="relative">
            <div className="flex">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder={t.searchPlaceholder}
                className="flex-grow px-4 md:px-6 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 md:px-8 py-3 md:py-4 rounded-r-xl"
              >
                {t.searchButton}
              </button>
            </div>
          </form>
        </div>

        <SearchFilters />

        {/* Promotion Banner */}
        <div className="my-8">
          <ResponsiveAd placement="inline" />
        </div>

        {/* Spot listesi (içinde native reklamlar var) */}
        <div className="mt-6">
          <SpotList />
        </div>

        {/* Layout'ta zaten footer reklamı var */}
      </main>
    </div>
  )
}
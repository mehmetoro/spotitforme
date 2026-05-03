
'use client'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const nadirText = {
  tr: { title: 'Nadir Keşifler', subtitle: 'Topluluğun en nadir, en ilginç ve en az bulunan spotlarını burada keşfet! Her gün güncellenen nadir seyahatler, koleksiyoncular ve meraklılar için özel olarak listelenir.', boxTitle: 'Nadirlik Neye Göre?', items: ['Toplulukta az sayıda bulunan veya az paylaşılmış spotlar', 'Koleksiyoncuların ve uzmanların önerdiği özel paylaşımlar', 'Yüksek etkileşim alan, ancak az bulunan ürünler'], btn: 'Tüm Keşifleri Gör' },
  en: { title: 'Rare Finds', subtitle: 'Discover the rarest, most interesting and least-found spots in the community! Rare travels updated daily, specially listed for collectors and enthusiasts.', boxTitle: 'What Makes It Rare?', items: ['Spots rarely found or shared in the community', 'Special shares recommended by collectors and experts', 'Highly interactive but hard-to-find items'], btn: 'See All Discoveries' },
  de: { title: 'Seltene Funde', subtitle: 'Entdecke die seltensten, interessantesten und am schwierigsten zu findenden Spots der Community!', boxTitle: 'Was macht es selten?', items: ['In der Community selten gefundene oder geteilte Spots', 'Besondere Empfehlungen von Sammlern und Experten', 'Hoch interaktive, aber schwer zu findende Artikel'], btn: 'Alle Entdeckungen ansehen' },
  fr: { title: 'Trouvailles Rares', subtitle: 'Découvrez les spots les plus rares, les plus intéressants et les moins trouvés de la communauté !', boxTitle: 'Qu\'est-ce qui le rend rare ?', items: ['Spots rarement trouvés ou partagés dans la communauté', 'Partages spéciaux recommandés par des collectionneurs', 'Articles très populaires mais difficiles à trouver'], btn: 'Voir toutes les découvertes' },
  es: { title: 'Hallazgos Raros', subtitle: '¡Descubre los spots más raros, interesantes y difíciles de encontrar de la comunidad!', boxTitle: '¿Qué lo hace raro?', items: ['Spots raramente encontrados o compartidos en la comunidad', 'Publicaciones especiales recomendadas por coleccionistas', 'Artículos muy populares pero difíciles de encontrar'], btn: 'Ver todos los descubrimientos' },
  ru: { title: 'Редкие Находки', subtitle: 'Открывайте самые редкие, интересные и труднодоступные споты в сообществе!', boxTitle: 'Что делает его редким?', items: ['Споты, редко встречающиеся в сообществе', 'Особые рекомендации от коллекционеров и экспертов', 'Популярные, но труднодоступные товары'], btn: 'Смотреть все находки' },
} as const

export default function NadirPage() {
  const locale = useCurrentLocale()
  const t = nadirText[locale as keyof typeof nadirText] ?? nadirText.tr
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-yellow-700 mb-6">{t.title}</h1>
          <p className="text-lg text-gray-700 text-center mb-8">{t.subtitle}</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl mb-8">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">{t.boxTitle}</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              {t.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="text-center mt-8">
            <a href="/discovery" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">
              {t.btn}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

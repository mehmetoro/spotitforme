'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const heroText = {
  tr: {
    title1: 'Bulunması zor ürünleri',
    title2: 'toplulukla bulun',
    subtitle: 'Aradığınız nadir, vintage veya üretimi durmuş ürünleri binlerce göz sizin için arasın. Topluluğumuzun gücüyle imkansızı mümkün kılın.',
    card1Label: '1. Spot Paylasimi',
    card1Desc: 'Aradigin urunu ac, topluluk fiziki veya sanal yardimla bulmana destek olsun.',
    card1Link: 'Spot olustur →',
    card2Label: '2. Magaza Sistemi',
    card2Desc: 'Profesyonel saticilar urunlerini sergiler, toplulukla guvenli sekilde eslesir.',
    card2Link: 'Magaza ac →',
    card3Label: '3. Nadir Seyahat',
    card3Desc: 'Seyahatlerde gordugun nadir yerleri paylas, rota planla, kalici gezi hikayesi olustur.',
    card3Link: 'Rota planla →',
    searchPlaceholder: "Ne aramıştınız? Örnek: 'vintage Nikon kamera lensi', 'eski Arçelik çay makinesi parçası'",
    popularLabel: 'Popüler aramalar:',
    popularItems: ['vintage kamera lensi', 'eski çay makinesi parçası', 'retro oyun konsolu', 'antika saat', 'yedek parça'],
    searchBtn: 'Ara',
    ctaCreate: 'Ücretsiz Spot Oluştur',
    ctaExplore: "Spot'ları Keşfet",
    trustTitle: 'Milyonlarca kullanıcıya güvenilen platform',
    trust1: '%100 Ücretsiz',
    trust2: 'Güvenli & Gizli',
    trust3: 'Topluluk Desteği',
    trust4: 'Hızlı Yardım',
  },
  en: {
    title1: 'Find hard-to-find products',
    title2: 'with the community',
    subtitle: 'Let thousands of eyes search for the rare, vintage or discontinued products you need. Make the impossible possible with the power of our community.',
    card1Label: '1. Spot Sharing',
    card1Desc: 'Open a request for the item you need, let the community help you find it physically or virtually.',
    card1Link: 'Create spot →',
    card2Label: '2. Shop System',
    card2Desc: 'Professional sellers showcase their items and safely match with the community.',
    card2Link: 'Open shop →',
    card3Label: '3. Rare Travel',
    card3Desc: 'Share rare places you find on your travels, plan routes, create lasting travel stories.',
    card3Link: 'Plan route →',
    searchPlaceholder: "What are you looking for? Example: 'vintage Nikon camera lens', 'old blender part'",
    popularLabel: 'Popular searches:',
    popularItems: ['vintage camera lens', 'old tea maker part', 'retro game console', 'antique watch', 'spare parts'],
    searchBtn: 'Search',
    ctaCreate: 'Create Free Spot',
    ctaExplore: 'Explore Spots',
    trustTitle: 'Trusted by millions of users',
    trust1: '100% Free',
    trust2: 'Secure & Private',
    trust3: 'Community Support',
    trust4: 'Fast Help',
  },
  de: {
    title1: 'Schwer zu findende Produkte',
    title2: 'mit der Community finden',
    subtitle: 'Lass tausende Augen nach seltenen, Vintage- oder eingestellten Produkten suchen. Mach das Unmögliche möglich mit der Kraft unserer Community.',
    card1Label: '1. Spot teilen',
    card1Desc: 'Erstelle eine Anfrage, lass die Community dir physisch oder virtuell helfen.',
    card1Link: 'Spot erstellen →',
    card2Label: '2. Shop-System',
    card2Desc: 'Professionelle Verkäufer zeigen ihre Artikel und werden sicher mit der Community verbunden.',
    card2Link: 'Shop öffnen →',
    card3Label: '3. Seltene Reise',
    card3Desc: 'Teile seltene Orte, die du auf Reisen entdeckst, plane Routen, erstelle bleibende Reisegeschichten.',
    card3Link: 'Route planen →',
    searchPlaceholder: "Was suchen Sie? Beispiel: 'Vintage-Nikon-Kameraobjektiv', 'altes Kaffeemaschinenteil'",
    popularLabel: 'Beliebte Suchen:',
    popularItems: ['Vintage-Kameraobjektiv', 'altes Gerätebauteil', 'Retro-Spielekonsole', 'antike Uhr', 'Ersatzteile'],
    searchBtn: 'Suchen',
    ctaCreate: 'Kostenlosen Spot erstellen',
    ctaExplore: 'Spots entdecken',
    trustTitle: 'Von Millionen von Nutzern vertraut',
    trust1: '100% Kostenlos',
    trust2: 'Sicher & Privat',
    trust3: 'Community-Unterstützung',
    trust4: 'Schnelle Hilfe',
  },
  fr: {
    title1: 'Trouvez des produits difficiles',
    title2: 'grâce à la communauté',
    subtitle: 'Laissez des milliers d\'yeux chercher les produits rares, vintage ou discontinués dont vous avez besoin. Rendez l\'impossible possible avec notre communauté.',
    card1Label: '1. Partage de spot',
    card1Desc: 'Ouvrez une demande, laissez la communauté vous aider physiquement ou virtuellement.',
    card1Link: 'Créer un spot →',
    card2Label: '2. Système boutique',
    card2Desc: 'Les vendeurs professionnels exposent leurs articles et se connectent en toute sécurité.',
    card2Link: 'Ouvrir boutique →',
    card3Label: '3. Voyage rare',
    card3Desc: 'Partagez les endroits rares découverts en voyage, planifiez des itinéraires, créez des histoires de voyage.',
    card3Link: 'Planifier itinéraire →',
    searchPlaceholder: "Que cherchez-vous ? Exemple : 'objectif Nikon vintage', 'pièce de machine à café ancienne'",
    popularLabel: 'Recherches populaires :',
    popularItems: ['objectif vintage', 'pièce ancienne', 'console rétro', 'montre antique', 'pièces détachées'],
    searchBtn: 'Rechercher',
    ctaCreate: 'Créer un spot gratuit',
    ctaExplore: 'Explorer les spots',
    trustTitle: 'Approuvé par des millions d\'utilisateurs',
    trust1: '100% Gratuit',
    trust2: 'Sécurisé & Privé',
    trust3: 'Soutien communautaire',
    trust4: 'Aide rapide',
  },
  es: {
    title1: 'Encuentra productos difíciles',
    title2: 'con la comunidad',
    subtitle: 'Deja que miles de ojos busquen los productos raros, vintage o descontinuados que necesitas. Haz lo imposible posible con el poder de nuestra comunidad.',
    card1Label: '1. Compartir spot',
    card1Desc: 'Abre una solicitud, deja que la comunidad te ayude física o virtualmente.',
    card1Link: 'Crear spot →',
    card2Label: '2. Sistema de tiendas',
    card2Desc: 'Los vendedores profesionales exhiben sus artículos y se conectan de forma segura.',
    card2Link: 'Abrir tienda →',
    card3Label: '3. Viaje raro',
    card3Desc: 'Comparte lugares raros que encuentras en tus viajes, planifica rutas, crea historias de viaje duraderas.',
    card3Link: 'Planificar ruta →',
    searchPlaceholder: "¿Qué buscas? Ejemplo: 'lente de cámara Nikon vintage', 'pieza de tetera antigua'",
    popularLabel: 'Búsquedas populares:',
    popularItems: ['lente de cámara vintage', 'pieza de aparato antiguo', 'consola retro', 'reloj antiguo', 'repuestos'],
    searchBtn: 'Buscar',
    ctaCreate: 'Crear spot gratis',
    ctaExplore: 'Explorar spots',
    trustTitle: 'De confianza para millones de usuarios',
    trust1: '100% Gratis',
    trust2: 'Seguro y Privado',
    trust3: 'Apoyo comunitario',
    trust4: 'Ayuda rápida',
  },
  ru: {
    title1: 'Naydi trudnodostupnyye produkty',
    title2: 's pomoshchyu soobshchestva',
    subtitle: 'Pust tysyachi glaz ishchut redkiye, vintazhnyye ili snyatyye s proizvodstva tovary. Sdyelay nevozmozhnoye vozmozhnym vmeste s nashim soobshchestvom.',
    card1Label: '1. Publikatsiya spota',
    card1Desc: 'Otkroy zapros, pust soobshchestvo pomozhet tebe nayti tovar fizicheski ili virtualno.',
    card1Link: 'Sozdat spot →',
    card2Label: '2. Sistema magazinov',
    card2Desc: 'Professionalnyye prodavtsy demonstriruyut svoi tovary i bezopasno svyazyvayutsya s soobshchestvom.',
    card2Link: 'Otkryt magazin →',
    card3Label: '3. Redkoye puteshestviye',
    card3Desc: 'Delis redkimi mestami na puteshestviyakh, planiruy marshruty, sozdavay putevyye istorii.',
    card3Link: 'Planirovat marshrut →',
    searchPlaceholder: "Chto ishchesh? Primer: 'vintazhnyy obyektiv Nikon', 'zapchast starogo chainika'",
    popularLabel: 'Populyarnyye zaprosy:',
    popularItems: ['vintazhnyy obyektiv', 'staraya zapchast', 'retro pristavka', 'antikvarnyye chasy', 'zapchasti'],
    searchBtn: 'Iskati',
    ctaCreate: 'Sozdat besplatnyy spot',
    ctaExplore: 'Issledovat spoty',
    trustTitle: 'Doveryayut milliony polzovateley',
    trust1: '100% Besplatno',
    trust2: 'Bezopasno i Konfidentsialno',
    trust3: 'Podderzhka soobshchestva',
    trust4: 'Bystraya pomoshch',
  },
} as const

export default function Hero() {
  const locale = useCurrentLocale()
  const t = heroText[locale]
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/sightings?search=${encodeURIComponent(searchQuery)}&tab=sightings`)
    }
  }


  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
      
      <div className="relative container-custom py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t.title1}{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t.title2}
                </span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-100 -z-10 rounded-full"></span>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>

            <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-3 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-blue-200 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t.card1Label}</p>
                <p className="mt-1 text-sm text-gray-700">{t.card1Desc}</p>
                <Link href="/create-spot" className="mt-2 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800">{t.card1Link}</Link>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{t.card2Label}</p>
                <p className="mt-1 text-sm text-gray-700">{t.card2Desc}</p>
                <Link href="/for-business" className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800">{t.card2Link}</Link>
              </div>
              <div className="rounded-2xl border border-purple-200 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{t.card3Label}</p>
                <p className="mt-1 text-sm text-gray-700">{t.card3Desc}</p>
                <Link href="/rare-travel-plan" className="mt-2 inline-block text-sm font-semibold text-purple-700 hover:text-purple-800">{t.card3Link}</Link>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-2 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                  <div className="flex-grow min-w-0 relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full pl-12 pr-4 py-3.5 sm:py-4 text-base sm:text-lg border-0 focus:ring-0 focus:outline-none rounded-xl sm:rounded-l-2xl sm:rounded-r-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 sm:transform sm:hover:scale-105 shadow-lg"
                  >
                    {t.searchBtn}
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-3">{t.popularLabel}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {t.popularItems.map((search, index) => (
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
              {t.ctaCreate}
              <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <button
              onClick={() => router.push('/spots')}
              className="group bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <span className="mr-3">🔍</span>
              {t.ctaExplore}
              <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Güven işaretleri */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-6">{t.trustTitle}</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span className="text-sm font-medium">{t.trust1}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">🔒</span>
                </div>
                <span className="text-sm font-medium">{t.trust2}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">🤝</span>
                </div>
                <span className="text-sm font-medium">{t.trust3}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">⚡</span>
                </div>
                <span className="text-sm font-medium">{t.trust4}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
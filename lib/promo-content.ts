export type PromoLocale = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'ru'

const SUPPORTED_PROMO_LOCALES: PromoLocale[] = ['tr', 'en', 'de', 'fr', 'es', 'ru']

export interface PromoItem {
  id: string
  icon: string
  title: string
  description: string
  link: string
  colors: string
  buttonColor: string
}

type PromoBaseItem = Omit<PromoItem, 'title' | 'description'>

const BASE_PROMOS: PromoBaseItem[] = [
  { id: 'quick-maps', icon: '⚡', link: '/info/quick-maps', colors: 'from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800', buttonColor: 'text-emerald-700' },
  { id: 'rare-product-map', icon: '🗺️', link: '/info/rare-product-map', colors: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700', buttonColor: 'text-amber-700' },
  { id: 'rare-travel-map', icon: '🌍', link: '/info/rare-travel-map', colors: 'from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800', buttonColor: 'text-blue-700' },
  { id: 'rare-travel-plan', icon: '🧭', link: '/info/rare-travel-plan', colors: 'from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700', buttonColor: 'text-emerald-600' },
  { id: 'rare-sightings', icon: '👁️', link: '/info/rare-sightings', colors: 'from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700', buttonColor: 'text-purple-600' },
  { id: 'share-moment', icon: '📸', link: '/info/share-moment', colors: 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700', buttonColor: 'text-pink-600' },
  { id: 'social-discovery', icon: '🌟', link: '/info/social-discovery', colors: 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700', buttonColor: 'text-cyan-600' },
  { id: 'create-spots', icon: '🎯', link: '/info/create-spots', colors: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700', buttonColor: 'text-red-600' },
  { id: 'community-power', icon: '🤝', link: '/info/community-power', colors: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700', buttonColor: 'text-blue-600' },
  { id: 'help-others', icon: '💝', link: '/info/help-others', colors: 'from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700', buttonColor: 'text-rose-600' },
  { id: 'success-stories', icon: '🏆', link: '/info/success-stories', colors: 'from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700', buttonColor: 'text-yellow-600' },
  { id: 'antique-items', icon: '🏺', link: '/info/antique-items', colors: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700', buttonColor: 'text-amber-600' },
  { id: 'local-products', icon: '🏔️', link: '/info/local-products', colors: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700', buttonColor: 'text-green-600' },
  { id: 'discontinued-products', icon: '⚙️', link: '/info/discontinued-products', colors: 'from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800', buttonColor: 'text-gray-700' },
  { id: 'rare-books', icon: '📚', link: '/info/rare-books', colors: 'from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700', buttonColor: 'text-indigo-600' },
  { id: 'collectors-items', icon: '💎', link: '/info/collectors-items', colors: 'from-violet-500 to-purple-700 hover:from-violet-600 hover:to-purple-800', buttonColor: 'text-violet-600' },
]

const TITLES: Record<PromoLocale, Record<string, string>> = {
  tr: {
    'quick-maps': 'Hizli Haritalar',
    'rare-product-map': 'Nadir Urun Haritasi',
    'rare-travel-map': 'Nadir Seyahat Haritasi',
    'rare-travel-plan': 'Nadir Seyahat Plani',
    'rare-sightings': 'Nadir Gordum!',
    'share-moment': 'Anini Paylas',
    'social-discovery': 'Kesfet ve Kesfettir',
    'create-spots': 'Birlikte Bulalim',
    'community-power': 'Topluluk Gucu',
    'help-others': 'Yardim Et, Mutlu Ol',
    'success-stories': 'Basari Hikayeleri',
    'antique-items': 'Antika Esyalar',
    'local-products': 'Yoresel Urunler',
    'discontinued-products': 'Artik Uretilmiyor',
    'rare-books': 'Nadir Kitaplar',
    'collectors-items': 'Koleksiyon Parcasi',
  },
  en: {
    'quick-maps': 'Quick Maps',
    'rare-product-map': 'Rare Product Map',
    'rare-travel-map': 'Rare Travel Map',
    'rare-travel-plan': 'Rare Travel Plan',
    'rare-sightings': 'I Spotted Rare!',
    'share-moment': 'Share Your Moment',
    'social-discovery': 'Discover and Inspire',
    'create-spots': 'Let Us Find It Together',
    'community-power': 'Community Power',
    'help-others': 'Help and Make Happy',
    'success-stories': 'Success Stories',
    'antique-items': 'Antique Items',
    'local-products': 'Local Products',
    'discontinued-products': 'Discontinued Items',
    'rare-books': 'Rare Books',
    'collectors-items': 'Collector Pieces',
  },
  de: {
    'quick-maps': 'Schnelle Karten',
    'rare-product-map': 'Karte seltener Produkte',
    'rare-travel-map': 'Karte seltener Reisen',
    'rare-travel-plan': 'Plan fur seltene Reisen',
    'rare-sightings': 'Selten gesehen!',
    'share-moment': 'Teile deinen Moment',
    'social-discovery': 'Entdecken und Inspirieren',
    'create-spots': 'Gemeinsam finden',
    'community-power': 'Kraft der Community',
    'help-others': 'Hilf und mach glucklich',
    'success-stories': 'Erfolgsgeschichten',
    'antique-items': 'Antike Gegenstande',
    'local-products': 'Regionale Produkte',
    'discontinued-products': 'Nicht mehr produziert',
    'rare-books': 'Seltene Bucher',
    'collectors-items': 'Sammlerstucke',
  },
  fr: {
    'quick-maps': 'Cartes rapides',
    'rare-product-map': 'Carte des objets rares',
    'rare-travel-map': 'Carte des voyages rares',
    'rare-travel-plan': 'Plan de voyage rare',
    'rare-sightings': 'Objet rare repere!',
    'share-moment': 'Partage ton moment',
    'social-discovery': 'Decouvrir et inspirer',
    'create-spots': 'Trouvons-le ensemble',
    'community-power': 'Force de la communaute',
    'help-others': 'Aide et rends heureux',
    'success-stories': 'Histoires de succes',
    'antique-items': 'Objets antiques',
    'local-products': 'Produits locaux',
    'discontinued-products': 'Produit arrete',
    'rare-books': 'Livres rares',
    'collectors-items': 'Pieces de collection',
  },
  es: {
    'quick-maps': 'Mapas rapidos',
    'rare-product-map': 'Mapa de productos raros',
    'rare-travel-map': 'Mapa de viajes raros',
    'rare-travel-plan': 'Plan de viaje raro',
    'rare-sightings': 'Vi algo raro!',
    'share-moment': 'Comparte tu momento',
    'social-discovery': 'Descubre e inspira',
    'create-spots': 'Encontrarlo juntos',
    'community-power': 'Fuerza de la comunidad',
    'help-others': 'Ayuda y haz feliz',
    'success-stories': 'Historias de exito',
    'antique-items': 'Objetos antiguos',
    'local-products': 'Productos locales',
    'discontinued-products': 'Ya no se fabrica',
    'rare-books': 'Libros raros',
    'collectors-items': 'Piezas de coleccion',
  },
  ru: {
    'quick-maps': 'Bystrye karty',
    'rare-product-map': 'Karta redkikh tovarov',
    'rare-travel-map': 'Karta redkikh puteshestviy',
    'rare-travel-plan': 'Plan redkogo puteshestviya',
    'rare-sightings': 'Ya videl redkoe!',
    'share-moment': 'Podelis momentom',
    'social-discovery': 'Otkryvay i vdokhnovlyay',
    'create-spots': 'Naydem vmeste',
    'community-power': 'Sila soobshchestva',
    'help-others': 'Pomogay i raduy',
    'success-stories': 'Istorii uspekha',
    'antique-items': 'Antikvariat',
    'local-products': 'Mestnye produkty',
    'discontinued-products': 'Snyato s proizvodstva',
    'rare-books': 'Redkie knigi',
    'collectors-items': 'Kollektsionnye predmeti',
  },
}

const DESCRIPTIONS: Record<PromoLocale, Record<string, string>> = {
  tr: {
    'quick-maps': 'Cevrendeki nadir urunleri, seyahat noktalarini ve sosyal paylasimlari aninda haritada gor!',
    'rare-product-map': 'Fiziksel nadir urunlerin topluluk tarafindan paylasildigi harita. Gercek dunyadaki nadirleri bul!',
    'rare-travel-map': 'Toplulugun paylastigi nadir seyahat noktalarini ve deneyimlerini haritada kesfet!',
    'rare-travel-plan': 'Kendi nadir seyahat rotani olustur, duraklarini sec, toplulukla paylas!',
    'rare-sightings': 'Sen de gordugun nadir ani binlerce kisiyle paylas',
    'share-moment': 'Karsilastigin ilginc seyi gormeyenler icin anlat!',
    'social-discovery': 'Senin kesfin, baskalarinin ilhami olabilir',
    'create-spots': 'Aradigini soyle, binlerce kisi senin icin arasin',
    'community-power': 'Sen ararken yoruldun mu? Binlerce goz senin icin bakiyor!',
    'help-others': 'Birinin aradigini buldun mu? Mutlulugunu paylas!',
    'success-stories': 'Binlerce kisi aradigini burada buldu!',
    'antique-items': 'Deden atolye de kullaniyordu, sen nerede bulacaksin?',
    'local-products': 'O lezzet sadece orada! Birisi senin icin bulabilir',
    'discontinued-products': 'Uretimi bitti diye umutsuz olma, biri mutlaka biliyordur',
    'rare-books': 'Ilk baskisini ariyorsan, koleksiyoncu toplulugu yardimci olur',
    'collectors-items': 'Koleksiyonunu tamamla! Diger koleksiyoncular sana yardim etsin',
  },
  en: {
    'quick-maps': 'See nearby rare items, travel points, and social shares instantly on the map!',
    'rare-product-map': 'A map of physical rare item sightings shared by the community.',
    'rare-travel-map': 'Discover rare travel points and experiences shared by the community.',
    'rare-travel-plan': 'Build your own rare travel route, pick stops, and share it with the community.',
    'rare-sightings': 'Share the rare thing you spotted with thousands of people.',
    'share-moment': 'Tell others about the interesting thing you encountered.',
    'social-discovery': 'Your discovery can inspire others.',
    'create-spots': 'Tell us what you need and let thousands search for you.',
    'community-power': 'Tired of searching alone? Thousands of eyes are looking for you.',
    'help-others': 'Found what someone is looking for? Share the joy!',
    'success-stories': 'Thousands already found what they needed here.',
    'antique-items': 'Classic antique pieces may still be out there waiting for you.',
    'local-products': 'That local flavor exists somewhere, someone can find it for you.',
    'discontinued-products': 'Production ended, but hope did not. Someone may know where it is.',
    'rare-books': 'Looking for first editions? The collector community can help.',
    'collectors-items': 'Complete your collection with help from fellow collectors.',
  },
  de: {
    'quick-maps': 'Sieh seltene Produkte, Reisepunkte und Social-Posts in deiner Nahe sofort auf der Karte.',
    'rare-product-map': 'Karte mit physischen Sichtungen seltener Produkte aus der Community.',
    'rare-travel-map': 'Entdecke seltene Reiseorte und Erfahrungen aus der Community.',
    'rare-travel-plan': 'Erstelle deine eigene seltene Reiseroute und teile sie.',
    'rare-sightings': 'Teile deine seltene Sichtung mit Tausenden Nutzern.',
    'share-moment': 'Erzahle von dem interessanten Moment, den du erlebt hast.',
    'social-discovery': 'Deine Entdeckung kann andere inspirieren.',
    'create-spots': 'Sag, was du suchst, und lass Tausende fur dich suchen.',
    'community-power': 'Mude vom Suchen? Tausende Augen helfen dir.',
    'help-others': 'Etwas gefunden? Teile die Freude.',
    'success-stories': 'Tausende haben hier bereits gefunden, was sie suchten.',
    'antique-items': 'Antike Fundstucke warten oft noch irgendwo auf dich.',
    'local-products': 'Lokale Spezialitaten konnen durch die Community gefunden werden.',
    'discontinued-products': 'Nicht mehr produziert, aber vielleicht noch verfugbar.',
    'rare-books': 'Auf der Suche nach Erstausgaben? Die Sammler helfen.',
    'collectors-items': 'Vervollstandige deine Sammlung mit Hilfe anderer Sammler.',
  },
  fr: {
    'quick-maps': 'Voyez instantanement sur la carte les objets rares et points de voyage pres de vous.',
    'rare-product-map': 'Carte des signalements physiques d objets rares partages par la communaute.',
    'rare-travel-map': 'Decouvrez des lieux et experiences de voyage rares partages par la communaute.',
    'rare-travel-plan': 'Creez votre itineraire de voyage rare et partagez-le.',
    'rare-sightings': 'Partagez votre trouvaille rare avec des milliers de personnes.',
    'share-moment': 'Racontez votre moment interessant a ceux qui ne l ont pas vu.',
    'social-discovery': 'Votre decouverte peut inspirer les autres.',
    'create-spots': 'Dites ce que vous cherchez et laissez la communaute aider.',
    'community-power': 'Fatigue de chercher seul? Des milliers d yeux vous aident.',
    'help-others': 'Vous avez trouve quelque chose? Partagez la joie.',
    'success-stories': 'Des milliers de personnes ont deja trouve ici.',
    'antique-items': 'Les pieces antiques peuvent encore etre trouvees.',
    'local-products': 'Cette saveur locale existe quelque part, la communaute peut la trouver.',
    'discontinued-products': 'Production arretee, mais il reste des pistes.',
    'rare-books': 'Vous cherchez une premiere edition? Les collectionneurs aident.',
    'collectors-items': 'Completez votre collection avec l aide des autres collectionneurs.',
  },
  es: {
    'quick-maps': 'Ve al instante en el mapa productos raros y puntos de viaje cercanos.',
    'rare-product-map': 'Mapa de avistamientos fisicos de productos raros compartidos por la comunidad.',
    'rare-travel-map': 'Descubre lugares y experiencias de viaje raras compartidas por la comunidad.',
    'rare-travel-plan': 'Crea tu ruta de viaje rara y compartela.',
    'rare-sightings': 'Comparte lo raro que viste con miles de personas.',
    'share-moment': 'Cuenta ese momento interesante a quienes no lo vieron.',
    'social-discovery': 'Tu descubrimiento puede inspirar a otros.',
    'create-spots': 'Di lo que buscas y deja que miles te ayuden a encontrarlo.',
    'community-power': 'Cansado de buscar solo? Miles de ojos buscan por ti.',
    'help-others': 'Encontraste algo para alguien? Comparte la alegria.',
    'success-stories': 'Miles de personas ya encontraron aqui lo que buscaban.',
    'antique-items': 'Las piezas antiguas aun pueden aparecer en algun lugar.',
    'local-products': 'Ese sabor local existe en algun lugar, la comunidad puede hallarlo.',
    'discontinued-products': 'Ya no se fabrica, pero aun puede encontrarse.',
    'rare-books': 'Buscas primeras ediciones? La comunidad coleccionista ayuda.',
    'collectors-items': 'Completa tu coleccion con ayuda de otros coleccionistas.',
  },
  ru: {
    'quick-maps': 'Mgnovenno smotrite na karte redkiye tovary i tocki puteshestviy ryadom.',
    'rare-product-map': 'Karta fizicheskikh nakhodok redkikh tovarov ot soobshchestva.',
    'rare-travel-map': 'Otkryvayte redkiye tochki i opyt puteshestviy ot soobshchestva.',
    'rare-travel-plan': 'Sozdavayte sobstvennyy marshrut redkogo puteshestviya i delites.',
    'rare-sightings': 'Podelites redkoy nakhodkoy s tysyachami lyudey.',
    'share-moment': 'Rasskazhite ob interesnom momente tem, kto ego ne videl.',
    'social-discovery': 'Vashe otkrytie mozhet vdokhnovit drugikh.',
    'create-spots': 'Skazhite, chto ishchete, i pust tysyachi pomogut nayti.',
    'community-power': 'Ustali iskat v odinochku? Tysyachi glaz pomogayut vam.',
    'help-others': 'Nashli chto-to dlya kogo-to? Podelites radostyu.',
    'success-stories': 'Tysyachi uzhe nashli zdes to, chto iskali.',
    'antique-items': 'Redkiye antikvarnye veshchi vse eshche mozhno nayti.',
    'local-products': 'Mestnyy vkus mozhno nayti s pomoshchyu soobshchestva.',
    'discontinued-products': 'Snyato s proizvodstva, no eshche mozhno otyskat.',
    'rare-books': 'Ishchete pervye izdaniya? Kollektsionery pomogut.',
    'collectors-items': 'Dopolnite kollektsiyu s pomoshchyu drugih kollektsionerov.',
  },
}

function normalizeLocale(locale: string): PromoLocale {
  if (locale === 'en' || locale === 'de' || locale === 'fr' || locale === 'es' || locale === 'ru') return locale
  return 'tr'
}

export function withPromoLocale(path: string, locale: string): string {
  const normalizedLocale = normalizeLocale(locale)

  if (!path) return `/${normalizedLocale}`
  if (path.startsWith('#') || path.startsWith('mailto:') || path.startsWith('tel:')) return path
  if (/^[a-z][a-z\d+\-.]*:/i.test(path)) return path

  const [pathAndQuery, hashPart] = path.split('#', 2)
  const [rawPath, queryPart] = pathAndQuery.split('?', 2)
  const safePath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const parts = safePath.split('/').filter(Boolean)

  if (parts.length > 0 && SUPPORTED_PROMO_LOCALES.includes(parts[0] as PromoLocale)) {
    parts[0] = normalizedLocale
  } else {
    parts.unshift(normalizedLocale)
  }

  const localizedPath = `/${parts.join('/')}`
  const querySuffix = queryPart ? `?${queryPart}` : ''
  const hashSuffix = hashPart ? `#${hashPart}` : ''

  return `${localizedPath}${querySuffix}${hashSuffix}`
}

export function getPromoCategories(locale: string): PromoItem[] {
  const normalizedLocale = normalizeLocale(locale)
  const fallbackLocale: PromoLocale = 'tr'

  return BASE_PROMOS.map((item) => ({
    ...item,
    title: TITLES[normalizedLocale][item.id] || TITLES[fallbackLocale][item.id] || item.id,
    description:
      DESCRIPTIONS[normalizedLocale][item.id] || DESCRIPTIONS[fallbackLocale][item.id] || '',
  }))
}

'use client'

import Link from 'next/link'

import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const antiqueText = {
  tr: {
    title: '🏺 Antika Eşyalar',
    subtitle: 'Eski ve değerli nesneleri keşfet, ara ve paylaş',
    topLink: 'Antika Spotlar',
    s1Title: 'Antika Eşya Nedir?',
    s1Desc: 'Antika eşyalar, geçmişten günümüze ulaşmış, tarihi ve kültürel değeri olan nesnelerdir. Koleksiyoncular için değerli, nostaljik anıları taşıyan bu parçalar her geçen gün daha nadir hale gelir.',
    s1Item1Title: 'Antika Mobilyalar',
    s1Item1Desc: 'Çeyiz sandıkları, eski masalar, koltuklar, dolap ve kredanslar',
    s1Item2Title: 'Nostaljik Cihazlar',
    s1Item2Desc: 'Eski radyolar, pikaplar, gramofonlar, telefonlar ve saatler',
    s1Item3Title: 'Dekoratif Objeler',
    s1Item3Desc: 'Tablolar, heykeller, vazolar ve süs eşyaları',
    s1Item4Title: 'Takı ve Aksesuarlar',
    s1Item4Desc: 'Eski mücevherler, saatler, broşlar ve kolyeler',
    s2Title: 'Nasıl Antika Bulunur?',
    s2Card1Title: '🏪 Bit Pazarları ve Antikacılar',
    s2Card1Desc: 'Şehirlerdeki bit pazarları, antika dükkanları ve eski eşya satan yerler ilk durak olmalı.',
    s2Card2Title: '👵 Yaşlı Nesil ve Aileniz',
    s2Card2Desc: 'Büyükanne ve büyükbabalarınızın evlerinde, çatı aralarında sürpriz antikalar bulunabilir.',
    s2Card3Title: '🌐 Online Platformlar',
    s2Card3Desc: 'SpotItForMe gibi platformlarda antika arayanlar ve satanlar buluşur.',
    s3Title: 'Antika Paylaşım & Spot İpuçları',
    s3Item1Label: 'Detaylı Fotoğraflar:',
    s3Item1Desc: 'Eşyanın her açısını, detaylarını ve özel işaretlerini çekin',
    s3Item2Label: 'Ölçüler ve Malzeme:',
    s3Item2Desc: 'Boyut, ölçü ve malzeme bilgisini ekleyin',
    s3Item3Label: 'Tarihsel Bilgi:',
    s3Item3Desc: 'Yaklaşık yaş, üretim yeri ve üretici bilgisini paylaşın',
    side1Title: 'Popüler Antika Kategorileri',
    side1Item1: '🪑 Mobilya',
    side1Item2: '📻 Nostaljik Cihazlar',
    side1Item3: '🎭 Dekoratif Objeler',
    side1Item4: '💍 Takı & Aksesuar',
    side2Title: 'Antika Ara veya Sat',
    side2Desc: 'Aradığın antika için spot oluştur veya bulduğun antikaları paylaş',
    side2Btn1: 'Spot Oluştur',
    side2Btn2: 'Bulduklarımı Paylaş',
  },
  en: {
    title: '🏺 Antique Items',
    subtitle: 'Discover, search for, and share old and valuable objects',
    topLink: 'Antique Spots',
    s1Title: 'What Is an Antique Item?',
    s1Desc: 'Antique items are objects that have survived from the past to the present and carry historical and cultural value. These pieces are valuable for collectors and carry nostalgic memories, becoming rarer every day.',
    s1Item1Title: 'Antique Furniture',
    s1Item1Desc: 'Hope chests, old tables, armchairs, cabinets, and sideboards',
    s1Item2Title: 'Nostalgic Devices',
    s1Item2Desc: 'Old radios, record players, gramophones, telephones, and watches',
    s1Item3Title: 'Decorative Objects',
    s1Item3Desc: 'Paintings, sculptures, vases, and ornamental items',
    s1Item4Title: 'Jewelry and Accessories',
    s1Item4Desc: 'Old jewelry, watches, brooches, and necklaces',
    s2Title: 'How Can You Find Antiques?',
    s2Card1Title: '🏪 Flea Markets and Antique Shops',
    s2Card1Desc: 'Flea markets, antique stores, and shops selling old goods in cities should be your first stops.',
    s2Card2Title: '👵 Older Generations and Your Family',
    s2Card2Desc: 'You may find surprise antiques in your grandparents’ homes or attics.',
    s2Card3Title: '🌐 Online Platforms',
    s2Card3Desc: 'Platforms like SpotItForMe bring together people who seek and sell antiques.',
    s3Title: 'Antique Sharing & Spot Tips',
    s3Item1Label: 'Detailed Photos:',
    s3Item1Desc: 'Capture every angle, detail, and special marking of the item',
    s3Item2Label: 'Dimensions and Material:',
    s3Item2Desc: 'Add size, measurements, and material information',
    s3Item3Label: 'Historical Information:',
    s3Item3Desc: 'Share the approximate age, place of production, and maker',
    side1Title: 'Popular Antique Categories',
    side1Item1: '🪑 Furniture',
    side1Item2: '📻 Nostalgic Devices',
    side1Item3: '🎭 Decorative Objects',
    side1Item4: '💍 Jewelry & Accessories',
    side2Title: 'Search or Sell Antiques',
    side2Desc: 'Create a spot for the antique you want or share the ones you found',
    side2Btn1: 'Create Spot',
    side2Btn2: 'Share What I Found',
  },
  de: {
    title: '🏺 Antiquitäten',
    subtitle: 'Entdecke, suche und teile alte und wertvolle Gegenstände',
    topLink: 'Antiquitäten-Spots',
    s1Title: 'Was ist ein antiker Gegenstand?',
    s1Desc: 'Antike Gegenstände sind Objekte, die aus der Vergangenheit bis heute erhalten geblieben sind und historischen sowie kulturellen Wert tragen. Für Sammler sind diese Stücke wertvoll und werden mit jedem Tag seltener.',
    s1Item1Title: 'Antike Möbel',
    s1Item1Desc: 'Aussteuertruhen, alte Tische, Sessel, Schränke und Anrichten',
    s1Item2Title: 'Nostalgische Geräte',
    s1Item2Desc: 'Alte Radios, Plattenspieler, Grammophone, Telefone und Uhren',
    s1Item3Title: 'Dekorative Objekte',
    s1Item3Desc: 'Gemälde, Skulpturen, Vasen und Dekorationsartikel',
    s1Item4Title: 'Schmuck und Accessoires',
    s1Item4Desc: 'Alter Schmuck, Uhren, Broschen und Halsketten',
    s2Title: 'Wie findet man Antiquitäten?',
    s2Card1Title: '🏪 Flohmärkte und Antiquitätenhändler',
    s2Card1Desc: 'Flohmärkte, Antiquitätengeschäfte und Läden mit alten Waren in der Stadt sollten die erste Station sein.',
    s2Card2Title: '👵 Ältere Generationen und Familie',
    s2Card2Desc: 'In den Häusern oder auf den Dachböden deiner Großeltern können überraschende Antiquitäten auftauchen.',
    s2Card3Title: '🌐 Online-Plattformen',
    s2Card3Desc: 'Auf Plattformen wie SpotItForMe treffen sich Menschen, die Antiquitäten suchen und verkaufen.',
    s3Title: 'Tipps für das Teilen und Spotten von Antiquitäten',
    s3Item1Label: 'Detaillierte Fotos:',
    s3Item1Desc: 'Fotografiere jeden Winkel, jedes Detail und besondere Kennzeichen des Stücks',
    s3Item2Label: 'Maße und Material:',
    s3Item2Desc: 'Ergänze Größe, Maße und Materialangaben',
    s3Item3Label: 'Historische Infos:',
    s3Item3Desc: 'Teile ungefähres Alter, Herstellungsort und Hersteller',
    side1Title: 'Beliebte Antiquitäten-Kategorien',
    side1Item1: '🪑 Möbel',
    side1Item2: '📻 Nostalgische Geräte',
    side1Item3: '🎭 Dekorative Objekte',
    side1Item4: '💍 Schmuck & Accessoires',
    side2Title: 'Antiquitäten suchen oder verkaufen',
    side2Desc: 'Erstelle einen Spot für die Antiquität, die du suchst, oder teile gefundene Stücke',
    side2Btn1: 'Spot erstellen',
    side2Btn2: 'Meine Funde teilen',
  },
  fr: {
    title: '🏺 Objets antiques',
    subtitle: 'Découvrez, recherchez et partagez des objets anciens et précieux',
    topLink: 'Spots antiques',
    s1Title: 'Qu’est-ce qu’un objet antique ?',
    s1Desc: 'Les objets antiques sont des pièces venues du passé jusqu’à aujourd’hui, avec une valeur historique et culturelle. Ils sont précieux pour les collectionneurs et deviennent de plus en plus rares.',
    s1Item1Title: 'Meubles anciens',
    s1Item1Desc: 'Coffres de mariage, vieilles tables, fauteuils, armoires et buffets',
    s1Item2Title: 'Appareils nostalgiques',
    s1Item2Desc: 'Anciennes radios, tourne-disques, gramophones, téléphones et montres',
    s1Item3Title: 'Objets décoratifs',
    s1Item3Desc: 'Tableaux, sculptures, vases et objets décoratifs',
    s1Item4Title: 'Bijoux et accessoires',
    s1Item4Desc: 'Anciens bijoux, montres, broches et colliers',
    s2Title: 'Comment trouver des antiquités ?',
    s2Card1Title: '🏪 Brocantes et antiquaires',
    s2Card1Desc: 'Les brocantes, boutiques d’antiquités et magasins d’objets anciens en ville doivent être vos premiers arrêts.',
    s2Card2Title: '👵 Les anciens et votre famille',
    s2Card2Desc: 'Vous pouvez trouver de véritables surprises dans les maisons et greniers de vos grands-parents.',
    s2Card3Title: '🌐 Plateformes en ligne',
    s2Card3Desc: 'Des plateformes comme SpotItForMe réunissent ceux qui cherchent et vendent des antiquités.',
    s3Title: 'Conseils pour partager des antiquités et créer un spot',
    s3Item1Label: 'Photos détaillées :',
    s3Item1Desc: 'Prenez tous les angles, les détails et les marques particulières de l’objet',
    s3Item2Label: 'Dimensions et matériau :',
    s3Item2Desc: 'Ajoutez la taille, les dimensions et le matériau',
    s3Item3Label: 'Informations historiques :',
    s3Item3Desc: 'Partagez l’âge approximatif, le lieu de fabrication et l’artisan',
    side1Title: 'Catégories d’antiquités populaires',
    side1Item1: '🪑 Mobilier',
    side1Item2: '📻 Appareils nostalgiques',
    side1Item3: '🎭 Objets décoratifs',
    side1Item4: '💍 Bijoux & accessoires',
    side2Title: 'Chercher ou vendre des antiquités',
    side2Desc: 'Créez un spot pour l’antiquité que vous recherchez ou partagez celles que vous avez trouvées',
    side2Btn1: 'Créer un spot',
    side2Btn2: 'Partager mes trouvailles',
  },
  es: {
    title: '🏺 Objetos antiguos',
    subtitle: 'Descubre, busca y comparte objetos antiguos y valiosos',
    topLink: 'Spots de antigüedades',
    s1Title: '¿Qué es un objeto antiguo?',
    s1Desc: 'Los objetos antiguos son piezas que han llegado del pasado hasta hoy y tienen valor histórico y cultural. Son valiosos para los coleccionistas y cada día se vuelven más raros.',
    s1Item1Title: 'Muebles antiguos',
    s1Item1Desc: 'Baúles de ajuar, mesas antiguas, sillones, armarios y aparadores',
    s1Item2Title: 'Dispositivos nostálgicos',
    s1Item2Desc: 'Radios antiguas, tocadiscos, gramófonos, teléfonos y relojes',
    s1Item3Title: 'Objetos decorativos',
    s1Item3Desc: 'Cuadros, esculturas, jarrones y adornos',
    s1Item4Title: 'Joyas y accesorios',
    s1Item4Desc: 'Joyas antiguas, relojes, broches y collares',
    s2Title: '¿Cómo encontrar antigüedades?',
    s2Card1Title: '🏪 Mercadillos y anticuarios',
    s2Card1Desc: 'Los mercadillos, tiendas de antigüedades y comercios de objetos antiguos en la ciudad deberían ser tu primera parada.',
    s2Card2Title: '👵 Generaciones mayores y tu familia',
    s2Card2Desc: 'Puedes encontrar antigüedades sorprendentes en las casas y áticos de tus abuelos.',
    s2Card3Title: '🌐 Plataformas en línea',
    s2Card3Desc: 'Plataformas como SpotItForMe reúnen a quienes buscan y venden antigüedades.',
    s3Title: 'Consejos para compartir antigüedades y crear spots',
    s3Item1Label: 'Fotos detalladas:',
    s3Item1Desc: 'Captura todos los ángulos, detalles y marcas especiales del objeto',
    s3Item2Label: 'Medidas y material:',
    s3Item2Desc: 'Añade tamaño, medidas e información del material',
    s3Item3Label: 'Información histórica:',
    s3Item3Desc: 'Comparte la edad aproximada, lugar de producción y fabricante',
    side1Title: 'Categorías populares de antigüedades',
    side1Item1: '🪑 Muebles',
    side1Item2: '📻 Dispositivos nostálgicos',
    side1Item3: '🎭 Objetos decorativos',
    side1Item4: '💍 Joyería y accesorios',
    side2Title: 'Buscar o vender antigüedades',
    side2Desc: 'Crea un spot para la antigüedad que buscas o comparte las que encontraste',
    side2Btn1: 'Crear spot',
    side2Btn2: 'Compartir lo que encontré',
  },
  ru: {
    title: '🏺 Антикварные вещи',
    subtitle: 'Открывайте, ищите и делитесь старыми и ценными предметами',
    topLink: 'Антикварные споты',
    s1Title: 'Что такое антикварная вещь?',
    s1Desc: 'Антикварные вещи - это предметы, дошедшие из прошлого до наших дней и имеющие историческую и культурную ценность. Для коллекционеров они особенно ценны и с каждым днем становятся все более редкими.',
    s1Item1Title: 'Антикварная мебель',
    s1Item1Desc: 'Сундуки для приданого, старые столы, кресла, шкафы и буфеты',
    s1Item2Title: 'Ностальгические устройства',
    s1Item2Desc: 'Старые радиоприемники, проигрыватели, граммофоны, телефоны и часы',
    s1Item3Title: 'Декоративные предметы',
    s1Item3Desc: 'Картины, скульптуры, вазы и украшения',
    s1Item4Title: 'Украшения и аксессуары',
    s1Item4Desc: 'Старинные украшения, часы, броши и ожерелья',
    s2Title: 'Как найти антиквариат?',
    s2Card1Title: '🏪 Блошиные рынки и антикварные магазины',
    s2Card1Desc: 'Блошиные рынки, антикварные лавки и магазины старых вещей в городах должны стать вашей первой остановкой.',
    s2Card2Title: '👵 Старшее поколение и семья',
    s2Card2Desc: 'Неожиданные антикварные вещи можно найти в домах и на чердаках бабушек и дедушек.',
    s2Card3Title: '🌐 Онлайн-платформы',
    s2Card3Desc: 'На платформах вроде SpotItForMe встречаются те, кто ищет и продает антиквариат.',
    s3Title: 'Советы по публикации антиквариата и созданию спота',
    s3Item1Label: 'Подробные фото:',
    s3Item1Desc: 'Снимите вещь со всех сторон, включая детали и особые отметки',
    s3Item2Label: 'Размеры и материал:',
    s3Item2Desc: 'Добавьте размеры, габариты и информацию о материале',
    s3Item3Label: 'Исторические сведения:',
    s3Item3Desc: 'Укажите примерный возраст, место изготовления и автора',
    side1Title: 'Популярные категории антиквариата',
    side1Item1: '🪑 Мебель',
    side1Item2: '📻 Ностальгические устройства',
    side1Item3: '🎭 Декоративные предметы',
    side1Item4: '💍 Украшения и аксессуары',
    side2Title: 'Искать или продавать антиквариат',
    side2Desc: 'Создайте спот для антикварной вещи, которую вы ищете, или поделитесь найденными предметами',
    side2Btn1: 'Создать спот',
    side2Btn2: 'Поделиться находками',
  },
} as const

export default function AntiqueItemsPage() {
  const locale = useCurrentLocale()
  const t = antiqueText[locale as keyof typeof antiqueText] ?? antiqueText.tr

  return (
    <div className="min-h-screen bg-white">
      <main className="container-custom py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-xl text-gray-600">{t.subtitle}</p>
          </div>
          <Link href="/spots?category=antika" className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 font-bold">
            {t.topLink}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s1Title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t.s1Desc}</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-2xl">🪑</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.s1Item1Title}</h3>
                    <p className="text-sm text-gray-600">{t.s1Item1Desc}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">📻</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.s1Item2Title}</h3>
                    <p className="text-sm text-gray-600">{t.s1Item2Desc}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🎭</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.s1Item3Title}</h3>
                    <p className="text-sm text-gray-600">{t.s1Item3Desc}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">💍</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.s1Item4Title}</h3>
                    <p className="text-sm text-gray-600">{t.s1Item4Desc}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s2Title}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{t.s2Card1Title}</h3>
                  <p className="text-gray-700 text-sm">{t.s2Card1Desc}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{t.s2Card2Title}</h3>
                  <p className="text-gray-700 text-sm">{t.s2Card2Desc}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{t.s2Card3Title}</h3>
                  <p className="text-gray-700 text-sm">{t.s2Card3Desc}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s3Title}</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">📸</span>
                  <p className="text-sm text-gray-700"><strong>{t.s3Item1Label}</strong> {t.s3Item1Desc}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📏</span>
                  <p className="text-sm text-gray-700"><strong>{t.s3Item2Label}</strong> {t.s3Item2Desc}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📜</span>
                  <p className="text-sm text-gray-700"><strong>{t.s3Item3Label}</strong> {t.s3Item3Desc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6 border border-amber-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">{t.side1Title}</h3>
              <div className="space-y-2 text-sm">
                <Link href="/spots?category=mobilya" className="block p-2 hover:bg-white rounded transition">
                  {t.side1Item1}
                </Link>
                <Link href="/spots?category=elektronik" className="block p-2 hover:bg-white rounded transition">
                  {t.side1Item2}
                </Link>
                <Link href="/spots?category=dekor" className="block p-2 hover:bg-white rounded transition">
                  {t.side1Item3}
                </Link>
                <Link href="/spots?category=taki" className="block p-2 hover:bg-white rounded transition">
                  {t.side1Item4}
                </Link>
              </div>
            </div>

            <div className="bg-amber-600 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">{t.side2Title}</h3>
              <p className="text-sm opacity-90 mb-4">{t.side2Desc}</p>
              <Link href="/create-spot" className="block text-center bg-white text-amber-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition mb-2">
                {t.side2Btn1}
              </Link>
              <Link href="/sightings" className="block text-center bg-amber-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-800 transition">
                {t.side2Btn2}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

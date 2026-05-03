'use client'

import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const localProductsText = {
  tr: {
    title: '🏔️ Yöresel Ürünler',
    subtitle: 'Bölgeye özel lezzetler ve geleneksel ürünler',
    cta: 'Yöresel Spotlar',
    section1_title: 'Yöresel Ürün Nedir?',
    section1_desc: 'Yöresel ürünler, belirli bir bölgede geleneksel yöntemlerle üretilen, o yörenin kültürünü ve lezzetini yansıtan özel ürünlerdir. İnternette veya marketlerde bulmak zor, ama o bölgeye gittiğinizde mutlaka tatmanız gereken lezzetler!',
    item1_icon: '🍯', item1_title: 'Yöresel Lezzetler', item1_desc: 'Antep baklavası, Maraş dondurması, Trabzon peyniri, Kars gravyeri',
    item2_icon: '🧵', item2_title: 'El Yapımı Ürünler', item2_desc: 'Kilim, halı, çini, bakır işleme, seramik',
    item3_icon: '🌿', item3_title: 'Doğal ve Organik', item3_desc: 'Yöresel bitki çayları, bal çeşitleri, zeytinyağı',
    item4_icon: '🎁', item4_title: 'Hediyelik Eşyalar', item4_desc: 'Nazar boncuğu, sedef işlemeli kutular, geleneksel giysiler',
    section2_title: 'Nereden Bulunur?',
    where1_title: '🏪 Yerel Pazarlar ve Çarşılar', where1_desc: 'Her şehrin tarihi çarşısı, mahalle pazarı ve yerel üreticilerin satış yaptığı yerler ilk duraktır.',
    where2_title: '👨‍🌾 Küçük Üreticilerden', where2_desc: 'Ailelerin geleneksel yöntemlerle ürettiği ürünler genelde küçük dükkanlarda veya evlerde satılır.',
    where3_title: '🗺️ Spot Sistemiyle', where3_desc: 'O bölgede yaşayanlar için spot oluşturun, yerel halk size yardımcı olsun!',
    section3_title: 'Spot Oluşturma Önerileri',
    tip1: '📍 Bölge Belirtin: Hangi şehir/ilçede aradığınızı net söyleyin',
    tip2: '🏷️ Ürün Detayı: "Antep baklavası" yerine "fıstıklı, ince açılmış baklava" deyin',
    tip3: '💰 Bütçe: Ne kadar harcayabileceğinizi belirtin, yerel fiyatları öğrenin',
    regions_title: 'Popüler Yöreler',
    region1: '🥐 Gaziantep: Baklava, lahmacun',
    region2: '🍇 Manisa: Sultaniye üzüm, mesir macunu',
    region3: '🧀 Kars: Gravyer peyniri, kaşar',
    region4: '🫖 Rize: Çay, bal',
    sidebar_title: 'Yöresel Ürün Ara',
    sidebar_desc: 'Aradığın yöresel lezzet için spot oluştur',
    sidebar_btn: 'Spot Oluştur',
    stats_title: 'İstatistikler',
    stat1_label: 'Yöresel Spot', stat1_val: '847',
    stat2_label: 'Başarıyla Bulunan', stat2_val: '%81',
  },
  en: {
    title: '🏔️ Local Products',
    subtitle: 'Regional flavors and traditional products',
    cta: 'Local Spots',
    section1_title: 'What are Local Products?',
    section1_desc: 'Local products are special items produced traditionally in specific regions, reflecting the culture and flavors of that area. Hard to find online, but must-try when visiting that region!',
    item1_icon: '🍯', item1_title: 'Regional Flavors', item1_desc: 'Antep baklava, Mara ice cream, Trabzon cheese, Kars gravyer',
    item2_icon: '🧵', item2_title: 'Handmade Items', item2_desc: 'Kilim, carpet, ceramics, copperwork, pottery',
    item3_icon: '🌿', item3_title: 'Natural & Organic', item3_desc: 'Regional herbal teas, honey varieties, olive oil',
    item4_icon: '🎁', item4_title: 'Gift Items', item4_desc: 'Evil eye beads, mother-of-pearl boxes, traditional clothing',
    section2_title: 'Where to Find?',
    where1_title: '🏪 Local Markets & Bazaars', where1_desc: 'Historic bazaars, neighborhood markets and local producer shops are first stops.',
    where2_title: '👨‍🌾 From Small Producers', where2_desc: 'Items made traditionally by families are usually sold in small shops or homes.',
    where3_title: '🗺️ Via Spot System', where3_desc: 'Create a spot for local residents, they\'ll help you!',
    section3_title: 'Spot Creation Tips',
    tip1: '📍 Specify Region: Clearly mention which city/district you\'re searching in',
    tip2: '🏷️ Product Details: Say "thin-shelled pistachio baklava" instead of just "baklava"',
    tip3: '💰 Budget: Mention how much you can spend, learn local prices',
    regions_title: 'Popular Regions',
    region1: '🥐 Gaziantep: Baklava, lahmacun',
    region2: '🍇 Manisa: Sultaniye raisins, mesir paste',
    region3: '🧀 Kars: Gravyer cheese, kasar',
    region4: '🫖 Rize: Tea, honey',
    sidebar_title: 'Search Local Products',
    sidebar_desc: 'Create a spot for regional flavors you seek',
    sidebar_btn: 'Create Spot',
    stats_title: 'Statistics',
    stat1_label: 'Local Spots', stat1_val: '847',
    stat2_label: 'Successfully Found', stat2_val: '81%',
  },
  de: {
    title: '🏔️ Lokale Produkte',
    subtitle: 'Regionale Spezialitäten und traditionelle Produkte',
    cta: 'Lokale Spots',
    section1_title: 'Was sind lokale Produkte?',
    section1_desc: 'Lokale Produkte sind spezielle Artikel, die traditionell in bestimmten Regionen hergestellt werden und die Kultur und Geschmäcke dieser Gegend widerspiegeln. Schwer online zu finden, aber ein Muss beim Besuch!',
    item1_icon: '🍯', item1_title: 'Regionale Spezialitäten', item1_desc: 'Antep Baklava, Mara Eis, Trabzon Käse, Kars Gravyer',
    item2_icon: '🧵', item2_title: 'Handgemachte Artikel', item2_desc: 'Kilim, Teppich, Keramik, Kupferwerk, Töpferei',
    item3_icon: '🌿', item3_title: 'Natur & Bio', item3_desc: 'Regionale Kräutertees, Honig Sorten, Olivenöl',
    item4_icon: '🎁', item4_title: 'Geschenkartikel', item4_desc: 'Nazar Perlen, Perlmuttboxen, traditionelle Kleidung',
    section2_title: 'Wo finden?',
    where1_title: '🏪 Lokale Märkte & Basare', where1_desc: 'Historische Basare, Nachbarschaftsmärkte und lokale Produzentenläden sind erste Anlaufstellen.',
    where2_title: '👨‍🌾 Von kleinen Produzenten', where2_desc: 'Traditionell von Familien hergestellte Artikel werden meist in kleinen Läden oder zu Hause verkauft.',
    where3_title: '🗺️ Via Spot-System', where3_desc: 'Erstelle einen Spot für Einheimische, sie helfen dir!',
    section3_title: 'Spot-Erstellungs-Tipps',
    tip1: '📍 Region angeben: Nennen Sie deutlich, in welcher Stadt/Bezirk Sie suchen',
    tip2: '🏷️ Produktdetails: Sagen Sie "dünne Pistazie Baklava" statt nur "Baklava"',
    tip3: '💰 Budget: Nennen Sie, wie viel Sie ausgeben können, lokale Preise erfahren',
    regions_title: 'Beliebte Regionen',
    region1: '🥐 Gaziantep: Baklava, Lahmacun',
    region2: '🍇 Manisa: Sultaniye Rosinen, Mesir Paste',
    region3: '🧀 Kars: Gravyer Käse, Kasar',
    region4: '🫖 Rize: Tee, Honig',
    sidebar_title: 'Lokale Produkte Suchen',
    sidebar_desc: 'Erstelle einen Spot für gesuchte Spezialitäten',
    sidebar_btn: 'Spot Erstellen',
    stats_title: 'Statistiken',
    stat1_label: 'Lokale Spots', stat1_val: '847',
    stat2_label: 'Erfolgreich Gefunden', stat2_val: '81%',
  },
  fr: {
    title: '🏔️ Produits Locaux',
    subtitle: 'Saveurs régionales et produits traditionnels',
    cta: 'Spots Locaux',
    section1_title: 'Quels sont les produits locaux?',
    section1_desc: 'Produits locaux sont articles spéciaux produits traditionnellement dans régions spécifiques, reflétant culture saveurs région. Difficiles trouver en ligne, mais essentiels visiter!',
    item1_icon: '🍯', item1_title: 'Spécialités Régionales', item1_desc: 'Baklava Antep, Glace Mara, Fromage Trabzon, Gravyer Kars',
    item2_icon: '🧵', item2_title: 'Articles Artisanaux', item2_desc: 'Kilim, tapis, céramique, cuivre, poterie',
    item3_icon: '🌿', item3_title: 'Naturel & Bio', item3_desc: 'Thés herbes régionaux, variétés miel, huile olive',
    item4_icon: '🎁', item4_title: 'Articles Cadeaux', item4_desc: 'Perles mauvais œil, boîtes nacre, vêtements traditionnels',
    section2_title: 'Où trouver?',
    where1_title: '🏪 Marchés Locaux & Bazars', where1_desc: 'Bazars historiques, marchés quartier magasins producteurs locaux premiers arrêts.',
    where2_title: '👨‍🌾 De petits producteurs', where2_desc: 'Articles faits traditionnellement familles vendus petits magasins maisons.',
    where3_title: '🗺️ Via système Spot', where3_desc: 'Crée spot habitants locaux, ils aideront!',
    section3_title: 'Conseils Création Spot',
    tip1: '📍 Spécifiez Région: Dites clairement ville/district cherchez',
    tip2: '🏷️ Détails Produit: Dites "baklava fine pistache" au lieu juste "baklava"',
    tip3: '💰 Budget: Mentionnez combien dépenser, apprenez prix locaux',
    regions_title: 'Régions Populaires',
    region1: '🥐 Gaziantep: Baklava, Lahmacun',
    region2: '🍇 Manisa: Raisins Sultaniye, Pâte mesir',
    region3: '🧀 Kars: Fromage Gravyer, Kasar',
    region4: '🫖 Rize: Thé, Miel',
    sidebar_title: 'Chercher Produits Locaux',
    sidebar_desc: 'Crée spot saveurs régionales cherches',
    sidebar_btn: 'Créer Spot',
    stats_title: 'Statistiques',
    stat1_label: 'Spots Locaux', stat1_val: '847',
    stat2_label: 'Trouvés avec Succès', stat2_val: '81%',
  },
  es: {
    title: '🏔️ Productos Locales',
    subtitle: 'Sabores regionales y productos tradicionales',
    cta: 'Spots Locales',
    section1_title: '¿Qué son productos locales?',
    section1_desc: 'Productos locales artículos especiales producidos tradicionalmente en regiones específicas, reflejando cultura sabores área. Difíciles encontrar en línea, ¡pero imprescindibles visitar!',
    item1_icon: '🍯', item1_title: 'Especialidades Regionales', item1_desc: 'Baklava Antep, Helado Mara, Queso Trabzon, Gravyer Kars',
    item2_icon: '🧵', item2_title: 'Artículos Hechos a Mano', item2_desc: 'Kilim, alfombra, cerámica, cobre, alfarería',
    item3_icon: '🌿', item3_title: 'Natural & Orgánico', item3_desc: 'Tés hierbas regionales, variedades miel, aceite oliva',
    item4_icon: '🎁', item4_title: 'Artículos Regalo', item4_desc: 'Cuentas ojo malvado, cajas nácar, ropa tradicional',
    section2_title: '¿Dónde encontrar?',
    where1_title: '🏪 Mercados Locales & Bazares', where1_desc: 'Bazares históricos, mercados barrio tiendas productores locales primeras paradas.',
    where2_title: '👨‍🌾 De pequeños productores', where2_desc: 'Artículos hechos tradicionalmente familias vendidos pequeñas tiendas casas.',
    where3_title: '🗺️ Vía sistema Spot', where3_desc: 'Crea spot habitantes locales, ¡ayudarán!',
    section3_title: 'Consejos Creación Spot',
    tip1: '📍 Especifica Región: Di claramente ciudad/distrito buscas',
    tip2: '🏷️ Detalles Producto: Di "baklava fina pistacho" en lugar solo "baklava"',
    tip3: '💰 Presupuesto: Menciona cuánto gastar, aprende precios locales',
    regions_title: 'Regiones Populares',
    region1: '🥐 Gaziantep: Baklava, Lahmacun',
    region2: '🍇 Manisa: Pasas Sultaniye, Pasta mesir',
    region3: '🧀 Kars: Queso Gravyer, Kasar',
    region4: '🫖 Rize: Té, Miel',
    sidebar_title: 'Buscar Productos Locales',
    sidebar_desc: 'Crea spot sabores regionales buscas',
    sidebar_btn: 'Crear Spot',
    stats_title: 'Estadísticas',
    stat1_label: 'Spots Locales', stat1_val: '847',
    stat2_label: 'Encontrados Exitosamente', stat2_val: '81%',
  },
  ru: {
    title: '🏔️ Местные Продукты',
    subtitle: 'Региональные специалитеты и традиционные продукты',
    cta: 'Местные Объявления',
    section1_title: 'Что такое местные продукты?',
    section1_desc: 'Местные продукты - это специальные предметы, произведённые традиционно в определённых регионах, отражающие культуру вкусы области. Трудно найти онлайн, но должны попробовать!',
    item1_icon: '🍯', item1_title: 'Региональные Специалитеты', item1_desc: 'Баклава Антеп, Мороженое Мара, Сыр Трабзон, Гравьер Карс',
    item2_icon: '🧵', item2_title: 'Ручные Изделия', item2_desc: 'Килим, ковёр, керамика, медные изделия, гончарство',
    item3_icon: '🌿', item3_title: 'Натуральное & Органическое', item3_desc: 'Региональные травяные чаи, сорта мёда, оливковое масло',
    item4_icon: '🎁', item4_title: 'Сувениры', item4_desc: 'Бусины сглаза, шкатулки перламутра, традиционная одежда',
    section2_title: 'Где найти?',
    where1_title: '🏪 Местные Рынки & Базары', where1_desc: 'Исторические базары, местные рынки магазины производителей первые остановки.',
    where2_title: '👨‍🌾 От малых производителей', where2_desc: 'Изделия, произведённые традиционно семьями, продаются небольших магазинах домах.',
    where3_title: '🗺️ Через систему Объявлений', where3_desc: 'Создай объявление местным жителям, они помогут!',
    section3_title: 'Советы Создания Объявления',
    tip1: '📍 Укажи Регион: Ясно скажи какой город/район ищешь',
    tip2: '🏷️ Детали Продукта: Скажи "тонкая фисташковая баклава" вместо просто "баклава"',
    tip3: '💰 Бюджет: Упомяни сколько можешь потратить, узнай локальные цены',
    regions_title: 'Популярные Регионы',
    region1: '🥐 Газиантеп: Баклава, Лахмаджун',
    region2: '🍇 Маниса: Изюм Султание, Паста месир',
    region3: '🧀 Карс: Сыр Гравьер, Казар',
    region4: '🫖 Риза: Чай, Мёд',
    sidebar_title: 'Поиск Местных Продуктов',
    sidebar_desc: 'Создай объявление региональные вкусы ищешь',
    sidebar_btn: 'Создать Объявление',
    stats_title: 'Статистика',
    stat1_label: 'Местных Объявлений', stat1_val: '847',
    stat2_label: 'Найдено Успешно', stat2_val: '81%',
  },
} as const

export default function LocalProductsPage() {
  const locale = useCurrentLocale()
  const t = localProductsText[locale as keyof typeof localProductsText] ?? localProductsText.tr

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-xl text-gray-600">{t.subtitle}</p>
          </div>
          <Link href="/spots?category=yoresel" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold whitespace-nowrap">
            {t.cta}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.section1_title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t.section1_desc}</p>
              <ul className="space-y-3">
                {[
                  { icon: t.item1_icon, title: t.item1_title, desc: t.item1_desc },
                  { icon: t.item2_icon, title: t.item2_title, desc: t.item2_desc },
                  { icon: t.item3_icon, title: t.item3_title, desc: t.item3_desc },
                  { icon: t.item4_icon, title: t.item4_title, desc: t.item4_desc },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 2 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.section2_title}</h2>
              <div className="space-y-4">
                {[
                  { title: t.where1_title, desc: t.where1_desc },
                  { title: t.where2_title, desc: t.where2_desc },
                  { title: t.where3_title, desc: t.where3_desc },
                ].map((item, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.section3_title}</h2>
              <div className="space-y-3">
                {[t.tip1, t.tip2, t.tip3].map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xl">{tip.charAt(0)}</span>
                    <p className="text-sm text-gray-700">{tip.substring(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6 border border-green-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">{t.regions_title}</h3>
              <div className="space-y-2 text-sm">
                {[t.region1, t.region2, t.region3, t.region4].map((region, i) => (
                  <div key={i} className="p-2 bg-white rounded">{region}</div>
                ))}
              </div>
            </div>

            <div className="bg-green-600 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">{t.sidebar_title}</h3>
              <p className="text-sm opacity-90 mb-4">{t.sidebar_desc}</p>
              <Link href="/create-spot" className="block text-center bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
                {t.sidebar_btn}
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">{t.stats_title}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.stat1_label}</span>
                  <span className="font-bold">{t.stat1_val}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.stat2_label}</span>
                  <span className="font-bold">{t.stat2_val}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import Link from 'next/link'

import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const discontinuedText = {
  tr: {
    title: '⚙️ Üretimi Durmuş Ürünler',
    subtitle: 'Eski model parçalar ve üretimi durmuş ürünler',
    topLink: 'İlgili Spotlar',
    s1Title: 'Üretimi Durmuş Ürün Nedir?',
    s1Desc: 'Üretimi durmuş ürünler, artık fabrika tarafından üretilmeyen, piyasada bulunmayan ancak hala kullanılan veya tamir edilmesi gereken eşya ve parçalardır. Bazen nostaljik değeri, bazen de işlevsel ihtiyaç nedeniyle aranırlar.',
    s1Item1Title: 'Yedek Parçalar',
    s1Item1Desc: 'Eski model beyaz eşya, elektronik cihaz ve otomobil parçaları',
    s1Item2Title: 'Teknoloji Ürünleri',
    s1Item2Desc: 'Eski telefon modelleri, vintage kameralar ve klasik oyun konsolları',
    s1Item3Title: 'Giyim ve Aksesuar',
    s1Item3Desc: 'Artık üretilmeyen markalar ve eski sezon ürünleri',
    s1Item4Title: 'Hobi İçerikleri',
    s1Item4Desc: 'Eski nesil oyun kasetleri veya CD’leri, koleksiyon figürleri',
    s2Title: 'Nereden Bulunur?',
    s2Card1Title: '🏪 İkinci El Pazarlar',
    s2Card1Desc: 'Bit pazarları, ikinci el dükkanları ve online ikinci el satış platformları ilk bakılacak yerlerdir.',
    s2Card2Title: '🔍 Özel Koleksiyoncular',
    s2Card2Desc: 'Bazı koleksiyoncular eski model parçaları saklar. Forumlarda ve koleksiyoncu gruplarında sorun.',
    s2Card3Title: '🌐 SpotItForMe ile',
    s2Card3Desc: 'Spot oluşturun, belki evinde duran birini bulursunuz!',
    s3Title: 'Spot Oluştururken Dikkat!',
    s3Item1Label: 'Model ve Seri No:',
    s3Item1Desc: 'Ne kadar detay verirseniz o kadar iyi',
    s3Item2Label: 'Fotoğraf:',
    s3Item2Desc: 'Aradığınız parçanın internetten bulduğunuz görselini ekleyin',
    s3Item3Label: 'Üretim Yılı:',
    s3Item3Desc: 'Yaklaşık hangi yılda üretildiğini belirtin',
    side1Title: 'En Çok Aranan',
    side1Item1: '🔌 Eski beyaz eşya parçaları',
    side1Item2: '📱 Vintage telefon modelleri',
    side1Item3: '🚗 Klasik araba yedek parçaları',
    side1Item4: '📷 Eski kamera lensleri',
    side2Title: 'Eski Model Parça Ara',
    side2Desc: 'Aradığın yedek parça için spot oluştur',
    side2Btn: 'Spot Oluştur',
    side3Title: 'İpuçları',
    side3Item1: '✓ Marka ve model no mutlaka yazın',
    side3Item2: '✓ Alternatif uyumlu parçaları belirtin',
    side3Item3: '✓ Fotoğraf ekleyin',
    side3Item4: '✓ Acil mi değil mi belirtin',
  },
  en: {
    title: '⚙️ Discontinued Products',
    subtitle: 'Older parts and discontinued products',
    topLink: 'Related Spots',
    s1Title: 'What Is a Discontinued Product?',
    s1Desc: 'Discontinued products are items and parts no longer manufactured by the factory and no longer widely available, yet still in use or still needed for repairs. People look for them because of nostalgia or practical need.',
    s1Item1Title: 'Spare Parts',
    s1Item1Desc: 'Older home appliances, electronic devices, and car parts',
    s1Item2Title: 'Tech Products',
    s1Item2Desc: 'Older phone models, vintage cameras, and classic game consoles',
    s1Item3Title: 'Clothing and Accessories',
    s1Item3Desc: 'Brands that shut down and products from past seasons',
    s1Item4Title: 'Hobby Items',
    s1Item4Desc: 'Retro game cartridges or CDs, collectible figures',
    s2Title: 'Where Can You Find Them?',
    s2Card1Title: '🏪 Second-Hand Markets',
    s2Card1Desc: 'Flea markets, second-hand stores, and online resale platforms are the first places to check.',
    s2Card2Title: '🔍 Private Collectors',
    s2Card2Desc: 'Some collectors keep old-model parts. Ask around in forums and collector groups.',
    s2Card3Title: '🌐 With SpotItForMe',
    s2Card3Desc: 'Create a spot, and you may find someone who already has it at home.',
    s3Title: 'Watch Out When Creating a Spot!',
    s3Item1Label: 'Model and Serial No:',
    s3Item1Desc: 'The more detail you give, the better',
    s3Item2Label: 'Photo:',
    s3Item2Desc: 'Add an image of the part you found online',
    s3Item3Label: 'Production Year:',
    s3Item3Desc: 'Mention roughly which year it was produced',
    side1Title: 'Most Requested',
    side1Item1: '🔌 Old appliance parts',
    side1Item2: '📱 Vintage phone models',
    side1Item3: '🚗 Classic car spare parts',
    side1Item4: '📷 Old camera lenses',
    side2Title: 'Search for Old Model Parts',
    side2Desc: 'Create a spot for the spare part you need',
    side2Btn: 'Create Spot',
    side3Title: 'Tips',
    side3Item1: '✓ Always include brand and model number',
    side3Item2: '✓ Mention compatible alternatives',
    side3Item3: '✓ Add a photo',
    side3Item4: '✓ State whether it is urgent',
  },
  de: {
    title: '⚙️ Ausgelaufene Produkte',
    subtitle: 'Alte Modellteile und nicht mehr produzierte Produkte',
    topLink: 'Passende Spots',
    s1Title: 'Was ist ein ausgelaufenes Produkt?',
    s1Desc: 'Ausgelaufene Produkte sind Artikel und Teile, die nicht mehr vom Hersteller produziert und kaum noch am Markt gefunden werden, aber weiterhin genutzt oder repariert werden müssen. Man sucht sie aus Nostalgie oder aus praktischem Bedarf.',
    s1Item1Title: 'Ersatzteile',
    s1Item1Desc: 'Teile für ältere Haushaltsgeräte, Elektronik und Autos',
    s1Item2Title: 'Technikprodukte',
    s1Item2Desc: 'Ältere Handymodelle, Vintage-Kameras und klassische Spielkonsolen',
    s1Item3Title: 'Kleidung und Accessoires',
    s1Item3Desc: 'Nicht mehr produzierte Marken und Produkte früherer Saisons',
    s1Item4Title: 'Hobbyartikel',
    s1Item4Desc: 'Alte Spielmodule oder CDs, Sammlerfiguren',
    s2Title: 'Wo findet man sie?',
    s2Card1Title: '🏪 Secondhand-Märkte',
    s2Card1Desc: 'Flohmärkte, Secondhand-Läden und Online-Weiterverkaufsplattformen sind die ersten Anlaufstellen.',
    s2Card2Title: '🔍 Private Sammler',
    s2Card2Desc: 'Manche Sammler bewahren alte Modellteile auf. Frag in Foren und Sammlergruppen nach.',
    s2Card3Title: '🌐 Mit SpotItForMe',
    s2Card3Desc: 'Erstelle einen Spot, vielleicht findest du jemanden, der das Teil zuhause liegen hat.',
    s3Title: 'Worauf du beim Erstellen achten solltest',
    s3Item1Label: 'Modell und Seriennr.:',
    s3Item1Desc: 'Je mehr Details du gibst, desto besser',
    s3Item2Label: 'Foto:',
    s3Item2Desc: 'Füge ein Bild des gesuchten Teils hinzu',
    s3Item3Label: 'Baujahr:',
    s3Item3Desc: 'Gib ungefähr das Produktionsjahr an',
    side1Title: 'Am häufigsten gesucht',
    side1Item1: '🔌 Alte Haushaltsgeräteteile',
    side1Item2: '📱 Vintage-Handymodelle',
    side1Item3: '🚗 Ersatzteile für klassische Autos',
    side1Item4: '📷 Alte Kameraobjektive',
    side2Title: 'Alte Modellteile suchen',
    side2Desc: 'Erstelle einen Spot für das Ersatzteil, das du suchst',
    side2Btn: 'Spot erstellen',
    side3Title: 'Tipps',
    side3Item1: '✓ Marke und Modellnummer immer angeben',
    side3Item2: '✓ Kompatible Alternativen erwähnen',
    side3Item3: '✓ Ein Foto hinzufügen',
    side3Item4: '✓ Angeben, ob es dringend ist',
  },
  fr: {
    title: '⚙️ Produits arrêtés',
    subtitle: 'Pièces d’anciens modèles et produits arrêtés',
    topLink: 'Spots associés',
    s1Title: 'Qu’est-ce qu’un produit arrêté ?',
    s1Desc: 'Les produits arrêtés sont des objets et des pièces qui ne sont plus fabriqués par l’usine et ne se trouvent presque plus sur le marché, mais qui sont encore utilisés ou nécessaires pour des réparations. On les recherche pour leur valeur nostalgique ou pour un besoin pratique.',
    s1Item1Title: 'Pièces de rechange',
    s1Item1Desc: 'Pièces pour anciens appareils ménagers, électroniques et automobiles',
    s1Item2Title: 'Produits technologiques',
    s1Item2Desc: 'Anciens téléphones, appareils photo vintage et consoles classiques',
    s1Item3Title: 'Vêtements et accessoires',
    s1Item3Desc: 'Marques disparues et produits d’anciennes saisons',
    s1Item4Title: 'Articles de loisir',
    s1Item4Desc: 'Anciennes cartouches ou CD de jeux, figurines de collection',
    s2Title: 'Où les trouver ?',
    s2Card1Title: '🏪 Marchés d’occasion',
    s2Card1Desc: 'Les brocantes, magasins d’occasion et plateformes de revente en ligne sont les premiers endroits à vérifier.',
    s2Card2Title: '🔍 Collectionneurs privés',
    s2Card2Desc: 'Certains collectionneurs gardent d’anciennes pièces. Demandez dans les forums et groupes de collectionneurs.',
    s2Card3Title: '🌐 Avec SpotItForMe',
    s2Card3Desc: 'Créez un spot, vous trouverez peut-être quelqu’un qui l’a déjà chez lui.',
    s3Title: 'À savoir en créant un spot',
    s3Item1Label: 'Modèle et n° de série :',
    s3Item1Desc: 'Plus vous donnez de détails, mieux c’est',
    s3Item2Label: 'Photo :',
    s3Item2Desc: 'Ajoutez une image de la pièce que vous avez trouvée en ligne',
    s3Item3Label: 'Année de fabrication :',
    s3Item3Desc: 'Indiquez approximativement l’année de fabrication',
    side1Title: 'Les plus recherchés',
    side1Item1: '🔌 Anciennes pièces d’électroménager',
    side1Item2: '📱 Modèles de téléphones vintage',
    side1Item3: '🚗 Pièces de voitures classiques',
    side1Item4: '📷 Anciens objectifs photo',
    side2Title: 'Chercher une pièce ancienne',
    side2Desc: 'Créez un spot pour la pièce de rechange que vous cherchez',
    side2Btn: 'Créer un spot',
    side3Title: 'Conseils',
    side3Item1: '✓ Indiquez toujours la marque et le numéro de modèle',
    side3Item2: '✓ Mentionnez les pièces compatibles',
    side3Item3: '✓ Ajoutez une photo',
    side3Item4: '✓ Précisez si c’est urgent',
  },
  es: {
    title: '⚙️ Productos descatalogados',
    subtitle: 'Piezas de modelos antiguos y productos descatalogados',
    topLink: 'Spots relacionados',
    s1Title: '¿Qué es un producto descatalogado?',
    s1Desc: 'Los productos descatalogados son artículos y piezas que ya no fabrica la empresa y que ya no se encuentran fácilmente en el mercado, aunque todavía se usan o se necesitan para reparaciones. Se buscan por nostalgia o por necesidad práctica.',
    s1Item1Title: 'Repuestos',
    s1Item1Desc: 'Piezas para electrodomésticos antiguos, dispositivos electrónicos y automóviles',
    s1Item2Title: 'Productos tecnológicos',
    s1Item2Desc: 'Modelos de teléfonos antiguos, cámaras vintage y consolas clásicas',
    s1Item3Title: 'Ropa y accesorios',
    s1Item3Desc: 'Marcas desaparecidas y productos de temporadas anteriores',
    s1Item4Title: 'Artículos de hobby',
    s1Item4Desc: 'Cartuchos o CD retro, figuras de colección',
    s2Title: '¿Dónde encontrarlos?',
    s2Card1Title: '🏪 Mercados de segunda mano',
    s2Card1Desc: 'Los mercadillos, las tiendas de segunda mano y las plataformas de reventa online son los primeros lugares que revisar.',
    s2Card2Title: '🔍 Coleccionistas privados',
    s2Card2Desc: 'Algunos coleccionistas guardan piezas de modelos antiguos. Pregunta en foros y grupos de coleccionistas.',
    s2Card3Title: '🌐 Con SpotItForMe',
    s2Card3Desc: 'Crea un spot y quizá encuentres a alguien que ya lo tiene en casa.',
    s3Title: 'Qué cuidar al crear un spot',
    s3Item1Label: 'Modelo y n.º de serie:',
    s3Item1Desc: 'Cuantos más detalles des, mejor',
    s3Item2Label: 'Foto:',
    s3Item2Desc: 'Añade una imagen de la pieza que encontraste en internet',
    s3Item3Label: 'Año de fabricación:',
    s3Item3Desc: 'Indica aproximadamente en qué año se fabricó',
    side1Title: 'Lo más buscado',
    side1Item1: '🔌 Piezas antiguas de electrodomésticos',
    side1Item2: '📱 Modelos de teléfonos vintage',
    side1Item3: '🚗 Repuestos para coches clásicos',
    side1Item4: '📷 Lentes de cámaras antiguas',
    side2Title: 'Busca piezas de modelos antiguos',
    side2Desc: 'Crea un spot para el repuesto que necesitas',
    side2Btn: 'Crear spot',
    side3Title: 'Consejos',
    side3Item1: '✓ Escribe siempre la marca y el número de modelo',
    side3Item2: '✓ Indica alternativas compatibles',
    side3Item3: '✓ Añade una foto',
    side3Item4: '✓ Indica si es urgente',
  },
  ru: {
    title: '⚙️ Снятые с производства товары',
    subtitle: 'Детали старых моделей и товары, которые больше не выпускаются',
    topLink: 'Похожие споты',
    s1Title: 'Что такое снятый с производства товар?',
    s1Desc: 'Снятые с производства товары - это вещи и детали, которые больше не выпускаются заводом и почти не встречаются в продаже, но все еще используются или нужны для ремонта. Их ищут из-за ностальгии или по практической необходимости.',
    s1Item1Title: 'Запасные части',
    s1Item1Desc: 'Детали для старой бытовой техники, электроники и автомобилей',
    s1Item2Title: 'Технические товары',
    s1Item2Desc: 'Старые модели телефонов, винтажные камеры и классические игровые консоли',
    s1Item3Title: 'Одежда и аксессуары',
    s1Item3Desc: 'Бренды, которые закрылись, и товары прошлых сезонов',
    s1Item4Title: 'Хобби-товары',
    s1Item4Desc: 'Старые игровые картриджи или CD, коллекционные фигурки',
    s2Title: 'Где их найти?',
    s2Card1Title: '🏪 Рынки подержанных вещей',
    s2Card1Desc: 'Блошиные рынки, секонд-хенды и онлайн-платформы перепродажи - первые места, которые стоит проверить.',
    s2Card2Title: '🔍 Частные коллекционеры',
    s2Card2Desc: 'Некоторые коллекционеры хранят детали старых моделей. Спросите на форумах и в сообществах коллекционеров.',
    s2Card3Title: '🌐 С SpotItForMe',
    s2Card3Desc: 'Создайте спот - возможно, вы найдете человека, у которого эта вещь уже есть дома.',
    s3Title: 'На что обратить внимание при создании спота',
    s3Item1Label: 'Модель и серийный номер:',
    s3Item1Desc: 'Чем больше деталей вы дадите, тем лучше',
    s3Item2Label: 'Фото:',
    s3Item2Desc: 'Добавьте изображение нужной детали, которое вы нашли в интернете',
    s3Item3Label: 'Год выпуска:',
    s3Item3Desc: 'Укажите примерный год производства',
    side1Title: 'Ищут чаще всего',
    side1Item1: '🔌 Старые детали бытовой техники',
    side1Item2: '📱 Винтажные модели телефонов',
    side1Item3: '🚗 Запчасти для классических автомобилей',
    side1Item4: '📷 Старые объективы для камер',
    side2Title: 'Искать детали старых моделей',
    side2Desc: 'Создайте спот для нужной вам запчасти',
    side2Btn: 'Создать спот',
    side3Title: 'Советы',
    side3Item1: '✓ Обязательно укажите бренд и номер модели',
    side3Item2: '✓ Укажите совместимые альтернативы',
    side3Item3: '✓ Добавьте фото',
    side3Item4: '✓ Уточните, срочно ли это',
  },
} as const

export default function DiscontinuedProductsPage() {
  const locale = useCurrentLocale()
  const t = discontinuedText[locale as keyof typeof discontinuedText] ?? discontinuedText.tr

  return (
    <div className="min-h-screen bg-white">
      <main className="container-custom py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-xl text-gray-600">{t.subtitle}</p>
          </div>
          <Link href="/spots?category=uretimi-durmus" className="bg-gray-700 text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-bold">
            {t.topLink}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s1Title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t.s1Desc}</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.s1Item1Title}</h3>
                    <p className="text-sm text-gray-600">{t.s1Item1Desc}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.s1Item2Title}</h3>
                    <p className="text-sm text-gray-600">{t.s1Item2Desc}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">👕</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.s1Item3Title}</h3>
                    <p className="text-sm text-gray-600">{t.s1Item3Desc}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🎮</span>
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

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s3Title}</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">🏷️</span>
                  <p className="text-sm text-gray-700"><strong>{t.s3Item1Label}</strong> {t.s3Item1Desc}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📸</span>
                  <p className="text-sm text-gray-700"><strong>{t.s3Item2Label}</strong> {t.s3Item2Desc}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📅</span>
                  <p className="text-sm text-gray-700"><strong>{t.s3Item3Label}</strong> {t.s3Item3Desc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">{t.side1Title}</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-white rounded">{t.side1Item1}</div>
                <div className="p-2 bg-white rounded">{t.side1Item2}</div>
                <div className="p-2 bg-white rounded">{t.side1Item3}</div>
                <div className="p-2 bg-white rounded">{t.side1Item4}</div>
              </div>
            </div>

            <div className="bg-gray-700 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">{t.side2Title}</h3>
              <p className="text-sm opacity-90 mb-4">{t.side2Desc}</p>
              <Link href="/create-spot" className="block text-center bg-white text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
                {t.side2Btn}
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">{t.side3Title}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>{t.side3Item1}</li>
                <li>{t.side3Item2}</li>
                <li>{t.side3Item3}</li>
                <li>{t.side3Item4}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

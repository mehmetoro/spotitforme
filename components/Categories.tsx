"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SOCIAL_CATEGORIES, findCategoryByValue, getCategorySlug } from '@/lib/social-categories';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';

const CATEGORY_LIST = SOCIAL_CATEGORIES;

const CITY_LIST = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Trabzon', 'Yalova'
];

export default function Categories() {
  const locale = useCurrentLocale();
  const t = {
    title: locale === 'tr' ? 'Populer Kategoriler' : locale === 'en' ? 'Popular Categories' : locale === 'de' ? 'Beliebte Kategorien' : locale === 'fr' ? 'Categories populaires' : locale === 'es' ? 'Categorias populares' : 'Populyarnye kategorii',
    subtitle: locale === 'tr' ? 'Ihtiyaciniz olan urunu kategorilere gore arayin veya yeni bir spot olusturun' : locale === 'en' ? 'Search by category or create a new spot for what you need' : locale === 'de' ? 'Suche nach Kategorien oder erstelle einen neuen Spot' : locale === 'fr' ? 'Recherchez par categorie ou creez un nouveau spot' : locale === 'es' ? 'Busca por categoria o crea un nuevo spot' : 'Ishchite po kategoriyam ili sozdavayte novyy spot',
    posts: locale === 'tr' ? 'paylasim' : locale === 'en' ? 'posts' : locale === 'de' ? 'Beitrage' : locale === 'fr' ? 'publications' : locale === 'es' ? 'publicaciones' : 'publikatsiy',
    cities: locale === 'tr' ? 'Sehirlere Gore Ara' : locale === 'en' ? 'Search by City' : locale === 'de' ? 'Nach Stadt suchen' : locale === 'fr' ? 'Rechercher par ville' : locale === 'es' ? 'Buscar por ciudad' : 'Poisk po gorodam',
    allCities: locale === 'tr' ? '+ Tum Sehirler' : locale === 'en' ? '+ All Cities' : locale === 'de' ? '+ Alle Stadte' : locale === 'fr' ? '+ Toutes les villes' : locale === 'es' ? '+ Todas las ciudades' : '+ Vse goroda',
  };

  const categoryNameByLocale: Record<string, Record<string, string>> = {
    en: {
      'Tarihi Yerler': 'Historical Places',
      'Muzeler ve Sergiler': 'Museums and Exhibitions',
      'Ibadethaneler': 'Places of Worship',
      'Konaklama': 'Accommodation',
      'Restoran ve Lezzet Duraklari': 'Restaurants and Food Stops',
      'Kafeler ve Kahveciler': 'Cafes and Coffee Shops',
      'Yerel Pazarlar ve Carsilar': 'Local Markets and Bazaars',
      'Antika ve Bit Pazarlari': 'Antique and Flea Markets',
      'Doga Rotalari ve Milli Parklar': 'Nature Routes and National Parks',
      'Kiyi ve Plajlar': 'Coasts and Beaches',
      'Seyir Teraslari ve Manzara Noktalari': 'Viewpoints and Scenic Terraces',
      'Sanat Sokaklari ve Atolyeler': 'Art Streets and Workshops',
      'Festival ve Etkinlik Alanlari': 'Festival and Event Areas',
      'Gece Hayati ve Eglence': 'Nightlife and Entertainment',
      'Koyler ve Kasabalar': 'Villages and Towns',
      'Rota Ustu Duraklar': 'Route Stops',
      'Gizli Mekanlar': 'Hidden Places',
      'Diger': 'Other',
    },
    de: {
      'Tarihi Yerler': 'Historische Orte',
      'Muzeler ve Sergiler': 'Museen und Ausstellungen',
      'Ibadethaneler': 'Gotteshauser',
      'Konaklama': 'Unterkunft',
      'Restoran ve Lezzet Duraklari': 'Restaurants und Genussorte',
      'Kafeler ve Kahveciler': 'Cafes und Kaffeerostereien',
      'Yerel Pazarlar ve Carsilar': 'Lokale Markte und Basare',
      'Antika ve Bit Pazarlari': 'Antik- und Flohmarkte',
      'Doga Rotalari ve Milli Parklar': 'Naturrouten und Nationalparks',
      'Kiyi ve Plajlar': 'Kusten und Strande',
      'Seyir Teraslari ve Manzara Noktalari': 'Aussichtspunkte und Panoramaterrassen',
      'Sanat Sokaklari ve Atolyeler': 'Kunststrassen und Ateliers',
      'Festival ve Etkinlik Alanlari': 'Festival- und Eventflachen',
      'Gece Hayati ve Eglence': 'Nachtleben und Unterhaltung',
      'Koyler ve Kasabalar': 'Dorfer und Kleinstadte',
      'Rota Ustu Duraklar': 'Stopps entlang der Route',
      'Gizli Mekanlar': 'Versteckte Orte',
      'Diger': 'Andere',
    },
    fr: {
      'Tarihi Yerler': 'Lieux historiques',
      'Muzeler ve Sergiler': 'Musees et expositions',
      'Ibadethaneler': 'Lieux de culte',
      'Konaklama': 'Hebergement',
      'Restoran ve Lezzet Duraklari': 'Restaurants et haltes gourmandes',
      'Kafeler ve Kahveciler': 'Cafes et coffee shops',
      'Yerel Pazarlar ve Carsilar': 'Marches locaux et bazars',
      'Antika ve Bit Pazarlari': 'Marches aux puces et antiquites',
      'Doga Rotalari ve Milli Parklar': 'Itineraires nature et parcs nationaux',
      'Kiyi ve Plajlar': 'Cotes et plages',
      'Seyir Teraslari ve Manzara Noktalari': 'Belvederes et points de vue',
      'Sanat Sokaklari ve Atolyeler': 'Rues d art et ateliers',
      'Festival ve Etkinlik Alanlari': 'Zones de festivals et evenements',
      'Gece Hayati ve Eglence': 'Vie nocturne et divertissement',
      'Koyler ve Kasabalar': 'Villages et petites villes',
      'Rota Ustu Duraklar': 'Arrets de route',
      'Gizli Mekanlar': 'Lieux caches',
      'Diger': 'Autre',
    },
    es: {
      'Tarihi Yerler': 'Lugares historicos',
      'Muzeler ve Sergiler': 'Museos y exposiciones',
      'Ibadethaneler': 'Lugares de culto',
      'Konaklama': 'Alojamiento',
      'Restoran ve Lezzet Duraklari': 'Restaurantes y paradas gastronomicas',
      'Kafeler ve Kahveciler': 'Cafes y cafeterias',
      'Yerel Pazarlar ve Carsilar': 'Mercados locales y bazares',
      'Antika ve Bit Pazarlari': 'Antiguedades y mercadillos',
      'Doga Rotalari ve Milli Parklar': 'Rutas naturales y parques nacionales',
      'Kiyi ve Plajlar': 'Costas y playas',
      'Seyir Teraslari ve Manzara Noktalari': 'Miradores y terrazas panoramicas',
      'Sanat Sokaklari ve Atolyeler': 'Calles de arte y talleres',
      'Festival ve Etkinlik Alanlari': 'Zonas de festivales y eventos',
      'Gece Hayati ve Eglence': 'Vida nocturna y ocio',
      'Koyler ve Kasabalar': 'Pueblos y villas',
      'Rota Ustu Duraklar': 'Paradas en ruta',
      'Gizli Mekanlar': 'Lugares ocultos',
      'Diger': 'Otro',
    },
    ru: {
      'Tarihi Yerler': 'Istoricheskiye mesta',
      'Muzeler ve Sergiler': 'Muzei i vystavki',
      'Ibadethaneler': 'Mesta bogosluzheniya',
      'Konaklama': 'Prozhivanie',
      'Restoran ve Lezzet Duraklari': 'Restorany i gastronomicheskiye tochki',
      'Kafeler ve Kahveciler': 'Kafe i kofeyni',
      'Yerel Pazarlar ve Carsilar': 'Mestnyye rynki i bazary',
      'Antika ve Bit Pazarlari': 'Antikvariat i bloshinyye rynki',
      'Doga Rotalari ve Milli Parklar': 'Prirodnyye marshruty i natsionalnye parki',
      'Kiyi ve Plajlar': 'Poberezhya i plyazhi',
      'Seyir Teraslari ve Manzara Noktalari': 'Smotrovye ploshchadki i panoramy',
      'Sanat Sokaklari ve Atolyeler': 'Ulitsy iskusstva i masterskiye',
      'Festival ve Etkinlik Alanlari': 'Festivalnye i event-ploshchadki',
      'Gece Hayati ve Eglence': 'Nochnaya zhizn i razlecheniya',
      'Koyler ve Kasabalar': 'Derevni i gorodki',
      'Rota Ustu Duraklar': 'Ostanovki po marshrutu',
      'Gizli Mekanlar': 'Skrytyye mesta',
      'Diger': 'Drugoye',
    },
  };

  const getCategoryLabel = (categoryId: string, defaultName: string) => {
    if (locale === 'tr') return defaultName;
    return categoryNameByLocale[locale]?.[categoryId] || defaultName;
  };

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    // Kategorilere göre aktif paylaşım sayısı (social_posts tablosu)
    (async () => {
      const counts: Record<string, number> = Object.fromEntries(
        CATEGORY_LIST.map((category) => [category.id, 0])
      );

      const { data, error } = await supabase
        .from('social_posts')
        .select('category');

      if (error) {
        setCategoryCounts(counts);
        return;
      }

      (data || []).forEach((row: { category: string | null }) => {
        const matchedCategory = findCategoryByValue(row.category);
        if (!matchedCategory) return;
        counts[matchedCategory.id] = (counts[matchedCategory.id] || 0) + 1;
      });

      setCategoryCounts(counts);
    })();

    // Şehirlere göre paylaşım sayısı (social_posts tablosu)
    (async () => {
      const counts: Record<string, number> = {};
      const { data, error } = await supabase
        .from('social_posts')
        .select('city');
      if (error) {
        setCityCounts({});
        return;
      }
      const normalize = (s: string) => (s || '').trim().toLocaleLowerCase('tr-TR');
      // Tüm şehirleri normalize edip say
      const cityCountMap: Record<string, number> = {};
      (data || []).forEach(row => {
        const city = normalize(row.city);
        if (city) cityCountMap[city] = (cityCountMap[city] || 0) + 1;
      });
      // CITY_LIST'i normalize ederek eşleştir
      for (const city of CITY_LIST) {
        const norm = normalize(city);
        // Hem orijinal hem de normalize edilmiş haliyle kontrol et
        counts[city] = cityCountMap[norm] || cityCountMap[city] || 0;
      }
      setCityCounts(counts);
    })();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORY_LIST.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:shadow-md transition duration-200 cursor-pointer"
              onClick={() => router.push(`/kategori/${getCategorySlug(category.id)}`)}
            >
              <div className={`w-16 h-16 ${category.badgeColor.split(' ')[0]} rounded-full flex items-center justify-center text-2xl mx-auto mb-4`}>
                {category.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{getCategoryLabel(category.id, category.name)}</h3>
              <p className="text-gray-500 text-sm">{categoryCounts[category.id] || 0} {t.posts}</p>
            </div>
          ))}
        </div>

        {/* Search by city */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            {t.cities}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {CITY_LIST.map((city) => (
              <button
                key={city}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-medium transition duration-200"
                onClick={() => router.push(`/discovery?city=${encodeURIComponent(city)}`)}
              >
                {city} <span className="ml-2 text-xs text-gray-500">({cityCounts[city] || 0})</span>
              </button>
            ))}
            <button className="px-6 py-3 text-blue-600 hover:text-blue-800 font-medium" onClick={() => router.push('/discovery')}>{t.allCities}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
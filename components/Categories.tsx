"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SOCIAL_CATEGORIES, findCategoryByValue, getCategorySlug } from '@/lib/social-categories';

const CATEGORY_LIST = SOCIAL_CATEGORIES;

const CITY_LIST = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Trabzon', 'Yalova'
];

export default function Categories() {
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
            Popüler Kategoriler
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İhtiyacınız olan ürünü kategorilere göre arayın veya yeni bir spot oluşturun
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
              <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-gray-500 text-sm">{categoryCounts[category.id] || 0} paylaşım</p>
            </div>
          ))}
        </div>

        {/* Search by city */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Şehirlere Göre Ara
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
            <button className="px-6 py-3 text-blue-600 hover:text-blue-800 font-medium" onClick={() => router.push('/discovery')}>+ Tüm Şehirler</button>
          </div>
        </div>
      </div>
    </section>
  );
}
// components/RecentSpots.tsx - GÜNCELLENMİŞ
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SpotCard from './SpotCard';
import NativeAd from './NativeAd';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';

export default function RecentSpots() {
  const locale = useCurrentLocale();
  const t = {
    title: locale === 'tr' ? "Yeni Eklenen Spot'lar" : locale === 'en' ? 'Recently Added Spots' : locale === 'de' ? 'Neu hinzugefugte Spots' : locale === 'fr' ? 'Spots recemment ajoutes' : locale === 'es' ? 'Spots agregados recientemente' : 'Nedavno dobavlennye spoty',
    seeAll: locale === 'tr' ? 'Tumunu Gor' : locale === 'en' ? 'See All' : locale === 'de' ? 'Alle ansehen' : locale === 'fr' ? 'Voir tout' : locale === 'es' ? 'Ver todo' : 'Smotret vse',
  };
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpots();
  }, [locale]);

  const loadSpots = async () => {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(9); // 9 spot + reklamlar

    if (error) {
      console.error('Error loading recent spots:', error);
      return;
    }

    let rows = data || [];

    if (locale !== 'tr' && rows.length > 0) {
      const spotIds = rows.map((s: any) => s.id);
      const { data: translations } = await supabase
        .from('spot_translations')
        .select('spot_id, title, description')
        .in('spot_id', spotIds)
        .eq('language', locale);

      if (translations && translations.length > 0) {
        const translationMap: Record<string, { title: string; description: string }> = {};
        translations.forEach((tr: any) => {
          translationMap[tr.spot_id] = {
            title: tr.title,
            description: tr.description,
          };
        });

        rows = rows.map((spot: any) => {
          const tr = translationMap[spot.id];
          if (!tr) return spot;
          return {
            ...spot,
            title: tr.title || spot.title,
            description: tr.description || spot.description,
          };
        });
      }
    }

    setSpots(rows);
    setLoading(false);
  };

  // Spotlar ve reklamları karıştır
  const getMixedItems = () => {
    const items: any[] = [];
    
    // İlk 3 spot
    items.push(...spots.slice(0, 3).map(spot => ({
      type: 'spot',
      data: spot,
      key: `spot-${spot.id}`
    })));
    
    // İlk reklam
    items.push({
      type: 'ad',
      key: 'ad-1',
      index: 3
    });
    
    // Sonraki 3 spot
    items.push(...spots.slice(3, 6).map(spot => ({
      type: 'spot',
      data: spot,
      key: `spot-${spot.id}`
    })));
    
    // İkinci reklam
    items.push({
      type: 'ad',
      key: 'ad-2',
      index: 6
    });
    
    // Son 3 spot
    items.push(...spots.slice(6, 9).map(spot => ({
      type: 'spot',
      data: spot,
      key: `spot-${spot.id}`
    })));
    
    return items;
  };

  const mixedItems = getMixedItems();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          {t.title}
        </h2>
        <a
          href="/spots"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {t.seeAll} →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mixedItems.map((item) => {
          if (item.type === 'spot') {
            return (
              <SpotCard key={item.key} spot={item.data} />
            );
          } else {
            return (
              <div key={item.key} className="col-span-full md:col-span-2 lg:col-span-3">
                <NativeAd index={item.index} />
              </div>
            );
          }
        })}
      </div>
    </section>
  );
}
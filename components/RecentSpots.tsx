// components/RecentSpots.tsx - GÜNCELLENMİŞ
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SpotCard from './SpotCard';
import NativeAd from './NativeAd';

export default function RecentSpots() {
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpots();
  }, []);

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

    setSpots(data || []);
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
          Yeni Eklenen Spot'lar
        </h2>
        <a
          href="/spots"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Tümünü Gör →
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
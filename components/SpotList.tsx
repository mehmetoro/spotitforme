// components/SpotList.tsx - GÜNCELLENMİŞ
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SpotCard from './SpotCard';
import NativeAd from './NativeAd';

interface SpotListProps {
  searchQuery?: string;
  category?: string;
  location?: string;
  status?: string;
}

export default function SpotList({ 
  searchQuery, 
  category, 
  location, 
  status 
}: SpotListProps) {
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadSpots = async (pageNum = 1) => {
    setLoading(true);
    
    // İlk önce spots'u getir
    let query = supabase
      .from('spots')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Filtreler
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (location && location !== 'all') {
      query = query.eq('location', location);
    }

    const { data, error } = await query
      .range((pageNum - 1) * 12, pageNum * 12 - 1);

    if (error) {
      console.error('Error loading spots:', error);
      return;
    }

    // Kullanıcı bilgilerini ayrıca getir
    if (data && data.length > 0) {
      const userIds = Array.from(new Set(data.map(spot => spot.user_id)));
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const userMap = new Map(users?.map(u => [u.id, u]) || []);
      const spotsWithUsers = data.map(spot => ({
        ...spot,
        user: userMap.get(spot.user_id) ? { full_name: userMap.get(spot.user_id)?.full_name } : null
      }));
      
      if (pageNum === 1) {
        setSpots(spotsWithUsers);
      } else {
        setSpots(prev => [...prev, ...spotsWithUsers]);
      }
    } else {
      if (pageNum === 1) {
        setSpots(data || []);
      } else {
        setSpots(prev => [...prev, ...(data || [])]);
      }
    }

    setHasMore((data?.length || 0) === 12);
    setLoading(false);
  };

  useEffect(() => {
    loadSpots(1);
    setPage(1);
  }, [searchQuery, category, location, status]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadSpots(nextPage);
  };

  // Reklamları spotlar arasına serpiştir
  const getItemsWithAds = () => {
    const items: any[] = [];
    const adFrequency = 4; // Her 4 spot'ta bir reklam
    
    spots.forEach((spot, index) => {
      items.push({
        type: 'spot',
        data: spot,
        key: `spot-${spot.id}`
      });
      
      // Belirli aralıklarla reklam ekle
      if ((index + 1) % adFrequency === 0) {
        items.push({
          type: 'ad',
          key: `ad-${index}`,
          index: index
        });
      }
    });
    
    return items;
  };

  const items = getItemsWithAds();

  return (
    <div>
      {/* Spot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Spot'lar yükleniyor...</p>
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && spots.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Daha Fazla Spot Göster
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && spots.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Spot bulunamadı
          </h3>
          <p className="text-gray-600 mb-6">
            Arama kriterlerinize uygun spot bulunamadı.
          </p>
          <a
            href="/create-spot"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
          >
            İlk Spot'u Siz Oluşturun
          </a>
        </div>
      )}
    </div>
  );
}
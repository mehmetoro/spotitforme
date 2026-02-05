// components/NativeAd.tsx - Spot'larla uyumlu reklam
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ExternalLink, TrendingUp, Star } from 'lucide-react';

interface NativeAdProps {
  index?: number; // Kaçıncı spot'tan sonra gösterileceği
  className?: string;
}

export default function NativeAd({ index = 3, className = '' }: NativeAdProps) {
  const [adData, setAdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAd();
  }, []);

  const loadAd = async () => {
    try {
      // Native reklamları getir (spot benzeri görünüm)
      const { data: ads } = await supabase
        .from('ad_units')
        .select('*')
        .eq('type', 'native')
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('rotation_order', { ascending: true })
        .limit(1);

      if (ads && ads.length > 0) {
        setAdData(ads[0]);
      }
    } catch (error) {
      console.error('Reklam yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`}>
        <div className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Reklam yoksa göster
  if (!adData) {
    return (
      <div className={`border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <h4 className="font-semibold text-blue-800 mb-2">Reklam Alanı</h4>
          <p className="text-blue-600 text-sm mb-4">
            Buraya spot'larla uyumlu reklamınızı yerleştirin
          </p>
          <div className="text-xs text-blue-500">
            Gösterim: 0 | Tıklama: 0 | CTR: 0%
          </div>
        </div>
      </div>
    );
  }

  // Native reklam gösterimi
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="p-6">
        {/* Reklam badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
              <span className="flex items-center">
                <Star size={12} className="mr-1" />
                SPONSORLU
              </span>
            </div>
            {adData.advertiser_name && (
              <span className="text-sm text-gray-600">{adData.advertiser_name}</span>
            )}
          </div>
          <ExternalLink size={16} className="text-gray-400" />
        </div>

        {/* Reklam içeriği */}
        <div className="mb-4">
          {adData.custom_html ? (
            <div dangerouslySetInnerHTML={{ __html: adData.custom_html }} />
          ) : (
            <>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                {adData.name || 'Özel Teklif'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {adData.description || 'Bu ürün/hizmet için özel fırsat!'}
              </p>
            </>
          )}
        </div>

        {/* Call to action */}
        <a
          href={adData.advertiser_url || '#'}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
          onClick={async () => {
            // Click tracking
            if (adData.id) {
              await supabase
                .from('ad_units')
                .update({ clicks: (adData.clicks || 0) + 1 })
                .eq('id', adData.id);
            }
          }}
        >
          {adData.cta_text || 'Detaylı İncele'}
        </a>

        {/* Küçük disclaimer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Bu bir reklamdır. SpotItForMe reklam içeriğinden sorumlu değildir.
          </p>
        </div>
      </div>
    </div>
  );
}
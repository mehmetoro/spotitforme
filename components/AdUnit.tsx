// components/AdUnit.tsx - ÇİFT ÖZELLİKLİ
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PromoCard, { PromoBanner } from '@/components/PromoCard';

interface AdUnitProps {
  placement: string; // 'header', 'sidebar', 'inline', 'popup'
  className?: string;
}

export default function AdUnit({ placement, className = '' }: AdUnitProps) {
  const [adData, setAdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adType, setAdType] = useState<'adsense' | 'manual' | 'placeholder'>('placeholder');

  useEffect(() => {
    loadAd();
  }, [placement]);

  const loadAd = async () => {
    try {
      // 1. Önce aktif reklamları getir
      const { data: ads } = await supabase
        .from('ad_units')
        .select('*')
        .eq('position', placement)
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('rotation_order', { ascending: true })
        .limit(1);

      if (ads && ads.length > 0) {
        const ad = ads[0];
        setAdData(ad);
        setAdType(ad.ad_type);
      } else {
        setAdType('placeholder');
      }
    } catch (error) {
      console.error('Reklam yükleme hatası:', error);
      setAdType('placeholder');
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async () => {
    if (!adData) return;
    
    await supabase
      .from('ad_units')
      .update({
        impressions: (adData.impressions || 0) + 1
      })
      .eq('id', adData.id);
  };

  const trackClick = async () => {
    if (!adData) return;
    
    await supabase
      .from('ad_units')
      .update({
        clicks: (adData.clicks || 0) + 1
      })
      .eq('id', adData.id);
  };

  if (loading) {
    return (
      <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-400">Reklam yükleniyor...</span>
        </div>
      </div>
    );
  }

  // AdSense reklamı
  if (adType === 'adsense' && adData?.client_id) {
    return (
      <div className={`relative ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adData.client_id}
          data-ad-slot={adData.ad_slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({});
            `,
          }}
        />
      </div>
    );
  }

  // Manuel reklam
  if (adType === 'manual' && adData) {
    return (
      <div 
        className={`relative ${className}`}
        onLoad={trackImpression}
        onClick={trackClick}
      >
        {adData.custom_html ? (
          <div dangerouslySetInnerHTML={{ __html: adData.custom_html }} />
        ) : (
          <a 
            href={adData.advertiser_url || '#'}
            target="_blank"
            rel="nofollow ugc noopener noreferrer"
            className="block"
          >
            <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="font-semibold text-blue-700">{adData.advertiser_name}</div>
                <div className="text-sm text-blue-600">Reklam Alanı</div>
                <div className="text-xs text-gray-500 mt-2">
                  Boyut: {adData.size} | Gösterim: {adData.impressions || 0}
                </div>
              </div>
            </div>
          </a>
        )}
      </div>
    );
  }

  // Placeholder - Reklam yoksa PromoCard göster
  // Header ve inline placement için banner formatı, diğerleri için kart formatı
  if (placement === 'header' || placement === 'inline') {
    return (
      <div className={className}>
        <PromoBanner variant="random" />
      </div>
    );
  }

  return (
    <div className={className}>
      <PromoCard variant="random" />
    </div>
  );
}

function getPlaceholderSize(placement: string): string {
  const sizes: Record<string, string> = {
    'header': '728x90',
    'sidebar': '300x250',
    'inline': '728x90',
    'mobile': '320x50',
    'popup': '400x300'
  };
  return sizes[placement] || '300x250';
}
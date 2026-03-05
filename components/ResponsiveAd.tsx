// components/ResponsiveAd.tsx - SABİT ÖLÇÜLER
'use client';

import { useState, useEffect } from 'react';
import PromoCard, { PromoBanner } from '@/components/PromoCard';

interface ResponsiveAdProps {
  placement: 'inline' | 'banner' | 'native';
  className?: string;
}

export default function ResponsiveAd({ 
  placement, 
  className = ''
}: ResponsiveAdProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse rounded`}>
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">Reklam yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Sabit ölçüler belirle
  const getAdConfig = () => {
    if (isMobile) {
      return {
        height: placement === 'banner' ? 'h-16' : 'h-48',
        width: 'w-full',
        textSize: 'text-sm',
        label: placement === 'banner' ? 'MOBİL BANNER' : 'MOBİL REKLAM',
        dimensions: placement === 'banner' ? '320×50' : '300×250',
        bgColor: placement === 'banner' ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : 'bg-gradient-to-br from-blue-50 to-purple-50'
      };
    } else {
      return {
        height: placement === 'banner' ? 'h-20' : 'h-40',
        width: 'w-full',
        textSize: 'text-base',
        label: placement === 'banner' ? 'DESKTOP BANNER' : 'DESKTOP REKLAM',
        dimensions: placement === 'banner' ? '728×90' : '728×90',
        bgColor: placement === 'banner' ? 'bg-gradient-to-r from-blue-100 to-indigo-100' : 'bg-gradient-to-br from-blue-100 to-purple-100'
      };
    }
  };

  const config = getAdConfig();

  // Banner placement için PromoBanner kullan
  if (placement === 'banner') {
    return <PromoBanner variant="random" className={className} />;
  }

  // Inline ve native placement için PromoCard kullan
  return <PromoCard variant="random" className={className} />;
}
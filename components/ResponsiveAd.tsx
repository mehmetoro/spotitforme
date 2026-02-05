// components/ResponsiveAd.tsx - DÜZELTMİŞ
'use client';

import { useState, useEffect } from 'react';
import NativeAd from './NativeAd';

interface ResponsiveAdProps {
  placement: 'inline' | 'banner' | 'native';
  className?: string;
}

export default function ResponsiveAd({ placement, className = '' }: ResponsiveAdProps) {
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
      <div className={`${className} bg-gray-100 animate-pulse rounded-lg`}>
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">Reklam yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Mobilde daha küçük reklam boyutları
  const getAdSize = () => {
    if (isMobile) {
      switch (placement) {
        case 'banner': return '320x50';
        case 'inline': return '300x250';
        case 'native': return 'native';
        default: return '300x250';
      }
    } else {
      switch (placement) {
        case 'banner': return '728x90';
        case 'inline': return '728x90';
        case 'native': return 'native';
        default: return '728x90';
      }
    }
  };

  const adSize = getAdSize();

  return (
    <div className={`${className} ${isMobile ? 'px-2' : ''}`}>
      {adSize === 'native' ? (
        <NativeAd />
      ) : (
        <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-gray-700 font-medium mb-2">
            {isMobile ? 'Mobil Reklam' : 'Desktop Reklam'}
          </div>
          <div className="text-gray-500 text-sm mb-3">
            Boyut: {adSize}
          </div>
          <div className="text-xs text-gray-400">
            Bu alana reklamınızı yerleştirin
          </div>
        </div>
      )}
    </div>
  );
}
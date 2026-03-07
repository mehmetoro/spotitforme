// components/ResponsiveAd.tsx - SABİT ÖLÇÜLER
'use client';

import { useState, useEffect } from 'react';

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

  if (placement === 'banner') {
    return (
      <div className={`${className} ${config.width} ${config.height} ${config.bgColor} rounded-xl border border-blue-100`}>
        <div className="h-full flex items-center justify-between px-4 md:px-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Sponsorlu İçerik</p>
            <p className={`font-semibold text-gray-800 ${config.textSize}`}>Spotitforme Tanıtımı</p>
          </div>
          <span className="text-xs md:text-sm bg-white text-blue-600 font-semibold px-3 py-1 rounded-full">Keşfet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${config.width} ${config.height} ${config.bgColor} rounded-xl border border-purple-100`}>
      <div className="h-full flex flex-col justify-center px-4 md:px-6">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sponsorlu İçerik</p>
        <p className={`font-semibold text-gray-800 ${config.textSize}`}>Topluluk ile daha hızlı bul</p>
        <p className="text-xs md:text-sm text-gray-600 mt-1">İstediğin ürünü paylaş, sana en yakın fırsatları keşfet.</p>
      </div>
    </div>
  );
}
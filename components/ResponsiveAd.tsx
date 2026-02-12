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

  return (
    <div className={`${className} ${config.width}`}>
      <div className={`
        text-center
        ${config.bgColor}
        border-2 border-dashed ${isMobile ? 'border-blue-200' : 'border-blue-300'}
        rounded-lg
        overflow-hidden
        relative
      `}>
        {/* Reklam etiketi - köşede */}
        <div className={`absolute top-2 left-2 ${isMobile ? 'text-[10px]' : 'text-xs'} bg-blue-600 text-white px-2 py-1 rounded`}>
          REKLAM
        </div>
        
        {/* Platform etiketi - diğer köşede */}
        <div className={`absolute top-2 right-2 ${isMobile ? 'text-[10px]' : 'text-xs'} bg-gray-700 text-white px-2 py-1 rounded`}>
          {isMobile ? '📱' : '💻'}
        </div>
        
        {/* Ana reklam alanı */}
        <div className={`
          ${config.height}
          flex flex-col items-center justify-center
          px-4
        `}>
          <div className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} text-blue-700 mb-1`}>
            {config.label}
          </div>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-600 mb-2`}>
            {config.dimensions}
          </div>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
            {isMobile 
              ? 'Mobil uyumlu reklam alanı' 
              : 'Desktop uyumlu reklam alanı'}
          </div>
        </div>
        
        {/* Alt bilgi */}
        <div className={`
          ${isMobile ? 'py-1' : 'py-2'}
          bg-white/50
          border-t ${isMobile ? 'border-blue-100' : 'border-blue-200'}
        `}>
          <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
            SpotItForMe - Reklam Alanı
          </div>
        </div>
      </div>
    </div>
  );
}
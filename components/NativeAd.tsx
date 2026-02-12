// components/NativeAd.tsx - TAMAMI
'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, Star, Smartphone, Monitor } from 'lucide-react';

interface NativeAdProps {
  index?: number;
  className?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  advertiserName?: string;
}

export default function NativeAd({ 
  index = 3, 
  className = '',
  title,
  description,
  ctaText,
  advertiserName
}: NativeAdProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Varsayılan reklam içerikleri
  const defaultAds = {
    mobile: {
      title: 'Mobil Alışverişte Özel Fırsat!',
      description: 'Nadir bulunan ürünler için mobil uygulamamızı deneyin. %20 indirim kodu: SPOT20',
      ctaText: 'Hemen Keşfet',
      advertiserName: 'Mobil Partner',
      icon: '📱'
    },
    desktop: {
      title: 'Desktop Özel Teklif',
      description: 'Geniş ekranda daha iyi deneyim için premium üyelik avantajları.',
      ctaText: 'Detayları Gör',
      advertiserName: 'Desktop Sponsor',
      icon: '💻'
    },
    generic: {
      title: 'SpotItForMe Premium',
      description: 'Spot\'larınızı öne çıkarın, daha hızlı bulun. Premium üyelik avantajları.',
      ctaText: 'Premium Ol',
      advertiserName: 'SpotItForMe',
      icon: '⭐'
    }
  };

  // Reklam verisini seç
  const getAdData = () => {
    if (title || description || ctaText || advertiserName) {
      return {
        title: title || defaultAds.generic.title,
        description: description || defaultAds.generic.description,
        ctaText: ctaText || defaultAds.generic.ctaText,
        advertiserName: advertiserName || defaultAds.generic.advertiserName,
        icon: defaultAds.generic.icon
      };
    }
    
    return isMobile ? defaultAds.mobile : defaultAds.desktop;
  };

  const adData = getAdData();

  if (!mounted) {
    return (
      <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`}>
        <div className={`p-${isMobile ? '4' : '6'}`}>
          <div className={`h-4 bg-gray-200 rounded ${isMobile ? 'w-1/2' : 'w-1/3'} mb-4`}></div>
          <div className={`h-${isMobile ? '16' : '20'} bg-gray-200 rounded mb-4`}></div>
          <div className={`h-8 bg-gray-200 rounded ${isMobile ? 'w-full' : 'w-1/2'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative z-0 ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`
        ${isMobile ? 'p-4' : 'p-6'}
        ${hover 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }
        border ${isMobile ? 'rounded-lg' : 'rounded-xl'}
        shadow-sm
        transition-all duration-300
        overflow-hidden
        relative
      `}>
        
        {/* Sponsor badge - sol üst */}
        <div className="absolute top-3 left-3">
          <div className={`
            ${isMobile ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5'} 
            ${hover ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}
            font-semibold rounded-full
            flex items-center
            transition-colors duration-300
          `}>
            <Star size={isMobile ? 10 : 12} className="mr-1" />
            SPONSOR
          </div>
        </div>

        {/* Platform icon - sağ üst */}
        <div className="absolute top-3 right-3">
          <div className={`
            ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
            ${hover ? 'bg-blue-100' : 'bg-gray-100'}
            rounded-full flex items-center justify-center
            transition-colors duration-300
          `}>
            {isMobile ? (
              <Smartphone size={isMobile ? 14 : 16} className={hover ? 'text-blue-600' : 'text-gray-600'} />
            ) : (
              <Monitor size={isMobile ? 14 : 16} className={hover ? 'text-blue-600' : 'text-gray-600'} />
            )}
          </div>
        </div>

        {/* Ana içerik */}
        <div className={isMobile ? 'pt-10' : 'pt-12'}>
          
          {/* Başlık */}
          <h3 className={`
            font-bold text-gray-900 
            ${isMobile ? 'text-base mb-2' : 'text-lg mb-3'}
            ${hover ? 'text-blue-800' : ''}
            transition-colors duration-300
          `}>
            {adData.title}
          </h3>

          {/* Açıklama */}
          <p className={`
            text-gray-600 
            ${isMobile ? 'text-sm mb-3' : 'text-base mb-4'}
            ${hover ? 'text-gray-700' : ''}
            transition-colors duration-300
          `}>
            {adData.description}
          </p>

          {/* Reklamveren bilgisi */}
          <div className="flex items-center mb-4">
            <div className={`
              ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
              ${hover ? 'bg-blue-100' : 'bg-gray-100'}
              rounded-full flex items-center justify-center mr-3
              transition-colors duration-300
            `}>
              <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                {adData.icon}
              </span>
            </div>
            <div>
              <p className={`
                font-medium 
                ${isMobile ? 'text-sm' : 'text-base'}
                ${hover ? 'text-blue-700' : 'text-gray-700'}
                transition-colors duration-300
              `}>
                {adData.advertiserName}
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                {isMobile ? 'Mobil Sponsor' : 'Desktop Sponsor'}
              </p>
            </div>
          </div>

          {/* CTA Butonu */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              console.log('Native ad clicked:', adData.title);
              // Buraya tıklama takibi eklenebilir
            }}
            className={`
              block w-full 
              ${hover 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              }
              text-center font-semibold 
              ${isMobile ? 'py-2.5 px-4 text-sm' : 'py-3 px-6 text-base'}
              rounded-lg
              transition-all duration-300
              transform ${hover ? 'scale-[1.02]' : 'scale-100'}
              shadow-sm ${hover ? 'shadow-md' : ''}
              flex items-center justify-center
            `}
          >
            <span>{adData.ctaText}</span>
            <ExternalLink size={isMobile ? 14 : 16} className="ml-2" />
          </a>

          {/* İstatistikler (sadece desktop) */}
          {!isMobile && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">1.2K</div>
                  <div>Gösterim</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">48</div>
                  <div>Tıklama</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">4%</div>
                  <div>CTR</div>
                </div>
              </div>
            </div>
          )}

          {/* Küçük disclaimer */}
          <div className={`mt-${isMobile ? '3' : '4'} pt-${isMobile ? '3' : '4'} border-t border-gray-100`}>
            <p className={`
              text-gray-400 text-center 
              ${isMobile ? 'text-[10px]' : 'text-xs'}
              ${hover ? 'text-gray-500' : ''}
              transition-colors duration-300
            `}>
              Bu bir reklamdır. Tıklamalar dış sitelere yönlendirebilir.
            </p>
          </div>
        </div>

        {/* Dekoratif elementler */}
        <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 -mb-8 -ml-8 bg-indigo-100 rounded-full opacity-20"></div>
      </div>
    </div>
  );
}
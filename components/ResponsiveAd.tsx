// components/ResponsiveAd.tsx - SABİT ÖLÇÜLER
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';
import { getPromoCategories, withPromoLocale } from '@/lib/promo-content';

interface ResponsiveAdProps {
  placement: 'inline' | 'banner' | 'native';
  className?: string;
}

export default function ResponsiveAd({ 
  placement, 
  className = ''
}: ResponsiveAdProps) {
  const locale = useCurrentLocale();
  const promoCategories = useMemo(() => getPromoCategories(locale), [locale]);
  const text = {
    loading: locale === 'tr' ? 'Yukleniyor...' : locale === 'en' ? 'Loading...' : locale === 'de' ? 'Wird geladen...' : locale === 'fr' ? 'Chargement...' : locale === 'es' ? 'Cargando...' : 'Zagruzka...',
    discover: locale === 'tr' ? 'Kesfet' : locale === 'en' ? 'Discover' : locale === 'de' ? 'Entdecken' : locale === 'fr' ? 'Decouvrir' : locale === 'es' ? 'Descubrir' : 'Otkryt',
    more: locale === 'tr' ? 'Daha Fazla' : locale === 'en' ? 'Learn More' : locale === 'de' ? 'Mehr' : locale === 'fr' ? 'En savoir plus' : locale === 'es' ? 'Mas informacion' : 'Uznat bolshe',
  };
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [promo, setPromo] = useState(promoCategories[0]);
  const promoHref = useMemo(() => withPromoLocale(promo.link, locale), [promo.link, locale]);

  useEffect(() => {
    setMounted(true);
    
    // Rastgele promo seç
    const randomIndex = Math.floor(Math.random() * promoCategories.length);
    setPromo(promoCategories[randomIndex]);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [promoCategories]);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse rounded-xl`}>
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">{text.loading}</span>
        </div>
      </div>
    );
  }

  // Banner yerleşimi (728x90 benzeri)
  if (placement === 'banner') {
    return (
      <Link href={promoHref}>
        <div className={`${className} bg-gradient-to-r ${promo.colors} rounded-lg shadow-md p-4 text-white transition-all hover:shadow-lg cursor-pointer`}
             style={{ minHeight: isMobile ? '80px' : '90px' }}>
          <div className="flex items-center gap-3 md:gap-4 h-full">
            <div className="text-3xl md:text-4xl flex-shrink-0">{promo.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg mb-0.5 md:mb-1 truncate">{promo.title}</h3>
              <p className="text-xs md:text-sm opacity-90 line-clamp-1">{promo.description}</p>
            </div>
            <div className={`hidden sm:block bg-white ${promo.buttonColor} px-4 md:px-6 py-1.5 md:py-2 rounded-full font-bold text-sm whitespace-nowrap flex-shrink-0`}>
              {text.discover} →
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Inline yerleşimi (büyük kart)
  return (
    <Link href={promoHref}>
      <div className={`${className} bg-gradient-to-r ${promo.colors} rounded-xl shadow-lg p-6 text-white transition-all hover:shadow-xl cursor-pointer`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-4xl mb-3">{promo.icon}</div>
            <h3 className="font-bold text-lg md:text-xl mb-2">{promo.title}</h3>
            <p className="text-sm md:text-base opacity-90 mb-4">
              {promo.description}
            </p>
            <div className={`inline-block bg-white ${promo.buttonColor} px-5 py-2 rounded-full text-sm font-bold`}>
              {text.more} →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
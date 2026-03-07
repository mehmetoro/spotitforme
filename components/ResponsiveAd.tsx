// components/ResponsiveAd.tsx - SABİT ÖLÇÜLER
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ResponsiveAdProps {
  placement: 'inline' | 'banner' | 'native';
  className?: string;
}

// Tanıtım kategorileri
const PROMO_CATEGORIES = [
  {
    id: 'rare-sightings',
    icon: '👁️',
    title: 'Nadir Gördüm!',
    description: 'Sen de gördüğün nadir anı binlerce kişiyle paylaş',
    link: '/info/rare-sightings',
    colors: 'from-purple-500 to-violet-600',
    buttonColor: 'text-purple-600'
  },
  {
    id: 'share-moment',
    icon: '📸',
    title: 'Anını Paylaş',
    description: 'Karşılaştığın ilginç şeyi görmeyenler için anlat!',
    link: '/info/share-moment',
    colors: 'from-pink-500 to-rose-600',
    buttonColor: 'text-pink-600'
  },
  {
    id: 'social-discovery',
    icon: '🌟',
    title: 'Keşfet & Keşfettir',
    description: 'Senin keşfin, başkalarının ilhamı olabilir',
    link: '/info/social-discovery',
    colors: 'from-cyan-500 to-blue-600',
    buttonColor: 'text-cyan-600'
  },
  {
    id: 'create-spots',
    icon: '🎯',
    title: 'Birlikte Bulalım',
    description: 'Aradığını söyle, 50.000 kişi senin için arasın',
    link: '/info/create-spots',
    colors: 'from-orange-500 to-red-600',
    buttonColor: 'text-red-600'
  },
  {
    id: 'community-power',
    icon: '🤝',
    title: 'Topluluk Gücü',
    description: 'Sen ararken yoruldun mu? 50.000 göz senin için bakıyor!',
    link: '/info/community-power',
    colors: 'from-blue-500 to-indigo-600',
    buttonColor: 'text-blue-600'
  },
  {
    id: 'help-others',
    icon: '💝',
    title: 'Yardım Et, Mutlu Ol',
    description: 'Birinin aradığını buldun mu? Mutluluğunu paylaş!',
    link: '/info/help-others',
    colors: 'from-rose-500 to-pink-600',
    buttonColor: 'text-rose-600'
  },
  {
    id: 'success-stories',
    icon: '🏆',
    title: 'Başarı Hikayeleri',
    description: '10.000+ kişi aradığını burada buldu!',
    link: '/info/success-stories',
    colors: 'from-yellow-500 to-orange-600',
    buttonColor: 'text-yellow-600'
  },
  {
    id: 'antique-items',
    icon: '🏺',
    title: 'Antika Eşyalar',
    description: 'Deden atölyede kullanıyordu, sen nerede bulacaksın?',
    link: '/info/antique-items',
    colors: 'from-amber-500 to-orange-600',
    buttonColor: 'text-amber-600'
  },
  {
    id: 'local-products',
    icon: '🏔️',
    title: 'Yöresel Ürünler',
    description: 'O lezzet sadece orada! Birisi senin için bulabilir',
    link: '/info/local-products',
    colors: 'from-green-500 to-emerald-600',
    buttonColor: 'text-green-600'
  },
  {
    id: 'collectors-items',
    icon: '💎',
    title: 'Koleksiyon Parçası',
    description: 'Koleksiyonunu tamamla! Diğer koleksiyoncular sana yardım etsin',
    link: '/info/collectors-items',
    colors: 'from-violet-500 to-purple-700',
    buttonColor: 'text-violet-600'
  }
];

export default function ResponsiveAd({ 
  placement, 
  className = ''
}: ResponsiveAdProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [promo, setPromo] = useState(PROMO_CATEGORIES[0]);

  useEffect(() => {
    setMounted(true);
    
    // Rastgele promo seç
    const randomIndex = Math.floor(Math.random() * PROMO_CATEGORIES.length);
    setPromo(PROMO_CATEGORIES[randomIndex]);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse rounded-xl`}>
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Banner yerleşimi (728x90 benzeri)
  if (placement === 'banner') {
    return (
      <Link href={promo.link}>
        <div className={`${className} bg-gradient-to-r ${promo.colors} rounded-lg shadow-md p-4 text-white transition-all hover:shadow-lg cursor-pointer`}
             style={{ minHeight: isMobile ? '80px' : '90px' }}>
          <div className="flex items-center gap-3 md:gap-4 h-full">
            <div className="text-3xl md:text-4xl flex-shrink-0">{promo.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg mb-0.5 md:mb-1 truncate">{promo.title}</h3>
              <p className="text-xs md:text-sm opacity-90 line-clamp-1">{promo.description}</p>
            </div>
            <div className={`hidden sm:block bg-white ${promo.buttonColor} px-4 md:px-6 py-1.5 md:py-2 rounded-full font-bold text-sm whitespace-nowrap flex-shrink-0`}>
              Keşfet →
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Inline yerleşimi (büyük kart)
  return (
    <Link href={promo.link}>
      <div className={`${className} bg-gradient-to-r ${promo.colors} rounded-xl shadow-lg p-6 text-white transition-all hover:shadow-xl cursor-pointer`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-4xl mb-3">{promo.icon}</div>
            <h3 className="font-bold text-lg md:text-xl mb-2">{promo.title}</h3>
            <p className="text-sm md:text-base opacity-90 mb-4">
              {promo.description}
            </p>
            <div className={`inline-block bg-white ${promo.buttonColor} px-5 py-2 rounded-full text-sm font-bold`}>
              Daha Fazla →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
// components/NativeAd.tsx
'use client';

import PromoCard from '@/components/PromoCard';

interface NativeAdProps {
  index?: number;
  className?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  advertiserName?: string;
}

export default function NativeAd({ 
  className = ''
}: NativeAdProps) {
  return (
    <div className={className}>
      <PromoCard variant="random" />
    </div>
  );
}

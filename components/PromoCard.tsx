'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'
import { getPromoCategories, withPromoLocale } from '@/lib/promo-content'

interface PromoCardProps {
  variant?: 'rare-sightings' | 'share-moment' | 'social-discovery' | 'create-spots' | 'community-power' | 'help-others' | 'success-stories' | 'antique-items' | 'local-products' | 'discontinued-products' | 'rare-books' | 'collectors-items' | 'random'
  className?: string
}

export default function PromoCard({ variant = 'random', className = '' }: PromoCardProps) {
  const locale = useCurrentLocale()
  const categories = useMemo(() => getPromoCategories(locale), [locale])
  const [promo, setPromo] = useState(categories[0])
  const promoHref = useMemo(() => withPromoLocale(promo.link, locale), [promo.link, locale])

  const t = {
    more: locale === 'tr' ? 'Daha Fazla' : locale === 'en' ? 'Learn More' : locale === 'de' ? 'Mehr' : locale === 'fr' ? 'En savoir plus' : locale === 'es' ? 'Mas informacion' : 'Uznat bolshe',
    discover: locale === 'tr' ? 'Kesfet' : locale === 'en' ? 'Discover' : locale === 'de' ? 'Entdecken' : locale === 'fr' ? 'Decouvrir' : locale === 'es' ? 'Descubrir' : 'Otkryt',
  }

  useEffect(() => {
    if (variant === 'random') {
      // Random seç
      const randomIndex = Math.floor(Math.random() * categories.length)
      setPromo(categories[randomIndex])
    } else {
      // Belirtilen kategoriyi seç
      const selected = categories.find(cat => cat.id === variant)
      if (selected) {
        setPromo(selected)
      }
    }
  }, [variant, categories])

  return (
    <Link href={promoHref}>
      <div className={`bg-gradient-to-r ${promo.colors} rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all ${className}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-4xl mb-2">{promo.icon}</div>
            <h3 className="font-bold text-lg mb-2">{promo.title}</h3>
            <p className="text-sm opacity-90">
              {promo.description}
            </p>
            <div className={`mt-3 inline-block bg-white ${promo.buttonColor} px-4 py-1 rounded-full text-sm font-bold`}>
              {t.more} →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Sayfa banner'ları için component (Desktop 728x90)
export function PromoBanner({ variant = 'random', className = '' }: PromoCardProps) {
  const locale = useCurrentLocale()
  const categories = useMemo(() => getPromoCategories(locale), [locale])
  const [promo, setPromo] = useState(categories[0])
  const promoHref = useMemo(() => withPromoLocale(promo.link, locale), [promo.link, locale])

  const discoverText = locale === 'tr' ? 'Kesfet' : locale === 'en' ? 'Discover' : locale === 'de' ? 'Entdecken' : locale === 'fr' ? 'Decouvrir' : locale === 'es' ? 'Descubrir' : 'Otkryt'

  useEffect(() => {
    if (variant === 'random') {
      const randomIndex = Math.floor(Math.random() * categories.length)
      setPromo(categories[randomIndex])
    } else {
      const selected = categories.find(cat => cat.id === variant)
      if (selected) {
        setPromo(selected)
      }
    }
  }, [variant, categories])

  return (
    <Link href={promoHref}>
      <div className={`bg-gradient-to-r ${promo.colors} rounded-lg shadow p-4 text-white cursor-pointer hover:shadow-lg transition-all ${className}`}
        style={{ minHeight: '90px' }}>
        <div className="flex items-center gap-4 h-full">
          <div className="text-5xl">{promo.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-1">{promo.title}</h3>
            <p className="text-sm opacity-90">{promo.description}</p>
          </div>
          <div className={`bg-white ${promo.buttonColor} px-6 py-2 rounded-full font-bold whitespace-nowrap`}>
            {discoverText} →
          </div>
        </div>
      </div>
    </Link>
  )
}

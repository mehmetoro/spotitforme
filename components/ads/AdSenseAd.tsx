// components/ads/AdSenseAd.tsx
'use client'

import { useEffect } from 'react'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

interface AdSenseAdProps {
  clientId?: string
  slot: string
  format?: string
  responsive?: boolean
  className?: string
}

export default function AdSenseAd({ 
  clientId,
  slot, 
  format = 'auto',
  responsive = true,
  className = ''
}: AdSenseAdProps) {
  const locale = useCurrentLocale()
  const missingClientText =
    locale === 'tr'
      ? 'AdSense reklami - Client ID gerekli'
      : locale === 'en'
        ? 'AdSense ad - Client ID required'
        : locale === 'de'
          ? 'AdSense-Anzeige - Client-ID erforderlich'
          : locale === 'fr'
            ? 'Annonce AdSense - Client ID requis'
            : locale === 'es'
              ? 'Anuncio AdSense - Client ID requerido'
              : 'Reklama AdSense - trebuetsya Client ID'
  const adClient = clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        ;(window as any).adsbygoogle.push({})
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [])

  if (!adClient) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-600">{missingClientText}</p>
      </div>
    )
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
// components/ads/AdSenseAd.tsx
'use client'

import { useEffect } from 'react'

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
        <p className="text-gray-600">AdSense reklamı - Client ID gerekli</p>
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
// components/ads/AdPlacement.tsx
'use client'

import AdSenseAd from './AdSenseAd'

export default function AdPlacement() {
  // Farklı pozisyonlar için farklı ad slot'ları
  const adUnits = [
    { id: 'header-ad', position: 'header', slot: '1234567890' },
    { id: 'sidebar-ad', position: 'sidebar', slot: '0987654321' },
    { id: 'footer-ad', position: 'footer', slot: '1122334455' },
  ]

  return (
    <div className="ad-placement">
      {/* Header Ad - Sadece ana sayfada */}
      <div className="header-ad hidden md:block">
        <AdSenseAd slot="header-ad-slot" format="horizontal" />
      </div>

      {/* Sidebar Ad */}
      <div className="sidebar-ad">
        <AdSenseAd slot="sidebar-ad-slot" format="vertical" />
      </div>

      {/* In-article Ad */}
      <div className="article-ad">
        <AdSenseAd slot="article-ad-slot" format="auto" responsive />
      </div>

      {/* Footer Ad */}
      <div className="footer-ad">
        <AdSenseAd slot="footer-ad-slot" format="horizontal" />
      </div>
    </div>
  )
}
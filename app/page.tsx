// app/page.tsx - BASİTLEŞTİRİLMİŞ
import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Stats from '@/components/Stats'
import HowItWorks from '@/components/HowItWorks'
import RecentSpots from '@/components/RecentSpots'
import Categories from '@/components/Categories'
import CTA from '@/components/CTA'
import RecentSightings from '@/components/RecentSightings'
import Leaderboard from '@/components/Leaderboard'
import DailyChallenges from '@/components/DailyChallenges'
import QuickSightingButton from '@/components/QuickSightingButton'
import ResponsiveAd from '@/components/ResponsiveAd'

export const metadata: Metadata = {
  title: 'Nadir Seyahat ve Spot Kesifleri',
  description:
    'Toplulugun paylastigi nadir seyahat rotalarini, mekan onerilerini ve spot kesiflerini tek platformda inceleyin.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SpotItForMe – Nadir Seyahat ve Spot Kesifleri',
    description:
      'Toplulugun paylastigi nadir seyahat rotalarini, mekan onerilerini ve spot kesiflerini tek platformda inceleyin.',
    url: '/',
    type: 'website',
    locale: 'tr_TR',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <QuickSightingButton />
      
      <div className="container-custom">
        {/* Header'da zaten reklam var, burada TEKRAR EKLEME */}
        
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 py-4 md:py-8">
          <div className="lg:col-span-2">
            <Hero />
            <Stats />
            
            {/* Tanıtım Banner */}
            <div className="my-8">
              <ResponsiveAd placement="inline" />
            </div>
            
            <RecentSightings />
            <HowItWorks />
            
            {/* İçerik arası reklam YOK - Native ads SpotList içinde */}
            <RecentSpots />
            
            <Categories />
            
            {/* Footer'da zaten reklam var, burada TEKRAR EKLEME */}
            <CTA />
          </div>

          <div className="space-y-6">
            <Leaderboard />
            
            {/* Sidebar reklamı - SADECE desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                {/* Native reklam veya tanıtım banner */}
                <ResponsiveAd placement="native" className="mb-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
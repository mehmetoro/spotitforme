// app/page.tsx - BASİTLEŞTİRİLMİŞ
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
            <DailyChallenges />
            
            {/* Sidebar reklamı - SADECE desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                {/* Native reklam veya banner */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700 mb-2">REKLAM</div>
                    <div className="text-sm text-gray-600">Sidebar 300×250</div>
                    <div className="text-xs text-gray-400 mt-4">Desktop reklam alanı</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
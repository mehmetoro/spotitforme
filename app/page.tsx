// app/page.tsx - DÜZELTMİŞ HALİ
import Hero from '@/components/Hero'
import Stats from '@/components/Stats'
import HowItWorks from '@/components/HowItWorks'
import RecentSpots from '@/components/RecentSpots'
import Categories from '@/components/Categories'
import CTA from '@/components/CTA'

// YENİ BİLEŞENLER
import RecentSightings from '@/components/RecentSightings'
import Leaderboard from '@/components/Leaderboard'
import DailyChallenges from '@/components/DailyChallenges'
import QuickSightingButton from '@/components/QuickSightingButton'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER'ı BURADAN KALDIRIN - Layout'ta zaten var */}
      <QuickSightingButton />
      
      <div className="container-custom">
        <div className="grid lg:grid-cols-3 gap-8 py-8">
          {/* Sol Kolon - Ana içerik */}
          <div className="lg:col-span-2">
            <Hero />
            <Stats />
            
            {/* YENİ: Son Görülenler Bölümü */}
            <RecentSightings />
            
            <HowItWorks />
            <RecentSpots />
            <Categories />
            <CTA />
          </div>

          {/* Sağ Kolon - Yan içerikler */}
          <div className="space-y-6">
            <Leaderboard />
            <DailyChallenges />
            
            {/* Hızlı İstatistikler */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">⚡ Hızlı Puan Kazan</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">👁️</span>
                    <span className="font-medium">Nadir Gördüm</span>
                  </div>
                  <span className="font-bold text-green-600">+5-25 puan</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🤝</span>
                    <span className="font-medium">Spot'a Yardım</span>
                  </div>
                  <span className="font-bold text-green-600">+10 puan</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📸</span>
                    <span className="font-medium">Fotoğraf Paylaş</span>
                  </div>
                  <span className="font-bold text-green-600">+15 puan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER'ı da BURADAN KALDIRIN - Layout'ta zaten var */}
    </div>
  )
}
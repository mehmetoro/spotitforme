// app/page.tsx - BASİTLEŞTİRİLMİŞ
import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
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

const homeMetaByLocale: Record<string, { title: string; description: string; ogLocale: string }> = {
  tr: {
    title: 'Nadir Seyahat ve Spot Kesifleri',
    description: 'Toplulugun paylastigi nadir seyahat rotalarini, mekan onerilerini ve spot kesiflerini tek platformda inceleyin.',
    ogLocale: 'tr_TR',
  },
  en: {
    title: 'Rare Travel and Spot Discoveries',
    description: 'Explore rare travel routes, local recommendations and spot discoveries shared by the community.',
    ogLocale: 'en_US',
  },
  de: {
    title: 'Seltene Reisen und Spot-Entdeckungen',
    description: 'Entdecke seltene Reiserouten, lokale Empfehlungen und Spot-Entdeckungen aus der Community.',
    ogLocale: 'de_DE',
  },
  fr: {
    title: 'Voyages Rares et Decouvertes Spot',
    description: 'Decouvrez des itineraires rares, des recommandations locales et des spots partages par la communaute.',
    ogLocale: 'fr_FR',
  },
  es: {
    title: 'Viajes Raros y Descubrimientos Spot',
    description: 'Explora rutas de viaje raras, recomendaciones locales y descubrimientos spot compartidos por la comunidad.',
    ogLocale: 'es_ES',
  },
  ru: {
    title: 'Redkie Puteshestviya i Spot-Otkrytiya',
    description: 'Izuchayte redkie marshruty, lokalnye rekomendatsii i spot-otkrytiya ot soobshchestva.',
    ogLocale: 'ru_RU',
  },
}

export function generateMetadata(): Metadata {
  const localeFromHeader = headers().get('x-locale')
  const localeCookie = cookies().get('NEXT_LOCALE')?.value
  const locale = (localeFromHeader && homeMetaByLocale[localeFromHeader])
    ? localeFromHeader
    : (localeCookie && homeMetaByLocale[localeCookie])
      ? localeCookie
      : 'tr'

  const text = homeMetaByLocale[locale]

  return {
    title: text.title,
    description: text.description,
    alternates: {
      canonical: `/${locale}`,
    },
    openGraph: {
      title: `SpotItForMe - ${text.title}`,
      description: text.description,
      url: `/${locale}`,
      type: 'website',
      locale: text.ogLocale,
    },
  }
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
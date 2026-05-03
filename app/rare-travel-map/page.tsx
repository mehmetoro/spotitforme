'use client'

import dynamic from 'next/dynamic'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const RareSightingsMap = dynamic(() => import('@/components/RareSightingsMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 p-6 text-sm text-gray-500">Loading map...</div>
  ),
})

const rtmText = {
  tr: { title: 'Nadir Seyahat Haritasi', desc: 'Sosyal nadir paylasimlarinin konumlarini tek haritada gorun.' },
  en: { title: 'Rare Travel Map', desc: 'View the locations of social rare sightings on a single map.' },
  de: { title: 'Karte seltener Reisen', desc: 'Sehen Sie die Standorte sozialer seltener Sichtungen auf einer Karte.' },
  fr: { title: 'Carte des voyages rares', desc: 'Visualisez les emplacements des observations sociales rares sur une seule carte.' },
  es: { title: 'Mapa de viajes raros', desc: 'Ve las ubicaciones de avistamientos sociales raros en un solo mapa.' },
  ru: { title: 'Карта редких путешествий', desc: 'Просмотрите местоположения социальных редких наблюдений на одной карте.' },
} as const

export default function RareTravelMapPage() {
  const locale = useCurrentLocale()
  const t = rtmText[locale as keyof typeof rtmText] ?? rtmText.tr

  return (
    <main className="container-custom py-6 md:py-8">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.desc}</p>
      </div>

      <RareSightingsMap channel="social" />
    </main>
  )
}

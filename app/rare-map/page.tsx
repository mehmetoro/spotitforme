'use client'

import dynamic from 'next/dynamic'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const RareSightingsMap = dynamic(() => import('@/components/RareSightingsMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 p-6 text-sm text-gray-500">Loading map...</div>
  ),
})

const rmText = {
  tr: { mapLoading: 'Harita yukleniyor...', title: 'Nadir Urun Haritasi', desc: 'Fiziksel nadir urun paylasimlarinin konumlarini tek haritada gorun.' },
  en: { mapLoading: 'Loading map...', title: 'Rare Item Map', desc: 'View the locations of physical rare item sightings on a single map.' },
  de: { mapLoading: 'Karte wird geladen...', title: 'Karte seltener Artikel', desc: 'Sehen Sie die Standorte physischer seltener Artikel auf einer Karte.' },
  fr: { mapLoading: 'Chargement de la carte...', title: 'Carte des articles rares', desc: 'Visualisez les emplacements des observations d\'articles rares physiques sur une seule carte.' },
  es: { mapLoading: 'Cargando mapa...', title: 'Mapa de artículos raros', desc: 'Ve las ubicaciones de avistamientos de artículos raros físicos en un solo mapa.' },
  ru: { mapLoading: 'Загрузка карты...', title: 'Карта редких предметов', desc: 'Просмотрите местоположения физических наблюдений редких предметов на одной карте.' },
} as const

export default function RareMapPage() {
  const locale = useCurrentLocale()
  const t = rmText[locale as keyof typeof rmText] ?? rmText.tr

  return (
    <main className="container-custom py-6 md:py-8">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.desc}</p>
      </div>

      <RareSightingsMap channel="physical" />
    </main>
  )
}

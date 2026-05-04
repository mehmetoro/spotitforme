'use client'

import dynamic from 'next/dynamic'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const RareTravelPlanner = dynamic(() => import('@/components/RareTravelPlanner'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 p-6 text-sm text-gray-500">Loading...</div>
  ),
})

const rtpText = {
  tr: { title: 'Nadir Seyahat Plani', desc: 'OSRM rota altyapisi ile secilen guzergah boyunca ugranmaya deger nadir sosyal paylasimlari kesfet.', loading: 'Yukleniyor...' },
  en: { title: 'Rare Travel Plan', desc: 'Discover noteworthy rare social sightings along your chosen route with OSRM routing infrastructure.', loading: 'Loading...' },
  de: { title: 'Seltener Reiseplan', desc: 'Entdecken Sie bemerkenswerte seltene soziale Sichtungen entlang Ihrer gewählten Route mit der OSRM-Routeninfrastruktur.', loading: 'Wird geladen...' },
  fr: { title: 'Plan de voyage rare', desc: 'Découvrez des observations sociales rares remarquables le long de votre itinéraire avec l\'infrastructure de routage OSRM.', loading: 'Chargement...' },
  es: { title: 'Plan de viaje raro', desc: 'Descubre avistamientos sociales raros notables a lo largo de tu ruta elegida con la infraestructura de enrutamiento OSRM.', loading: 'Cargando...' },
  ru: { title: 'Редкий план путешествия', desc: 'Откройте для себя замечательные редкие социальные наблюдения вдоль выбранного маршрута с инфраструктурой маршрутизации OSRM.', loading: 'Загрузка...' },
} as const

export default function RareTravelPlanPage() {
  const locale = useCurrentLocale()
  const t = rtpText[locale as keyof typeof rtpText] ?? rtpText.tr

  return (
    <main className="container-custom py-6 md:py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.desc}</p>
      </div>

      <RareTravelPlanner />
    </main>
  )
}

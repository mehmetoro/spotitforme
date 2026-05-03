import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Rare Sightings - SpotItForMe',
  description: 'Rare Sightings - SpotItForMe details page',
}

export default function Page() {
  return <PromoInfoPage promoId='rare-sightings' accent='blue' />
}

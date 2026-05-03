import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Rare Travel Map - SpotItForMe',
  description: 'Rare Travel Map details page',
}

export default function Page() {
  return <PromoInfoPage promoId='rare-travel-map' accent='teal' />
}

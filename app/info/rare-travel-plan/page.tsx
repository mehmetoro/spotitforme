import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Rare Travel Plan - SpotItForMe',
  description: 'Rare Travel Plan details page',
}

export default function Page() {
  return <PromoInfoPage promoId='rare-travel-plan' accent='emerald' />
}

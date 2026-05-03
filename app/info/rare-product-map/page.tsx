import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Rare Product Map - SpotItForMe',
  description: 'Rare Product Map details page',
}

export default function Page() {
  return <PromoInfoPage promoId='rare-product-map' accent='amber' />
}

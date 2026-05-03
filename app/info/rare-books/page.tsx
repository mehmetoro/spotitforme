import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Rare Books - SpotItForMe',
  description: 'Rare Books - SpotItForMe details page',
}

export default function Page() {
  return <PromoInfoPage promoId='rare-books' accent='purple' />
}

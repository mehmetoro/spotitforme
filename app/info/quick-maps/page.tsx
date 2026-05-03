import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Quick Maps - SpotItForMe',
  description: 'Quick Maps details page',
}

export default function Page() {
  return <PromoInfoPage promoId='quick-maps' accent='green' />
}

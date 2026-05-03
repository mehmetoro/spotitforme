import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Social Discovery - SpotItForMe',
  description: 'Social Discovery - SpotItForMe details page',
}

export default function Page() {
  return <PromoInfoPage promoId='social-discovery' accent='cyan' />
}

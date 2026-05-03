import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Share Moment - SpotItForMe',
  description: 'Share Moment - SpotItForMe details page',
}

export default function Page() {
  return <PromoInfoPage promoId='share-moment' accent='pink' />
}

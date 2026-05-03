import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Success Stories - SpotItForMe',
  description: 'Success Stories - SpotItForMe details page',
}

export default function Page() {
  return <PromoInfoPage promoId='success-stories' accent='yellow' />
}

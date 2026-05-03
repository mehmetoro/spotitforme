import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Create Spots - SpotItForMe',
  description: 'Create Spots - SpotItForMe details page',
}

export default function Page() {
  return <PromoInfoPage promoId='create-spots' accent='emerald' />
}

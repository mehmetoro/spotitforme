import { Metadata } from 'next'
import PromoInfoPage from '@/components/info/PromoInfoPage'

export const metadata: Metadata = {
  title: 'Help Others - SpotItForMe',
  description: 'Help Others - SpotItForMe details page',
}

export default function Page() {
  return <PromoInfoPage promoId='help-others' accent='rose' />
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nadir Seyahat Kesif Akisi',
  description:
    'Kategori, sehir, populerlik ve zaman filtreleriyle nadir seyahat paylasimlarini kesfedin.',
  alternates: {
    canonical: '/discovery',
  },
  openGraph: {
    title: 'SpotItForMe Discovery – Nadir Seyahat Kesif Akisi',
    description:
      'Kategori, sehir, populerlik ve zaman filtreleriyle nadir seyahat paylasimlarini kesfedin.',
    url: '/discovery',
    type: 'website',
    locale: 'tr_TR',
  },
}

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return children
}

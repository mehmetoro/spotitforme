import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// BU KISMI EKLEYİN veya GÜNCELLEYİN
export const metadata: Metadata = {
  title: 'SpotItForMe - Toplulukla Ürün Bulma Platformu',
  description: 'Bulunması zor ürünleri topluluk gücüyle bulun. Vintage, nadir, eski model ürünler için spot oluşturun.',
  keywords: 'vintage, nadir ürün, yedek parça, antika, koleksiyon, ikinci el, bulunmaz ürün',
  metadataBase: new URL('https://spotitforme.vercel.app'), // BU SATIRI EKLEYİN
  openGraph: {
    title: 'SpotItForMe',
    description: 'Topluluk gücüyle kayıp ürünleri bulma platformu',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
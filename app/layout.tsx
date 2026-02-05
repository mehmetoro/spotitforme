// app/layout.tsx - HEAD kısmına ekle
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SpotItForMe - Toplulukla Ürün Bulma Platformu',
  description: 'Bulunması zor ürünleri topluluk gücüyle bulun. Vintage, nadir, eski model ürünler için spot oluşturun.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        {/* Google AdSense Script */}
        <script 
          async 
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
        
        {/* Meta Tags for AdSense */}
        <meta name="google-adsense-account" content={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`} />
        
        {/* Favicon ve diğer meta tag'ler */}
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* AdSense için gerekli meta tag'ler */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={inter.className}>
        {children}
        
        {/* AdSense için gerekli script */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}",
                enable_page_level_ads: true,
                overlays: {bottom: true}
              });
            `
          }}
        />
      </body>
    </html>
  )
}
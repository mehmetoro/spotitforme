// app/layout.tsx - DÜZGÜN KONUMLANDIRMA
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResponsiveAd from "@/components/ResponsiveAd";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={inter.className}>
        {/* REKLAM CONTAINER - Sabit yükseklik */}
        <div className="bg-gray-50">
          <div className="container mx-auto px-2 md:px-4">
            <div className="relative">
              {/* Reklam - Sabit ölçüler */}
              <div className="py-2">
                <ResponsiveAd 
                  placement="banner" 
                  className="h-16 md:h-20" 
                />
              </div>
              
              {/* Header - Reklamın ALTINDA */}
              <div className="relative z-10">
                <Header />
              </div>
            </div>
          </div>
        </div>
        
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
            {children}
          </div>
        </main>
        
        {/* Footer Öncesi Reklam - Sabit alan */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-2 md:px-4 py-6 md:py-8">
            <ResponsiveAd placement="inline" />
          </div>
        </div>
        
        <Footer />
      </body>
    </html>
  );
}
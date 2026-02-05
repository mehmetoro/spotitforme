// app/layout.tsx - GÜNCELLENMİŞ
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";

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
        {/* Header üstü reklam (sadece desktop) */}
        <div className="hidden md:block container mx-auto px-4 mt-4">
          <AdUnit placement="header" className="h-24 mb-4" />
        </div>
        
        <Header />
        
        <main className="min-h-screen">
          {/* SADECE children - sidebar YOK */}
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
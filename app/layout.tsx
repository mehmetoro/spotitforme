// app/layout.tsx - PWA + DÜZGÜN KONUMLANDIRMA
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResponsiveAd from "@/components/ResponsiveAd";
import AppSidebar from "@/components/AppSidebar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import PWAInstaller from "@/components/PWAInstaller";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpotItForMe – Toplulukla Ürün Bulma Platformu",
  description:
    "Nadir ürünleri toplulukla bul. Sighting paylaş, spot oluştur ve mağazaları keşfet.",
  manifest: "/manifest.json?v=2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpotItForMe",
  },
  icons: {
    icon: [
      { url: "/favicon/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
        <PWAInstaller />
        <ToastProvider>
          {/* Header - sticky, tam genişlik */}
          <Header />

          {/* Banner Reklam - Header altında */}
          <div className="bg-gray-50 border-b border-gray-100">
            <div className="container-custom py-2">
              <ResponsiveAd placement="banner" className="h-16 md:h-20" />
            </div>
          </div>

          <main className="min-h-screen bg-white">
            <div className="container-custom py-4 md:py-8 lg:flex lg:items-start lg:gap-6">
              <div className="hidden lg:block lg:w-64 lg:shrink-0">
                <div className="lg:sticky lg:top-24">
                  <AppSidebar />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                {children}
              </div>
            </div>
          </main>

          {/* Footer Öncesi Reklam */}
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="container-custom py-6 md:py-8">
              <ResponsiveAd placement="inline" />
            </div>
          </div>

          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
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
import { locales } from '@/lib/i18n'
import { cookies, headers } from 'next/headers';

const inter = Inter({ subsets: ["latin"] });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spotitforme.com";

const metadataTextByLocale: Record<string, { title: string; description: string; keywords: string[]; ogLocale: string }> = {
  tr: {
    title: 'SpotItForMe - Toplulukla Urun Bulma Platformu',
    description: 'Nadir urunleri toplulukla bul. Sighting paylas, spot olustur ve magazalari kesfet.',
    keywords: ['nadir seyahat', 'spot kesfi', 'toplulukla urun bulma', 'yerel mekan onerileri', 'koleksiyon kesfi'],
    ogLocale: 'tr_TR',
  },
  en: {
    title: 'SpotItForMe - Community-Powered Product Discovery',
    description: 'Find rare products with community help. Share sightings, create spots, and discover shops.',
    keywords: ['rare products', 'community search', 'item spotting', 'local discovery', 'collectibles'],
    ogLocale: 'en_US',
  },
  de: {
    title: 'SpotItForMe - Produktsuche mit Community',
    description: 'Finde seltene Produkte mit der Community. Teile Sichtungen, erstelle Spots und entdecke Shops.',
    keywords: ['seltene produkte', 'community suche', 'produktsichtung', 'lokale entdeckung', 'sammlerstucke'],
    ogLocale: 'de_DE',
  },
  fr: {
    title: 'SpotItForMe - Decouverte de Produits avec la Communaute',
    description: 'Trouvez des produits rares grace a la communaute. Partagez, creez des spots et decouvrez des boutiques.',
    keywords: ['produits rares', 'recherche communautaire', 'observation produit', 'decouverte locale', 'collection'],
    ogLocale: 'fr_FR',
  },
  es: {
    title: 'SpotItForMe - Descubrimiento de Productos con la Comunidad',
    description: 'Encuentra productos raros con ayuda de la comunidad. Comparte hallazgos, crea spots y descubre tiendas.',
    keywords: ['productos raros', 'busqueda comunitaria', 'avistamientos', 'descubrimiento local', 'coleccionables'],
    ogLocale: 'es_ES',
  },
  ru: {
    title: 'SpotItForMe - Poisk Tovarov s Pomoshchyu Soobshchestva',
    description: 'Nakhodite redkie tovary s pomoshchyu soobshchestva. Delites nakhodkami, sozdavaite spoty i otkryvaite magaziny.',
    keywords: ['redkie tovary', 'poisk soobshchestvom', 'nakhodki', 'lokalnye otkrytiya', 'kollektsionnye tovary'],
    ogLocale: 'ru_RU',
  },
}

const metadataBaseConfig = {
  metadataBase: new URL(SITE_URL),
  title: { template: '%s | SpotItForMe' as const },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.json?v=2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default' as const,
    title: 'SpotItForMe',
  },
  icons: {
    icon: [
      { url: '/favicon/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export function generateMetadata(): Metadata {
  const requestHeaders = headers()
  const localeFromHeader = requestHeaders.get('x-locale')
  const localeCookie = cookies().get('NEXT_LOCALE')?.value
  const activeLocale = (localeFromHeader && metadataTextByLocale[localeFromHeader])
    ? localeFromHeader
    : (localeCookie && metadataTextByLocale[localeCookie])
      ? localeCookie
      : 'tr'

  const text = metadataTextByLocale[activeLocale]

  return {
    ...metadataBaseConfig,
    title: {
      ...metadataBaseConfig.title,
      default: text.title,
    },
    description: text.description,
    keywords: text.keywords,
    openGraph: {
      type: 'website',
      locale: text.ogLocale,
      url: SITE_URL,
      siteName: 'SpotItForMe',
      title: text.title,
      description: text.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: text.title,
      description: text.description,
    },
  }
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
const localeToLanguageTag: Record<string, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  ru: 'ru-RU',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const requestHeaders = headers();
  const localeFromHeader = requestHeaders.get('x-locale');
  const localeCookie = cookies().get('NEXT_LOCALE')?.value;
  const activeLocale = ['tr', 'en', 'de', 'fr', 'es', 'ru'].includes(localeFromHeader || '')
    ? localeFromHeader!
    : (['tr', 'en', 'de', 'fr', 'es', 'ru'].includes(localeCookie || '') ? localeCookie! : 'tr');
  const htmlLang = activeLocale;
  const normalizedPath = requestHeaders.get('x-pathname') || '/';
  const canonicalPath = normalizedPath === '/' ? `/${activeLocale}` : `/${activeLocale}${normalizedPath}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const alternateUrls = (locales as readonly string[]).map((locale) => ({
    locale,
    href: `${SITE_URL}${normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`}`,
  }));
  // Admin route kontrolü için özel header kullan
  const isAdminRoute = requestHeaders.get('x-admin-route') === '1';
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SpotItForMe',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/discovery?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: localeToLanguageTag[activeLocale] || 'tr-TR',
  };
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SpotItForMe',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon/web-app-manifest-512x512.png`,
  };

  return (
    <html lang={htmlLang}>
      <head>
        <link rel="canonical" href={canonicalUrl} />
        {alternateUrls.map(({ locale, href }) => (
          <link key={locale} rel="alternate" hrefLang={locale} href={href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/tr${normalizedPath === '/' ? '' : normalizedPath}`} />
        <Script id="schema-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(websiteJsonLd)}
        </Script>
        <Script id="schema-organization" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationJsonLd)}
        </Script>
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
          {!isAdminRoute && <Header />}
          {!isAdminRoute && (
            <div className="bg-gray-50 border-b border-gray-100">
              <div className="container-custom py-2">
                <ResponsiveAd placement="banner" className="h-16 md:h-20" />
              </div>
            </div>
          )}
          <main className="min-h-screen bg-white">
            <div className="container-custom py-4 md:py-8 lg:flex lg:items-start lg:gap-6">
              {!isAdminRoute && (
                <div className="hidden lg:block lg:w-64 lg:shrink-0">
                  <div className="lg:sticky lg:top-24">
                    <AppSidebar />
                  </div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                {children}
              </div>
            </div>
          </main>
          {!isAdminRoute && (
            <div className="bg-gray-50 border-t border-gray-200">
              <div className="container-custom py-6 md:py-8">
                <ResponsiveAd placement="inline" />
              </div>
            </div>
          )}
          {!isAdminRoute && <Footer />}
        </ToastProvider>
      </body>
    </html>
  );
}
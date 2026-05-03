
'use client'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const premiumText = {
  tr: { title: 'Premium Paketler', subtitle: 'Mağazanız için daha fazla ürün eklemek ve gelişmiş özelliklere erişmek için premium paketleri inceleyin.', freeName: 'Ücretsiz Mağaza', freeItems: ['20 ürün ekleme limiti', 'Temel mağaza yönetimi', 'Toplulukta görünürlük', '0 TL / ay'], freeBtn: 'Aktif', premName: 'Premium Mağaza', premItems: ['100 ürün ekleme limiti', 'Gelişmiş istatistikler', 'Öne çıkarılmış mağaza', 'Özel destek', '10 USD / yıl'], premBtn: 'Çok Yakında', note: 'Premium paketler çok yakında aktif olacak! Şu anda tüm mağazalar ücretsiz olarak kullanılabilir.' },
  en: { title: 'Premium Packages', subtitle: 'Explore premium packages to add more products and access advanced features for your store.', freeName: 'Free Store', freeItems: ['20 product limit', 'Basic store management', 'Community visibility', '$0 / month'], freeBtn: 'Active', premName: 'Premium Store', premItems: ['100 product limit', 'Advanced statistics', 'Featured store', 'Priority support', '$10 USD / year'], premBtn: 'Coming Soon', note: 'Premium packages are coming soon! All stores are currently available for free.' },
  de: { title: 'Premium-Pakete', subtitle: 'Erkunden Sie Premium-Pakete, um mehr Produkte hinzuzufügen und erweiterte Funktionen zu nutzen.', freeName: 'Kostenloses Geschäft', freeItems: ['20 Produktlimit', 'Grundlegende Verwaltung', 'Community-Sichtbarkeit', '0 € / Monat'], freeBtn: 'Aktiv', premName: 'Premium-Geschäft', premItems: ['100 Produktlimit', 'Erweiterte Statistiken', 'Hervorgehobenes Geschäft', 'Prioritätssupport', '10 USD / Jahr'], premBtn: 'Demnächst', note: 'Premium-Pakete kommen bald! Alle Shops sind derzeit kostenlos verfügbar.' },
  fr: { title: 'Forfaits Premium', subtitle: 'Explorez les forfaits premium pour ajouter plus de produits et accéder à des fonctionnalités avancées.', freeName: 'Boutique Gratuite', freeItems: ['Limite de 20 produits', 'Gestion de base', 'Visibilité communautaire', '0 € / mois'], freeBtn: 'Actif', premName: 'Boutique Premium', premItems: ['Limite de 100 produits', 'Statistiques avancées', 'Boutique en vedette', 'Support prioritaire', '10 USD / an'], premBtn: 'Bientôt', note: 'Les forfaits premium arrivent bientôt ! Toutes les boutiques sont actuellement gratuites.' },
  es: { title: 'Paquetes Premium', subtitle: 'Explora los paquetes premium para agregar más productos y acceder a funciones avanzadas.', freeName: 'Tienda Gratuita', freeItems: ['Límite de 20 productos', 'Gestión básica', 'Visibilidad comunitaria', '0 € / mes'], freeBtn: 'Activo', premName: 'Tienda Premium', premItems: ['Límite de 100 productos', 'Estadísticas avanzadas', 'Tienda destacada', 'Soporte prioritario', '10 USD / año'], premBtn: 'Próximamente', note: '¡Los paquetes premium llegan pronto! Todas las tiendas están disponibles gratis actualmente.' },
  ru: { title: 'Премиум-пакеты', subtitle: 'Изучите премиум-пакеты для добавления большего количества товаров и доступа к расширенным функциям.', freeName: 'Бесплатный магазин', freeItems: ['Лимит 20 товаров', 'Базовое управление', 'Видимость в сообществе', '0 руб / мес'], freeBtn: 'Активен', premName: 'Премиум магазин', premItems: ['Лимит 100 товаров', 'Расширенная статистика', 'Выделенный магазин', 'Приоритетная поддержка', '10 USD / год'], premBtn: 'Скоро', note: 'Премиум-пакеты скоро будут доступны! Сейчас все магазины бесплатны.' },
} as const

export default function PremiumPackagesPage() {
  const locale = useCurrentLocale()
  const t = premiumText[locale as keyof typeof premiumText] ?? premiumText.tr
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-yellow-700 mb-6">{t.title}</h1>
          <p className="text-lg text-gray-700 text-center mb-8">{t.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">{t.freeName}</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1 text-left">
                {t.freeItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <span className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold">{t.freeBtn}</span>
            </div>
            <div className="bg-yellow-100 border-2 border-yellow-500 rounded-xl p-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-yellow-900 mb-2">{t.premName}</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1 text-left">
                {t.premItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <span className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">{t.premBtn}</span>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl text-yellow-900 text-center">
            <p className="font-semibold">{t.note}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

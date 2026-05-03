
'use client'

import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const spText = {
  tr: { title: 'Mağaza Paneli', desc: 'Mağazanı yönet, ürün ekle, siparişleri ve istatistikleri görüntüle. Tüm mağaza işlemlerini tek panelden kolayca yönetebilirsin.', productsTitle: 'Ürün Yönetimi', products: ['Yeni ürün ekle', 'Mevcut ürünleri düzenle', 'Stok ve fiyat güncelle'], ordersTitle: 'Siparişler', orders: ['Gelen siparişleri görüntüle', 'Sipariş durumunu güncelle', 'Müşteri ile iletişim kur'], statsTitle: 'İstatistikler', stats: ['Satış ve görüntülenme raporları', 'En çok satan ürünler', 'Mağaza puanı ve yorumlar'], settingsTitle: 'Ayarlar', settings: ['Mağaza bilgilerini güncelle', 'Adres ve iletişim ayarları', 'Abonelik ve paketler'], cta: 'İşletme Kaydı / Bilgileri' },
  en: { title: 'Shop Panel', desc: 'Manage your shop, add products, view orders and statistics. Easily manage all shop operations from a single panel.', productsTitle: 'Product Management', products: ['Add new product', 'Edit existing products', 'Update stock and price'], ordersTitle: 'Orders', orders: ['View incoming orders', 'Update order status', 'Communicate with customer'], statsTitle: 'Statistics', stats: ['Sales and view reports', 'Best selling products', 'Shop rating and reviews'], settingsTitle: 'Settings', settings: ['Update shop info', 'Address and contact settings', 'Subscription and packages'], cta: 'Business Registration / Info' },
  de: { title: 'Shop-Panel', desc: 'Verwalten Sie Ihren Shop, fügen Sie Produkte hinzu, sehen Sie Bestellungen und Statistiken. Verwalten Sie alle Shop-Operationen einfach über ein einziges Panel.', productsTitle: 'Produktverwaltung', products: ['Neues Produkt hinzufügen', 'Bestehende Produkte bearbeiten', 'Bestand und Preis aktualisieren'], ordersTitle: 'Bestellungen', orders: ['Eingehende Bestellungen anzeigen', 'Bestellstatus aktualisieren', 'Mit Kunden kommunizieren'], statsTitle: 'Statistiken', stats: ['Verkaufs- und Aufrufsberichte', 'Bestseller', 'Shop-Bewertung und Rezensionen'], settingsTitle: 'Einstellungen', settings: ['Shop-Infos aktualisieren', 'Adress- und Kontakteinstellungen', 'Abonnement und Pakete'], cta: 'Unternehmensregistrierung / Info' },
  fr: { title: 'Panneau de boutique', desc: 'Gérez votre boutique, ajoutez des produits, consultez les commandes et statistiques.', productsTitle: 'Gestion des produits', products: ['Ajouter un nouveau produit', 'Modifier les produits existants', 'Mettre à jour le stock et le prix'], ordersTitle: 'Commandes', orders: ['Voir les commandes entrantes', 'Mettre à jour le statut de commande', 'Communiquer avec le client'], statsTitle: 'Statistiques', stats: ['Rapports de ventes et de vues', 'Produits les plus vendus', 'Note et avis de la boutique'], settingsTitle: 'Paramètres', settings: ['Mettre à jour les infos de la boutique', 'Paramètres d\'adresse et de contact', 'Abonnement et forfaits'], cta: 'Enregistrement / Info entreprise' },
  es: { title: 'Panel de tienda', desc: 'Administra tu tienda, agrega productos, ve pedidos y estadísticas. Gestiona todas las operaciones de la tienda fácilmente desde un solo panel.', productsTitle: 'Gestión de productos', products: ['Agregar nuevo producto', 'Editar productos existentes', 'Actualizar stock y precio'], ordersTitle: 'Pedidos', orders: ['Ver pedidos entrantes', 'Actualizar estado del pedido', 'Comunicarse con el cliente'], statsTitle: 'Estadísticas', stats: ['Informes de ventas y vistas', 'Productos más vendidos', 'Calificación y reseñas de la tienda'], settingsTitle: 'Configuración', settings: ['Actualizar info de la tienda', 'Configuración de dirección y contacto', 'Suscripción y paquetes'], cta: 'Registro / Info de empresa' },
  ru: { title: 'Панель магазина', desc: 'Управляйте магазином, добавляйте товары, просматривайте заказы и статистику. Управляйте всеми операциями магазина через единую панель.', productsTitle: 'Управление товарами', products: ['Добавить новый товар', 'Редактировать существующие товары', 'Обновить запасы и цены'], ordersTitle: 'Заказы', orders: ['Просмотр входящих заказов', 'Обновить статус заказа', 'Общаться с клиентом'], statsTitle: 'Статистика', stats: ['Отчёты о продажах и просмотрах', 'Самые продаваемые товары', 'Рейтинг и отзывы магазина'], settingsTitle: 'Настройки', settings: ['Обновить информацию о магазине', 'Настройки адреса и контактов', 'Подписка и пакеты'], cta: 'Регистрация бизнеса / Информация' },
} as const

export default function ShopPanelPage() {
  const locale = useCurrentLocale()
  const t = spText[locale as keyof typeof spText] ?? spText.tr

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-purple-700 mb-6">{t.title}</h1>
          <p className="text-lg text-gray-700 text-center mb-8">{t.desc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">{t.productsTitle}</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t.products.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">{t.ordersTitle}</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t.orders.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">{t.statsTitle}</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t.stats.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">{t.settingsTitle}</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {t.settings.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="/for-business" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">
              {t.cta}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

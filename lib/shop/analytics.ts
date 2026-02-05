// lib/shop/analytics.ts
export const shopAnalyticsEvents = {
  // Mağaza görüntüleme
  SHOP_VIEWED: 'shop_viewed',
  PRODUCT_VIEWED: 'product_viewed',
  SEARCH_VIEWED: 'search_viewed',
  
  // Engagement
  SHOP_FOLLOWED: 'shop_followed',
  PRODUCT_INQUIRY: 'product_inquiry',
  SEARCH_MATCH_CLICKED: 'search_match_clicked',
  
  // Conversion
  CONTACT_CLICKED: 'contact_clicked',
  DIRECT_MESSAGE_SENT: 'direct_message_sent',
  
  // Monetization
  PREMIUM_UPGRADE: 'premium_upgrade',
  FEATURED_PRODUCT: 'featured_product_purchased',
  PROMOTION_PURCHASED: 'promotion_purchased'
}

// Premium özellikler
export const shopPremiumFeatures = {
  BASIC: {
    price: 0,
    features: [
      '5 aktif arama',
      '50 ürün listesi',
      'Temel eşleşme sistemi',
      'Email bildirimleri'
    ]
  },
  PRO: {
    price: 99,
    features: [
      '20 aktif arama',
      '200 ürün listesi',
      'Gelişmiş eşleşme algoritması',
      'Öncelikli destek',
      'Analytics dashboard',
      'Özel mağaza teması'
    ]
  },
  BUSINESS: {
    price: 299,
    features: [
      '100 aktif arama',
      '1000 ürün listesi',
      'AI destekli eşleşme',
      'API erişimi',
      'Çoklu kullanıcı hesabı',
      'Özel entegrasyonlar'
    ]
  }
}
// lib/shop/optimizations.ts
export const shopOptimizations = {
  // Cache strategies
  CACHE_KEYS: {
    SHOP_PROFILE: (shopId: string) => `shop:${shopId}:profile`,
    SHOP_INVENTORY: (shopId: string) => `shop:${shopId}:inventory`,
    SHOP_SEARCHES: (shopId: string) => `shop:${shopId}:searches`,
    SHOP_MATCHES: (shopId: string) => `shop:${shopId}:matches`
  },

  // Pagination
  PAGINATION: {
    INVENTORY_PER_PAGE: 12,
    SEARCHES_PER_PAGE: 10,
    MATCHES_PER_PAGE: 20
  },

  // Image optimization
  IMAGE_SIZES: {
    THUMBNAIL: 'w_300,h_300,c_fill',
    PRODUCT: 'w_800,h_800,c_limit',
    GALLERY: 'w_1200,h_1200,c_limit'
  },

  // Search/match optimization
  MATCH_ALGORITHM: {
    BATCH_SIZE: 100,
    MIN_SCORE: 50,
    REINDEX_HOURS: 24
  }
}
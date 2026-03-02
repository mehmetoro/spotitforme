// lib/social/optimizations.ts
export const socialOptimizations = {
  // Image optimization
  IMAGE_SIZES: {
    thumbnail: 'w_200,h_200,c_fill',
    feed: 'w_1080,h_1080,c_limit',
    story: 'w_1080,h_1920,c_fill'
  },

  // Lazy loading
  LAZY_THRESHOLD: 0.1, // Intersection Observer threshold
  
  // Caching
  CACHE_TTL: {
    feed: 60, // 1 dakika
    comments: 30, // 30 saniye
    profile: 300 // 5 dakika
  },

  // Batch operations
  BATCH_SIZES: {
    comments: 20,
    notifications: 50,
    feed: 10
  }
}
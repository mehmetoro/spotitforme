// lib/gamification/game-engine.ts
export class GamificationEngine {
  // ROZET SİSTEMİ
  static BADGES = {
    FIRST_SIGHTING: { id: 'first-sighting', name: 'İlk İz', icon: '👁️', points: 10 },
    HELPER_LEVEL_1: { id: 'helper-1', name: 'Yardımsever', icon: '🤝', points: 50 },
    RARE_FINDER: { id: 'rare-finder', name: 'Nadir Avcısı', icon: '🔍', points: 100 },
    QUICK_RESPONSE: { id: 'quick-response', name: 'Hızlı Tepki', icon: '⚡', points: 25 },
    SOCIAL_INFLUENCER: { id: 'social-influencer', name: 'Topluluk Lideri', icon: '👑', points: 500 }
  }

  // SEVİYE SİSTEMİ
  static LEVELS = [
    { level: 1, name: 'Yeni Gözcü', minPoints: 0, color: 'gray' },
    { level: 2, name: 'Aktif Avcı', minPoints: 100, color: 'blue' },
    { level: 3, name: 'Uzman Bulucu', minPoints: 500, color: 'green' },
    { level: 4, name: 'Master Dedektif', minPoints: 2000, color: 'purple' },
    { level: 5, name: 'Efsane Avcı', minPoints: 5000, color: 'gold' }
  ]

  // PUAN SİSTEMİ
  static POINT_RULES = {
    SIGHTING_WITHOUT_PHOTO: 5,
    SIGHTING_WITH_PHOTO: 15,
    SIGHTING_WITH_PRICE: 10,
    RARE_ITEM_REPORT: 25,
    PURCHASE_FACILITATED: 50,
    DAILY_LOGIN_STREAK: [5, 10, 15, 20, 25], // 5 gün üst üste
    SOCIAL_SHARE: 10,
    PROFILE_COMPLETION: 30
  }
}
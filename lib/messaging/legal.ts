// lib/messaging/legal.ts
export const LEGAL_COMPLIANCE = {
  // KVKK/GDPR uyumu
  DATA_PROTECTION: {
    messageRetentionDays: 365, // Mesajlar 1 yıl saklanır
    autoDeleteAfterInactivity: 730, // 2 yıl hareketsiz kalırsa silinir
    userRightToDelete: true, // Kullanıcı mesajlarını silebilir
    dataExportEnabled: true // Kullanıcı verilerini dışa aktarabilir
  },

  // Türkiye yasaları
  TURKISH_LAW: {
    law5651: true, // İnternet ortamında yapılan yayınların düzenlenmesi
    eSignatureLaw: false, // Mutabakat formları e-imza değildir
    consumerProtection: {
      applies: false, // B2B olduğu için Tüketici Koruma Kanunu uygulanmaz
      note: 'Platform sadece iletişim sağlar, satış yapmaz'
    }
  },

  // Uluslararası düzenlemeler
  INTERNATIONAL: {
    dmcaCompliant: true,
    safeHarbor: true,
    reportAbuseEmail: 'abuse@spotitforme.com',
    lawEnforcementContact: 'legal@spotitforme.com'
  }
}

// Kullanım şartları snippet'leri
export const TERMS_SNIPPETS = {
  MESSAGING: `6. MESAJLAŞMA HİZMETİ
6.1. Platform kullanıcılar arasında mesajlaşma imkanı sağlar.
6.2. Mesaj içeriklerinden kullanıcılar sorumludur.
6.3. Platform dışı işlemlerde (ödeme, teslimat) hiçbir sorumluluk kabul edilmez.
6.4. Şüpheli içerikler 5651 Sayılı Kanun gereği saklanır ve yetkililere bildirilir.`,

  TRADE: `7. PLATFORM DIŞI İŞLEMLER
7.1. Kullanıcılar platform dışında yaptıkları tüm işlemlerden kendileri sorumludur.
7.2. Mutabakat formları sadece kayıt amaçlıdır, yasal bağlayıcılığı yoktur.
7.3. Ödeme ve teslimat anlaşmazlıklarında platform arabuluculuk yapmaz.
7.4. Dolandırıcılık şüphesi durumunda ilgili makamlara bilgi verilir.`
}
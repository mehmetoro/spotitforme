// lib/messaging/disclaimer.ts
export const MESSAGING_DISCLAIMERS = {
  // Tüm mesajlaşmalarda gösterilecek uyarı
  GENERAL_DISCLAIMER: {
    title: "⚠️ Önemli Güvenlik Uyarısı",
    content: `SpotItForMe bir mesajlaşma platformu sağlar ancak:

1. 🚫 **Platform dışı ödemelerden sorumlu değiliz**
2. 🛡️ Kişisel bilgilerinizi (TCKN, kredi kartı, şifre) paylaşmayın
3. 🔍 Karşı tarafı doğrulamak için profil bilgilerini kontrol edin
4. 📞 Şüpheli durumlarda bize bildirin

Platformumuz sadece iletişim amaçlıdır. Tüm alışveriş işlemleri tarafların sorumluluğundadır.`
  },

  // Mutabakat formu disclaimer'ı
  TRADE_AGREEMENT_DISCLAIMER: `**SORUMLULUK REDDİ BEYANI**

Bu mutabakat formu SpotItForMe platformu tarafından sağlanan bir araçtır. Ancak:

1. SpotItForMe bu anlaşmanın tarafları DEĞİLDİR
2. Ödeme, teslimat veya anlaşmazlıklarda arabuluculuk YAPMAYIZ
3. Taraflar kendi aralarında güvenli işlem yapmakla YÜKÜMLÜDÜR
4. Platform sadece iletişim ve belge kaydı sağlar

✅ Bu formu kabul ederek yukarıdaki şartları kabul etmiş olursunuz.`,

  // Güvenlik ipuçları
  SAFETY_TIPS: [
    "Yerel buluşmaları halka açık, güvenli yerlerde yapın",
    "Ön ödeme talep edenlere dikkat edin",
    "Ürünü görmeden, teslimat almadan ödeme yapmayın",
    "Resmi fatura veya garanti belgesi isteyin",
    "Şüpheli durumları platform@spotitforme.com'a bildirin"
  ]
}

// Güvenlik kontrol fonksiyonları
export class MessagingSecurity {
  // Kullanıcıları otomatik olarak şüpheli içerik için tarar
  static scanMessageForRisks(content: string): {
    riskLevel: 'low' | 'medium' | 'high'
    warnings: string[]
    blocked: boolean
  } {
    const warnings: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    
    const riskyPatterns = [
      { pattern: /\b(TCKN|kimlik|numara)\b/i, warning: 'Kişisel bilgi paylaşımı' },
      { pattern: /\b(kredi.?kartı|kart.?numarası)\b/i, warning: 'Finansal bilgi paylaşımı' },
      { pattern: /\b(ön.?ödeme|havale|eft)\b.*\b(acil|hemen|şimdi)\b/i, warning: 'Acil ödeme talebi' },
      { pattern: /\b(dışarıda|sokakta|ıssız)\b.*\b(buluş|teslim)\b/i, warning: 'Güvensiz buluşma önerisi' },
      { pattern: /(http|https):\/\/[^\s]+(bank|ödeme|transfer)/i, warning: 'Şüpheli ödeme linki' }
    ]
    
    for (const { pattern, warning } of riskyPatterns) {
      if (pattern.test(content)) {
        warnings.push(warning)
        riskLevel = riskLevel === 'low' ? 'medium' : 'high'
      }
    }
    
    // Çok sayıda uyarı varsa blokla
    const blocked = warnings.length >= 3
    
    return { riskLevel, warnings, blocked }
  }
  
  // Kullanıcı güvenlik skoru
  static calculateUserTrustScore(userId: string): Promise<number> {
    // Bu fonksiyon kullanıcının:
    // - Doğrulanmış email/telefon
    // - Profil tamamlama oranı
    // - Geçmiş işlemleri
    // - Diğer kullanıcılardan aldığı puanlar
    // baz alınarak hesaplanır
    
    return Promise.resolve(70) // Örnek değer
  }
}
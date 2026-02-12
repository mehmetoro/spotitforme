// lib/email-client.ts - YENİ VE BASİT
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// TÜM email fonksiyonları için ortak gönderici
async function sendEmailAPI(to: string, subject: string, html: string): Promise<boolean> {
  console.log(`📤 Email gönderiliyor: ${to}`)
  
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    })
    
    if (!response.ok) {
      console.error('❌ API response not OK:', response.status)
      return false
    }
    
    const result = await response.json()
    console.log('📨 API Response:', result)
    
    return result.success === true
    
  } catch (error) {
    console.error('❌ Email API çağrı hatası:', error)
    
    // Development'da her zaman başarılı
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 DEV MOD: Simulating success')
      return true
    }
    
    return false
  }
}

// 1. Hoşgeldin Email'i
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const subject = `🤝 Hoş Geldin ${name}! - SpotItForMe`
  const html = `
    <h1>Hoş Geldin ${name}! 👋</h1>
    <p>SpotItForMe topluluğuna katıldığınız için teşekkür ederiz.</p>
    <p>Artık kayıp ürünlerinizi bulabilir veya başkalarına yardım edebilirsiniz.</p>
    <p><strong>App Password Test:</strong> ahfd vrzy kuen opmj</p>
  `
  
  return sendEmailAPI(to, subject, html)
}

// 2. Spot Oluşturma Email'i
export async function sendSpotCreatedEmail(to: string, spotTitle: string, spotId: string): Promise<boolean> {
  const subject = `🎉 Spot Oluşturuldu: "${spotTitle}"`
  const html = `
    <h1>Spot'unuz Oluşturuldu! 🎯</h1>
    <p><strong>"${spotTitle}"</strong> başlıklı spot'unuz başarıyla oluşturuldu.</p>
    <p>Topluluğumuz şimdi bu ürünü aramaya başladı!</p>
    <p>Spot ID: ${spotId}</p>
  `
  
  return sendEmailAPI(to, subject, html)
}

// 3. Yardım Bildirimi Email'i
export async function sendSightingNotificationEmail(
  to: string, 
  spotTitle: string, 
  spotterName: string,
  spotId: string
): Promise<boolean> {
  const subject = `🎯 Yeni Yardım: "${spotTitle}" ürünü görüldü!`
  const html = `
    <h1>🎉 Müjdeli Haber!</h1>
    <p><strong>${spotterName}</strong> adlı kullanıcı, aradığınız ürünü gördüğünü bildirdi!</p>
    <p>Ürün: <strong>"${spotTitle}"</strong></p>
    <p>Hemen uygulamaya gidip detayları görüntüleyin.</p>
  `
  
  return sendEmailAPI(to, subject, html)
}

// 4. Şifre Sıfırlama Email'i
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
  const subject = '🔐 SpotItForMe - Şifre Sıfırlama'
  const html = `
    <h1>Şifre Sıfırlama</h1>
    <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>Bu link 1 saat geçerlidir.</p>
    <p>Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
  `
  
  return sendEmailAPI(to, subject, html)
}
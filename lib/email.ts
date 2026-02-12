// lib/email.ts (GÜNCELLENMİŞ - Ücretsiz versiyon)
export async function sendSpotCreatedEmail(to: string, spotTitle: string, spotId: string) {
  try {
    console.log('📧 Spot oluşturma emaili gönderiliyor:', { to, spotTitle })
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        template: 'spot-created',
        data: { spotTitle, spotId }
      })
    })

    if (!response.ok) {
      throw new Error(`Email API hatası: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Email gönderildi:', result)
    return true

  } catch (error) {
    console.error('Email gönderilemedi:', error)
    
    // Production'da hatayı log'la ama kullanıcıya gösterme
    if (process.env.NODE_ENV === 'production') {
      // Hata tracking servisine log'la (Sentry, LogRocket, vb.)
      console.error('Production email hatası:', error)
    }
    
    return false
  }
}

export async function sendSightingNotificationEmail(
  to: string, 
  spotTitle: string, 
  spotterName: string,
  spotId: string
) {
  try {
    console.log('🎯 Yardım bildirimi emaili:', { to, spotTitle })
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        template: 'sighting-notification',
        data: { spotTitle, spotterName, spotId }
      })
    })

    if (!response.ok) {
      throw new Error(`Email API hatası: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Yardım bildirimi gönderildi:', result)
    return true

  } catch (error) {
    console.error('Yardım bildirimi gönderilemedi:', error)
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Production yardım bildirimi hatası:', error)
    }
    
    return false
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    console.log('👋 Hoşgeldin emaili:', { to, name })
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        template: 'welcome',
        data: { name }
      })
    })

    if (!response.ok) {
      throw new Error(`Email API hatası: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Hoşgeldin emaili gönderildi:', result)
    return true

  } catch (error) {
    console.error('Hoşgeldin emaili gönderilemedi:', error)
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Production hoşgeldin emaili hatası:', error)
    }
    
    return false
  }
}

// Test email gönderme
export async function sendTestEmail(to: string) {
  return sendWelcomeEmail(to, 'Test Kullanıcı')
}
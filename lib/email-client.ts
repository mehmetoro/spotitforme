// lib/email-client.ts - Nodemailer OLMADAN!
// Bu dosya sadece fetch yapar, server-side modülleri kullanmaz

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  try {
    console.log('📧 Hoşgeldin emaili API çağrısı:', to)
    
    // Development'da her zaman başarılı dön (test için)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 DEV MOD: Email simülasyonu başarılı - To:', to)
      console.log('📝 Email içeriği: Hoş geldin', name)
      console.log('🔐 App Password simülasyonu: ahfd vrzy kuen opmj')
      return true
    }
    
    // Production'da API'yi çağır
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        to,
        data: { name }
      })
    })
    
    const result = await response.json()
    return result.success === true
    
  } catch (error) {
    console.error('❌ Email gönderme hatası:', error)
    return false
  }
}

export async function sendSpotCreatedEmail(to: string, spotTitle: string, spotId: string): Promise<boolean> {
  try {
    console.log('📧 Spot oluşturma emaili API çağrısı:', to)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 DEV MOD: Spot email simülasyonu başarılı')
      console.log('📝 Spot:', spotTitle)
      console.log('🔗 ID:', spotId)
      return true
    }
    
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'spot-created',
        to,
        data: { spotTitle, spotId }
      })
    })
    
    const result = await response.json()
    return result.success === true
    
  } catch (error) {
    console.error('❌ Spot email gönderme hatası:', error)
    return false
  }
}

export async function sendSightingNotificationEmail(
  to: string, 
  spotTitle: string, 
  spotterName: string,
  spotId: string
): Promise<boolean> {
  try {
    console.log('📧 Yardım bildirimi emaili API çağrısı:', to)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 DEV MOD: Yardım email simülasyonu başarılı')
      console.log('🎯 Spot:', spotTitle)
      console.log('👤 Yardım eden:', spotterName)
      return true
    }
    
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sighting-notification',
        to,
        data: { spotTitle, spotterName, spotId }
      })
    })
    
    const result = await response.json()
    return result.success === true
    
  } catch (error) {
    console.error('❌ Yardım email gönderme hatası:', error)
    return false
  }
}
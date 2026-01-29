// lib/email.ts - YENİ VERSİYON
// Bu artık sadece bir wrapper, gerçek işi email-client.ts yapacak

// Client fonksiyonlarını export et
export { 
  sendWelcomeEmail, 
  sendSpotCreatedEmail, 
  sendSightingNotificationEmail 
} from './email-client'

// Server-side fonksiyon (sadece API route'larda kullanılacak)
export async function sendEmailDirectly(to: string, subject: string, html: string) {
  // Bu sadece server-side'da çalışır
  // API route'larında kullanılır
  return { success: false, message: 'Use API route instead' }
}
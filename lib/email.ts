// lib/email.ts dosyasının TAMAMINI bu kodla değiştirin:
// Bu sadece bir wrapper - gerçek kod email-client.ts'te

// Client fonksiyonlarını export et
export { 
  sendWelcomeEmail, 
  sendSpotCreatedEmail, 
  sendSightingNotificationEmail 
} from './email-client'

// Test fonksiyonu (isteğe bağlı)
export async function testEmailConnection() {
  console.log('🔧 Email test (simulated for client)')
  return {
    success: true,
    message: 'Client-side test başarılı. Real test için API kullanın.'
  }
}
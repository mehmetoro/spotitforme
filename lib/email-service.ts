// lib/email-service.ts
import { emailTemplates, generateTextVersion } from './email-templates'

export interface EmailOptions {
  to: string | string[]
  template: string
  data: any
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  devMode?: boolean
}

class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      console.log('📧 Email gönderiliyor:', {
        to: typeof options.to === 'string' ? options.to.substring(0, 3) + '...' : options.to.length + ' alıcı',
        template: options.template,
        timestamp: new Date().toISOString()
      })

      // 1. Template'i al
      const templateGenerator = emailTemplates[options.template]
      if (!templateGenerator) {
        throw new Error(`Template bulunamadı: ${options.template}`)
      }

      const template = templateGenerator(options.data)

      // 2. Email verilerini hazırla
      const emailData = {
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        template: options.template,
        data: options.data,
        subject: template.subject,
        html: template.html,
        text: template.text || generateTextVersion(template.html),
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(',') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc) : undefined,
        replyTo: options.replyTo,
        attachments: options.attachments
      }

      // 3. API'ye gönder
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Email gönderilemedi')
      }

      console.log('✅ Email gönderildi:', result.messageId || 'ID yok')
      return {
        success: true,
        messageId: result.messageId,
        devMode: result.devMode
      }

    } catch (error: any) {
      console.error('❌ Email gönderme hatası:', error.message)
      
      // Production'da hatayı log'la
      if (process.env.NODE_ENV === 'production') {
        // Burada Sentry, LogRocket gibi bir servise log'layabilirsiniz
        console.error('Production email hatası:', {
          error: error.message,
          template: options.template,
          to: options.to
        })
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Kolay kullanım için yardımcı metodlar
  async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail({
      to,
      template: 'welcome',
      data: { name }
    })
  }

  async sendSpotCreatedEmail(to: string, spotTitle: string, spotId: string) {
    return this.sendEmail({
      to,
      template: 'spot-created',
      data: { spotTitle, spotId }
    })
  }

  async sendSightingNotification(
    to: string, 
    spotTitle: string, 
    spotterName: string, 
    spotId: string,
    spotterMessage?: string,
    price?: string,
    location?: string
  ) {
    return this.sendEmail({
      to,
      template: 'spot-sighting',
      data: { 
        spotTitle, 
        spotterName, 
        spotId,
        spotterMessage,
        price,
        location
      }
    })
  }

  async sendSpotFoundEmail(
    to: string,
    spotTitle: string,
    spotId: string,
    foundBy?: string,
    totalSpots?: number,
    foundSpots?: number
  ) {
    return this.sendEmail({
      to,
      template: 'spot-found',
      data: {
        spotTitle,
        spotId,
        foundBy,
        totalSpots,
        foundSpots
      }
    })
  }

  async sendBusinessWelcomeEmail(
    to: string,
    businessName: string,
    contactName: string,
    plan: string,
    imageLimit: string
  ) {
    return this.sendEmail({
      to,
      template: 'business-welcome',
      data: {
        businessName,
        contactName,
        plan,
        imageLimit
      }
    })
  }

  async sendPasswordResetEmail(to: string, resetLink: string, name?: string) {
    return this.sendEmail({
      to,
      template: 'password-reset',
      data: {
        resetLink,
        name: name || 'Kullanıcı'
      }
    })
  }

  async sendVerificationEmail(to: string, verificationLink: string, name?: string) {
    return this.sendEmail({
      to,
      template: 'verify-email',
      data: {
        verificationLink,
        name: name || 'Kullanıcı'
      }
    })
  }

  async sendAdminAlert(title: string, details: any, adminEmails: string | string[]) {
    return this.sendEmail({
      to: adminEmails,
      template: 'admin-alert',
      data: {
        title,
        details
      }
    })
  }
}

// Singleton instance export
export const emailService = EmailService.getInstance()
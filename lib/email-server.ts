// lib/email-server.ts - SERVER SIDE EMAIL
'use server'

import nodemailer from 'nodemailer'

// 1. EMAIL TRANSPORTER (SERVER SIDE)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  })
}

// 2. EMAIL TEMPLATE HELPER
const createEmailTemplate = (title: string, content: string, button?: { text: string; url: string }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
        .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { color: rgba(255, 255, 255, 0.9); font-size: 14px; }
        .content { background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #2563eb; }
        .highlight { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SpotItForMe</div>
          <div class="tagline">Toplulukla Bul, Birlikte Keşfet</div>
        </div>
        
        <div class="content">
          ${content}
          
          ${button ? `
            <div style="text-align: center; margin-top: 30px;">
              <a href="${button.url}" class="button">${button.text}</a>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Bu e-posta SpotItForMe platformundan otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// 3. HOŞGELDİN EMAIL'I
export async function sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`👋 Hoşgeldin emaili gönderiliyor: ${to} (${name})`)
    
    const transporter = createTransporter()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'SpotItForMe <noreply@spotitforme.com>',
      to,
      subject: `🤝 Hoş Geldin ${name}! - SpotItForMe Topluluğuna Katıldınız`,
      html: createEmailTemplate(
        'Hoş Geldiniz',
        `
          <h2 style="color: #1f2937; margin-bottom: 20px;">Merhaba ${name},</h2>
          <p>SpotItForMe topluluğuna katıldığınız için çok mutluyuz! 🎉</p>
          
          <div class="highlight">
            <p style="font-weight: 600; color: #1e40af; margin-bottom: 10px;">🚀 Hemen Başlayın:</p>
            <p>Kayıp ürünlerinizi bulmak veya başkalarına yardım etmek için platformumuzu kullanmaya başlayabilirsiniz.</p>
          </div>
          
          <p>Herhangi bir sorunuz olursa destek@spotitforme.com adresinden bize ulaşabilirsiniz.</p>
        `,
        {
          text: 'SpotItForMe\'yi Keşfet',
          url: `${siteUrl}/spots`
        }
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Hoşgeldin emaili gönderildi:', info.messageId)
    
    return { success: true, message: 'Email gönderildi' }
    
  } catch (error: any) {
    console.error('❌ Hoşgeldin emaili gönderilemedi:', error.message)
    return { success: false, message: error.message }
  }
}

// 4. SPOT OLUŞTURMA EMAIL'I
export async function sendSpotCreatedEmail(to: string, spotTitle: string, spotId: string, userName: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`📝 Spot oluşturma emaili: ${to} - "${spotTitle}"`)
    
    const transporter = createTransporter()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'SpotItForMe <noreply@spotitforme.com>',
      to,
      subject: `🎉 Spot Oluşturuldu: "${spotTitle.substring(0, 50)}${spotTitle.length > 50 ? '...' : ''}"`,
      html: createEmailTemplate(
        'Spot Oluşturuldu',
        `
          <h2 style="color: #1f2937; margin-bottom: 20px;">Merhaba ${userName},</h2>
          <p><strong>"${spotTitle}"</strong> başlıklı spot'unuz başarıyla oluşturuldu!</p>
          
          <div class="highlight">
            <p style="font-weight: 600; color: #059669; margin-bottom: 15px;">✅ Spot'unuz Aktif!</p>
            <p>Spot'unuz şu anda topluluğumuzun yardımına sunuldu.</p>
          </div>
          
          <p><strong>🔗 Spot Linki:</strong> <a href="${siteUrl}/spots/${spotId}">${siteUrl}/spots/${spotId}</a></p>
        `,
        {
          text: 'Spot\'umu Görüntüle',
          url: `${siteUrl}/spots/${spotId}`
        }
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Spot oluşturma emaili gönderildi:', info.messageId)
    
    return { success: true, message: 'Email gönderildi' }
    
  } catch (error: any) {
    console.error('❌ Spot oluşturma emaili gönderilemedi:', error.message)
    return { success: false, message: error.message }
  }
}

// 5. YARDIM BİLDİRİMİ EMAIL'I
export async function sendSightingNotificationEmail(
  to: string, 
  spotTitle: string, 
  spotterName: string,
  spotId: string,
  spotOwnerName: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`🎯 Yardım bildirimi: ${to} - "${spotTitle}"`)
    
    const transporter = createTransporter()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'SpotItForMe <noreply@spotitforme.com>',
      to,
      subject: `🎯 YARDIM BİLDİRİMİ: "${spotTitle.substring(0, 40)}${spotTitle.length > 40 ? '...' : ''}" ürününüz görüldü!`,
      html: createEmailTemplate(
        'Yardım Bildirimi',
        `
          <h2 style="color: #1f2937; margin-bottom: 20px;">Merhaba ${spotOwnerName},</h2>
          
          <p style="font-size: 18px; color: #059669; font-weight: 600; margin-bottom: 20px;">
            🎉 MÜJDE! Aradığınız ürün görüldü!
          </p>
          
          <div class="highlight">
            <p><strong>${spotterName}</strong> adlı topluluk üyemiz, aradığınız <strong>"${spotTitle}"</strong> ürününü gördüğünü bildirdi!</p>
          </div>
          
          <p><strong>🔗 Detaylar:</strong> <a href="${siteUrl}/spots/${spotId}">Spot sayfasında görüntüle</a></p>
        `,
        {
          text: 'Yardım Detaylarını Görüntüle',
          url: `${siteUrl}/spots/${spotId}`
        }
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Yardım bildirimi emaili gönderildi:', info.messageId)
    
    return { success: true, message: 'Email gönderildi' }
    
  } catch (error: any) {
    console.error('❌ Yardım bildirimi emaili gönderilemedi:', error.message)
    return { success: false, message: error.message }
  }
}

// 6. ŞİFRE SIFIRLAMA EMAIL'I
export async function sendPasswordResetEmail(to: string, resetLink: string, userName?: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`🔐 Şifre sıfırlama emaili: ${to}`)
    
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'SpotItForMe <noreply@spotitforme.com>',
      to,
      subject: '🔐 SpotItForMe - Şifre Sıfırlama Talebi',
      html: createEmailTemplate(
        'Şifre Sıfırlama',
        `
          <h2 style="color: #1f2937; margin-bottom: 20px;">Merhaba ${userName || 'Kullanıcı'},</h2>
          <p>Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi oluşturabilirsiniz:</p>
          
          <div class="highlight">
            <p style="font-weight: 600; color: #d97706; margin-bottom: 10px;">⚠️ ÖNEMLİ UYARILAR:</p>
            <p><strong>• Bu link 1 saat içinde geçerlidir</strong></p>
            <p><strong>• Linki kimseyle paylaşmayın</strong></p>
          </div>
        `,
        {
          text: 'Şifremi Sıfırla',
          url: resetLink
        }
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Şifre sıfırlama emaili gönderildi:', info.messageId)
    
    return { success: true, message: 'Email gönderildi' }
    
  } catch (error: any) {
    console.error('❌ Şifre sıfırlama emaili gönderilemedi:', error.message)
    return { success: false, message: error.message }
  }
}
// lib/email.ts - GÜNCEL ve ÜCRETSİZ
import nodemailer from 'nodemailer'

// Email transporter oluştur
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false // Development için
    }
  })
}

// Basit HTML template oluşturucu
const createEmailTemplate = (title: string, content: string, button?: { text: string, url: string }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; color: white; }
        .content { padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .highlight { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SpotItForMe</h1>
        <p>Toplulukla Bul, Birlikte Keşfet</p>
      </div>
      <div class="content">
        ${content}
        ${button ? `<div style="text-align: center;"><a href="${button.url}" class="button">${button.text}</a></div>` : ''}
        <div class="footer">
          <p>Bu e-posta SpotItForMe platformundan otomatik olarak gönderilmiştir.</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe">Bildirimleri devre dışı bırak</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

// EMAIL FONKSİYONLARI

export async function sendSpotCreatedEmail(to: string, spotTitle: string, spotId: string) {
  try {
    const transporter = createTransporter()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: `🎉 Spot Oluşturuldu: "${spotTitle}"`,
      html: createEmailTemplate(
        'Spot Oluşturuldu',
        `
          <p>Merhaba,</p>
          <p><strong>"${spotTitle}"</strong> başlıklı spot'unuz başarıyla oluşturuldu!</p>
          
          <div class="highlight">
            <p><strong>Spot Detayları:</strong></p>
            <p>📌 <strong>Başlık:</strong> ${spotTitle}</p>
            <p>🔗 <strong>Spot Linki:</strong> ${siteUrl}/spots/${spotId}</p>
            <p>⏰ <strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <p>Spot'unuz şu anda topluluğumuzun yardımına sunuldu. Binlerce kullanıcı şehirlerinde gezerken sizin için göz kulak olacak.</p>
          
          <p><strong>💡 İpuçları:</strong></p>
          <ul>
            <li>Spot detaylarınızı güncelleyebilirsiniz</li>
            <li>Daha fazla fotoğraf ekleyebilirsiniz</li>
            <li>Spot'u sosyal medyada paylaşabilirsiniz</li>
          </ul>
        `,
        {
          text: 'Spot\'u Görüntüle',
          url: `${siteUrl}/spots/${spotId}`
        }
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Spot oluşturma emaili gönderildi:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Spot oluşturma emaili gönderilemedi:', error)
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
    const transporter = createTransporter()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: `🎯 YENİ YARDIM: "${spotTitle}" ürünü görüldü!`,
      html: createEmailTemplate(
        'Yeni Yardım Bildirimi',
        `
          <p>Merhaba,</p>
          <p><strong>${spotterName}</strong> adlı kullanıcı, aradığınız <strong>"${spotTitle}"</strong> ürününü gördüğünü bildirdi!</p>
          
          <div class="highlight" style="background: #f0fdf4; border-left: 4px solid #10b981;">
            <p><strong>🎉 Müjdeli Haber!</strong></p>
            <p>Bir topluluk üyemiz aradığınız ürünü gördüğünü bildirdi.</p>
            <p>Hemen spot sayfasına giderek detayları görüntüleyin!</p>
          </div>

          <p><strong>📋 Sonraki Adımlar:</strong></p>
          <ol>
            <li>Yardım detaylarını inceleyin</li>
            <li>Gerekirse spotter ile iletişime geçin</li>
            <li>Ürünü bulduysanız spot durumunu güncelleyin</li>
            <li>Yardım eden kullanıcıya teşekkür edin</li>
          </ol>
          
          <p><strong>⚠️ Dikkat:</strong> Lütfen güvenliğiniz için kişisel bilgilerinizi paylaşırken dikkatli olun.</p>
        `,
        {
          text: 'Yardım Detaylarını Görüntüle',
          url: `${siteUrl}/spots/${spotId}`
        }
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Yardım bildirimi emaili gönderildi:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Yardım bildirimi emaili gönderilemedi:', error)
    return false
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const transporter = createTransporter()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: `🤝 Hoş Geldin ${name}! SpotItForMe Topluluğuna Katıldınız`,
      html: createEmailTemplate(
        'Hoş Geldiniz',
        `
          <p>Merhaba <strong>${name}</strong>,</p>
          <p>SpotItForMe topluluğuna katıldığınız için çok mutluyuz! 🎉</p>
          
          <div class="highlight">
            <p><strong>🚀 Hemen Başlayın:</strong></p>
            <p>Kayıp ürünlerinizi bulmak veya başkalarına yardım etmek için platformumuzu kullanmaya hemen başlayabilirsiniz.</p>
          </div>

          <p><strong>✨ Platform Özellikleri:</strong></p>
          <ul>
            <li>✅ Ücretsiz spot oluşturma</li>
            <li>✅ Binlerce aktif topluluk üyesi</li>
            <li>✅ Anlık yardım bildirimleri</li>
            <li>✅ Mobil uyumlu tasarım</li>
            <li>✅ %100 güvenli ve gizli</li>
          </ul>

          <p><strong>📚 Nasıl Çalışır?</strong></p>
          <ol>
            <li>Spot oluşturun (ücretsiz)</li>
            <li>Topluluk üyeleri ürünü görsün</li>
            <li>Yardım bildirimleri alın</li>
            <li>Ürününüzü bulun!</li>
          </ol>
          
          <p>Herhangi bir sorunuz olursa <a href="mailto:destek@spotitforme.com">destek@spotitforme.com</a> adresinden bize ulaşabilirsiniz.</p>
        `,
        {
          text: 'Platformu Keşfet',
          url: `${siteUrl}/spots`
        }
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Hoşgeldin emaili gönderildi:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Hoşgeldin emaili gönderilemedi:', error)
    return false
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: '🔐 SpotItForMe - Şifre Sıfırlama',
      html: createEmailTemplate(
        'Şifre Sıfırlama',
        `
          <p>Merhaba,</p>
          <p>Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi oluşturabilirsiniz:</p>
          
          <div class="highlight" style="text-align: center;">
            <p><strong>⚠️ Bu link 1 saat içinde geçerlidir</strong></p>
          </div>
          
          <p>Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        `,
        {
          text: 'Şifremi Sıfırla',
          url: resetLink
        }
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Şifre sıfırlama emaili gönderildi:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Şifre sıfırlama emaili gönderilemedi:', error)
    return false
  }
}

// TEST FONKSİYONU
export async function testEmailConnection() {
  try {
    const transporter = createTransporter()
    
    // Test email gönder
    const testMailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Kendi email'inize gönderin
      subject: '✅ SpotItForMe Email Testi',
      text: 'Email sistemi başarıyla çalışıyor!',
      html: '<h1>✅ Email Testi Başarılı!</h1><p>SpotItForMe email sistemi çalışıyor.</p>'
    }

    const info = await transporter.sendMail(testMailOptions)
    console.log('✅ Email testi başarılı:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Email testi başarısız:', error)
    return { 
      success: false, 
      error: error.message,
      details: 'SMTP ayarlarını kontrol edin: host, port, user, password'
    }
  }
}
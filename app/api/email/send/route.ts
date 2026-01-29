// app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body
    
    console.log('📧 Email API çağrıldı:', { type, to })

    // 1. SMTP ayarlarını kontrol et
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM || 'SpotItForMe <noreply@spotitforme.com>'
    }

    if (!smtpConfig.user || !smtpConfig.pass) {
      console.error('❌ SMTP ayarları eksik')
      return NextResponse.json(
        { success: false, error: 'SMTP configuration missing' },
        { status: 500 }
      )
    }

    // 2. Transporter oluştur (SERVER-SIDE - burada nodemailer kullanabiliriz)
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // 3. Email template'ini oluştur
    const { subject, html } = getEmailTemplate(type, data)

    // 4. Email gönder
    const info = await transporter.sendMail({
      from: smtpConfig.from,
      to,
      subject,
      html,
    })

    console.log('✅ Email gönderildi:', info.messageId)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    })

  } catch (error: any) {
    console.error('❌ Email API hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email gönderilemedi',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Email template'leri
function getEmailTemplate(type: string, data: any) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
  
  switch (type) {
    case 'welcome':
      return {
        subject: `🤝 Hoş Geldin ${data.name}! - SpotItForMe`,
        html: `
          <h1>Hoş Geldin ${data.name}! 👋</h1>
          <p>SpotItForMe topluluğuna katıldığınız için teşekkür ederiz.</p>
          <p>Artık kayıp ürünlerinizi bulmak veya başkalarına yardım etmek için platformumuzu kullanabilirsiniz.</p>
          <p><a href="${siteUrl}/spots" style="color: #3b82f6;">Spot'ları Keşfet →</a></p>
        `
      }
      
    case 'spot-created':
      return {
        subject: `🎉 Spot Oluşturuldu: "${data.spotTitle}"`,
        html: `
          <h1>Spot'unuz Oluşturuldu! 🎯</h1>
          <p><strong>"${data.spotTitle}"</strong> başlıklı spot'unuz başarıyla oluşturuldu.</p>
          <p>Topluluğumuz şimdi bu ürünü aramaya başladı!</p>
          <p><a href="${siteUrl}/spots/${data.spotId}" style="color: #3b82f6;">Spot'unuzu Görüntüle →</a></p>
        `
      }
      
    case 'sighting-notification':
      return {
        subject: `🎯 Yeni Yardım: "${data.spotTitle}" ürünü görüldü!`,
        html: `
          <h1>🎉 Müjdeli Haber!</h1>
          <p><strong>${data.spotterName}</strong> adlı kullanıcı, aradığınız <strong>"${data.spotTitle}"</strong> ürününü gördüğünü bildirdi!</p>
          <p>Hemen spot sayfasına giderek detayları görüntüleyin.</p>
          <p><a href="${siteUrl}/spots/${data.spotId}" style="color: #3b82f6;">Yardım Detaylarını Gör →</a></p>
        `
      }
      
    default:
      return {
        subject: 'SpotItForMe Bildirimi',
        html: '<p>SpotItForMe bildirimi</p>'
      }
  }
}
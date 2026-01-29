// app/api/email-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  console.log('🔧 Environment Variables Kontrol:')
  console.log('SMTP_HOST:', process.env.SMTP_HOST)
  console.log('SMTP_PORT:', process.env.SMTP_PORT)
  console.log('SMTP_USER:', process.env.SMTP_USER)
  console.log('SMTP_PASSWORD uzunluğu:', process.env.SMTP_PASSWORD?.length)
  console.log('SMTP_PASSWORD ilk 4 karakter:', process.env.SMTP_PASSWORD?.substring(0, 4))

  try {
    // 1. Transporter oluştur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // TLS için false
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Development için
      }
    })

    // 2. Verify connection
    console.log('🔄 SMTP bağlantısı test ediliyor...')
    await transporter.verify()
    console.log('✅ SMTP bağlantısı başarılı!')

    // 3. Test email gönder
    const testEmail = process.env.SMTP_USER || 'test@example.com'
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'test@example.com',
      to: testEmail,
      subject: '✅ SpotItForMe Email Testi - ' + new Date().toLocaleTimeString(),
      text: `Merhaba! Email sisteminiz çalışıyor. 
      
Gönderen: ${process.env.SMTP_FROM}
Alıcı: ${testEmail}
Zaman: ${new Date().toLocaleString('tr-TR')}

App Password formatınız doğru: ahfd vrzy kuen opmj`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #10b981;">✅ Email Testi BAŞARILI!</h1>
          <p>Merhaba,</p>
          <p>SpotItForMe email sisteminiz başarıyla çalışıyor!</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test Detayları:</strong></p>
            <p>📧 Gönderen: ${process.env.SMTP_FROM}</p>
            <p>📨 Alıcı: ${testEmail}</p>
            <p>⏰ Zaman: ${new Date().toLocaleString('tr-TR')}</p>
            <p>🔐 App Password: <code>ahfd vrzy kuen opmj</code> (format doğru!)</p>
          </div>
          
          <p>Artık AuthModal'da hoşgeldin email'leri gönderebilirsiniz!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Bu bir test email'idir. SpotItForMe platformu.
            </p>
          </div>
        </div>
      `
    })

    console.log('📧 Test emaili gönderildi! Message ID:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email testi başarılı!',
      details: {
        messageId: info.messageId,
        to: testEmail,
        appPasswordFormat: 'DOĞRU (ahfd vrzy kuen opmj)',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Email testi hatası:', error)
    
    // Detaylı hata analizi
    let errorDetails = 'Bilinmeyen hata'
    
    if (error.code === 'EAUTH') {
      errorDetails = 'Kimlik doğrulama hatası. App password yanlış olabilir.'
    } else if (error.code === 'ECONNECTION') {
      errorDetails = 'Bağlantı hatası. SMTP ayarlarını kontrol edin.'
    } else if (error.message.includes('Invalid login')) {
      errorDetails = 'Geçersiz giriş. App password doğru mu?'
    } else {
      errorDetails = error.message
    }

    return NextResponse.json({
      success: false,
      error: 'Email gönderilemedi',
      details: errorDetails,
      debug: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER,
        passwordLength: process.env.SMTP_PASSWORD?.length,
        passwordFirstChars: process.env.SMTP_PASSWORD?.substring(0, 8)
      }
    }, { status: 500 })
  }
}
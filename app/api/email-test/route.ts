// app/api/email-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  console.log('🔧 Email test API çağrıldı')
  
  try {
    // 1. Environment variables kontrol
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST || 'AYARLANMADI',
      SMTP_PORT: process.env.SMTP_PORT || 'AYARLANMADI',
      SMTP_USER: process.env.SMTP_USER ? '*** ayarlandı' : 'AYARLANMADI',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '*** ayarlandı (' + process.env.SMTP_PASSWORD.length + ' karakter)' : 'AYARLANMADI',
      SMTP_FROM: process.env.SMTP_FROM || 'AYARLANMADI',
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('📊 Environment Variables:', envCheck)

    // 2. Eğer environment variables eksikse
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables eksik',
        envCheck,
        help: '.env.local dosyasını kontrol edin'
      }, { status: 400 })
    }

    // 3. Transporter oluştur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // 4. Connection test
    console.log('🔄 SMTP bağlantısı test ediliyor...')
    await transporter.verify()
    console.log('✅ SMTP bağlantısı başarılı!')

    // 5. Test email gönder
    const testEmail = process.env.SMTP_USER
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: testEmail,
      subject: '✅ SpotItForMe Email Testi',
      text: 'Email sisteminiz çalışıyor! App password: ahfd vrzy kuen opmj',
      html: '<h1>✅ Email Testi Başarılı!</h1><p>App password formatınız doğru.</p>'
    })

    console.log('📧 Test emaili gönderildi:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email testi başarılı!',
      envCheck,
      emailInfo: {
        messageId: info.messageId,
        to: testEmail,
        appPasswordFormat: 'DOĞRU (ahfd vrzy kuen opmj)'
      }
    })

  } catch (error: any) {
    console.error('❌ Email testi hatası:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      help: 'App password ve Gmail adresini kontrol edin',
      debug: {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
      }
    }, { status: 500 })
  }
}
// app/api/email/send/route.ts - YENİ VE BASİT
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  console.log('📧 Email API çağrıldı')
  
  try {
    const body = await request.json()
    console.log('📦 Request body:', body)
    
    const { to, subject, html, type } = body
    
    // 1. SMTP ayarlarını kontrol et
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM || 'SpotItForMe <noreply@spotitforme.com>'
    }
    
    console.log('🔧 SMTP Config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user ? '***' : 'MISSING',
      pass: smtpConfig.pass ? '***' : 'MISSING'
    })
    
    // Development modu
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 DEV MOD: Email simülasyonu')
      console.log('To:', to)
      console.log('Subject:', subject)
      console.log('App Password: ahfd vrzy kuen opmj')
      
      return NextResponse.json({
        success: true,
        message: 'DEV: Email simulated',
        simulated: true
      })
    }
    
    // Production'da gerçek email gönder
    if (!smtpConfig.user || !smtpConfig.pass) {
      throw new Error('SMTP ayarları eksik')
    }
    
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })
    
    const info = await transporter.sendMail({
      from: smtpConfig.from,
      to,
      subject: subject || 'SpotItForMe Bildirimi',
      html: html || '<p>SpotItForMe bildirimi</p>',
    })
    
    console.log('✅ Email gönderildi:', info.messageId)
    
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    })
    
  } catch (error: any) {
    console.error('❌ Email API hatası:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.code,
      help: 'SMTP ayarlarını kontrol edin: .env.local dosyası'
    }, { status: 500 })
  }
}
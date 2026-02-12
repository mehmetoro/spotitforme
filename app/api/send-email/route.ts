// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // Max 10 email per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimit.get(ip)

  if (!limit) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (limit.count >= RATE_LIMIT) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  
  // Rate limit kontrolü
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { 
      to, 
      template, 
      data, 
      subject, 
      html, 
      text,
      cc,
      bcc,
      replyTo,
      attachments 
    } = body

    console.log('📧 Email gönderiliyor:', { 
      to: typeof to === 'string' ? to.substring(0, 3) + '...' : 'multiple',
      template,
      ip
    })

    // Gmail konfigürasyonu
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASS

    if (!gmailUser || !gmailPass) {
      console.error('❌ Gmail konfigürasyonu eksik')
      return NextResponse.json(
        { error: 'Email servisi konfigüre edilmemiş' },
        { status: 500 }
      )
    }

    // Transporter oluştur
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
      // Pooling için ayarlar
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    })

    // Email seçenekleri
    const mailOptions: any = {
      from: `"SpotItForMe" <${gmailUser}>`,
      to,
      subject: subject || `SpotItForMe - ${template}`,
      html: html || '<p>Email içeriği</p>',
      text: text || 'Email içeriği',
      // Hotmail/Outlook için özel header'lar
      headers: {
        'List-Unsubscribe': `<mailto:unsubscribe@spotitforme.com>`,
        'Precedence': 'bulk',
        'X-Entity-Ref-ID': Date.now().toString(),
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      },
      // DKIM imzası (Gmail otomatik ekler)
      dkim: {
        domainName: 'spotitforme.com',
        keySelector: 'default',
        privateKey: process.env.DKIM_PRIVATE_KEY || ''
      }
    }

    // Opsiyonel alanlar
    if (cc) mailOptions.cc = cc
    if (bcc) mailOptions.bcc = bcc
    if (replyTo) mailOptions.replyTo = replyTo
    if (attachments) mailOptions.attachments = attachments

    // Email gönder
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email gönderildi:', {
      messageId: info.messageId,
      to: typeof to === 'string' ? to.substring(0, 3) + '...' : 'multiple',
      accepted: info.accepted?.length || 0,
      rejected: info.rejected?.length || 0
    })

    // Başarılı response
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      envelope: info.envelope
    })

  } catch (error: any) {
    console.error('❌ Email gönderme hatası:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })

    // Detaylı hata mesajı
    let errorMessage = error.message
    let statusCode = 500

    if (error.message.includes('Invalid login')) {
      errorMessage = 'Gmail kimlik doğrulama hatası'
      statusCode = 401
    } else if (error.message.includes('recipient')) {
      errorMessage = 'Geçersiz alıcı email adresi'
      statusCode = 400
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Gmail gönderim limitine ulaşıldı'
      statusCode = 429
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        code: error.code,
        devMessage: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    )
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  const hasGmailConfig = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASS)
  
  return NextResponse.json({
    status: hasGmailConfig ? 'healthy' : 'misconfigured',
    service: 'SpotItForMe Email API',
    version: '2.1.0',
    environment: process.env.NODE_ENV,
    gmail_configured: hasGmailConfig,
    rate_limit: `${RATE_LIMIT} emails per minute`,
    templates: [
      'welcome',
      'verify-email', 
      'password-reset',
      'spot-created',
      'spot-sighting',
      'spot-found',
      'business-welcome',
      'admin-alert'
    ],
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
}
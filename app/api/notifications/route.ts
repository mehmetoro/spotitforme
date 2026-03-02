// app/api/notifications/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// we defer reading env vars until a request arrives so that build
// time doesn't crash when those secrets aren't available.
// Also force the runtime to nodejs since we use nodemailer and service
// role keys which are not supported on the Edge runtime.
export const runtime = 'nodejs'

let supabase: ReturnType<typeof createClient> | null = null
function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not set')
    }
    supabase = createClient(supabaseUrl, supabaseKey)
  }
  return supabase
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

// Email gönderme helper
async function sendEmailNotification(
  userId: string,
  type: string,
  actorId: string,
  message: string,
  postType?: string
) {
  try {
    const supabase = getSupabaseClient()
    // Alıcı kullanıcı bilgisi
    const userProfileResult = await supabase
      .from('user_profiles')
      .select('email, name')
      .eq('id', userId)
      .single() as any
    const userProfile = userProfileResult.data

    if (!userProfile?.email) return

    // Gönderen kullanıcı bilgisi
    const actorProfileResult = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', actorId)
      .single() as any
    const actorProfile = actorProfileResult.data

    const actorName = actorProfile?.name || 'Bir kullanıcı'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spotitforme.com'

    // Notification türüne göre email yapısı
    const emailTemplates: { [key: string]: string } = {
      post_liked: `
        <h2>${actorName} senin paylaşımını beğendi! 👍</h2>
        <p>${message}</p>
        <a href="${appUrl}/notifications" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Bildirimleri Gör
        </a>
      `,
      post_commented: `
        <h2>${actorName} senin paylaşımına yorum yaptı! 💬</h2>
        <p>${message}</p>
        <a href="${appUrl}/notifications" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Yorumları Gör
        </a>
      `,
      spot_found: `
        <h2>${actorName} senin bulduğun yeri buldu! 🎉</h2>
        <p>${message}</p>
        <a href="${appUrl}/notifications" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Detaylı Gör
        </a>
      `,
      post_shared: `
        <h2>${actorName} senin paylaşımını paylaştı! 🔗</h2>
        <p>${message}</p>
        <a href="${appUrl}/notifications" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Bildirimleri Gör
        </a>
      `
    }

    const emailContent = emailTemplates[type] || `<p>${message}</p>`

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
            .email-content { background-color: white; padding: 20px; border-radius: 10px; }
            h2 { color: #1f2937; margin-bottom: 10px; }
            a { color: #3b82f6; text-decoration: none; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-content">
              <h1>SpotItForMe 🎯</h1>
              ${emailContent}
              <div class="footer">
                <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen cevap vermeyin.</p>
                <p>© 2026 SpotItForMe. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Email gönder
    if (transporter && process.env.EMAIL_USER) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userProfile.email,
        subject: `SpotItForMe: ${message}`,
        html: htmlBody,
        text: `${message}\n\nDetayları görmek için: ${appUrl}/notifications`
      })
      console.log(`✅ Email gönderildi: ${userProfile.email}`)
    }
  } catch (error) {
    console.error('Email gönderim hatası:', error)
    // Bildirim gönderilmiş, email başarısız olsa da problem değil
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { userId, type, actorId, postId, message, postType } = body

    // Validasyon
    if (!userId || !type || !actorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Aynı kullanıcıya kendinden bildirim gönderme kontrolü
    if (userId === actorId) {
      return NextResponse.json(
        { success: true, skipped: true, reason: 'Self notification' },
        { status: 200 }
      )
    }

    // Notification kayıt et (türe göre uygun tabloya)
    const tableName = postType === 'shop' ? 'shop_social_notifications' : 'social_notifications'

    const { data, error } = await (supabase
      .from(tableName) as any)
      .insert({
        user_id: userId,
        type,
        actor_id: actorId,
        post_id: postId,
        message: message || 'Yeni bildirim',
        read: false
      })
      .select()
      .single()

    if (error) {
      console.error('Notification kayıt hatası:', error)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    // Email gönder (arka planda - bekleme)
    sendEmailNotification(userId, type, actorId, message, postType).catch(err => 
      console.error('Email gönderim hatası:', err)
    )

    return NextResponse.json(
      { success: true, notification: data },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Notification API hatası:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

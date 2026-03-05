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
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
})

// Email gönderme helper
async function sendEmailNotification(
  userId: string,
  type: string,
  actorId: string,
  message: string,
  postType?: string,
  spotTitle?: string,
  spotLocation?: string,
  spotPrice?: string,
  spotNotes?: string
) {
  try {
    const supabase = getSupabaseClient()
    // Alıcı kullanıcı adı (profil tablosundan)
    const userProfileResult = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', userId)
      .single() as any
    const userProfile = userProfileResult.data

    // Alıcı email (auth.users üzerinden - service role gerekli)
    const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(userId)
    if (authUserError) {
      console.error('Auth user email alınamadı:', authUserError)
      return
    }

    const recipientEmail = authUserData?.user?.email
    if (!recipientEmail) return

    // Gönderen kullanıcı bilgisi
    const actorProfileResult = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', actorId)
      .single() as any
    const actorProfile = actorProfileResult.data

    const actorName = actorProfile?.full_name || 'Bir kullanıcı'
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
      spot_sighting: `
        <h2>${actorName} spotun için "Ben Gördüm" bildirimi gönderdi! 👀</h2>
        <p><strong>${spotTitle || 'Spot'}</strong></p>
        ${spotLocation ? `<p><strong>Nerede gördü:</strong> ${spotLocation}</p>` : ''}
        ${spotPrice ? `<p><strong>Fiyat:</strong> ₺${spotPrice}</p>` : ''}
        ${spotNotes ? `<p><strong>Ek Bilgi:</strong> ${spotNotes}</p>` : ''}
        <p style="margin-top: 15px; color: #666;">${message}</p>
        <a href="${appUrl}/notifications" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Detayları Gör
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
    if (transporter && process.env.GMAIL_USER) {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: recipientEmail,
        subject: `SpotItForMe: ${message}`,
        html: htmlBody,
        text: `${message}\n\nDetayları görmek için: ${appUrl}/notifications`
      })
      console.log(`✅ Email gönderildi: ${recipientEmail}`)
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
    const { userId, type, actorId, postId, message, postType, spotTitle, spotLocation, spotPrice, spotNotes } = body

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

    let { data, error } = await (supabase
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

    // Eski şemalar spot_sighting tipini kabul etmeyebilir; geriye uyumlu fallback
    if (error && type === 'spot_sighting') {
      const retry = await (supabase
        .from(tableName) as any)
        .insert({
          user_id: userId,
          type: 'spot_found',
          actor_id: actorId,
          post_id: postId,
          message: message || 'Yeni bildirim',
          read: false
        })
        .select()
        .single()

      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('Notification kayıt hatası:', error)
      return NextResponse.json(
        { error: 'Failed to create notification', details: error },
        { status: 500 }
      )
    }

    // Email gönder (arka planda - bekleme)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      sendEmailNotification(userId, type, actorId, message, postType, spotTitle, spotLocation, spotPrice, spotNotes).catch(err => 
        console.error('Email gönderim hatası:', err)
      )
    }

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

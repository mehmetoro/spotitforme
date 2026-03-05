// app/api/forgot-password/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email gerekli' }, { status: 400 })
    }

    // Supabase client'ı runtime'da initialize et
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Kullanıcının var olup olmadığını kontrol et
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .limit(1)

    if (userError || !users || users.length === 0) {
      // Güvenlik: Kullanıcı yoksa bile başarılı mesajı göster (email enumeration saldırısını engelle)
      return NextResponse.json({ success: true })
    }

    // Supabase admin API ile password reset link oluştur
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
      }
    })

    if (linkError) throw linkError

    const resetLink = linkData.properties?.action_link || ''

    // Email gönder
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    })

    const mailOptions = {
      from: `"SpotItForMe" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🔐 Şifre Sıfırlama - SpotItForMe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Şifre Sıfırlama</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                        Merhaba <strong>${users[0].full_name || 'Kullanıcı'}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                        SpotItForMe hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 30px 0;">
                            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                              Şifremi Sıfırla
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                          <strong>⚠️ Önemli:</strong> Bu link 24 saat geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili dikkate almayın.
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                        Buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayın:
                      </p>
                      <p style="margin: 10px 0 0 0; word-break: break-all;">
                        <a href="${resetLink}" style="color: #3b82f6; font-size: 12px;">${resetLink}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        <strong>SpotItForMe</strong> - Aradığın her şey, seni bekliyor!
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
    
  } catch (err: any) {
    console.error('Forgot password API error:', err)
    return NextResponse.json(
      { error: err.message || 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

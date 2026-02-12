// lib/email-server.ts
'use server'

import nodemailer from 'nodemailer'

// Email transporter oluştur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
})

// Server Action: Hoşgeldin emaili gönder
export async function sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; message: string }> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    await transporter.sendMail({
      from: `"SpotItForMe" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🎉 SpotItForMe Topluluğuna Hoş Geldin ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f7fa; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🤝 Hoş Geldiniz!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Merhaba <strong>${name}</strong>,</p>
            <p>SpotItForMe topluluğuna katıldığınız için çok mutluyuz! 🎉</p>
            
            <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>🚀 Hemen Başlayın:</strong></p>
              <div style="display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 15px;">
                <a href="${siteUrl}/create-spot" style="background: #8b5cf6; color: white; padding: 12px; text-align: center; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  İlk Spot'unu Oluştur
                </a>
                <a href="${siteUrl}/spots" style="background: #f1f5f9; color: #475569; padding: 12px; text-align: center; border-radius: 8px; text-decoration: none;">
                  Spot'ları Keşfet
                </a>
                <a href="${siteUrl}/how-it-works" style="background: #f1f5f9; color: #475569; padding: 12px; text-align: center; border-radius: 8px; text-decoration: none;">
                  Nasıl Çalışır?
                </a>
              </div>
            </div>

            <p><strong>✨ Platform Özellikleri:</strong></p>
            <ul style="padding-left: 20px;">
              <li>✅ Ücretsiz spot oluşturma</li>
              <li>✅ Binlerce aktif topluluk üyesi</li>
              <li>✅ Anlık yardım bildirimleri</li>
              <li>✅ Mobil uyumlu tasarım</li>
              <li>✅ Güvenli ve gizli</li>
            </ul>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              Sorularınız için: <a href="mailto:${process.env.GMAIL_USER}" style="color: #6b7280;">${process.env.GMAIL_USER}</a><br/>
              <a href="${siteUrl}" style="color: #6b7280;">${siteUrl}</a>
            </p>
          </div>
        </div>
      `,
      text: `SpotItForMe'ye Hoş Geldiniz!\n\nMerhaba ${name},\n\nSpotItForMe topluluğuna katıldığınız için teşekkür ederiz.\n\nHemen başlayın: ${siteUrl}/create-spot\n\nİyi kullanımlar!`
    })

    console.log('✅ Hoşgeldin emaili gönderildi:', to)
    return { success: true, message: 'Email gönderildi' }
  } catch (error) {
    console.error('❌ Hoşgeldin emaili gönderilemedi:', error)
    return { success: false, message: 'Email gönderilemedi' }
  }
}

// Server Action: Mağaza kayıt emaili gönder
export async function sendBusinessRegistrationEmail(to: string, shopName: string, ownerId: string): Promise<{ success: boolean; message: string }> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    await transporter.sendMail({
      from: `"SpotItForme İşletme" <${process.env.GMAIL_USER}>`,
      to,
      cc: process.env.ADMIN_EMAIL,
      subject: `🏪 Mağaza Kaydınız Alındı: ${shopName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f7fa; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏪 Mağaza Kaydınız Alındı!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Merhaba,</p>
            <p><strong>${shopName}</strong> mağazanız için kaydınız başarıyla alındı! 🎉</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p><strong>🎯 Sonraki Adımlar:</strong></p>
              <ol style="margin-left: 20px;">
                <li>Mağaza profilinizi tamamlayın</li>
                <li>İlk ürünlerinizi ekleyin</li>
                <li>Spot'lara cevap verin</li>
                <li>Premium paketlere geçerek limitlerinizi artırın</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/shop/dashboard" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 5px;">
                Mağaza Paneline Git
              </a>
              <a href="${siteUrl}/create-spot" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 5px;">
                İlk Spot'u Oluştur
              </a>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📊 Mağaza İstatistikleriniz:</strong></p>
              <p>✅ <strong>Paket:</strong> Ücretsiz Başlangıç</p>
              <p>✅ <strong>Resim Limiti:</strong> 20 adet ücretsiz</p>
              <p>✅ <strong>Spot Limiti:</strong> Sınırsız</p>
              <p>✅ <strong>Destek:</strong> Email ile 7/24</p>
            </div>

            <p><strong>📞 İletişim:</strong></p>
            <p>Herhangi bir sorunuz için: <a href="mailto:${process.env.GMAIL_USER}" style="color: #3b82f6;">${process.env.GMAIL_USER}</a></p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              SpotItForme İşletme Ekibi<br/>
              <a href="${siteUrl}" style="color: #6b7280;">${siteUrl}</a>
            </p>
          </div>
        </div>
      `,
      text: `Mağaza Kaydı\n\n${shopName} mağazanız için kaydınız alındı.\n\nMağaza Paneliniz: ${siteUrl}/shop/dashboard\n\nTeşekkür ederiz!`
    })

    console.log('✅ Mağaza kayıt emaili gönderildi:', to)
    return { success: true, message: 'Email gönderildi' }
  } catch (error) {
    console.error('❌ Mağaza kayıt emaili gönderilemedi:', error)
    return { success: false, message: 'Email gönderilemedi' }
  }
}
// Server Action: Şifre sıfırlama emaili gönder
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<{ success: boolean; message: string }> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    await transporter.sendMail({
      from: `"SpotItForMe Şifre Sıfırlama" <${process.env.GMAIL_USER}>`,
      to,
      subject: '🔐 SpotItForMe Şifre Sıfırlama İsteği',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f7fa; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Şifre Sıfırlama</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Merhaba,</p>
            <p>SpotItForMe hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p><strong>⚠️ Güvenlik Uyarısı:</strong></p>
              <p>Bu isteği siz yapmadıysanız, bu email'i görmezden gelebilirsiniz.</p>
              <p>Hesabınızla ilgili endişeleriniz varsa lütfen bizimle iletişime geçin.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Şifremi Sıfırla
              </a>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>🔒 Güvenlik İpuçları:</strong></p>
              <ul style="margin-left: 20px; color: #4b5563;">
                <li>Şifrenizi kimseyle paylaşmayın</li>
                <li>Link'e tıkladıktan sonra yeni bir şifre belirleyin</li>
                <li>Güçlü bir şifre kullanın (harf, rakam, özel karakter)</li>
                <li>Bu link 24 saat sonra geçersiz olacaktır</li>
              </ul>
            </div>

            <p><strong>📝 Link çalışmıyor mu?</strong></p>
            <p>Eğer buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px; font-size: 12px;">
              ${resetLink}
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              Bu email SpotItForMe platformundan otomatik olarak gönderilmiştir.<br/>
              <a href="${siteUrl}" style="color: #6b7280;">${siteUrl}</a> | 
              <a href="mailto:${process.env.GMAIL_USER}" style="color: #6b7280;">Yardım</a>
            </p>
          </div>
        </div>
      `,
      text: `SpotItForMe Şifre Sıfırlama\n\nŞifrenizi sıfırlamak için bu linke tıklayın: ${resetLink}\n\nBu link 24 saat geçerlidir.\n\nEğer bu isteği siz yapmadıysanız, bu email'i görmezden gelebilirsiniz.\n\nTeşekkür ederiz!`
    })

    console.log('✅ Şifre sıfırlama emaili gönderildi:', to)
    return { success: true, message: 'Şifre sıfırlama emaili gönderildi' }
  } catch (error) {
    console.error('❌ Şifre sıfırlama emaili gönderilemedi:', error)
    return { success: false, message: 'Şifre sıfırlama emaili gönderilemedi' }
  }
}
// Server Action: Spot oluşturma emaili
export async function sendSpotCreatedEmail(to: string, spotTitle: string, spotId: string): Promise<{ success: boolean; message: string }> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    await transporter.sendMail({
      from: `"SpotItForMe" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🎉 Spot Oluşturuldu: ${spotTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f7fa; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Spot'unuz Oluşturuldu!</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Merhaba,</p>
            <p><strong>"${spotTitle}"</strong> başlıklı spot'unuz başarıyla oluşturuldu.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p><strong>Spot Detayları:</strong></p>
              <p>📌 <strong>Başlık:</strong> ${spotTitle}</p>
              <p>🔗 <strong>Spot Linki:</strong> <a href="${siteUrl}/spots/${spotId}" style="color: #3b82f6;">${siteUrl}/spots/${spotId}</a></p>
              <p>⏰ <strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>

            <p>Spot'unuz şu anda topluluğumuzun yardımına sunuldu. Binlerce kullanıcı şehirlerinde gezerken sizin için göz kulak olacak.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/spots/${spotId}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Spot'u Görüntüle
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              Bu e-posta SpotItForMe platformundan otomatik olarak gönderilmiştir.<br/>
              <a href="${siteUrl}/unsubscribe" style="color: #6b7280;">Bildirimleri devre dışı bırak</a>
            </p>
          </div>
        </div>
      `,
      text: `SpotItForMe - Spot Oluşturuldu\n\n"${spotTitle}" başlıklı spot'unuz başarıyla oluşturuldu.\n\nSpot Linki: ${siteUrl}/spots/${spotId}\n\nTeşekkür ederiz!`
    })

    console.log('✅ Spot oluşturma emaili gönderildi:', to)
    return { success: true, message: 'Email gönderildi' }
  } catch (error) {
    console.error('❌ Email gönderilemedi:', error)
    return { success: false, message: 'Email gönderilemedi' }
  }
}

// Server Action: Yardım bildirimi emaili
export async function sendSightingNotificationEmail(
  to: string, 
  spotTitle: string, 
  spotterName: string,
  spotId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.vercel.app'
    
    await transporter.sendMail({
      from: `"SpotItForMe" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🎯 YENİ YARDIM: "${spotTitle}" için bildirim!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f7fa; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎯 YENİ YARDIM BİLDİRİMİ!</h1>
            <p style="color: white; opacity: 0.9; margin-top: 10px;">Birisi aradığınız ürünü gördü!</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Merhaba,</p>
            <p><strong>${spotterName}</strong> adlı kullanıcı, <strong>"${spotTitle}"</strong> spot'unuz için yardım bildirimi gönderdi! 🎉</p>
            
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p><strong>🎉 Müjdeli Haber!</strong></p>
              <p>Bir topluluk üyemiz aradığınız ürünü gördüğünü bildirdi.</p>
              <p>Hemen spot sayfasına giderek detayları görüntüleyin!</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/spots/${spotId}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Yardım Detaylarını Görüntüle
              </a>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📋 Sonraki Adımlar:</strong></p>
              <ol style="margin-left: 20px;">
                <li>Yardım detaylarını inceleyin</li>
                <li>Gerekirse spotter ile iletişime geçin</li>
                <li>Ürünü bulduysanız spot durumunu "Bulundu" olarak güncelleyin</li>
                <li>Yardım eden kullanıcıya teşekkür edin</li>
              </ol>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              Topluluğumuzun yardımıyla kayıp ürünlerinizi bulmanızı umuyoruz!<br/>
              <a href="${siteUrl}" style="color: #6b7280;">${siteUrl}</a>
            </p>
          </div>
        </div>
      `,
      text: `Yeni Yardım Bildirimi!\n\n${spotterName}, "${spotTitle}" spot'unuz için yardım bildirimi gönderdi.\n\nDetaylar için: ${siteUrl}/spots/${spotId}\n\nTeşekkür ederiz!`
    })

    console.log('✅ Yardım bildirimi emaili gönderildi:', to)
    return { success: true, message: 'Email gönderildi' }
  } catch (error) {
    console.error('❌ Yardım bildirimi emaili gönderilemedi:', error)
    return { success: false, message: 'Email gönderilemedi' }
  }
}
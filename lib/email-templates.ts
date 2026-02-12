// lib/email-templates.ts
export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export const emailTemplates: Record<string, (data: any) => EmailTemplate> = {
  // 1. KAYIT/KULLANICI EMAİLLERİ
  'welcome': (data) => ({
    subject: `🎉 SpotItForMe Topluluğuna Hoş Geldin ${data.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🤝 HOŞ GELDİNİZ!</h1>
          <p style="color: white; opacity: 0.9; margin-top: 10px; font-size: 16px;">
            SpotItForMe Topluluğuna Katıldığınız İçin Teşekkür Ederiz
          </p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Merhaba <strong style="color: #1f2937;">${data.name}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 20px;">
            SpotItForMe topluluğuna katıldığınız için çok mutluyuz! 🎉
            Artık binlerce göz sizin için arama yapacak.
          </p>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
            <p style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 15px;">
              🚀 Hemen Başlayın:
            </p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/create-spot" 
                 style="background: #667eea; color: white; padding: 14px 24px; text-align: center; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                 📝 İlk Spot'unu Oluştur
              </a>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/spots" 
                 style="background: white; color: #667eea; padding: 14px 24px; text-align: center; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #667eea;">
                 🔍 Spot'ları Keşfet
              </a>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
              <strong>İlk adım tavsiyemiz:</strong>
            </p>
            <ul style="font-size: 14px; color: #6b7280; padding-left: 20px; line-height: 1.6;">
              <li>Profil fotoğrafınızı ekleyin</li>
              <li>Aradığınız ilk ürünü spot olarak paylaşın</li>
              <li>Diğer kullanıcılara yardım ederek puan kazanın</li>
              <li>Topluluk kurallarını okuyun</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
            Sorularınız için: <a href="mailto:destek@spotitforme.com" style="color: #667eea;">destek@spotitforme.com</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #9ca3af;">
            SpotItForMe © ${new Date().getFullYear()} | 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" style="color: #9ca3af; text-decoration: underline;">Gizlilik Politikası</a>
          </p>
        </div>
      </div>
    `,
    text: `
      HOŞ GELDİNİZ!
      
      Merhaba ${data.name},
      
      SpotItForMe topluluğuna katıldığınız için çok mutluyuz! 🎉
      Artık binlerce göz sizin için arama yapacak.
      
      Hemen Başlayın:
      1. İlk spot'unuzu oluşturun: ${process.env.NEXT_PUBLIC_SITE_URL}/create-spot
      2. Diğer spot'ları keşfedin: ${process.env.NEXT_PUBLIC_SITE_URL}/spots
      
      İlk adım tavsiyelerimiz:
      - Profil fotoğrafınızı ekleyin
      - Aradığınız ilk ürünü spot olarak paylaşın
      - Diğer kullanıcılara yardım ederek puan kazanın
      - Topluluk kurallarını okuyun
      
      Sorularınız için: destek@spotitforme.com
      
      SpotItForMe © ${new Date().getFullYear()}
    `
  }),

  'verify-email': (data) => ({
    subject: '✅ SpotItForMe - Email Adresinizi Doğrulayın',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ EMAİL DOĞRULAMA</h1>
          <p style="color: white; opacity: 0.9; margin-top: 10px; font-size: 16px;">
            Hesabınızı aktive etmek için son adım
          </p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Merhaba <strong style="color: #1f2937;">${data.name}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 20px;">
            SpotItForMe hesabınızı oluşturduğunuz için teşekkür ederiz.
            Hesabınızı tamamen aktive etmek için email adresinizi doğrulamanız gerekiyor.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.verificationLink}" 
               style="background: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; display: inline-block;">
               📧 EMAİL'İMİ DOĞRULA
            </a>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
            <p style="font-size: 14px; color: #065f46; margin: 0;">
              <strong>Not:</strong> Bu link 24 saat geçerlidir. Eğer buton çalışmıyorsa, 
              aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:
            </p>
            <p style="font-size: 12px; color: #047857; background: #d1fae5; padding: 10px; border-radius: 4px; margin-top: 10px; word-break: break-all;">
              ${data.verificationLink}
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
            Bu işlemi siz yapmadıysanız, bu email'i görmezden gelebilirsiniz.
          </p>
        </div>
      </div>
    `
  }),

  'password-reset': (data) => ({
    subject: '🔐 SpotItForMe - Şifre Sıfırlama',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 ŞİFRE SIFIRLAMA</h1>
          <p style="color: white; opacity: 0.9; margin-top: 10px; font-size: 16px;">
            Hesabınızın şifresini yenileyin
          </p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın:
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.resetLink}" 
               style="background: #f59e0b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; display: inline-block;">
               🔑 ŞİFREMİ YENİLE
            </a>
          </div>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              <strong>Güvenlik Notu:</strong>
            </p>
            <ul style="font-size: 14px; color: #92400e; padding-left: 20px; line-height: 1.6; margin-top: 10px;">
              <li>Bu link 1 saat geçerlidir</li>
              <li>Bu talebi siz yapmadıysanız, bu email'i görmezden gelebilirsiniz</li>
              <li>Şifrenizi kimseyle paylaşmayın</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
            Link çalışmıyorsa: ${data.resetLink}
          </p>
        </div>
      </div>
    `
  }),

  // 2. SPOT İLE İLGİLİ EMAİLLER
  'spot-created': (data) => ({
    subject: `🎉 Spot Oluşturuldu: "${data.spotTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 SPOT OLUŞTURULDU!</h1>
          <p style="color: white; opacity: 0.9; margin-top: 10px; font-size: 16px;">
            Topluluğumuz sizin için aramaya başladı
          </p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Tebrikler! <strong>"${data.spotTitle}"</strong> başlıklı spot'unuz başarıyla oluşturuldu.
          </p>
          
          <div style="background: #faf5ff; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #8b5cf6;">
            <p style="font-size: 18px; font-weight: 600; color: #7c3aed; margin-bottom: 15px; text-align: center;">
              📋 Spot Detayları
            </p>
            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">Başlık:</span>
                <span style="font-weight: 600; color: #1f2937;">${data.spotTitle}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">Spot ID:</span>
                <span style="font-weight: 600; color: #1f2937;">${data.spotId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">Oluşturulma:</span>
                <span style="color: #1f2937;">${new Date().toLocaleDateString('tr-TR')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #6b7280;">Durum:</span>
                <span style="color: #10b981; font-weight: 600;">AKTİF</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/spots/${data.spotId}" 
               style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; display: inline-block;">
               👁️ SPOT'U GÖRÜNTÜLE
            </a>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 15px;">
              🕒 Bekleme Sürecinde:
            </p>
            <ul style="font-size: 14px; color: #4b5563; padding-left: 20px; line-height: 1.6;">
              <li>Spot'unuz binlerce kullanıcı tarafından görüntülenecek</li>
              <li>Ortalama ilk yardım 24 saat içinde gelir</li>
              <li>Spot detaylarınızı güncelleyebilirsiniz</li>
              <li>Daha fazla fotoğraf ekleyebilirsiniz</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/spots" 
               style="background: #f3f4f6; color: #374151; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; margin: 5px;">
               🔍 Diğer Spot'lar
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/create-spot" 
               style="background: #f3f4f6; color: #374151; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; margin: 5px;">
               📝 Yeni Spot Oluştur
            </a>
          </div>
        </div>
      </div>
    `
  }),

  'spot-sighting': (data) => ({
    subject: `🎯 "${data.spotTitle}" için YENİ YARDIM!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎯 YENİ YARDIM!</h1>
          <p style="color: white; opacity: 0.9; margin-top: 10px; font-size: 18px;">
            "${data.spotTitle}" spot'unuz için yardım geldi!
          </p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #d1fae5; color: #065f46; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px;">
              👁️
            </div>
            <h2 style="color: #1f2937; font-size: 24px; margin: 0;">
              Birisi Ürününüzü Gördü!
            </h2>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
            <strong>${data.spotterName}</strong> adlı topluluk üyemiz, 
            <strong>"${data.spotTitle}"</strong> spot'unuz için yardım bildirimi gönderdi.
          </p>
          
          ${data.spotterMessage ? `
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
              <p style="font-size: 14px; color: #065f46; font-weight: 600; margin-bottom: 10px;">
                📝 Spotter'ın Notu:
              </p>
              <p style="font-size: 16px; color: #065f46; font-style: italic; margin: 0;">
                "${data.spotterMessage}"
              </p>
            </div>
          ` : ''}
          
          ${data.price ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 16px; color: #92400e; margin: 0;">
                💰 <strong>Görülen Fiyat:</strong> ${data.price} TL
              </p>
            </div>
          ` : ''}
          
          ${data.location ? `
            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 16px; color: #0369a1; margin: 0;">
                📍 <strong>Konum:</strong> ${data.location}
              </p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/spots/${data.spotId}" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 18px 50px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 20px; display: inline-block;">
               👉 YARDIM DETAYLARINI GÖR
            </a>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 15px;">
              🎯 Sonraki Adımlar:
            </p>
            <ol style="font-size: 14px; color: #4b5563; padding-left: 20px; line-height: 1.6;">
              <li>Yardım detaylarını inceleyin</li>
              <li>Gerekirse spotter ile iletişime geçin</li>
              <li>Ürünü bulduysanız spot durumunu "BULUNDU" yapın</li>
              <li>Yardım eden kullanıcıya teşekkür puanı verin</li>
            </ol>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
            Bu yardım sayesinde ürününüzü bulmanızı umuyoruz! 🤝
          </p>
        </div>
      </div>
    `
  }),

  'spot-found': (data) => ({
    subject: `✅ "${data.spotTitle}" BAŞARIYLA BULUNDU!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">✅ BAŞARI HİKAYESİ!</h1>
          <p style="color: white; opacity: 0.9; margin-top: 10px; font-size: 18px;">
            "${data.spotTitle}" spot'unuz BULUNDU!
          </p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #fed7aa; color: #ea580c; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 48px;">
              🎉
            </div>
            <h2 style="color: #1f2937; font-size: 28px; margin: 0;">
              Tebrikler!
            </h2>
            <p style="color: #6b7280; font-size: 18px; margin-top: 10px;">
              Topluluğumuz sayesinde ürününüzü buldunuz
            </p>
          </div>
          
          <div style="background: #ffedd5; padding: 25px; border-radius: 12px; margin: 30px 0; border: 3px solid #f97316; text-align: center;">
            <p style="font-size: 20px; color: #ea580c; font-weight: 600; margin: 0;">
              "${data.spotTitle}"
            </p>
            <p style="font-size: 16px; color: #92400e; margin-top: 10px;">
              başlıklı spot'unuz başarıyla bulundu!
            </p>
          </div>
          
          ${data.foundBy ? `
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">
                Yardım Eden:
              </p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; display: inline-block;">
                <p style="font-size: 18px; color: #1f2937; font-weight: 600; margin: 0;">
                  👤 ${data.foundBy}
                </p>
              </div>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/spots/${data.spotId}" 
               style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 18px 50px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 20px; display: inline-block;">
               🏆 BAŞARI HİKAYESİNİ GÖR
            </a>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <p style="font-size: 18px; font-weight: 600; color: #1f2937; text-align: center; margin-bottom: 20px;">
              📊 İstatistikleriniz
            </p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #f97316;">${data.totalSpots || '1'}</div>
                <div style="font-size: 12px; color: #6b7280;">Toplam Spot</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #10b981;">${data.foundSpots || '1'}</div>
                <div style="font-size: 12px; color: #6b7280;">Bulunan Spot</div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Başka ürünler de arıyor musunuz?
            </p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/create-spot" 
               style="background: #f3f4f6; color: #374151; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
               🚀 YENİ SPOT OLUŞTUR
            </a>
          </div>
        </div>
      </div>
    `
  }),

  // 3. İŞLETME EMAİLLERİ
  'business-welcome': (data) => ({
    subject: `🏪 SpotItForMe İş Ortağınız! - ${data.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px; text-align: center; border-radius: 10px 10x 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏪 İŞ ORTAĞIMIZ OLDUĞUNUZ İÇİN TEŞEKKÜRLER!</h1>
          <p style="color: white; opacity: 0.9; margin-top: 10px; font-size: 16px;">
            ${data.businessName} - SpotItForMe İşletme Programı
          </p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Sayın <strong>${data.contactName}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 20px;">
            <strong>${data.businessName}</strong> işletmesini SpotItForMe işletme programına kaydettiğiniz için teşekkür ederiz!
            Artık binlerce potansiyel müşteriye ulaşabileceksiniz.
          </p>
          
          <div style="background: #eef2ff; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #6366f1;">
            <p style="font-size: 18px; font-weight: 600; color: #4f46e5; text-align: center; margin-bottom: 20px;">
              📋 İşletme Bilgileriniz
            </p>
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #c7d2fe;">
                <span style="color: #4b5563;">İşletme Adı:</span>
                <span style="font-weight: 600; color: #1f2937;">${data.businessName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #c7d2fe;">
                <span style="color: #4b5563;">Paket:</span>
                <span style="color: #10b981; font-weight: 600;">${data.plan} PAKET</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #c7d2fe;">
                <span style="color: #4b5563;">Resim Hakkı:</span>
                <span style="color: #1f2937;">${data.imageLimit}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #4b5563;">Başlangıç Tarihi:</span>
                <span style="color: #1f2937;">${new Date().toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
               style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; display: inline-block;">
               🚀 İŞLETME PANELİNE GİT
            </a>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 15px;">
              🎯 İlk Adımlar:
            </p>
            <ol style="font-size: 14px; color: #4b5563; padding-left: 20px; line-height: 1.6;">
              <li>İşletme profilinizi tamamlayın</li>
              <li>Stoklarınızdaki ürünleri spot olarak ekleyin</li>
              <li>Mağazanızı haritada görünür yapın</li>
              <li>Özel kampanyalar oluşturun</li>
              <li>Müşteri yorumlarını yönetin</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 14px; color: #6b7280;">
              İşletme destek ekibimiz: 
              <a href="mailto:business@spotitforme.com" style="color: #6366f1;">business@spotitforme.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // 4. SİSTEM EMAİLLERİ
  'admin-alert': (data) => ({
    subject: `🚨 ADMIN ALERT: ${data.title}`,
    html: `
      <div style="font-family: monospace; max-width: 800px; margin: 0 auto; padding: 20px; background: #0f172a; color: #e2e8f0;">
        <div style="background: #dc2626; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-family: monospace;">🚨 ADMIN ALERT</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #334155; border-top: none; border-radius: 0 0 8px 8px; background: #1e293b;">
          <div style="background: #475569; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600;">${data.title}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #cbd5e1;">${new Date().toISOString()}</p>
          </div>
          
          <div style="background: #334155; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; font-weight: 600;">📋 ALERT DETAILS:</p>
            <pre style="margin: 0; font-size: 14px; color: #94a3b8; white-space: pre-wrap;">${JSON.stringify(data.details, null, 2)}</pre>
          </div>
          
          <div style="background: #334155; padding: 15px; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: 600;">🔧 SYSTEM INFO:</p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px;">
              <div>
                <span style="color: #94a3b8;">Environment:</span>
                <span style="color: #fbbf24; margin-left: 10px;">${process.env.NODE_ENV}</span>
              </div>
              <div>
                <span style="color: #94a3b8;">Timestamp:</span>
                <span style="color: #fbbf24; margin-left: 10px;">${Date.now()}</span>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #475569;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
              This is an automated alert from SpotItForMe monitoring system.
            </p>
          </div>
        </div>
      </div>
    `
  })
}

// Helper function to generate text version
export function generateTextVersion(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim()
}
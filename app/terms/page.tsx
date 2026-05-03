// app/terms/page.tsx
'use client'
import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const termsContent = {
  tr: {
    title: 'SpotItForMe Kullanım Koşulları',
    sections: [
      { heading: '1. Kabul ve Değişiklikler', text: 'SpotItForMe platformunu ("Platform") kullanarak bu Kullanım Koşullarını kabul etmiş sayılırsınız. Platform sahibi, koşulları herhangi bir zamanda değiştirme hakkını saklı tutar. Değişiklikler Platform üzerinden duyurulacak olup, değişikliklerden sonra Platformu kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.' },
      { heading: '2. Hizmet Tanımı', text: 'SpotItForMe, kullanıcıların bulmakta zorlandığı ürünleri topluluk gücüyle bulmalarını sağlayan bir platformdur.', items: ['Spot oluşturma ve yayınlama', 'Spot\'lara yardım etme ("Ben gördüm" bildirimi)', 'Kullanıcı profili oluşturma', 'Mağaza profili oluşturma (işletmeler için)', 'Spot\'ları filtreleme ve arama'] },
      { heading: '3. Kullanıcı Yükümlülükleri', text: 'Platformu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:', items: ['Doğru, güncel ve eksiksiz bilgi sağlamak', 'Yasadışı, hakaret içeren veya spam içerik paylaşmamak', 'Başkalarının gizlilik haklarına saygı göstermek', 'Platformun güvenliğini tehlikeye atmamak', 'Telif hakkı ihlali yapmamak', 'Yanıltıcı veya aldatıcı bilgi paylaşmamak'] },
      { heading: '4. İçerik ve Fikri Mülkiyet', text: 'Platforma yüklediğiniz içeriklerin size ait olduğunu garanti edersiniz. SpotItForMe logosu, tasarımı ve yazılımı Platform sahibine aittir. İzinsiz kullanılamaz.' },
      { heading: '5. Mağaza Hesapları', text: 'İşletme sahipleri mağaza hesabı açabilir. Mağaza hesapları için ek kurallar:', items: ['Gerçek ve doğru işletme bilgileri sağlamak', 'Ticari faaliyetlere uygun içerik paylaşmak', 'Müşteri şikayetlerine zamanında cevap vermek', 'Fiyat ve stok bilgilerini güncel tutmak'] },
      { heading: '6. Ücretler ve Ödemeler', text: 'Şu anda Platform tüm kullanıcılar için ücretsizdir.' },
      { heading: '7. Sorumluluk Reddi', text: 'SpotItForMe, kullanıcılar arasındaki iletişimden, satış işlemlerinden veya anlaşmazlıklardan sorumlu değildir.' },
      { heading: '8. Hesap Askıya Alma', text: 'Aşağıdaki durumlarda hesabınız askıya alınabilir:', items: ['Koşulları ihlal ettiğiniz tespit edilirse', 'Yasadışı faaliyetlerde bulunursanız', 'Diğer kullanıcıları rahatsız ederseniz', 'Sistemi kötüye kullanırsanız'] },
      { heading: '9. Gizlilik', text: 'Kişisel verileriniz Gizlilik Politikamız uyarınca korunur.' },
      { heading: '10. İletişim', text: 'Sorularınız için: spotitformeweb@gmail.com' },
    ],
    updated: 'Son güncellenme',
    back: '← Geri Dön',
  },
  en: {
    title: 'SpotItForMe Terms of Use',
    sections: [
      { heading: '1. Acceptance & Changes', text: 'By using the SpotItForMe platform ("Platform"), you agree to these Terms. The Platform owner reserves the right to change terms at any time. Continued use after changes means acceptance.' },
      { heading: '2. Service Description', text: 'SpotItForMe is a community-powered platform that helps users find hard-to-find items.', items: ['Creating and publishing spots', 'Helping spots ("I Saw It" notification)', 'Creating user profiles', 'Creating shop profiles (for businesses)', 'Filtering and searching spots'] },
      { heading: '3. User Obligations', text: 'By using the Platform you agree to:', items: ['Provide accurate, current and complete information', 'Not share illegal, defamatory or spam content', 'Respect the privacy rights of others', 'Not compromise platform security', 'Not infringe copyrights', 'Not share misleading or deceptive information'] },
      { heading: '4. Content & Intellectual Property', text: 'You warrant that content you upload belongs to you. SpotItForMe logo, design and software belong to the Platform owner and cannot be used without permission.' },
      { heading: '5. Shop Accounts', text: 'Business owners can open shop accounts. Additional rules for shop accounts:', items: ['Provide accurate business information', 'Share content appropriate for commercial activities', 'Respond to customer complaints in a timely manner', 'Keep price and stock information up to date'] },
      { heading: '6. Fees & Payments', text: 'The Platform is currently free for all users.' },
      { heading: '7. Disclaimer', text: 'SpotItForMe is not responsible for communications, transactions or disputes between users.' },
      { heading: '8. Account Suspension', text: 'Your account may be suspended if:', items: ['You are found to have violated the terms', 'You engage in illegal activities', 'You harass other users', 'You abuse the system'] },
      { heading: '9. Privacy', text: 'Your personal data is protected in accordance with our Privacy Policy.' },
      { heading: '10. Contact', text: 'For questions: spotitformeweb@gmail.com' },
    ],
    updated: 'Last updated',
    back: '← Go Back',
  },
  de: {
    title: 'SpotItForMe Nutzungsbedingungen',
    sections: [
      { heading: '1. Annahme & Änderungen', text: 'Durch die Nutzung der Plattform stimmen Sie diesen Nutzungsbedingungen zu.' },
      { heading: '2. Leistungsbeschreibung', text: 'SpotItForMe hilft Nutzern, schwer zu findende Artikel zu entdecken.', items: ['Spots erstellen', 'Spots helfen', 'Benutzerprofile erstellen', 'Shop-Profile erstellen', 'Spots filtern'] },
      { heading: '3. Benutzerpflichten', text: 'Sie stimmen zu:', items: ['Korrekte Informationen angeben', 'Keine illegalen Inhalte teilen', 'Privatsphäre anderer respektieren', 'Plattformsicherheit nicht gefährden'] },
      { heading: '4. Inhalt & Geistiges Eigentum', text: 'Sie garantieren, dass hochgeladene Inhalte Ihnen gehören.' },
      { heading: '5. Shop-Konten', text: 'Geschäftsinhaber können Shop-Konten eröffnen.', items: ['Korrekte Geschäftsinformationen', 'Aktualisierte Preis- und Bestandsinformationen'] },
      { heading: '6. Gebühren', text: 'Die Plattform ist derzeit für alle kostenlos.' },
      { heading: '7. Haftungsausschluss', text: 'SpotItForMe haftet nicht für Kommunikation oder Transaktionen zwischen Nutzern.' },
      { heading: '8. Kontosperrung', text: 'Ihr Konto kann bei Verstößen gesperrt werden.' },
      { heading: '9. Datenschutz', text: 'Ihre Daten werden gemäß unserer Datenschutzrichtlinie geschützt.' },
      { heading: '10. Kontakt', text: 'Fragen an: spotitformeweb@gmail.com' },
    ],
    updated: 'Zuletzt aktualisiert',
    back: '← Zurück',
  },
  fr: {
    title: 'Conditions d\'utilisation de SpotItForMe',
    sections: [
      { heading: '1. Acceptation et modifications', text: 'En utilisant la plateforme SpotItForMe, vous acceptez ces conditions.' },
      { heading: '2. Description du service', text: 'SpotItForMe aide les utilisateurs à trouver des articles difficiles à trouver.', items: ['Créer et publier des spots', 'Aider les spots', 'Créer des profils', 'Créer des profils de boutique', 'Filtrer les spots'] },
      { heading: '3. Obligations de l\'utilisateur', text: 'Vous acceptez de :', items: ['Fournir des informations exactes', 'Ne pas partager de contenu illégal', 'Respecter la vie privée des autres', 'Ne pas compromettre la sécurité'] },
      { heading: '4. Contenu et propriété intellectuelle', text: 'Vous garantissez que le contenu téléchargé vous appartient.' },
      { heading: '5. Comptes boutique', text: 'Les propriétaires d\'entreprise peuvent ouvrir des comptes boutique.', items: ['Informations commerciales exactes', 'Informations de prix à jour'] },
      { heading: '6. Frais et paiements', text: 'La plateforme est actuellement gratuite pour tous.' },
      { heading: '7. Clause de non-responsabilité', text: 'SpotItForMe n\'est pas responsable des communications entre utilisateurs.' },
      { heading: '8. Suspension de compte', text: 'Votre compte peut être suspendu en cas de violation des conditions.' },
      { heading: '9. Confidentialité', text: 'Vos données sont protégées conformément à notre politique de confidentialité.' },
      { heading: '10. Contact', text: 'Pour questions : spotitformeweb@gmail.com' },
    ],
    updated: 'Dernière mise à jour',
    back: '← Retour',
  },
  es: {
    title: 'Términos de Uso de SpotItForMe',
    sections: [
      { heading: '1. Aceptación y cambios', text: 'Al usar la plataforma SpotItForMe aceptas estos términos.' },
      { heading: '2. Descripción del servicio', text: 'SpotItForMe ayuda a los usuarios a encontrar artículos difíciles de encontrar.', items: ['Crear y publicar spots', 'Ayudar spots', 'Crear perfiles', 'Crear perfiles de tienda', 'Filtrar spots'] },
      { heading: '3. Obligaciones del usuario', text: 'Aceptas:', items: ['Proporcionar información precisa', 'No compartir contenido ilegal', 'Respetar la privacidad de otros', 'No comprometer la seguridad'] },
      { heading: '4. Contenido y propiedad intelectual', text: 'Garantizas que el contenido subido te pertenece.' },
      { heading: '5. Cuentas de tienda', text: 'Los empresarios pueden abrir cuentas de tienda.', items: ['Información comercial precisa', 'Información de precios actualizada'] },
      { heading: '6. Tarifas y pagos', text: 'La plataforma es actualmente gratuita para todos.' },
      { heading: '7. Descargo de responsabilidad', text: 'SpotItForMe no es responsable de comunicaciones entre usuarios.' },
      { heading: '8. Suspensión de cuenta', text: 'Tu cuenta puede ser suspendida por violaciones.' },
      { heading: '9. Privacidad', text: 'Tus datos están protegidos según nuestra política de privacidad.' },
      { heading: '10. Contacto', text: 'Para preguntas: spotitformeweb@gmail.com' },
    ],
    updated: 'Última actualización',
    back: '← Volver',
  },
  ru: {
    title: 'Условия использования SpotItForMe',
    sections: [
      { heading: '1. Принятие и изменения', text: 'Используя платформу SpotItForMe, вы соглашаетесь с настоящими условиями.' },
      { heading: '2. Описание услуги', text: 'SpotItForMe помогает пользователям находить труднодоступные товары.', items: ['Создавать и публиковать споты', 'Помогать с сигналами', 'Создавать профили', 'Создавать профили магазинов', 'Фильтровать споты'] },
      { heading: '3. Обязанности пользователя', text: 'Вы соглашаетесь:', items: ['Предоставлять точную информацию', 'Не публиковать незаконный контент', 'Уважать конфиденциальность других', 'Не компрометировать безопасность'] },
      { heading: '4. Контент и интеллектуальная собственность', text: 'Вы гарантируете право на загружаемый контент.' },
      { heading: '5. Аккаунты магазинов', text: 'Владельцы бизнеса могут открывать аккаунты магазинов.', items: ['Точная деловая информация', 'Актуальные цены и наличие'] },
      { heading: '6. Плата', text: 'Платформа в настоящее время бесплатна для всех.' },
      { heading: '7. Отказ от ответственности', text: 'SpotItForMe не несёт ответственности за коммуникации между пользователями.' },
      { heading: '8. Блокировка аккаунта', text: 'Ваш аккаунт может быть заблокирован при нарушении условий.' },
      { heading: '9. Конфиденциальность', text: 'Ваши данные защищены согласно политике конфиденциальности.' },
      { heading: '10. Контакт', text: 'По вопросам: spotitformeweb@gmail.com' },
    ],
    updated: 'Последнее обновление',
    back: '← Назад',
  },
} as const

export default function TermsPage() {
  const locale = useCurrentLocale()
  const t = termsContent[locale as keyof typeof termsContent] ?? termsContent.tr
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-gray-600">{t.updated}: {new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="prose prose-lg max-w-none">
            {t.sections.map((section, i) => (
              <div key={i} className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.heading}</h2>
                <p className="text-gray-700 mb-4">{section.text}</p>
                {'items' in section && section.items && (
                  <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                    {section.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10 pt-6 border-t">
            <Link href="/for-business" className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-lg">
              {t.back}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
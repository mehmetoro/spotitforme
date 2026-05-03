
'use client'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const privacyPolicyText = {
  tr: { title: 'Gizlilik Politikası', intro: 'SpotItForMe olarak gizliliğinize önem veriyoruz. Kişisel verilerinizin korunması ve güvenliği için aşağıdaki ilkelere uyarız.', s1: '1. Toplanan Veriler', s1i: ['Ad, email, telefon (isteğe bağlı)', 'Kullanıcı tarafından yüklenen içerikler', 'IP adresi, cihaz ve kullanım bilgileri'], s2: '2. Veri Kullanımı', s2i: ['Hizmet sunmak ve geliştirmek', 'Kullanıcı güvenliğini sağlamak', 'Yasal yükümlülükleri yerine getirmek'], s3: '3. Veri Paylaşımı', s3i: ['Yasal zorunluluklar dışında üçüncü kişilerle paylaşılmaz', 'Hizmet sağlayıcılarla sadece gerekli ölçüde paylaşılır'], s4: '4. Güvenlik', s4i: ['Veriler şifreli ve güvenli sunucularda saklanır', 'Düzenli güvenlik kontrolleri yapılır'], s5: '5. Haklarınız', s5i: ['Verilerinize erişme, düzeltme ve silme hakkınız vardır'], s6: '6. Değişiklikler', s6t: 'Gizlilik politikası güncellenirse bu sayfadan duyurulur.' },
  en: { title: 'Privacy Policy', intro: 'At SpotItForMe we value your privacy. We follow these principles to protect your personal data.', s1: '1. Data Collected', s1i: ['Name, email, phone (optional)', 'Content uploaded by user', 'IP address, device and usage information'], s2: '2. Data Usage', s2i: ['Provide and improve services', 'Ensure user security', 'Fulfill legal obligations'], s3: '3. Data Sharing', s3i: ['Not shared with third parties except by legal obligation', 'Shared with service providers only as necessary'], s4: '4. Security', s4i: ['Data stored on encrypted, secure servers', 'Regular security checks performed'], s5: '5. Your Rights', s5i: ['You have the right to access, correct and delete your data'], s6: '6. Changes', s6t: 'If the privacy policy is updated, it will be announced on this page.' },
  de: { title: 'Datenschutzrichtlinie', intro: 'Bei SpotItForMe schätzen wir Ihre Privatsphäre. Wir befolgen diese Grundsätze zum Schutz Ihrer persönlichen Daten.', s1: '1. Gesammelte Daten', s1i: ['Name, E-Mail, Telefon (optional)', 'Vom Nutzer hochgeladene Inhalte', 'IP-Adresse, Gerät und Nutzungsdaten'], s2: '2. Datenverwendung', s2i: ['Dienste bereitstellen und verbessern', 'Benutzersicherheit gewährleisten', 'Rechtliche Verpflichtungen erfüllen'], s3: '3. Datenweitergabe', s3i: ['Keine Weitergabe an Dritte außer bei rechtlichen Anforderungen', 'Nur in notwendigem Umfang an Dienstleister'], s4: '4. Sicherheit', s4i: ['Daten auf verschlüsselten sicheren Servern gespeichert', 'Regelmäßige Sicherheitskontrollen'], s5: '5. Ihre Rechte', s5i: ['Sie haben das Recht auf Auskunft, Berichtigung und Löschung'], s6: '6. Änderungen', s6t: 'Änderungen der Datenschutzrichtlinie werden auf dieser Seite bekannt gegeben.' },
  fr: { title: 'Politique de confidentialité', intro: 'Chez SpotItForMe, nous valorisons votre vie privée.', s1: '1. Données collectées', s1i: ['Nom, e-mail, téléphone (optionnel)', 'Contenu téléchargé par l\'utilisateur', 'Adresse IP, appareil et informations d\'utilisation'], s2: '2. Utilisation des données', s2i: ['Fournir et améliorer les services', 'Assurer la sécurité des utilisateurs', 'Remplir les obligations légales'], s3: '3. Partage des données', s3i: ['Non partagé avec des tiers sauf obligation légale', 'Partagé avec les prestataires dans la mesure nécessaire'], s4: '4. Sécurité', s4i: ['Données stockées sur des serveurs sécurisés et chiffrés', 'Contrôles de sécurité réguliers'], s5: '5. Vos droits', s5i: ['Vous avez le droit d\'accéder, corriger et supprimer vos données'], s6: '6. Modifications', s6t: 'Les mises à jour de la politique seront annoncées sur cette page.' },
  es: { title: 'Política de privacidad', intro: 'En SpotItForMe valoramos tu privacidad.', s1: '1. Datos recopilados', s1i: ['Nombre, email, teléfono (opcional)', 'Contenido subido por el usuario', 'Dirección IP, dispositivo e información de uso'], s2: '2. Uso de datos', s2i: ['Proporcionar y mejorar servicios', 'Garantizar la seguridad del usuario', 'Cumplir con las obligaciones legales'], s3: '3. Compartir datos', s3i: ['No se comparte con terceros salvo obligación legal', 'Compartido con proveedores solo en la medida necesaria'], s4: '4. Seguridad', s4i: ['Datos almacenados en servidores seguros y cifrados', 'Controles de seguridad regulares'], s5: '5. Tus derechos', s5i: ['Tienes derecho a acceder, corregir y eliminar tus datos'], s6: '6. Cambios', s6t: 'Los cambios en la política de privacidad se anunciarán en esta página.' },
  ru: { title: 'Политика конфиденциальности', intro: 'В SpotItForMe мы ценим вашу конфиденциальность.', s1: '1. Собираемые данные', s1i: ['Имя, email, телефон (необязательно)', 'Контент, загруженный пользователем', 'IP-адрес, устройство и информация об использовании'], s2: '2. Использование данных', s2i: ['Предоставление и улучшение сервисов', 'Обеспечение безопасности пользователей', 'Выполнение правовых обязательств'], s3: '3. Передача данных', s3i: ['Не передаётся третьим лицам, кроме случаев, предусмотренных законом', 'Передаётся провайдерам только в необходимой мере'], s4: '4. Безопасность', s4i: ['Данные хранятся на зашифрованных защищённых серверах', 'Регулярные проверки безопасности'], s5: '5. Ваши права', s5i: ['Вы имеете право доступа, исправления и удаления своих данных'], s6: '6. Изменения', s6t: 'Обновления политики конфиденциальности будут объявлены на этой странице.' },
} as const

export default function PrivacyPolicyPage() {
  const locale = useCurrentLocale()
  const t = privacyPolicyText[locale as keyof typeof privacyPolicyText] ?? privacyPolicyText.tr
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-700 mb-6">{t.title}</h1>
          <p className="text-gray-700 mb-8 text-center">{t.intro}</p>
          <div className="space-y-6 text-gray-700">
            {([['s1','s1i'],['s2','s2i'],['s3','s3i'],['s4','s4i'],['s5','s5i']] as const).map(([h, items]) => (
              <div key={h}>
                <h2 className="text-xl font-bold mb-2">{(t as any)[h]}</h2>
                <ul className="list-disc pl-6">
                  {((t as any)[items] as string[]).map((item: string, j: number) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-xl font-bold mb-2">{t.s6}</h2>
              <p>{t.s6t}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

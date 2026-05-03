'use client'
import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const helpText = {
  tr: { hero: 'Yardım & SSS', heroDesc: 'SpotItForMe hakkında bilmeniz gereken her şey', howTitle: '📖 Nasıl Çalışır?', howDesc: 'SpotItForMe, aradığınız ürün veya şeyi bulmanız için geniş bir topluluğu kullanır:', howSteps: ['Spot Oluştur: Aradığınız şeyi detaylı açıklayın', 'Topluluğu Billendir: Binlerce kişi aradığınızı görecektir', 'Yardım Edin: Başkaları aradığında siz de yardımcı olun', 'Bulun! Ortalama 3-4 günde aradığınızı bulabilirsiniz'], createTitle: '🎯 Nasıl Spot Oluştururum?', createDesc: 'Spot oluşturmak çok kolay! Sadece şu adımları takip edin:', createSteps: ['Aradığınız şeyin adını yazın', 'Kategori seçin', 'Detaylı açıklama yapın (marka, model, renk, durum)', 'Eğer varsa fotoğraf ekleyin', 'Bulunabileceği lokasyonları belirtin', 'Spot oluştur!'], createTip: 'Ne kadar detay verirseniz, o kadar hızlı bulursunuz!', helpTitle: '🤝 Başkalarına Nasıl Yardım Ederim?', helpDesc: 'Başkalarının aradığı şeyleri bulun ve yardım edin:', helpSteps: ['Bilgi sahibi olduğunuz alanlarda yardımcı olabilirsiniz', 'Aydınlattığınız spotları göz atın', 'Bulduğunuz şeyler hakkında yorum yapın', 'Satıcı hakkında tavsiye verin'], secTitle: '🔒 Güvenlik & Gizlilik', secDesc: 'Sizin güvenliğiniz bizim önceliğimiz:', secPoints: ['Doğrulama: Tüm hesaplar doğrulanır', 'Kişisel Bilgiler: Asla üçüncü tarafa paylaşılmaz', 'Moderasyon: Uygunsuz içeriği hemen kaldırırız', 'Şifre: Güvenli şifreleme kullanırız'], faqTitle: '⭐ Sık Sorulan Sorular', faqs: [{ q: 'Her yaş için uygun mu?', a: 'SpotItForMe 13+ için tasarlanmıştır.' }, { q: 'Ücret alıyor musunuz?', a: 'Hayır! SpotItForMe tamamen ücretsizdir.' }, { q: 'Kaç kullanıcı var?', a: '50.000+ aktif kullanıcımız var.' }, { q: 'Satış yapabilir miyim?', a: 'SpotItForMe satış değil, bulma platformudur.' }, { q: 'Hesabımı nasıl silerim?', a: 'Ayarlar → Hesap → Hesabı Sil seçeneğini kullanabilirsiniz.' }], contactTitle: '📞 Bize Ulaşın', contactDesc: 'Sorunuz mu var? Bize yazabilirsiniz:', ctaDesc: 'Hazır başlamaya? Hemen bir spot oluştur!', createSpot: 'Spot Oluştur', helpOthers: 'Başkalarına Yardım Et' },
  en: { hero: 'Help & FAQ', heroDesc: 'Everything you need to know about SpotItForMe', howTitle: '📖 How Does It Work?', howDesc: 'SpotItForMe uses a large community to help you find what you\'re looking for:', howSteps: ['Create a Spot: Describe what you\'re looking for in detail', 'Notify the Community: Thousands will see what you\'re looking for', 'Help Others: Help others when they are searching', 'Find it! You can find what you\'re looking for in 3-4 days on average'], createTitle: '🎯 How Do I Create a Spot?', createDesc: 'Creating a spot is very easy! Just follow these steps:', createSteps: ['Write the name of what you\'re looking for', 'Select a category', 'Give a detailed description (brand, model, color, condition)', 'Add photos if available', 'Specify locations where it might be found', 'Create the spot!'], createTip: 'The more details you provide, the faster you\'ll find it!', helpTitle: '🤝 How Do I Help Others?', helpDesc: 'Find what others are looking for and help them:', helpSteps: ['Help in areas you\'re knowledgeable about', 'Browse spots you\'ve lit up', 'Comment on things you\'ve found', 'Give recommendations about sellers'], secTitle: '🔒 Security & Privacy', secDesc: 'Your security is our priority:', secPoints: ['Verification: All accounts are verified', 'Personal Information: Never shared with third parties', 'Moderation: We remove inappropriate content immediately', 'Password: We use secure encryption'], faqTitle: '⭐ Frequently Asked Questions', faqs: [{ q: 'Is it suitable for all ages?', a: 'SpotItForMe is designed for 13+.' }, { q: 'Is it free?', a: 'Yes! SpotItForMe is completely free.' }, { q: 'How many users are there?', a: 'We have 50,000+ active users.' }, { q: 'Can I sell things?', a: 'SpotItForMe is a finding platform, not a selling platform.' }, { q: 'How do I delete my account?', a: 'Go to Settings → Account → Delete Account.' }], contactTitle: '📞 Contact Us', contactDesc: 'Have a question? Write to us:', ctaDesc: 'Ready to start? Create a spot now!', createSpot: 'Create Spot', helpOthers: 'Help Others' },
  de: { hero: 'Hilfe & FAQ', heroDesc: 'Alles, was Sie über SpotItForMe wissen müssen', howTitle: '📖 Wie funktioniert es?', howDesc: 'SpotItForMe nutzt eine große Community:', howSteps: ['Spot erstellen: Beschreiben Sie, was Sie suchen', 'Community benachrichtigen: Tausende werden es sehen', 'Helfen Sie: Helfen Sie anderen beim Suchen', 'Finden! Durchschnittlich in 3-4 Tagen'], createTitle: '🎯 Wie erstelle ich einen Spot?', createDesc: 'Einen Spot zu erstellen ist ganz einfach:', createSteps: ['Namen eingeben', 'Kategorie auswählen', 'Detaillierte Beschreibung geben', 'Fotos hinzufügen', 'Mögliche Standorte angeben', 'Spot erstellen!'], createTip: 'Je mehr Details, desto schneller finden Sie es!', helpTitle: '🤝 Wie helfe ich anderen?', helpDesc: 'Finden Sie, was andere suchen:', helpSteps: ['In Ihren Fachgebieten helfen', 'Spots durchsuchen', 'Kommentare hinterlassen', 'Empfehlungen geben'], secTitle: '🔒 Sicherheit & Datenschutz', secDesc: 'Ihre Sicherheit hat Priorität:', secPoints: ['Verifizierung: Alle Konten werden verifiziert', 'Persönliche Daten: Niemals an Dritte weitergegeben', 'Moderation: Unangemessene Inhalte werden sofort entfernt', 'Passwort: Wir verwenden sichere Verschlüsselung'], faqTitle: '⭐ Häufig gestellte Fragen', faqs: [{ q: 'Für jedes Alter geeignet?', a: 'SpotItForMe ist für 13+ konzipiert.' }, { q: 'Ist es kostenlos?', a: 'Ja! SpotItForMe ist völlig kostenlos.' }, { q: 'Wie viele Nutzer gibt es?', a: '50.000+ aktive Nutzer.' }, { q: 'Kann ich verkaufen?', a: 'SpotItForMe ist eine Find-Plattform, keine Verkaufsplattform.' }, { q: 'Wie lösche ich mein Konto?', a: 'Einstellungen → Konto → Konto löschen.' }], contactTitle: '📞 Kontaktieren Sie uns', contactDesc: 'Haben Sie eine Frage? Schreiben Sie uns:', ctaDesc: 'Bereit anzufangen? Erstellen Sie jetzt einen Spot!', createSpot: 'Spot erstellen', helpOthers: 'Anderen helfen' },
  fr: { hero: 'Aide & FAQ', heroDesc: 'Tout ce que vous devez savoir sur SpotItForMe', howTitle: '📖 Comment ça marche ?', howDesc: 'SpotItForMe utilise une grande communauté :', howSteps: ['Créer un Spot: Décrivez ce que vous cherchez', 'Notifier la communauté: Des milliers verront votre recherche', 'Aider: Aidez les autres dans leurs recherches', 'Trouver ! En moyenne 3-4 jours'], createTitle: '🎯 Comment créer un Spot ?', createDesc: 'Créer un spot est très facile :', createSteps: ['Écrivez le nom de ce que vous cherchez', 'Sélectionnez une catégorie', 'Donnez une description détaillée', 'Ajoutez des photos', 'Précisez les lieux possibles', 'Créez le spot !'], createTip: 'Plus vous donnez de détails, plus vite vous trouverez !', helpTitle: '🤝 Comment aider les autres ?', helpDesc: 'Trouvez ce que les autres cherchent :', helpSteps: ['Aidez dans vos domaines d\'expertise', 'Parcourez les spots', 'Commentez vos trouvailles', 'Donnez des recommandations'], secTitle: '🔒 Sécurité & Confidentialité', secDesc: 'Votre sécurité est notre priorité :', secPoints: ['Vérification: Tous les comptes sont vérifiés', 'Données personnelles: Jamais partagées', 'Modération: Contenu inapproprié supprimé immédiatement', 'Mot de passe: Chiffrement sécurisé'], faqTitle: '⭐ Questions fréquentes', faqs: [{ q: 'Convient à tous les âges ?', a: 'SpotItForMe est conçu pour 13+.' }, { q: 'Est-ce gratuit ?', a: 'Oui ! SpotItForMe est entièrement gratuit.' }, { q: 'Combien d\'utilisateurs ?', a: '50 000+ utilisateurs actifs.' }, { q: 'Puis-je vendre ?', a: 'SpotItForMe est une plateforme de recherche, pas de vente.' }, { q: 'Comment supprimer mon compte ?', a: 'Paramètres → Compte → Supprimer le compte.' }], contactTitle: '📞 Contactez-nous', contactDesc: 'Vous avez une question ? Écrivez-nous :', ctaDesc: 'Prêt à commencer ? Créez un spot maintenant !', createSpot: 'Créer un Spot', helpOthers: 'Aider les autres' },
  es: { hero: 'Ayuda y FAQ', heroDesc: 'Todo lo que necesitas saber sobre SpotItForMe', howTitle: '📖 ¿Cómo funciona?', howDesc: 'SpotItForMe utiliza una gran comunidad:', howSteps: ['Crear un Spot: Describe lo que buscas', 'Notificar a la comunidad: Miles lo verán', 'Ayudar: Ayuda a otros cuando buscan', '¡Encontrar! En promedio 3-4 días'], createTitle: '🎯 ¿Cómo creo un Spot?', createDesc: '¡Crear un spot es muy fácil!:', createSteps: ['Escribe el nombre de lo que buscas', 'Selecciona una categoría', 'Da una descripción detallada', 'Añade fotos', 'Especifica posibles ubicaciones', '¡Crea el spot!'], createTip: '¡Cuantos más detalles des, más rápido lo encontrarás!', helpTitle: '🤝 ¿Cómo ayudo a otros?', helpDesc: 'Encuentra lo que otros buscan:', helpSteps: ['Ayuda en tus áreas de conocimiento', 'Navega por los spots', 'Comenta tus hallazgos', 'Da recomendaciones'], secTitle: '🔒 Seguridad y Privacidad', secDesc: 'Tu seguridad es nuestra prioridad:', secPoints: ['Verificación: Todas las cuentas son verificadas', 'Datos personales: Nunca compartidos', 'Moderación: Contenido inapropiado eliminado inmediatamente', 'Contraseña: Usamos cifrado seguro'], faqTitle: '⭐ Preguntas frecuentes', faqs: [{ q: '¿Es apto para todas las edades?', a: 'SpotItForMe está diseñado para 13+.' }, { q: '¿Es gratuito?', a: '¡Sí! SpotItForMe es completamente gratis.' }, { q: '¿Cuántos usuarios hay?', a: '50.000+ usuarios activos.' }, { q: '¿Puedo vender?', a: 'SpotItForMe es una plataforma de búsqueda, no de ventas.' }, { q: '¿Cómo elimino mi cuenta?', a: 'Configuración → Cuenta → Eliminar cuenta.' }], contactTitle: '📞 Contáctanos', contactDesc: '¿Tienes una pregunta? Escríbenos:', ctaDesc: '¿Listo para empezar? ¡Crea un spot ahora!', createSpot: 'Crear Spot', helpOthers: 'Ayudar a otros' },
  ru: { hero: 'Помощь и FAQ', heroDesc: 'Всё, что вам нужно знать о SpotItForMe', howTitle: '📖 Как это работает?', howDesc: 'SpotItForMe использует большое сообщество:', howSteps: ['Создать Спот: Опишите, что вы ищете', 'Уведомить сообщество: Тысячи увидят ваш запрос', 'Помогать: Помогайте другим в поиске', 'Найти! В среднем за 3-4 дня'], createTitle: '🎯 Как создать Спот?', createDesc: 'Создать спот очень просто:', createSteps: ['Напишите название того, что ищете', 'Выберите категорию', 'Дайте подробное описание', 'Добавьте фото', 'Укажите возможные места', 'Создайте спот!'], createTip: 'Чем больше деталей — тем быстрее найдёте!', helpTitle: '🤝 Как помочь другим?', helpDesc: 'Найдите то, что ищут другие:', helpSteps: ['Помогайте в своих областях знаний', 'Просматривайте споты', 'Оставляйте комментарии', 'Давайте рекомендации'], secTitle: '🔒 Безопасность и конфиденциальность', secDesc: 'Ваша безопасность — наш приоритет:', secPoints: ['Верификация: Все аккаунты верифицированы', 'Личные данные: Никогда не передаются третьим лицам', 'Модерация: Неуместный контент удаляется немедленно', 'Пароль: Мы используем надёжное шифрование'], faqTitle: '⭐ Часто задаваемые вопросы', faqs: [{ q: 'Подходит для всех возрастов?', a: 'SpotItForMe предназначен для 13+.' }, { q: 'Это бесплатно?', a: 'Да! SpotItForMe полностью бесплатен.' }, { q: 'Сколько пользователей?', a: '50 000+ активных пользователей.' }, { q: 'Могу ли я продавать?', a: 'SpotItForMe — платформа поиска, а не продаж.' }, { q: 'Как удалить аккаунт?', a: 'Настройки → Аккаунт → Удалить аккаунт.' }], contactTitle: '📞 Свяжитесь с нами', contactDesc: 'Есть вопрос? Напишите нам:', ctaDesc: 'Готовы начать? Создайте спот прямо сейчас!', createSpot: 'Создать Спот', helpOthers: 'Помочь другим' },
} as const

export default function HelpPage() {
  const locale = useCurrentLocale()
  const t = helpText[locale as keyof typeof helpText] ?? helpText.tr
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-3xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">❓</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">{t.hero}</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">{t.heroDesc}</p>
        </div>

        <div className="space-y-4 sm:space-y-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-l-4 border-blue-500">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t.howTitle}</h2>
            <p className="text-gray-700 text-sm sm:text-base mb-2">{t.howDesc}</p>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 text-gray-700 text-sm sm:text-base">
              {t.howSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-l-4 border-green-500">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t.createTitle}</h2>
            <p className="text-gray-700 text-sm sm:text-base mb-2">{t.createDesc}</p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 text-gray-700 text-sm sm:text-base">
              {t.createSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <p className="mt-3 sm:mt-4 text-blue-600 font-semibold text-sm sm:text-base">{t.createTip}</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-l-4 border-purple-500">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t.helpTitle}</h2>
            <p className="text-gray-700 text-sm sm:text-base mb-2">{t.helpDesc}</p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 text-gray-700 text-sm sm:text-base">
              {t.helpSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-l-4 border-red-500">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t.secTitle}</h2>
            <p className="text-gray-700 text-sm sm:text-base mb-2">{t.secDesc}</p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 text-gray-700 text-sm sm:text-base">
              {t.secPoints.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-l-4 border-yellow-500">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t.faqTitle}</h2>
            <div className="space-y-4 sm:space-y-6">
              {t.faqs.map((faq, i) => (
                <div key={i}>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{faq.q}</h3>
                  <p className="text-gray-700 text-sm sm:text-base">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 border-2 border-blue-300">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t.contactTitle}</h2>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">{t.contactDesc}</p>
            <ul className="space-y-2 text-sm sm:text-base">
              <li><strong>Email:</strong> <a href="mailto:help@spotitforme.com" className="text-blue-600 hover:underline"> help@spotitforme.com</a></li>
              <li><strong>Instagram:</strong> <a href="https://instagram.com/spotitforme" className="text-blue-600 hover:underline">@spotitforme</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg">{t.ctaDesc}</p>
          <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
            <Link href="/create-spot" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base">{t.createSpot}</Link>
            <Link href="/spots" className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base">{t.helpOthers}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}


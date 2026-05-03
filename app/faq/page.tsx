
'use client'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const faqData = {
  tr: {
    title: 'Sıkça Sorulan Sorular',
    items: [
      { q: 'SpotItForMe nedir?', a: 'SpotItForMe, topluluk gücüyle aradığınız ürün, kişi veya nesneyi bulmanızı sağlayan bir platformdur.' },
      { q: 'Spot nasıl oluşturulur?', a: 'Ana sayfadaki "Spot Oluştur" butonuna tıklayarak, aradığınız şeyi detaylıca açıklayarak spot oluşturabilirsiniz.' },
      { q: 'Yardım nasıl yapılır?', a: 'Bir spotu gördüyseniz veya bilgi sahibiyseniz, ilgili spotun sayfasında "Yardım Et" butonunu kullanarak yardımda bulunabilirsiniz.' },
      { q: 'Mağaza nasıl açılır?', a: '"İşletme Kaydı" sayfasını ziyaret edin ve formu doldurun.' },
      { q: 'Premium paketler ücretli mi?', a: 'Şu anda tüm mağazalar ücretsizdir. Premium paketler çok yakında aktif olacak ve yıllık 10 USD olacak.' },
      { q: 'Hesabımı nasıl silebilirim?', a: 'Ayarlar sayfasından hesabınızı kalıcı olarak silebilirsiniz. Tüm verileriniz silinir.' },
      { q: 'Gizlilik ve güvenlik nasıl sağlanıyor?', a: 'Tüm verileriniz gizli tutulur ve asla üçüncü kişilerle paylaşılmaz. Güvenliğiniz için gelişmiş şifreleme ve moderasyon uygulanır.' },
    ],
  },
  en: {
    title: 'Frequently Asked Questions',
    items: [
      { q: 'What is SpotItForMe?', a: 'SpotItForMe is a community-powered platform that helps you find the product, person, or item you are looking for.' },
      { q: 'How do I create a Spot?', a: 'Click the "Create Spot" button on the homepage and describe what you are looking for in detail.' },
      { q: 'How do I help someone?', a: 'If you have seen or know about a spot, use the "Help" button on the relevant spot\'s page to offer assistance.' },
      { q: 'How do I open a store?', a: 'Visit the "Business Registration" page and fill out the form to open a store for your business.' },
      { q: 'Are premium packages paid?', a: 'All stores are currently free. Premium packages will be activated very soon at $10 USD per year.' },
      { q: 'How do I delete my account?', a: 'You can permanently delete your account from the Settings page. All your data will be deleted.' },
      { q: 'How is privacy and security ensured?', a: 'All your data is kept private and never shared with third parties. Advanced encryption and moderation are applied for your security.' },
    ],
  },
  de: {
    title: 'Häufig Gestellte Fragen',
    items: [
      { q: 'Was ist SpotItForMe?', a: 'SpotItForMe ist eine Community-Plattform, die Ihnen hilft, das gesuchte Produkt, die Person oder den Artikel zu finden.' },
      { q: 'Wie erstelle ich einen Spot?', a: 'Klicken Sie auf "Spot erstellen" und beschreiben Sie detailliert, was Sie suchen.' },
      { q: 'Wie kann ich helfen?', a: 'Wenn Sie einen Spot kennen, nutzen Sie die "Helfen"-Schaltfläche auf der entsprechenden Seite.' },
      { q: 'Wie öffne ich einen Shop?', a: 'Besuchen Sie die Seite "Geschäftsanmeldung" und füllen Sie das Formular aus.' },
      { q: 'Sind Premium-Pakete kostenpflichtig?', a: 'Alle Shops sind derzeit kostenlos. Premium-Pakete werden bald für 10 USD pro Jahr aktiviert.' },
      { q: 'Wie lösche ich mein Konto?', a: 'Sie können Ihr Konto dauerhaft auf der Einstellungsseite löschen. Alle Ihre Daten werden gelöscht.' },
      { q: 'Wie wird Datenschutz gewährleistet?', a: 'Alle Ihre Daten werden vertraulich behandelt und niemals an Dritte weitergegeben.' },
    ],
  },
  fr: {
    title: 'Foire Aux Questions',
    items: [
      { q: 'Qu\'est-ce que SpotItForMe ?', a: 'SpotItForMe est une plateforme communautaire qui vous aide à trouver le produit, la personne ou l\'objet que vous cherchez.' },
      { q: 'Comment créer un Spot ?', a: 'Cliquez sur "Créer un Spot" et décrivez en détail ce que vous recherchez.' },
      { q: 'Comment aider quelqu\'un ?', a: 'Si vous connaissez un spot, utilisez le bouton "Aider" sur la page du spot concerné.' },
      { q: 'Comment ouvrir une boutique ?', a: 'Visitez la page "Inscription Entreprise" et remplissez le formulaire.' },
      { q: 'Les forfaits premium sont-ils payants ?', a: 'Toutes les boutiques sont actuellement gratuites. Les forfaits premium seront bientôt disponibles à 10 USD par an.' },
      { q: 'Comment supprimer mon compte ?', a: 'Vous pouvez supprimer définitivement votre compte depuis la page Paramètres. Toutes vos données seront supprimées.' },
      { q: 'Comment la confidentialité est-elle assurée ?', a: 'Toutes vos données sont confidentielles et ne sont jamais partagées avec des tiers.' },
    ],
  },
  es: {
    title: 'Preguntas Frecuentes',
    items: [
      { q: '¿Qué es SpotItForMe?', a: 'SpotItForMe es una plataforma comunitaria que te ayuda a encontrar el producto, persona u objeto que estás buscando.' },
      { q: '¿Cómo creo un Spot?', a: 'Haz clic en "Crear Spot" y describe detalladamente lo que buscas.' },
      { q: '¿Cómo ayudo a alguien?', a: 'Si conoces un spot, usa el botón "Ayudar" en la página del spot correspondiente.' },
      { q: '¿Cómo abro una tienda?', a: 'Visita la página "Registro de Empresa" y completa el formulario.' },
      { q: '¿Los paquetes premium son de pago?', a: 'Todas las tiendas son actualmente gratuitas. Los paquetes premium se activarán pronto a $10 USD por año.' },
      { q: '¿Cómo elimino mi cuenta?', a: 'Puedes eliminar permanentemente tu cuenta desde la página de Configuración. Todos tus datos serán eliminados.' },
      { q: '¿Cómo se garantiza la privacidad?', a: 'Todos tus datos son privados y nunca se comparten con terceros.' },
    ],
  },
  ru: {
    title: 'Часто Задаваемые Вопросы',
    items: [
      { q: 'Что такое SpotItForMe?', a: 'SpotItForMe — это платформа на основе сообщества, которая помогает вам найти нужный товар, человека или предмет.' },
      { q: 'Как создать Спот?', a: 'Нажмите кнопку "Создать Спот" и подробно опишите, что вы ищете.' },
      { q: 'Как помочь кому-то?', a: 'Если вы знаете о споте, используйте кнопку "Помочь" на странице соответствующего спота.' },
      { q: 'Как открыть магазин?', a: 'Посетите страницу "Регистрация бизнеса" и заполните форму.' },
      { q: 'Платные ли премиум-пакеты?', a: 'Все магазины в настоящее время бесплатны. Премиум-пакеты скоро будут активированы по цене $10 USD в год.' },
      { q: 'Как удалить мой аккаунт?', a: 'Вы можете окончательно удалить свой аккаунт на странице Настроек. Все ваши данные будут удалены.' },
      { q: 'Как обеспечивается конфиденциальность?', a: 'Все ваши данные конфиденциальны и никогда не передаются третьим лицам.' },
    ],
  },
} as const
type FAQLocale = keyof typeof faqData

export default function FAQPage() {
  const locale = useCurrentLocale()
  const t = faqData[(locale as FAQLocale) in faqData ? (locale as FAQLocale) : 'tr']

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-yellow-700 mb-6">{t.title}</h1>
          <div className="space-y-8">
            {t.items.map((item, i) => (
              <div key={i}>
                <h2 className="text-xl font-bold text-yellow-800 mb-2">{item.q}</h2>
                <p className="text-gray-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

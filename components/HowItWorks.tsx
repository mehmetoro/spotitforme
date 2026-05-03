'use client'

import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const howItWorksText = {
  tr: {
    badge: '🚀 4 ADIMDA ÇÖZÜM',
    title: 'SpotItForMe Nasıl Çalışır?',
    subtitle: 'Kayıp ürünlerinizi bulmak artık çok kolay. 4 basit adımda binlerce göz sizin için arasın.',
    steps: [
      { number: '01', title: 'Spot Oluştur', description: 'Aradığınız ürünün fotoğrafını ekleyin, detayları yazın', icon: '📝', features: ['Ücretsiz', '2 dakika', 'Resim yükle'], footer: 'ÜCRETSİZ başlayın' },
      { number: '02', title: 'Topluluk Görsün', description: 'Binlerce kullanıcı şehirlerinde gezerken göz kulak olur', icon: '👁️', features: ['Anlık bildirim', 'Konum bazlı', 'Uzman topluluk'], footer: '24/7 aktif topluluk' },
      { number: '03', title: 'Bildirim Al', description: 'Biri ürünü görünce anında fotoğraf ve konum bilgisi gelir', icon: '🔔', features: ['Gerçek zamanlı', 'Fotoğraflı', 'Detaylı bilgi'], footer: 'Anında bildirim' },
      { number: '04', title: 'Bul ve Mutlu Ol', description: 'Ürünü bulun, alın ve başarı hikayenizi paylaşın!', icon: '🎯', features: ['%94 başarı', 'Teşekkür puanı', 'Topluluk rozeti'], footer: 'Garantili memnuniyet' },
    ],
    videoTitle: '🎥 90 Saniyede SpotItForMe',
    videoDesc: 'Nasıl çalıştığımızı 90 saniyede öğrenin. Binlerce kullanıcının kayıp ürünlerini nasıl bulduğunu görün ve siz de hemen başlayın.',
    videoBtn: '▶️ Tanıtım Filmini İzle',
    storiesBtn: 'Başarı Hikayeleri',
    mobileTitle: 'Mobil Uygulama',
    mobileDesc: 'Yoldayken bile spot oluşturun',
  },
  en: {
    badge: '🚀 4-STEP SOLUTION',
    title: 'How Does SpotItForMe Work?',
    subtitle: 'Finding lost items is now very easy. Let thousands of eyes search for you in 4 simple steps.',
    steps: [
      { number: '01', title: 'Create a Spot', description: 'Add a photo of the item you need and write the details', icon: '📝', features: ['Free', '2 minutes', 'Upload image'], footer: 'Start for FREE' },
      { number: '02', title: 'Community Watches', description: 'Thousands of users keep an eye out while going around their city', icon: '👁️', features: ['Instant notification', 'Location-based', 'Expert community'], footer: '24/7 active community' },
      { number: '03', title: 'Get Notified', description: 'When someone spots it, you instantly receive a photo and location', icon: '🔔', features: ['Real-time', 'Photo included', 'Detailed info'], footer: 'Instant notification' },
      { number: '04', title: 'Find and Be Happy', description: 'Find the item, pick it up and share your success story!', icon: '🎯', features: ['94% success rate', 'Thank-you points', 'Community badge'], footer: 'Guaranteed satisfaction' },
    ],
    videoTitle: '🎥 SpotItForMe in 90 Seconds',
    videoDesc: 'Learn how we work in 90 seconds. See how thousands of users find their lost items and get started right away.',
    videoBtn: '▶️ Watch Intro Video',
    storiesBtn: 'Success Stories',
    mobileTitle: 'Mobile App',
    mobileDesc: 'Create spots even on the go',
  },
  de: {
    badge: '🚀 4-SCHRITT-LÖSUNG',
    title: 'Wie funktioniert SpotItForMe?',
    subtitle: 'Verlorene Artikel zu finden ist jetzt ganz einfach. Lass tausende Augen in 4 einfachen Schritten für dich suchen.',
    steps: [
      { number: '01', title: 'Spot erstellen', description: 'Foto des gesuchten Artikels hochladen und Details eingeben', icon: '📝', features: ['Kostenlos', '2 Minuten', 'Bild hochladen'], footer: 'KOSTENLOS starten' },
      { number: '02', title: 'Community beobachtet', description: 'Tausende Nutzer halten Ausschau in ihrer Stadt', icon: '👁️', features: ['Sofortige Benachrichtigung', 'Standortbasiert', 'Expertencommunity'], footer: '24/7 aktive Community' },
      { number: '03', title: 'Benachrichtigung erhalten', description: 'Wenn jemand es sieht, erhältst du sofort Foto und Standort', icon: '🔔', features: ['Echtzeit', 'Mit Foto', 'Detaillierte Info'], footer: 'Sofortige Benachrichtigung' },
      { number: '04', title: 'Finden und freuen', description: 'Artikel finden, abholen und Erfolgsgeschichte teilen!', icon: '🎯', features: ['94% Erfolgsrate', 'Dankespunkte', 'Community-Badge'], footer: 'Garantierte Zufriedenheit' },
    ],
    videoTitle: '🎥 SpotItForMe in 90 Sekunden',
    videoDesc: 'Lerne in 90 Sekunden, wie wir funktionieren. Sieh wie tausende Nutzer ihre vermissten Artikel finden.',
    videoBtn: '▶️ Einführungsvideo ansehen',
    storiesBtn: 'Erfolgsgeschichten',
    mobileTitle: 'Mobile App',
    mobileDesc: 'Erstelle Spots auch unterwegs',
  },
  fr: {
    badge: '🚀 SOLUTION EN 4 ÉTAPES',
    title: 'Comment fonctionne SpotItForMe ?',
    subtitle: "Trouver des articles perdus est maintenant très facile. Laissez des milliers d'yeux chercher pour vous en 4 étapes simples.",
    steps: [
      { number: '01', title: 'Créer un spot', description: "Ajoutez une photo de l'article recherché et écrivez les détails", icon: '📝', features: ['Gratuit', '2 minutes', 'Télécharger une image'], footer: 'Commencez GRATUITEMENT' },
      { number: '02', title: 'La communauté surveille', description: "Des milliers d'utilisateurs gardent un œil en se déplaçant en ville", icon: '👁️', features: ['Notification instantanée', 'Basé sur la localisation', 'Communauté experte'], footer: 'Communauté active 24h/24' },
      { number: '03', title: 'Recevoir une notification', description: 'Quand quelun le repère, vous recevez immédiatement une photo et la localisation', icon: '🔔', features: ['Temps réel', 'Avec photo', 'Informations détaillées'], footer: 'Notification instantanée' },
      { number: '04', title: 'Trouver et être heureux', description: 'Trouvez l article, récupérez-le et partagez votre histoire de succès !', icon: '🎯', features: ['94% de réussite', 'Points de remerciement', 'Badge communautaire'], footer: 'Satisfaction garantie' },
    ],
    videoTitle: '🎥 SpotItForMe en 90 secondes',
    videoDesc: "Apprenez comment nous fonctionnons en 90 secondes. Voyez comment des milliers d'utilisateurs trouvent leurs articles perdus.",
    videoBtn: '▶️ Regarder la vidéo de présentation',
    storiesBtn: 'Histoires de succès',
    mobileTitle: 'Application mobile',
    mobileDesc: 'Créez des spots même en déplacement',
  },
  es: {
    badge: '🚀 SOLUCIÓN EN 4 PASOS',
    title: '¿Cómo funciona SpotItForMe?',
    subtitle: 'Encontrar artículos perdidos ahora es muy fácil. Deja que miles de ojos busquen por ti en 4 sencillos pasos.',
    steps: [
      { number: '01', title: 'Crear un spot', description: 'Agrega una foto del artículo que buscas y escribe los detalles', icon: '📝', features: ['Gratis', '2 minutos', 'Subir imagen'], footer: 'Empieza GRATIS' },
      { number: '02', title: 'La comunidad vigila', description: 'Miles de usuarios están atentos mientras recorren su ciudad', icon: '👁️', features: ['Notificación instantánea', 'Basado en ubicación', 'Comunidad experta'], footer: 'Comunidad activa 24/7' },
      { number: '03', title: 'Recibir notificación', description: 'Cuando alguien lo ve, recibes al instante una foto y la ubicación', icon: '🔔', features: ['Tiempo real', 'Con foto', 'Información detallada'], footer: 'Notificación instantánea' },
      { number: '04', title: 'Encontrar y ser feliz', description: '¡Encuentra el artículo, recógelo y comparte tu historia de éxito!', icon: '🎯', features: ['94% de éxito', 'Puntos de agradecimiento', 'Insignia comunitaria'], footer: 'Satisfacción garantizada' },
    ],
    videoTitle: '🎥 SpotItForMe en 90 segundos',
    videoDesc: 'Aprende cómo funcionamos en 90 segundos. Ve cómo miles de usuarios encuentran sus artículos perdidos.',
    videoBtn: '▶️ Ver video de introducción',
    storiesBtn: 'Historias de éxito',
    mobileTitle: 'Aplicación móvil',
    mobileDesc: 'Crea spots incluso en movimiento',
  },
  ru: {
    badge: '🚀 RESHENIYE V 4 SHAGA',
    title: 'Kak rabotayet SpotItForMe?',
    subtitle: 'Nayti poteryannyye predmety teper ochen prosto. Pust tysyachi glaz ishchut za tebya v 4 prostykh shaga.',
    steps: [
      { number: '01', title: 'Sozdat spot', description: 'Dobav foto nuzhnog tovara i opishi detali', icon: '📝', features: ['Besplatno', '2 minuty', 'Zagruzit foto'], footer: 'Nachat BESPLATNO' },
      { number: '02', title: 'Soobshchestvo nablyudayet', description: 'Tysyachi polzovateley sledyat za okruzhayushchim prostranstvom', icon: '👁️', features: ['Mgnovennoye uvedomleniye', 'Na osnove mestopolozheniya', 'Ekspertnoye soobshchestvo'], footer: 'Aktivnoye soobshchestvo 24/7' },
      { number: '03', title: 'Poluchit uvedomleniye', description: 'Kogda kto-to zamet tovar, ty srazu poluchish foto i mestopolozheniye', icon: '🔔', features: ['V realnom vremeni', 'S fotofrafiyey', 'Podrobnyye svedeniya'], footer: 'Mgnovennoye uvedomleniye' },
      { number: '04', title: 'Nayti i byt schastlivym', description: 'Naydi tovar, zaberi yego i podelisya istoriyey uspekha!', icon: '🎯', features: ['94% uspekha', 'Blagodarstvennyye bally', 'Znachok soobshchestva'], footer: 'Garantirovannoye udovletvoreniye' },
    ],
    videoTitle: '🎥 SpotItForMe za 90 sekund',
    videoDesc: 'Uznay kak my rabotayem za 90 sekund. Posmotri kak tysyachi polzovateley nakhodyat svoi poteryannyye predmety.',
    videoBtn: '▶️ Posmotret vvodnoye video',
    storiesBtn: 'Istorii uspekha',
    mobileTitle: 'Mobilnoye prilozheniye',
    mobileDesc: 'Sozdavay spoty dazhe v puti',
  },
} as const

const stepColors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600']

export default function HowItWorks() {
  const locale = useCurrentLocale()
  const t = howItWorksText[locale]

  return (
    <section className="py-20 bg-white overflow-x-hidden">
      <div className="container-custom">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            {t.badge}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 gap-y-12">
          {t.steps.map((step, i) => (
            <div key={step.number} className="relative group">
              {i < t.steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 right-0 w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent translate-x-1/2 z-0" />
              )}
              <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-xl ${stepColors[i]} flex items-center justify-center text-2xl`}>
                    {step.icon}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-6">{step.description}</p>
                <div className="space-y-2">
                  {step.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-xs text-gray-500 font-medium">{step.footer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-2/3">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{t.videoTitle}</h3>
              <p className="text-gray-600 mb-6">{t.videoDesc}</p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center">
                  {t.videoBtn}
                </button>
                <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl border border-gray-300">
                  {t.storiesBtn}
                </button>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-1">
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="text-5xl mb-4">📱</div>
                  <h4 className="font-bold text-gray-900 mb-2">{t.mobileTitle}</h4>
                  <p className="text-sm text-gray-600 mb-4">{t.mobileDesc}</p>
                  <div className="flex justify-center space-x-3">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">App Store</button>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Google Play</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

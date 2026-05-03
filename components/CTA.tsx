'use client'

import { useRouter } from 'next/navigation'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

export default function CTA() {
  const router = useRouter()
  const locale = useCurrentLocale()
  const t = {
    badge: locale === 'tr' ? 'HEMEN BASLAYIN' : locale === 'en' ? 'START NOW' : locale === 'de' ? 'JETZT STARTEN' : locale === 'fr' ? 'COMMENCEZ MAINTENANT' : locale === 'es' ? 'EMPIEZA AHORA' : 'NACHNITE SEYCHAS',
    title: locale === 'tr' ? 'Aradiginiz Urunu Hemen Bulun' : locale === 'en' ? 'Find What You Need Right Now' : locale === 'de' ? 'Finden Sie Ihr Produkt sofort' : locale === 'fr' ? 'Trouvez ce que vous cherchez des maintenant' : locale === 'es' ? 'Encuentra lo que buscas ahora mismo' : 'Naydite nuzhnyy tovar pryamo seychas',
    desc: locale === 'tr' ? 'Binlerce goz sizin icin arasin. Ucretsiz kaydolun, spot olusturun ve kayip urunlerinizi toplulugumuzla bulun.' : locale === 'en' ? 'Let thousands of eyes search for you. Sign up free, create a spot, and find your hard-to-find items with the community.' : locale === 'de' ? 'Lassen Sie Tausende Augen fur Sie suchen. Kostenlos registrieren, Spot erstellen und gemeinsam finden.' : locale === 'fr' ? 'Laissez des milliers d yeux chercher pour vous. Inscrivez-vous gratuitement et creez un spot.' : locale === 'es' ? 'Deja que miles de ojos busquen por ti. Registrate gratis, crea un spot y encuentra lo que necesitas.' : 'Pust tysyachi glaz ishchut za vas. Registriruytes besplatno i sozdayte spot.',
    create: locale === 'tr' ? 'Ucretsiz Spot Olustur' : locale === 'en' ? 'Create Free Spot' : locale === 'de' ? 'Kostenlosen Spot erstellen' : locale === 'fr' ? 'Creer un spot gratuit' : locale === 'es' ? 'Crear spot gratis' : 'Sozdat besplatnyy spot',
    explore: locale === 'tr' ? "Spot'lari Incele" : locale === 'en' ? 'Explore Spots' : locale === 'de' ? 'Spots entdecken' : locale === 'fr' ? 'Explorer les spots' : locale === 'es' ? 'Explorar spots' : 'Issledovat spoty',
    freeTitle: locale === 'tr' ? 'Tamamen Ucretsiz' : locale === 'en' ? 'Completely Free' : locale === 'de' ? 'Komplett kostenlos' : locale === 'fr' ? 'Entierement gratuit' : locale === 'es' ? 'Totalmente gratis' : 'Polnostyu besplatno',
    freeDesc: locale === 'tr' ? 'Spot olusturmak, yardim etmek, topluluga katilmak tamamen ucretsiz' : locale === 'en' ? 'Creating spots, helping, and joining the community is completely free' : locale === 'de' ? 'Spot erstellen, helfen und der Community beitreten ist kostenlos' : locale === 'fr' ? 'Creer un spot, aider et rejoindre la communaute est gratuit' : locale === 'es' ? 'Crear spots, ayudar y unirte a la comunidad es gratis' : 'Sozdaniye spotov, pomoshch i uchastiye v soobshchestve besplatny',
    fastTitle: locale === 'tr' ? 'Hizli Yardim' : locale === 'en' ? 'Fast Help' : locale === 'de' ? 'Schnelle Hilfe' : locale === 'fr' ? 'Aide rapide' : locale === 'es' ? 'Ayuda rapida' : 'Bystraya pomoshch',
    fastDesc: locale === 'tr' ? 'Ortalama 24 saat icinde ilk yardim cevabini alirsiniz' : locale === 'en' ? 'Get your first help response within 24 hours on average' : locale === 'de' ? 'Im Schnitt erhalten Sie in 24 Stunden die erste Hilfeantwort' : locale === 'fr' ? 'Recevez une premiere reponse en moyenne sous 24 h' : locale === 'es' ? 'Recibe la primera respuesta en 24 horas de media' : 'Pervyy otklik obychno prihodit v techeniye 24 chasov',
    secureTitle: locale === 'tr' ? 'Guvenli ve Gizli' : locale === 'en' ? 'Secure & Private' : locale === 'de' ? 'Sicher & Privat' : locale === 'fr' ? 'Securise et prive' : locale === 'es' ? 'Seguro y privado' : 'Bezopasno i konfidentsialno',
    secureDesc: locale === 'tr' ? 'Kisisel bilgileriniz guvende, sadece gerekli bilgiler paylasilir' : locale === 'en' ? 'Your personal data is safe, only necessary information is shared' : locale === 'de' ? 'Ihre Daten sind sicher, nur notwendige Infos werden geteilt' : locale === 'fr' ? 'Vos donnees sont securisees, seules les infos necessaires sont partagees' : locale === 'es' ? 'Tus datos estan seguros, solo se comparte lo necesario' : 'Vashi dannye zashchishcheny, delimsya tolko neobkhodimym',
  }

  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium mb-6">
            🎯 {t.badge}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t.title}
          </h2>
          
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            {t.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => router.push('/create-spot')}
              className="group bg-white hover:bg-gray-100 text-blue-900 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center"
            >
              <span className="mr-3">🚀</span>
              {t.create}
              <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
            </button>
            
            <button
              onClick={() => router.push('/spots')}
              className="group bg-transparent hover:bg-white hover:bg-opacity-10 text-white font-semibold py-4 px-8 rounded-xl border-2 border-white border-opacity-30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <span className="mr-3">🔍</span>
              {t.explore}
              <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>

          {/* Özellikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl mb-4">🎁</div>
              <h4 className="text-white font-bold mb-2">{t.freeTitle}</h4>
              <p className="text-blue-200 text-sm">
                {t.freeDesc}
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="text-white font-bold mb-2">{t.fastTitle}</h4>
              <p className="text-blue-200 text-sm">
                {t.fastDesc}
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl mb-4">🔒</div>
              <h4 className="text-white font-bold mb-2">{t.secureTitle}</h4>
              <p className="text-blue-200 text-sm">
                {t.secureDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
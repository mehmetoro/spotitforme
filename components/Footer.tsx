'use client'
// components/Footer.tsx - GÜNCELLENMİŞ
import Link from 'next/link'
import BrandMark from './BrandMark'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

export default function Footer() {
  const locale = useCurrentLocale()
  const currentYear = new Date().getFullYear()

  const t = {
    description:
      locale === 'tr'
        ? 'Topluluk gucuyle kayip urunleri bulma platformu. Kesfet, bul, paylas, kazan!'
        : locale === 'en'
          ? 'Community-powered platform to find rare and hard-to-find items. Discover, find, share, win!'
          : locale === 'de'
            ? 'Community-Plattform zum Finden seltener Produkte. Entdecken, finden, teilen, gewinnen!'
            : locale === 'fr'
              ? 'Plateforme communautaire pour trouver des produits rares. Decouvrir, trouver, partager, gagner !'
              : locale === 'es'
                ? 'Plataforma comunitaria para encontrar productos raros. Descubre, encuentra, comparte, gana!'
                : 'Platforma soobshchestva dlya poiska redkih tovarov. Ischi, nahodi, delis, pobezhday!'
  }

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-16">
      <div className="container-custom">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <BrandMark className="h-11 w-[176px]" />
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.04em]">SpotItForMe</h2>
                <p className="text-[11px] uppercase tracking-[0.26em] text-amber-400">{locale === 'tr' ? 'Nadir izi' : locale === 'en' ? 'Rare trail' : locale === 'de' ? 'Seltene Spur' : locale === 'fr' ? 'Trace rare' : locale === 'es' ? 'Rastro raro' : 'Redkiy sled'}</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              {t.description}
            </p>
            <div className="flex space-x-4">
              <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                📘
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                📷
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                🐦
              </button>
            </div>
          </div>

          {/* Spot & Keşfet */}
          <div>
            <h3 className="text-lg font-bold mb-4">{locale === 'tr' ? 'Spot & Kesfet' : locale === 'en' ? 'Spot & Discover' : locale === 'de' ? 'Spot & Entdecken' : locale === 'fr' ? 'Spot & Decouvrir' : locale === 'es' ? 'Spot y Descubrir' : 'Spot i Otkrytiya'}</h3>
            <ul className="space-y-3">
              <li>
                  <Link href="/spots" className="text-gray-400 hover:text-white">
                    {locale === 'tr' ? "Tum Spot'lar" : locale === 'en' ? 'All Spots' : locale === 'de' ? 'Alle Spots' : locale === 'fr' ? 'Tous les spots' : locale === 'es' ? 'Todos los spots' : 'Vse spoty'}
                  </Link>
              </li>
              <li>
                  <Link href="/create-spot" className="text-gray-400 hover:text-white">
                    {locale === 'tr' ? 'Spot Olustur' : locale === 'en' ? 'Create Spot' : locale === 'de' ? 'Spot erstellen' : locale === 'fr' ? 'Creer un spot' : locale === 'es' ? 'Crear spot' : 'Sozdat spot'}
                  </Link>
              </li>
              <li>
                  <Link href="/nadir" className="text-gray-400 hover:text-white">
                    {locale === 'tr' ? 'Kesfet (Nadir)' : locale === 'en' ? 'Discover (Rare)' : locale === 'de' ? 'Entdecken (Selten)' : locale === 'fr' ? 'Decouvrir (Rare)' : locale === 'es' ? 'Descubrir (Raro)' : 'Otkryt (Redkoe)'}
                  </Link>
              </li>
              <li>
                  <Link href="/leaderboard" className="text-gray-400 hover:text-white">
                    {locale === 'tr' ? 'Lider Tablosu' : locale === 'en' ? 'Leaderboard' : locale === 'de' ? 'Bestenliste' : locale === 'fr' ? 'Classement' : locale === 'es' ? 'Clasificacion' : 'Tablica liderov'}
                  </Link>
              </li>
              <li>
                  <Link href="/daily-goals" className="text-gray-400 hover:text-white">
                    {locale === 'tr' ? 'Gunluk Hedefler' : locale === 'en' ? 'Daily Goals' : locale === 'de' ? 'Tagesziele' : locale === 'fr' ? 'Objectifs quotidiens' : locale === 'es' ? 'Objetivos diarios' : 'Dnevnye tseli'}
                  </Link>
              </li>
            </ul>
          </div>

          {/* Mağazalar */}
          <div>
            <h3 className="text-lg font-bold mb-4">{locale === 'tr' ? 'Magazalar' : locale === 'en' ? 'Shops' : locale === 'de' ? 'Shops' : locale === 'fr' ? 'Boutiques' : locale === 'es' ? 'Tiendas' : 'Magaziny'}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shops-discovery" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Magazalari Kesfet' : locale === 'en' ? 'Discover Shops' : locale === 'de' ? 'Shops entdecken' : locale === 'fr' ? 'Decouvrir les boutiques' : locale === 'es' ? 'Descubrir tiendas' : 'Issledovat magaziny'}
                </Link>
              </li>
              <li>
                <Link href="/for-business" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Isletme Kaydi' : locale === 'en' ? 'Business Registration' : locale === 'de' ? 'Unternehmensregistrierung' : locale === 'fr' ? 'Inscription entreprise' : locale === 'es' ? 'Registro de negocio' : 'Registratsiya biznesa'}
                </Link>
              </li>
              <li>
                <Link href="/shop-panel" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Magaza Paneli' : locale === 'en' ? 'Shop Panel' : locale === 'de' ? 'Shop-Panel' : locale === 'fr' ? 'Panneau boutique' : locale === 'es' ? 'Panel de tienda' : 'Panel magazina'}
                </Link>
              </li>
              <li>
                <Link href="/premium-packages" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Premium Paketler' : locale === 'en' ? 'Premium Packages' : locale === 'de' ? 'Premium-Pakete' : locale === 'fr' ? 'Offres premium' : locale === 'es' ? 'Paquetes premium' : 'Premium pakety'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Yardım & Destek */}
          <div>
            <h3 className="text-lg font-bold mb-4">{locale === 'tr' ? 'Yardim & Destek' : locale === 'en' ? 'Help & Support' : locale === 'de' ? 'Hilfe & Support' : locale === 'fr' ? 'Aide & Support' : locale === 'es' ? 'Ayuda y Soporte' : 'Pomoshch i podderzhka'}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Nasil Calisir?' : locale === 'en' ? 'How It Works?' : locale === 'de' ? 'Wie es funktioniert?' : locale === 'fr' ? 'Comment ca marche ?' : locale === 'es' ? 'Como funciona?' : 'Kak eto rabotaet?'}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Sikca Sorulan Sorular' : locale === 'en' ? 'FAQ' : locale === 'de' ? 'FAQ' : locale === 'fr' ? 'FAQ' : locale === 'es' ? 'Preguntas frecuentes' : 'Chasto zadavaemye voprosy'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Iletisim' : locale === 'en' ? 'Contact' : locale === 'de' ? 'Kontakt' : locale === 'fr' ? 'Contact' : locale === 'es' ? 'Contacto' : 'Kontakt'}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Gizlilik Politikasi' : locale === 'en' ? 'Privacy Policy' : locale === 'de' ? 'Datenschutzrichtlinie' : locale === 'fr' ? 'Politique de confidentialite' : locale === 'es' ? 'Politica de privacidad' : 'Politika konfidentsialnosti'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  {locale === 'tr' ? 'Kullanim Kosullari' : locale === 'en' ? 'Terms of Use' : locale === 'de' ? 'Nutzungsbedingungen' : locale === 'fr' ? 'Conditions d\'utilisation' : locale === 'es' ? 'Terminos de uso' : 'Usloviya ispolzovaniya'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter - YENİ */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-4">📬 {locale === 'tr' ? 'Bultenimize Abone Olun' : locale === 'en' ? 'Subscribe to Our Newsletter' : locale === 'de' ? 'Newsletter abonnieren' : locale === 'fr' ? 'Abonnez-vous a la newsletter' : locale === 'es' ? 'Suscribete al boletin' : 'Podpishites na rassylku'}</h3>
            <p className="text-gray-400 mb-6">
              {locale === 'tr' ? 'Yeni ozellikler, basari hikayeleri ve ozel firsatlardan haberdar olun.' : locale === 'en' ? 'Get updates on new features, success stories and special offers.' : locale === 'de' ? 'Bleiben Sie uber neue Funktionen, Erfolgsgeschichten und Angebote informiert.' : locale === 'fr' ? 'Recevez les nouveautes, succes et offres speciales.' : locale === 'es' ? 'Recibe novedades, historias de exito y ofertas especiales.' : 'Poluchayte novosti o funktsiyah, istoriyah uspeha i spetsialnyh predlozheniyah.'}
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder={locale === 'tr' ? 'E-posta adresiniz' : locale === 'en' ? 'Your email address' : locale === 'de' ? 'Ihre E-Mail-Adresse' : locale === 'fr' ? 'Votre adresse e-mail' : locale === 'es' ? 'Tu correo electronico' : 'Vash email'}
                className="flex-grow px-6 py-3 rounded-l-lg bg-gray-800 text-white border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-r-lg"
              >
                {locale === 'tr' ? 'Abone Ol' : locale === 'en' ? 'Subscribe' : locale === 'de' ? 'Abonnieren' : locale === 'fr' ? 'S\'abonner' : locale === 'es' ? 'Suscribirse' : 'Podpisatsya'}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} SpotItForMe. {locale === 'tr' ? 'Tum haklari saklidir.' : locale === 'en' ? 'All rights reserved.' : locale === 'de' ? 'Alle Rechte vorbehalten.' : locale === 'fr' ? 'Tous droits reserves.' : locale === 'es' ? 'Todos los derechos reservados.' : 'Vse prava zashchishcheny.'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {locale === 'tr' ? 'Arayanlar icin sevgiyle yapildi | v2.0' : locale === 'en' ? 'Made with love for people who search | v2.0' : locale === 'de' ? 'Mit Liebe fur Suchende gemacht | v2.0' : locale === 'fr' ? 'Fait avec amour pour ceux qui cherchent | v2.0' : locale === 'es' ? 'Hecho con amor para quienes buscan | v2.0' : 'Sdelano s lyubovyu dlya ishchushchikh | v2.0'}
          </p>
          
          {/* Yeni Özellikler Badge */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-xs">
              {locale === 'tr' ? '🔥 Yeni: Kesfet' : '🔥 New: Discover'}
            </span>
            <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-xs">
              {locale === 'tr' ? '🏆 Puan Sistemi' : '🏆 Points System'}
            </span>
            <span className="px-3 py-1 bg-purple-900 text-purple-200 rounded-full text-xs">
              {locale === 'tr' ? '🏪 Magaza 2.0' : '🏪 Shop 2.0'}
            </span>
            <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-xs">
              {locale === 'tr' ? '👁️ Nadir Gordum' : '👁️ Rare Sighting'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
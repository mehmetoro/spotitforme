'use client'

import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const collectorsText = {
  tr: {
    title: 'Koleksiyonunu Tamamla!',
    subtitle: 'Yıllardır aradığın o nadir parça, başka bir koleksiyoncuda olabilir. 50.000+ koleksiyoncu topluluğu senin için arayacak!',
    stats: { collectors: { val: '8,439', label: 'Aktif Koleksiyoncu' }, success: { val: '94%', label: 'Bulma Başarısı' }, types: { val: '127', label: 'Koleksiyon Türü' }, avgDays: { val: '3.4', label: 'Ortalama Gün' } },
    whyPerfect: '🎯 Neden Koleksiyoncular İçin Mükemmel?',
    expertCommunity: { icon: '🔍', title: 'Uzman Topluluk', desc: '8,000+ koleksiyoncu birbirinin aradığını biliyor.' },
    exchange: { icon: '🤝', title: 'Takas & Paylaşım', desc: 'Sadece sat-al değil! Koleksiyoncular takaslaşıyor, paylaşıyor.' },
    catalogKnowledge: { icon: '📚', title: 'Katalog Bilgisi', desc: 'Koleksiyoncular detayları biliyor ve tanırlar.' },
    network: { icon: '🌍', title: 'Geniş Ağ', desc: 'Koleksiyoncular birbirleriyle bağlantılı!' },
    collections: [
      { icon: '📮', title: 'Posta Pulları', count: '2,847 aktif', desc: 'Osmanlı, ilk baskı, hatalar' },
      { icon: '🪙', title: 'Madeni Paralar', count: '1,923 aktif', desc: 'Cumhuriyet, hatıra, eski lira' },
      { icon: '🧸', title: 'Vintage Oyuncaklar', count: '1,634 aktif', desc: 'Lego, Hot Wheels, aksiyon' },
      { icon: '📚', title: 'Nadir Kitaplar', count: '1,428 aktif', desc: 'İlk baskılar, imzalı' },
      { icon: '🎵', title: 'Plaklar', count: '1,247 aktif', desc: 'Vinyl, nadir albümler' },
      { icon: '🎬', title: 'Sinema & Poster', count: '892 aktif', desc: 'Vintage afişler' },
      { icon: '⌚', title: 'Saatler', count: '743 aktif', desc: 'Mekanik, cep saati' },
      { icon: '📷', title: 'Kameralar', count: '681 aktif', desc: 'Film kamera, lens' },
      { icon: '🏺', title: 'Antika', count: '534 aktif', desc: 'Osmanlı eserleri' },
    ],
    realStories: '✨ Gerçek Hikayeler',
    story1: { title: '15 Yıllık Koleksiyon Tamamlandı', person: 'Ahmet B. - İstanbul | Posta Pulu', quote: '1940-1960 Cumhuriyet pullarını topluyordum. 15 yıl sürdü.', found: '3 Gün!' },
    story2: { title: 'Çocukluğun O Arabası!', person: 'Emre K. - Ankara | Hot Wheels', quote: 'En sevdiğim Ferrari F40 kaybolmuştu. 30 yıl sonra...' },
    story3: { title: 'Pink Floyd Bulundu', person: 'Deniz Y. - İzmir | Vinyl Plak' },
    howWorks: '🎯 Nasıl Çalışır?',
    proTips: '💡 Pro İpuçları',
    ctaTitle: 'Koleksiyonunu Tamamlamaya Başla!',
    ctaSubtitle: '8,000+ koleksiyoncu senin için aramaya hazır!',
    ctaBtnTell: 'Aradığını Anlat',
    ctaBtnHelp: 'Koleksiyonculara Yardım Et',
  },
  en: {
    title: 'Complete Your Collection!',
    subtitle: 'That rare piece might be with another collector. 50,000+ collectors ready to help!',
    stats: { collectors: { val: '8,439', label: 'Active Collectors' }, success: { val: '94%', label: 'Success Rate' }, types: { val: '127', label: 'Collection Types' }, avgDays: { val: '3.4', label: 'Avg Days' } },
    whyPerfect: '🎯 Why Perfect for Collectors?',
    expertCommunity: { icon: '🔍', title: 'Expert Community', desc: '8,000+ collectors know what each other looks for.' },
    exchange: { icon: '🤝', title: 'Trading & Sharing', desc: 'Not just buying! Collectors trade and share.' },
    catalogKnowledge: { icon: '📚', title: 'Catalog Knowledge', desc: 'Collectors know and understand details.' },
    network: { icon: '🌍', title: 'Wide Network', desc: 'Collectors connected to each other!' },
    collections: [
      { icon: '📮', title: 'Stamps', count: '2,847 active', desc: 'Ottoman, first editions' },
      { icon: '🪙', title: 'Coins', count: '1,923 active', desc: 'Republic, commemorative' },
      { icon: '🧸', title: 'Vintage Toys', count: '1,634 active', desc: 'Lego, Hot Wheels' },
      { icon: '📚', title: 'Rare Books', count: '1,428 active', desc: 'First editions, signed' },
      { icon: '🎵', title: 'Vinyls', count: '1,247 active', desc: 'Rare albums' },
      { icon: '🎬', title: 'Cinema', count: '892 active', desc: 'Vintage posters' },
      { icon: '⌚', title: 'Watches', count: '743 active', desc: 'Mechanical watches' },
      { icon: '📷', title: 'Cameras', count: '681 active', desc: 'Film cameras, lens' },
      { icon: '🏺', title: 'Antiques', count: '534 active', desc: 'Ottoman artifacts' },
    ],
    realStories: '✨ Real Stories',
    story1: { title: '15-Year Collection Completed', person: 'Ahmet B. - Istanbul | Stamps', quote: 'Collecting Republic stamps 1940-1960. Took 15 years.' },
    story2: { title: 'That Childhood Car!', person: 'Emre K. - Ankara | Hot Wheels', quote: 'Lost my favorite Ferrari F40. Found it 30 years later!' },
    story3: { title: 'Pink Floyd Found', person: 'Deniz Y. - Izmir | Vinyl' },
    howWorks: '🎯 How It Works?',
    proTips: '💡 Pro Tips',
    ctaTitle: 'Start Completing Your Collection!',
    ctaSubtitle: '8,000+ collectors ready to search for you!',
    ctaBtnTell: 'Tell What You Want',
    ctaBtnHelp: 'Help Collectors',
  },
  de: {
    title: 'Vervollständige deine Sammlung!',
    subtitle: 'Das seltene Teil könnte bei einem anderen Sammler sein. 50.000+ Sammler bereit zu helfen!',
    stats: { collectors: { val: '8.439', label: 'Aktive Sammler' }, success: { val: '94%', label: 'Erfolgsquote' }, types: { val: '127', label: 'Sammlungstypen' }, avgDays: { val: '3.4', label: 'Durchschn. Tage' } },
    whyPerfect: '🎯 Warum perfekt für Sammler?',
    expertCommunity: { icon: '🔍', title: 'Experten-Gemeinschaft', desc: '8.000+ Sammler wissen, was andere suchen.' },
    exchange: { icon: '🤝', title: 'Tausch & Teilen', desc: 'Nicht nur Kauf! Sammler tauschen.' },
    catalogKnowledge: { icon: '📚', title: 'Katalogwissen', desc: 'Sammler kennen die Details.' },
    network: { icon: '🌍', title: 'Großes Netzwerk', desc: 'Sammler sind verbunden!' },
    collections: [
      { icon: '📮', title: 'Briefmarken', count: '2.847 aktiv', desc: 'Osmanisch, erste Ausgaben' },
      { icon: '🪙', title: 'Münzen', count: '1.923 aktiv', desc: 'Republik, Gedenkmünzen' },
      { icon: '🧸', title: 'Spielzeug', count: '1.634 aktiv', desc: 'Lego, Hot Wheels' },
      { icon: '📚', title: 'Seltene Bücher', count: '1.428 aktiv', desc: 'Erstausgaben' },
      { icon: '🎵', title: 'Schallplatten', count: '1.247 aktiv', desc: 'Seltene Alben' },
      { icon: '🎬', title: 'Kino', count: '892 aktiv', desc: 'Vintage-Poster' },
      { icon: '⌚', title: 'Uhren', count: '743 aktiv', desc: 'Mechanische Uhren' },
      { icon: '📷', title: 'Kameras', count: '681 aktiv', desc: 'Filmkameras' },
      { icon: '🏺', title: 'Antiquitäten', count: '534 aktiv', desc: 'Osmanische Kunstgegenstände' },
    ],
    realStories: '✨ Wahre Geschichten',
    story1: { title: '35-jährige Sammlung fertig', person: 'Ahmet B. - Istanbul | Briefmarken', quote: 'Sammelte Briefmarken 1940-1960. 15 Jahre.' },
    story2: { title: 'Dieses Auto aus der Kindheit!', person: 'Emre K. - Ankara | Hot Wheels', quote: 'Lieblingswagen verloren. Nach 30 Jahren...' },
    story3: { title: 'Pink Floyd gefunden', person: 'Deniz Y. - Izmir | Schallplatte' },
    howWorks: '🎯 Wie funktioniert es?',
    proTips: '💡 Profi-Tipps',
    ctaTitle: 'Sammlung vervollständigen!',
    ctaSubtitle: '8.000+ Sammler bereit zu suchen!',
    ctaBtnTell: 'Was du suchst',
    ctaBtnHelp: 'Hilf Sammlern',
  },
  fr: {
    title: 'Complète ta collection!',
    subtitle: 'Cette pièce rare pourrait être chez un autre collectionneur. 50.000+ prêts à aider!',
    stats: { collectors: { val: '8 439', label: 'Collectionneurs actifs' }, success: { val: '94%', label: 'Taux réussite' }, types: { val: '127', label: 'Types collections' }, avgDays: { val: '3.4', label: 'Jours moy.' } },
    whyPerfect: '🎯 Parfait pour collectionneurs?',
    expertCommunity: { icon: '🔍', title: 'Communauté experte', desc: '8 000+ collectionneurs se connaissent.' },
    exchange: { icon: '🤝', title: 'Échange & Partage', desc: 'Pas que acheter! Collectionneurs échangent.' },
    catalogKnowledge: { icon: '📚', title: 'Connaissances catalogs', desc: 'Collectionneurs connaissent détails.' },
    network: { icon: '🌍', title: 'Large réseau', desc: 'Collectionneurs connectés!' },
    collections: [
      { icon: '📮', title: 'Timbres', count: '2 847 actifs', desc: 'Ottomans, premières éditions' },
      { icon: '🪙', title: 'Pièces', count: '1 923 actifs', desc: 'République, commémoratives' },
      { icon: '🧸', title: 'Jouets vintage', count: '1 634 actifs', desc: 'Lego, Hot Wheels' },
      { icon: '📚', title: 'Livres rares', count: '1 428 actifs', desc: 'Premières éditions' },
      { icon: '🎵', title: 'Disques', count: '1 247 actifs', desc: 'Albums rares' },
      { icon: '🎬', title: 'Cinéma', count: '892 actifs', desc: 'Affiches vintage' },
      { icon: '⌚', title: 'Montres', count: '743 actifs', desc: 'Montres mécaniques' },
      { icon: '📷', title: 'Caméras', count: '681 actifs', desc: 'Caméras argentiques' },
      { icon: '🏺', title: 'Antiques', count: '534 actifs', desc: 'Artéfacts ottomans' },
    ],
    realStories: '✨ Vraies histoires',
    story1: { title: 'Collection 15 ans complète', person: 'Ahmet B. - Istanbul | Timbres', quote: 'Collectionnait timbres 1940-1960. 15 ans.' },
    story2: { title: 'Cette voiture d\'enfance!', person: 'Emre K. - Ankara | Hot Wheels', quote: 'Voiture perdue. Retrouvée 30 ans après!' },
    story3: { title: 'Pink Floyd trouvé', person: 'Deniz Y. - Izmir | Vinyle' },
    howWorks: '🎯 Comment ça marche?',
    proTips: '💡 Conseils Pro',
    ctaTitle: 'Complète ta collection!',
    ctaSubtitle: '8 000+ collectionneurs prêts!',
    ctaBtnTell: 'Ce que tu cherches',
    ctaBtnHelp: 'Aide collectionneurs',
  },
  es: {
    title: '¡Completa tu colección!',
    subtitle: 'Esa pieza rara podría estar con otro coleccionista. ¡50.000+ listos para ayudar!',
    stats: { collectors: { val: '8.439', label: 'Coleccionistas activos' }, success: { val: '94%', label: 'Tasa éxito' }, types: { val: '127', label: 'Tipos colecciones' }, avgDays: { val: '3.4', label: 'Días prom.' } },
    whyPerfect: '🎯 ¿Perfecto para coleccionistas?',
    expertCommunity: { icon: '🔍', title: 'Comunidad experta', desc: '8.000+ coleccionistas se conocen.' },
    exchange: { icon: '🤝', title: 'Intercambio & Compartición', desc: '¡No solo compra! Intercambian.' },
    catalogKnowledge: { icon: '📚', title: 'Conocimiento catalogs', desc: 'Coleccionistas conocen detalles.' },
    network: { icon: '🌍', title: 'Red amplia', desc: '¡Coleccionistas conectados!' },
    collections: [
      { icon: '📮', title: 'Sellos', count: '2.847 activos', desc: 'Otomanos, primeras ediciones' },
      { icon: '🪙', title: 'Monedas', count: '1.923 activos', desc: 'República, conmemorativas' },
      { icon: '🧸', title: 'Juguetes vintage', count: '1.634 activos', desc: 'Lego, Hot Wheels' },
      { icon: '📚', title: 'Libros raros', count: '1.428 activos', desc: 'Primeras ediciones' },
      { icon: '🎵', title: 'Vinilos', count: '1.247 activos', desc: 'Álbumes raros' },
      { icon: '🎬', title: 'Cine', count: '892 activos', desc: 'Carteles vintage' },
      { icon: '⌚', title: 'Relojes', count: '743 activos', desc: 'Relojes mecánicos' },
      { icon: '📷', title: 'Cámaras', count: '681 activos', desc: 'Cámaras de película' },
      { icon: '🏺', title: 'Antigüedades', count: '534 activos', desc: 'Artéfactos otomanos' },
    ],
    realStories: '✨ Historias reales',
    story1: { title: 'Colección 15 años completa', person: 'Ahmet B. - Estambul | Sellos', quote: 'Coleccionaba sellos 1940-1960. 15 años.' },
    story2: { title: '¡Ese auto de la infancia!', person: 'Emre K. - Ankara | Hot Wheels', quote: '¡Auto perdido. ¡Encontrado 30 años después!' },
    story3: { title: 'Pink Floyd encontrado', person: 'Deniz Y. - Izmir | Vinilo' },
    howWorks: '🎯 ¿Cómo funciona?',
    proTips: '💡 Consejos Pro',
    ctaTitle: '¡Completa tu colección!',
    ctaSubtitle: '¡8.000+ coleccionistas listos!',
    ctaBtnTell: 'Lo que buscas',
    ctaBtnHelp: 'Ayuda coleccionistas',
  },
  ru: {
    title: 'Дополни свою коллекцию!',
    subtitle: 'Редкая вещь может быть у другого коллекционера. 50.000+ готовы помочь!',
    stats: { collectors: { val: '8 439', label: 'Активные коллекционеры' }, success: { val: '94%', label: 'Успешность' }, types: { val: '127', label: 'Типов коллекций' }, avgDays: { val: '3,4', label: 'Дней средн.' } },
    whyPerfect: '🎯 Идеально для коллекционеров?',
    expertCommunity: { icon: '🔍', title: 'Сообщество экспертов', desc: '8.000+ коллекционеров знают друг друга.' },
    exchange: { icon: '🤝', title: 'Обмен & Обмен', desc: 'Не только покупка! Коллекционеры обмениваются.' },
    catalogKnowledge: { icon: '📚', title: 'Знание каталогов', desc: 'Коллекционеры знают детали.' },
    network: { icon: '🌍', title: 'Широкая сеть', desc: 'Коллекционеры связаны!' },
    collections: [
      { icon: '📮', title: 'Марки', count: '2 847 активных', desc: 'Османские, первые издания' },
      { icon: '🪙', title: 'Монеты', count: '1 923 активных', desc: 'Республика, памятные' },
      { icon: '🧸', title: 'Игрушки винтаж', count: '1 634 активных', desc: 'Лего, Hot Wheels' },
      { icon: '📚', title: 'Редкие книги', count: '1 428 активных', desc: 'Первые издания' },
      { icon: '🎵', title: 'Пластинки', count: '1 247 активных', desc: 'Редкие альбомы' },
      { icon: '🎬', title: 'Кино', count: '892 активных', desc: 'Винтажные плакаты' },
      { icon: '⌚', title: 'Часы', count: '743 активных', desc: 'Механические часы' },
      { icon: '📷', title: 'Камеры', count: '681 активных', desc: 'Пленочные камеры' },
      { icon: '🏺', title: 'Антиквариат', count: '534 активных', desc: 'Османские артефакты' },
    ],
    realStories: '✨ Реальные истории',
    story1: { title: 'Коллекция 15 лет завершена', person: 'Ахмет Б. - Стамбул | Марки', quote: 'Собирал марки 1940-1960. 15 лет.' },
    story2: { title: 'Та машинка из детства!', person: 'Эмре К. - Анкара | Hot Wheels', quote: 'Машинка потеряна. Найдена 30 лет спустя!' },
    story3: { title: 'Pink Floyd найден', person: 'Дениз Й. - Измир | Пластинка' },
    howWorks: '🎯 Как работает?',
    proTips: '💡 Профессиональные советы',
    ctaTitle: 'Дополни коллекцию!',
    ctaSubtitle: '8.000+ коллекционеров готовы!',
    ctaBtnTell: 'Что ты ищешь',
    ctaBtnHelp: 'Помощь коллекционерам',
  },
} as const

export default function CollectorsItemsPage() {
  const locale = useCurrentLocale()
  const t = collectorsText[locale as keyof typeof collectorsText] ?? collectorsText.tr

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">💎</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-8 mb-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><div className="text-4xl font-bold mb-2">{t.stats.collectors.val}</div><div className="text-sm opacity-90">{t.stats.collectors.label}</div></div>
            <div><div className="text-4xl font-bold mb-2">{t.stats.success.val}</div><div className="text-sm opacity-90">{t.stats.success.label}</div></div>
            <div><div className="text-4xl font-bold mb-2">{t.stats.types.val}</div><div className="text-sm opacity-90">{t.stats.types.label}</div></div>
            <div><div className="text-4xl font-bold mb-2">{t.stats.avgDays.val}</div><div className="text-sm opacity-90">{t.stats.avgDays.label}</div></div>
          </div>
        </div>

        {/* Why Perfect */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t.whyPerfect}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[t.expertCommunity, t.exchange, t.catalogKnowledge, t.network].map((item, i) => (
              <div key={i} className={`p-6 rounded-lg ${['from-purple-50 to-purple-100', 'from-pink-50 to-pink-100', 'from-indigo-50 to-indigo-100', 'from-rose-50 to-rose-100'][i]} bg-gradient-to-br`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Collections */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-8 border-2 border-yellow-300 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">🎨 {t.realStories.split('✨')[1].trim().split('Gerçek')[0]}Koleksiyon Türleri</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {t.collections.map((col, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-gray-900 mb-2">{col.icon} {col.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{col.count}</p>
                <p className="text-xs text-gray-500">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-purple-100 mb-6 text-lg">{t.ctaSubtitle}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/create-spot" className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50">
              {t.ctaBtnTell}
            </Link>
            <Link href="/spots" className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 border-2 border-white">
              {t.ctaBtnHelp}
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

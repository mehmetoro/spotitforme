import Link from 'next/link'

export const metadata = {
  title: 'Yöresel Ürünler - Bölgeye Özel Lezzetler | SpotItForMe',
  description: 'Sadece belirli yörelerde üretilen geleneksel yemekler, el yapımı ürünler ve yerel lezzetleri keşfet.'
}

export default function LocalProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container-custom py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🏔️ Yöresel Ürünler</h1>
            <p className="text-xl text-gray-600">Bölgeye özel lezzetler ve geleneksel ürünler</p>
          </div>
          <Link href="/spots?category=yoresel" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold">
            Yöresel Spotlar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Yöresel Ürün Nedir?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Yöresel ürünler, belirli bir bölgede geleneksel yöntemlerle üretilen, o yörenin kültürünü ve lezzetini yansıtan özel ürünlerdir.
                İnternette veya marketlerde bulmak zor, ama o bölgeye gittiğinizde mutlaka tatmanız gereken lezzetler!
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-2xl">🍯</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Yöresel Lezzetler</h3>
                    <p className="text-sm text-gray-600">Antep baklavası, Maraş dondurması, Trabzon peyniri, Kars gravyeri</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🧵</span>
                  <div>
                    <h3 className="font-bold text-gray-900">El Yapımı Ürünler</h3>
                    <p className="text-sm text-gray-600">Kilim, halı, çini, bakır işleme, seramik</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Doğal ve Organik</h3>
                    <p className="text-sm text-gray-600">Yöresel bitki çayları, bal çeşitleri, zeytinyağı</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Hediyelik Eşyalar</h3>
                    <p className="text-sm text-gray-600">Nazar boncuğu, sedef işlemeli kutular, geleneksel giysiler</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nereden Bulunur?</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🏪 Yerel Pazarlar ve Çarşılar</h3>
                  <p className="text-gray-700 text-sm">
                    Her şehrin tarihi çarşısı, mahalle pazarı ve yerel üreticilerin satış yaptığı yerler ilk duraktır.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">👨‍🌾 Küçük Üreticilerden</h3>
                  <p className="text-gray-700 text-sm">
                    Ailelerin geleneksel yöntemlerle ürettiği ürünler genelde küçük dükkanlarda veya evlerde satılır.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🗺️ Spot Sistemiyle</h3>
                  <p className="text-gray-700 text-sm">
                    O bölgede yaşayanlar için spot oluşturun, yerel halk size yardımcı olsun!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Spot Oluşturma önerileri</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">📍</span>
                  <p className="text-sm text-gray-700"><strong>Bölge Belirtin:</strong> Hangi şehir/ilçede aradığınızı net söyleyin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🏷️</span>
                  <p className="text-sm text-gray-700"><strong>Ürün Detayı:</strong> "Antep baklavası" yerine "fıstıklı, ince açılmış baklava" deyin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">💰</span>
                  <p className="text-sm text-gray-700"><strong>Bütçe:</strong> Ne kadar harcayabileceğinizi belirtin, yerel fiyatları öğrenin</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6 border border-green-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Popüler Yöreler</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-white rounded">🥐 <strong>Gaziantep:</strong> Baklava, lahmacun</div>
                <div className="p-2 bg-white rounded">🍇 <strong>Manisa:</strong> Sultaniye üzüm, mesir macunu</div>
                <div className="p-2 bg-white rounded">🧀 <strong>Kars:</strong> Gravyer peyniri, kaşar</div>
                <div className="p-2 bg-white rounded">🫖 <strong>Rize:</strong> Çay, bal</div>
              </div>
            </div>

            <div className="bg-green-600 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">Yöresel Ürün Ara</h3>
              <p className="text-sm opacity-90 mb-4">
                Aradığın yöresel lezzet için spot oluştur
              </p>
              <Link href="/create-spot" className="block text-center bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
                Spot Oluştur
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">İstatistikler</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Yöresel Spot</span>
                  <span className="font-bold">847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Başarıyla Bulunan</span>
                  <span className="font-bold">%81</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

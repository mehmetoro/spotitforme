import Link from 'next/link'

export const metadata = {
  title: 'Antika Eşyalar - Eski ve Değerli Nesneler | SpotItForMe',
  description: 'Antika mobilyalar, eski koleksiyonlar, tarih değeri taşıyan nesneleri ara ve bul.'
}

export default function AntiqueItemsPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container-custom py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🏺 Antika Eşyalar</h1>
            <p className="text-xl text-gray-600">Eski ve değerli nesneleri keşfet, ara ve paylaş</p>
          </div>
          <Link href="/spots?category=antika" className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 font-bold">
            Antika Spotlar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Antika Eşya Nedir?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Antika eşyalar, geçmişten günümüze ulaşmış, tarihi ve kültürel değeri olan nesnelerdir. 
                Koleksiyoncular için değerli, nostaljik anıları taşıyan bu parçalar her geçen gün daha nadir hale gelir.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-2xl">🪑</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Antika Mobilyalar</h3>
                    <p className="text-sm text-gray-600">Çeyiz sandıkları, eski masalar, koltu klar, dolap ve kredanslar</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">📻</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Nostaljik Cihazlar</h3>
                    <p className="text-sm text-gray-600">Eski radyolar, pikap, gramofon, telefon ve saatler</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🎭</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Dekoratif Objeler</h3>
                    <p className="text-sm text-gray-600">Tablolar, heykeller, vazo ve süs eşyaları</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">💍</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Takı ve Aksesuarlar</h3>
                    <p className="text-sm text-gray-600">Eski mücevherler, saatler, broşlar ve kolyeler</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nasıl Antika Bulunur?</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🏪 Bit Pazarları ve Antikacılar</h3>
                  <p className="text-gray-700 text-sm">
                    Şehirlerdeki bit pazarları, antika dükkanları ve eski eşya satan yerler ilk durak olmalı.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">👵 Yaşlı Nesil ve Aileniz</h3>
                  <p className="text-gray-700 text-sm">
                    Büyükanne ve büyükbabalarınızın evlerinde, çatı aralarında sürpriz antikalar bulunabilir.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🌐 Online Platformlar</h3>
                  <p className="text-gray-700 text-sm">
                    SpotItForMe gibi platformlarda antika arayanlar ve satanlar buluşur.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Antika Paylaşım & Spot İpuçları</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">📸</span>
                  <p className="text-sm text-gray-700"><strong>Detaylı Fotoğraflar:</strong> Eşyanın her açısını, detaylarını ve özel işaretlerini çekin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📏</span>
                  <p className="text-sm text-gray-700"><strong>Ölçüler ve Malzeme:</strong> Boya, ölçü, malzeme bilgisi ekleyin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📜</span>
                  <p className="text-sm text-gray-700"><strong>Tarihsel Bilgi:</strong> Yaklaşık yaş, üretim yeri, üretici bilgisi paylaşın</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6 border border-amber-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Popüler Antika Kategorileri</h3>
              <div className="space-y-2 text-sm">
                <Link href="/spots?category=mobilya" className="block p-2 hover:bg-white rounded transition">
                  🪑 Mobilya
                </Link>
                <Link href="/spots?category=elektronik" className="block p-2 hover:bg-white rounded transition">
                  📻 Nostaljik Cihazlar
                </Link>
                <Link href="/spots?category=dekor" className="block p-2 hover:bg-white rounded transition">
                  🎭 Dekoratif Objeler
                </Link>
                <Link href="/spots?category=taki" className="block p-2 hover:bg-white rounded transition">
                  💍 Takı & Aksesuar
                </Link>
              </div>
            </div>

            <div className="bg-amber-600 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">Antika Ara veya Sat</h3>
              <p className="text-sm opacity-90 mb-4">
                Aradığın antika için spot oluştur veya bulduğun antikaları paylaş
              </p>
              <Link href="/create-spot" className="block text-center bg-white text-amber-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition mb-2">
                Spot Oluştur
              </Link>
              <Link href="/sightings" className="block text-center bg-amber-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-800 transition">
                Bulduklarımı Paylaş
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

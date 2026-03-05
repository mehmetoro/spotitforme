import Link from 'next/link'

export const metadata = {
  title: 'Nadir Kitaplar - İlk Baskı ve Koleksiyon Kitaplar | SpotItForMe',
  description: 'İlk baskı kitaplar, antika yayınlar, eski dergiler ve koleksiyon değerindeki kitapları keşfet.'
}

export default function RareBooksPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container-custom py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">📚 Nadir Kitaplar</h1>
            <p className="text-xl text-gray-600">İlk baskı, antika ve koleksiyon değerindeki kitaplar</p>
          </div>
          <Link href="/spots?category=kitap" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-bold">
            Kitap Spotları
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nadir Kitap Nedir?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nadir kitaplar, az sayıda basılmış, ilk baskıları tükenmiş, antika veya özel bir değeri olan yayınlardır. 
                Koleksiyoncular için kültürel hazine, okurlar için erişilmesi zor kaynaklar!
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <h3 className="font-bold text-gray-900">İlk Baskı Kitaplar</h3>
                    <p className="text-sm text-gray-600">Yazarın ilk basımı, imzalı nüshalar, özel baskılar</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">📰</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Eski Dergi ve Gazeteler</h3>
                    <p className="text-sm text-gray-600">1950-80 arası dergiler, tarihi gazete arşivleri</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Akademik ve Bilimsel</h3>
                    <p className="text-sm text-gray-600">Eski tıp kitapları, bilimsel çalışmalar, tezler</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Yabancı Yayınlar</h3>
                    <p className="text-sm text-gray-600">Türkçe'ye çevrilmemiş eserler, orijinal dilde yayınlar</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nadir Kitap Nasıl Bulunur?</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">📚 Sahaf ve Antikacılar</h3>
                  <p className="text-gray-700 text-sm">
                    Beyazıt, Kadıköy gibi tarihi sahaf bölgeleri nadir kitaplar için hazine!
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🏛️ Üniversite Kütüphaneleri</h3>
                  <p className="text-gray-700 text-sm">
                    Akademik ve tarihi eserlere özel koleksiyonlardan erişebilirsiniz.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🌐 Online Platformlar</h3>
                  <p className="text-gray-700 text-sm">
                    SpotItForMe'de kitap tutkunları için spot oluşturun veya sahipleri bulun.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Kitap Spotları İçin İpuçları</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">✍️</span>
                  <p className="text-sm text-gray-700"><strong>Yazar ve Başlık:</strong> Tam adını, yazım şeklini belirtin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📅</span>
                  <p className="text-sm text-gray-700"><strong>Baskı Yılı:</strong> Hangi baskıyı aradığınızı yazın</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🏢</span>
                  <p className="text-sm text-gray-700"><strong>Yayınevi:</strong> Hangi yayınevi tarafından basıldığını ekleyin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📷</span>
                  <p className="text-sm text-gray-700"><strong>Kapak Görseli:</strong> İnternetten bulduğunuz kapak fotoğrafını paylaşın</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-6 border border-indigo-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Popüler Kategoriler</h3>
              <div className="space-y-2 text-sm">
                <Link href="/spots?category=edebiyat" className="block p-2 hover:bg-white rounded transition">
                  📖 Edebiyat Klasikleri
                </Link>
                <Link href="/spots?category=bilim" className="block p-2 hover:bg-white rounded transition">
                  🔬 Bilim ve Teknoloji
                </Link>
                <Link href="/spots?category=tarih" className="block p-2 hover:bg-white rounded transition">
                  🏛️ Tarih ve Felsefe
                </Link>
                <Link href="/spots?category=dergi" className="block p-2 hover:bg-white rounded transition">
                  📰 Dergi ve Gazete
                </Link>
              </div>
            </div>

            <div className="bg-indigo-600 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">Kitap Ara veya Sat</h3>
              <p className="text-sm opacity-90 mb-4">
                Aradığın nadir kitap için spot oluştur veya sahip olduğunu paylaş
              </p>
              <Link href="/create-spot" className="block text-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition mb-2">
                Spot Oluştur
              </Link>
              <Link href="/sightings" className="block text-center bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-800 transition">
                Kitaplarımı Paylaş
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Kitap Koleksiyonu</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>📚 <strong>850+</strong> nadir kitap spotu</p>
                <p>✅ <strong>%76</strong> başarıyla bulundu</p>
                <p>👥 <strong>2,400+</strong> kitap tutkunu</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

import Link from 'next/link'

export const metadata = {
  title: 'Üretimi Durmuş Ürünler - Eski Model Parçalar | SpotItForMe',
  description: 'Üretimi durmuş ürünler, eski model yedek parçalar ve artık piyasada bulunmayan eşyaları bul.'
}

export default function DiscontinuedProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container-custom py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">⚙️ Üretimi Durmuş Ürünler</h1>
            <p className="text-xl text-gray-600">Eski model parçalar ve üretimi durmuş ürünler</p>
          </div>
          <Link href="/spots?category=uretimi-durmus" className="bg-gray-700 text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-bold">
            İlgili Spotlar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Üretimi Durmuş Ürün Nedir?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Üretimi durmuş ürünler, artık fabrika tarafından üretilmeyen, piyasada bulunmayan ancak hala kullanılan 
                veya tamir edilmesi gereken eşyalar ve parçalardır. Bazen nostaljik değeri, bazen de işlevsel ihtiyaç nedeniyle aranırlar.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Yedek Parçalar</h3>
                    <p className="text-sm text-gray-600">Eski model beyaz eşya, elektronik cihaz, otomobil parçaları</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Teknoloji Ürünleri</h3>
                    <p className="text-sm text-gray-600">Eski telefon modelleri, vintage kamera, klasik oyun konsolları</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">👕</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Giyim ve Aksesuar</h3>
                    <p className="text-sm text-gray-600">Marka kapatılmış kıyafet markaları, eski sezon ürünler</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Hobiveİçerikler</h3>
                    <p className="text-sm text-gray-600">Eski nesil oyun kaset veya CD'leri, koleksiyon figürleri</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nereden Bulunur?</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🏪 İkinci El Pazarlar</h3>
                  <p className="text-gray-700 text-sm">
                    Bit pazarları, ikinci el dükkanları ve online ikinci el satış platformları ilk bakılacak yerlerdir.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🔍 Özel Koleksiyoncular</h3>
                  <p className="text-gray-700 text-sm">
                    Bazı koleksiyoncular eski model parçaları saklar. Forumlar ve koleksiyoncu gruplarında sorun.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🌐 SpotItForMe ile</h3>
                  <p className="text-gray-700 text-sm">
                    Spot oluşturun, belki evinde duran birini bulursunuz!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Spot Oluştururken Dikkat!</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">🏷️</span>
                  <p className="text-sm text-gray-700"><strong>Model ve Seri No:</strong> Ne kadar detay verirseniz o kadar iyi</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📸</span>
                  <p className="text-sm text-gray-700"><strong>Fotoğraf:</strong> Aradığınız parçanın internetten bulduğunuz görselini ekleyin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📅</span>
                  <p className="text-sm text-gray-700"><strong>Üretim Yılı:</strong> Yaklaşık hangi yılda üretildiğini belirtin</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">En Çok Aranan</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-white rounded">🔌 Eski beyaz eşya parçaları</div>
                <div className="p-2 bg-white rounded">📱 Vintage telefon modelleri</div>
                <div className="p-2 bg-white rounded">🚗 Klasik araba yedek parçaları</div>
                <div className="p-2 bg-white rounded">📷 Eski kamera lensleri</div>
              </div>
            </div>

            <div className="bg-gray-700 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">Eski Model Parça Ara</h3>
              <p className="text-sm opacity-90 mb-4">
                Aradığın yedek parça için spot oluştur
              </p>
              <Link href="/create-spot" className="block text-center bg-white text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
                Spot Oluştur
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">İpuçları</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Marka ve model no mutlaka yazın</li>
                <li>✓ Alternatif uyumlu parçaları belirtin</li>
                <li>✓ Fotoğraf ekleyin</li>
                <li>✓ Acil mi değil mi belirtin</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

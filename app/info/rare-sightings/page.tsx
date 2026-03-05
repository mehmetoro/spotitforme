import Link from 'next/link'

export const metadata = {
  title: 'Nadir Gördüm - Benzersiz Anları Paylaş | SpotItForMe',
  description: 'Nadir hayvan görüntüleri, eşsiz manzaralar, ender eşyalar, özel anlar ve daha fazlasını keşfet ve paylaş.'
}

export default function RareSightingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container-custom py-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">👁️ Nadir Gördüm</h1>
            <p className="text-xl text-gray-600">Benzersiz anları, nadir görüntüleri ve özel keşifleri paylaş</p>
          </div>
          <Link href="/sightings" className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-bold">
            Gördüklerimi Gör
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1 */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nadir Gördüm Nedir?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                "Nadir Gördüm", günlük hayatta nadiren karşılaştığımız, özel ve benzersiz anların paylaşıldığı platformumuzun özel bölümüdür. 
                Her gün göremediğiniz, size ilham veren veya şaşırtan her şeyi paylaşabilirsiniz:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-2xl">🦅</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Nadir Hayvan Görüntüleri</h3>
                    <p className="text-sm text-gray-600">Kurt, karaca, göçmen kuşlar gibi ender rastlanan vahşi hayvanlar</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🌅</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Eşsiz Manzaralar</h3>
                    <p className="text-sm text-gray-600">Gökkuşağı, çifte gün batımı, nadir doğa olayları</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🏺</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Antika ve Ender Eşyalar</h3>
                    <p className="text-sm text-gray-600">Bit pazarında bulduğunuz tarihi nesneler, eski koleksiyonlar</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Nadir Yemekler ve Lezzetler</h3>
                    <p className="text-sm text-gray-600">Sadece bir yörede yapılan geleneksel tatlar, unutulan tarifler</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Nadir Kitaplar & Baskılar</h3>
                    <p className="text-sm text-gray-600">İlk baskı kitaplar, eski dergiler, koleksiyon değerindeki yayınlar</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Özel Anlar</h3>
                    <p className="text-sm text-gray-600">Tesadüfi karşılaşmalar, beklenmedik olaylar, benzersiz deneyimler</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nasıl Nadir Gördüm Paylaşırım?</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">1. Fotoğrafınızı Çekin</h3>
                  <p className="text-gray-700">
                    Karşılaştığınız nadir anı, nesneyi veya görüntüyü net bir şekilde fotoğraflayın. 
                    Birden fazla açıdan çekmek detayları göstermek için faydalıdır.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">2. Konumu Belirtin</h3>
                  <p className="text-gray-700">
                    Nerede bulduğunuzu paylaşın. Bu, başkalarının da benzer deneyimler yaşamasına yardımcı olur.
                    GPS konumu eklemek isteğe bağlıdır.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">3. Hikayenizi Anlatın</h3>
                  <p className="text-gray-700">
                    Nasıl keşfettiniz? Ne kadar nadir? Neden özel? Detaylı açıklama eklemek 
                    paylaşımınızı daha değerli kılar.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">4. Kategori ve Etiketler</h3>
                  <p className="text-gray-700">
                    Paylaşımınızı doğru kategoriye ekleyin (hayvan, manzara, eşya vb.) ve 
                    hashtag'ler kullanarak keşfedilebilir hale getirin.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Paylaşım İpuçları</h2>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Kaliteli Fotoğraflar</h3>
                    <p className="text-sm text-gray-700">İyi aydınlatma ve net odaklama önemli. Detayları gösterebilmek için yakın plan çekimler yapın.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Detaylı Açıklama</h3>
                    <p className="text-sm text-gray-700">Ne zaman, nerede, nasıl bulduğunuz hikayesi paylaşımınızı daha ilgi çekici yapar.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Doğru Etiketleme</h3>
                    <p className="text-sm text-gray-700">Hashtag'ler ve kategori seçimi başkalarının paylaşımınızı bulmasını kolaylaştırır.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl p-6 border border-purple-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Neden Nadir Gördüm?</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="text-xl">📸</span>
                  <p className="text-sm text-gray-700"><strong>İlham Verici</strong> - Başkalarının keşiflerinden ilham al</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xl">🏆</span>
                  <p className="text-sm text-gray-700"><strong>Rozet & Puanlar</strong> - Nadir paylaşımlar için özel ödüller kazan</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xl">🌍</span>
                  <p className="text-sm text-gray-700"><strong>Harita Görünümü</strong> - Paylaşımları haritada keşfet</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xl">👥</span>
                  <p className="text-sm text-gray-700"><strong>Topluluk</strong> - Benzer ilgi alanlarına sahip kişilerle bağlantı kur</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-purple-600 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">İlk Paylaşımını Yap!</h3>
              <p className="text-sm opacity-90 mb-4">
                Sen de nadir bir şey mi gördün? Hemen paylaş!
              </p>
              <Link href="/sightings" className="block text-center bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
                Paylaşımları Gözat
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Topluluk İstatistikleri</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Paylaşım</span>
                  <span className="font-bold">15,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bu Ay</span>
                  <span className="font-bold">1,284</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aktif Kullanıcı</span>
                  <span className="font-bold">8,532</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

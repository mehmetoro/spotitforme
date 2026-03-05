import Link from 'next/link'

export const metadata = {
  title: 'Spot Oluştur - Aradığını Buldurmak İçin | SpotItForMe',
  description: 'Bulamadığınız bir ürün mü var? Topluluk için spot oluşturun, başkaları sizin için aranan ürünü bulsun.'
}

export default function CreateSpotsPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container-custom py-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🎯 Spot Oluştur</h1>
            <p className="text-xl text-gray-600">Bulamadığın ürünü topluluğa duyur, o sana bulsun</p>
          </div>
          <Link href="/create-spot" className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 font-bold">
            Hemen Spot Oluştur
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1 */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Spot Nedir?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Spot, bulamadığınız ve başkalarının sizin için bulmasını istediğiniz bir ürün, eşya veya varlıktır. 
                Topluluğa ilan ediyorsunuz: "Ben bunu arıyorum, kim bulursa bana haber versin!"
              </p>
              <div className="space-y-3 mt-6">
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <h3 className="font-bold text-orange-600 mb-2">🏺 Antika Eşyalar</h3>
                  <p className="text-gray-700 text-sm">
                    "1970'ler dönemi Ankara Devlet Tiyatrosu afişleri" - Koleksiyoncular için nadir materyaller
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <h3 className="font-bold text-orange-600 mb-2">🛍️ Üretimi Durmuş Ürünler</h3>
                  <p className="text-gray-700 text-sm">
                    "Arçelik 2005 model buzdolabı kapak kolonu" - Eski modellerin yedek parçası
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <h3 className="font-bold text-orange-600 mb-2">🌍 Bölgesel Ürünler</h3>
                  <p className="text-gray-700 text-sm">
                    "Antep'te sadece Şahinbey ilçesinde satılan el yapımı baklava" - Sadece bir yerde üretilen özel lezzetler
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <h3 className="font-bold text-orange-600 mb-2">💼 İnternette Bulunmayan</h3>
                  <p className="text-gray-700 text-sm">
                    "Lokal tasarımcıdan özel üretim deri çanta" - E-ticarette yer almayan yerel ürünler
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <h3 className="font-bold text-orange-600 mb-2">🔧 Yedek Parça ve Aksesuarlar</h3>
                  <p className="text-gray-700 text-sm">
                    "2010 model Canon kamera lens kapağı" - Eski cihazların parçaları
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Adım Adım: Spot Oluşturma</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">1. Ürün Detaylarını Belirle</h3>
                  <p className="text-gray-700">
                    Ne arıyorsunuz? Marka, model, renk, boyut gibi detayları ekleyin. Ne kadar spesifik olursanız, 
                    başkalarının bulma şansı o kadar artar.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">2. Neden Arıyorsunuz?</h3>
                  <p className="text-gray-700">
                    Hikayenizi paylaşın. Bu ürün neden önemli? Nereden bulursa kabul edilir mi yoksa spesifik bir yer mi? 
                    İyi bir açıklama insanları motive eder.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">3. Fotoğraf Ekleyin</h3>
                  <p className="text-gray-700">
                    Aradığınız ürünün örnek fotoğrafını ekleyin. İnternetten bulduğunuz benzer ürün resmi veya 
                    eski fotoğrafınız olabilir. Görsel önemli!
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">4. Konum & Bütçe (İsteğe Bağlı)</h3>
                  <p className="text-gray-700">
                    Hangi şehirde/bölgede arıyorsunuz? Bütçeniz ne kadar? Bu bilgiler bulanların size daha verimli 
                    yardımcı olmasını sağlar.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">5. Ödül Belirle (İsteğe Bağlı)</h3>
                  <p className="text-gray-700">
                    Bulan kişiye teşekkür olarak ne sunacaksınız? Puan, sembolik para veya hediye olabilir. 
                    Cazip ödüller daha fazla ilgi çeker!
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İyi Bir Spot Oluşturma İpuçları</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="text-3xl">✨</span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Detaylı ve Net Olun</h3>
                    <p className="text-gray-700 text-sm">
                      "Bir ayakkabı arıyorum" yerine "Nike Air Max 90 model, 42 numara, mavi-beyaz renk" gibi spesifik olun.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl">📸</span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Görsel Kullanın</h3>
                    <p className="text-gray-700 text-sm">
                      İnternetten örnek ürün fotoğrafı, eski katalog görüntüsü veya başka yerden bulduğunuz benzer ürün resmi ekleyin.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Gerçekçi Beklentiler</h3>
                    <p className="text-gray-700 text-sm">
                      "Her yerde bulunabilen" ürünler yerine gerçekten zor bulunan, nadir veya özel ürünler için spot açın.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl">💬</span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Hikayenizi Anlatın</h3>
                    <p className="text-gray-700 text-sm">
                      "Babamın 30 yıllık radyosunun parçasını arıyorum, çok duygusal değeri var" gibi hikayeler insanları motive eder.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Spot Oluşturduktan Sonra</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">👀</span>
                  <div>
                    <p className="text-gray-700">Spotunuzu <strong>takip edin</strong> ve gelen bildirimleri kontrol edin</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="text-gray-700">Sorulan <strong>sorulara cevap verin</strong>, detay isteyen olursa açıklayın</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="text-gray-700">Birisi bulursa <strong>onaylayın ve teşekkür edin</strong></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🔄</span>
                  <div>
                    <p className="text-gray-700">Gerekirse spotu <strong>güncelleyin</strong> veya yeni bilgi ekleyin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-6 border border-orange-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Hızlı Başlangıç</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>1.</strong> Aradığınız ürünü tanımlayın
                </p>
                <p className="text-gray-700">
                  <strong>2.</strong> Detayları ve fotoğraf ekleyin
                </p>
                <p className="text-gray-700">
                  <strong>3.</strong> Neden aradığınızı açıklayın
                </p>
                <p className="text-gray-700">
                  <strong>4.</strong> Konum ve bütçe belirtin
                </p>
                <p className="text-gray-700">
                  <strong>5.</strong> Yayınlayın ve bekleyin!
                </p>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">En İyi Uygulamalar</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex gap-2">
                  <span>✅</span>
                  <p>Spesifik detaylar ekleyin</p>
                </div>
                <div className="flex gap-2">
                  <span>✅</span>
                  <p>Kaliteli görsel kullanın</p>
                </div>
                <div className="flex gap-2">
                  <span>✅</span>
                  <p>Hikayenizi paylaşın</p>
                </div>
                <div className="flex gap-2">
                  <span>✅</span>
                  <p>Gerçekçi ödül belirleyin</p>
                </div>
                <div className="flex gap-2">
                  <span>❌</span>
                  <p>Çok genel tanımlama yapmayın</p>
                </div>
                <div className="flex gap-2">
                  <span>❌</span>
                  <p>Fotoğrafsız spot açmayın</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">Hemen Başla!</h3>
              <p className="text-sm opacity-90 mb-4">
                İlk spotunu oluştur, topluluk sana yardım etsin
              </p>
              <Link href="/create-spot" className="block text-center bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
                Spot Oluştur
              </Link>
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Topluluk İstatistikleri</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Spot</span>
                  <span className="font-bold">4,287</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bu Ay Oluşturulan</span>
                  <span className="font-bold">312</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Başarıyla Bulunan</span>
                  <span className="font-bold">%73</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

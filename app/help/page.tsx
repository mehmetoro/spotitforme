import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Yardım - SpotItForMe',
  description: 'SpotItForMe hakkında sık sorulan sorular ve yardım rehberi.',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Yardım & SSS
          </h1>
          <p className="text-xl text-gray-600">
            SpotItForMe hakkında bilmeniz gereken her şey
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Nasıl Çalışır */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📖 Nasıl Çalışır?</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                SpotItForMe, aradığınız ürün, kişi veya şeyi bulmanız için 50.000+'den oluşan geniş bir topluluğu 
                kullanır. Aşağıdaki adımları izleyin:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li><strong>Spot Oluştur:</strong> Aradığınız şeyi detaylı bir şekilde açıklayın</li>
                <li><strong>Topluluğu Billendir:</strong> Binlerce kişi aradığınız şeyi görecektir</li>
                <li><strong>Yardım Edin:</strong> Başkaları aradığında sizin de yardımcı olun</li>
                <li><strong>Bulun!</strong> Ortalama 3-4 günde aradığınızı bulabilirsiniz</li>
              </ol>
            </div>
          </div>

          {/* Spot Oluşturma */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Nasıl Spot Oluştururum?</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Spot oluşturmak çok kolay!</strong> Sadece şu adımları takip edin:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Aradığınız şeyin adını yazın</li>
                <li>Kategori seçin (Elektronik, Mobilya, Kişi, vb.)</li>
                <li>Detaylı açıklama yapın (marka, model, renk, durum, vb.)</li>
                <li>Eğer varsa fotoğraf ekleyin</li>
                <li>Bulunabileceği lokasyonları belirtin</li>
                <li>Spot oluştur!</li>
              </ul>
              <p className="mt-4 text-blue-600 font-semibold">
                Ne kadar detay verirseniz, o kadar hızlı bulursunuz!
              </p>
            </div>
          </div>

          {/* Başkalarına Yardım */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🤝 Başkalarına Nasıl Yardım Ederim?</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Başkalarının aradığı şeyleri bulun ve yardım edin:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Hobi alanınızda bilgi sahibi misiniz? Yardımcı olabilirsiniz</li>
                <li>Aydınlattığınız spotları göz atın</li>
                <li>Bulduğunuz şeyler hakkında yorum yapın</li>
                <li>Bilgi sahibi iseniz satıcı hakkında tavsiye verin</li>
                <li>Diğer kullanıcılara hediye etmeyi düşünebilirsiniz</li>
              </ul>
            </div>
          </div>

          {/* Güvenlik */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔒 Güvenlik & Gizlilik</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Sizin güvenliğiniz bizim önceliğimiz:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Doğrulama:</strong> Tüm hesaplar doğrulanır</li>
                <li><strong>Kişisel Bilgiler:</strong> Asla üçüncü tarafa paylaşılmaz</li>
                <li><strong>Moderasyon:</strong> Uygunsuz içeriği hemen kaldırırız</li>
                <li><strong>Şifre:</strong> Güvenli şifreleme kullanırız</li>
                <li><strong>Bildirim:</strong> İstenmeyen bildirimleri kapatabilirsiniz</li>
              </ul>
            </div>
          </div>

          {/* Sık Sorulan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-yellow-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ Sık Sorulan Sorular</h2>
            <div className="space-y-6">
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Her yaş için uygun mu?</h3>
                <p className="text-gray-700">
                  SpotItForMe 13+ için tasarlanmıştır. Daha küçük çocuklar ebeveyn gözetimi altında 
                  kullanabilirler.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Ücret alıyor musunuz?</h3>
                <p className="text-gray-700">
                  Hayır! SpotItForMe tamamen ücretsiz. Spot oluşturmak, arama 
                  yapmak ve yardım etmek hepsi bedava.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Kaç fakerson var?</h3>
                <p className="text-gray-700">
                  Şu anda 50.000+ aktif kullanıcımız var ve her gün yenileniyoruz. 
                  Komunita ne kadar büyürse, bulma şansınız o kadar artar!
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Satış yapabilir miyim?</h3>
                <p className="text-gray-700">
                  SpotItForMe satış platformu değil, bulma platformudur. Bulduğunuz 
                  kişiyle doğrudan iletişim kurup anlaşabilirsiniz.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Hiç sonuç alamazsam?</h3>
                <p className="text-gray-700">
                  Çoğu spot 3-4 günde bulunur ama bazıları daha uzun sürebilir. 
                  Eğer bulunamazsa, spotunuzu yeniden oluşturabilir veya komunitye soru sorabilirsiniz.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Hesabımı silmek istiyorum</h3>
                <p className="text-gray-700">
                  Ayarlar → Hesap → Hesabı Sil'e tıklayabilirsiniz. Tüm verileriniz silinecektir.
                </p>
              </div>

            </div>
          </div>

          {/* İletişim */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📞 Bize Ulaşın</h2>
            <p className="text-gray-700 mb-4">
              Sorunuz mu var? Bize yazabilirsiniz:
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Email:</strong> 
                <a href="mailto:help@spotitforme.com" className="text-blue-600 hover:underline"> help@spotitforme.com</a>
              </li>
              <li>
                <strong>Sosyal Medya:</strong> 
                <a href="https://instagram.com/spotitforme" className="text-blue-600 hover:underline">@spotitforme</a>
              </li>
            </ul>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Hazır başlamaya? Hemen bir spot oluştur!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/create-spot"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Spot Oluştur
            </Link>
            <Link
              href="/spots"
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Başkalarına Yardım Et
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

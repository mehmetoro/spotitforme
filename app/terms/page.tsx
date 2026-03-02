// app/terms/page.tsx
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              SpotItForMe Kullanım Koşulları
            </h1>
            <p className="text-gray-600">
              Son güncellenme: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Kabul ve Değişiklikler</h2>
              <p className="text-gray-700 mb-4">
                SpotItForMe platformunu ("Platform") kullanarak bu Kullanım Koşullarını kabul etmiş sayılırsınız. 
                Platform sahibi, koşulları herhangi bir zamanda değiştirme hakkını saklı tutar.
              </p>
              <p className="text-gray-700">
                Değişiklikler Platform üzerinden duyurulacak olup, değişikliklerden sonra Platformu 
                kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hizmet Tanımı</h2>
              <p className="text-gray-700 mb-4">
                SpotItForMe, kullanıcıların bulmakta zorlandığı ürünleri ("Spot") topluluk gücüyle 
                bulmalarını sağlayan bir platformdur. Hizmetler şunları içerir:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Spot oluşturma ve yayınlama</li>
                <li>Spot'lara yardım etme ("Ben gördüm" bildirimi)</li>
                <li>Kullanıcı profili oluşturma</li>
                <li>Mağaza profili oluşturma (işletmeler için)</li>
                <li>Spot'ları filtreleme ve arama</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Kullanıcı Yükümlülükleri</h2>
              <p className="text-gray-700 mb-4">
                Platformu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Doğru, güncel ve eksiksiz bilgi sağlamak</li>
                <li>Yasadışı, hakaret içeren veya spam içerik paylaşmamak</li>
                <li>Başkalarının gizlilik haklarına saygı göstermek</li>
                <li>Platformun güvenliğini tehlikeye atmamak</li>
                <li>Telif hakkı ihlali yapmamak</li>
                <li>Yanıltıcı veya aldatıcı bilgi paylaşmamak</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. İçerik ve Fikri Mülkiyet</h2>
              <p className="text-gray-700 mb-4">
                Platforma yüklediğiniz içeriklerin (fotoğraflar, açıklamalar, yorumlar) size ait olduğunu 
                veya yayınlama hakkınız bulunduğunu garanti edersiniz.
              </p>
              <p className="text-gray-700 mb-4">
                SpotItForMe logosu, tasarımı ve yazılımı Platform sahibine aittir. İzinsiz kullanılamaz.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Mağaza Hesapları</h2>
              <p className="text-gray-700 mb-4">
                İşletme sahipleri mağaza hesabı açabilir. Mağaza hesapları için ek kurallar:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Gerçek ve doğru işletme bilgileri sağlamak</li>
                <li>Ticari faaliyetlere uygun içerik paylaşmak</li>
                <li>Müşteri şikayetlerine zamanında cevap vermek</li>
                <li>Fiyat ve stok bilgilerini güncel tutmak</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Ücretler ve Ödemeler</h2>
              <p className="text-gray-700 mb-4">
                Şu anda Platform tüm kullanıcılar için ücretsizdir. İleride eklenebilecek premium 
                özellikler için ayrı ücret politikaları duyurulacaktır.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sorumluluk Reddi</h2>
              <p className="text-gray-700 mb-4">
                SpotItForMe, kullanıcılar arasındaki iletişimden, satış işlemlerinden veya 
                anlaşmazlıklardan sorumlu değildir. Platform bir aracı platformdur.
              </p>
              <p className="text-gray-700">
                Kullanıcılar kendi güvenliklerinden sorumludur. Yüz yüze buluşmalarda dikkatli olunması 
                ve güvenli yerler tercih edilmesi önerilir.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Hesap Askıya Alma ve Sonlandırma</h2>
              <p className="text-gray-700 mb-4">
                Aşağıdaki durumlarda hesabınız askıya alınabilir veya sonlandırılabilir:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Koşulları ihlal ettiğiniz tespit edilirse</li>
                <li>Yasadışı faaliyetlerde bulunursanız</li>
                <li>Diğer kullanıcıları rahatsız ederseniz</li>
                <li>Sistemi kötüye kullanırsanız</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Gizlilik</h2>
              <p className="text-gray-700 mb-4">
                Kişisel verileriniz <Link href="/privacy" className="text-blue-600 hover:text-blue-800">Gizlilik Politikamız</Link> 
                uyarınca korunur ve işlenir.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. İletişim</h2>
              <p className="text-gray-700">
                Kullanım Koşulları ile ilgili sorularınız için:{" "}
                <a href="mailto:spotitformeweb@gmail.com" className="text-blue-600 hover:text-blue-800">
                  spotitformeweb@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-10 pt-6 border-t">
            <Link
              href="/for-business"
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-lg"
            >
              ← Geri Dön
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
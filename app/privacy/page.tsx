// app/privacy/page.tsx
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              SpotItForMe Gizlilik Politikası
            </h1>
            <p className="text-gray-600">
              Son güncellenme: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Giriş</h2>
              <p className="text-gray-700">
                SpotItForMe ("Platform") olarak, gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, 
                kişisel verilerinizin nasıl toplandığını, kullanıldığını, korunduğunu ve paylaşıldığını açıklar.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Toplanan Veriler</h2>
              <p className="text-gray-700 mb-4">Platformu kullanırken şu verileri topluyoruz:</p>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">2.1. Doğrudan Sağladığınız Veriler:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Ad, soyad (isteğe bağlı)</li>
                <li>Email adresi</li>
                <li>Telefon numarası (mağaza hesapları için)</li>
                <li>İşletme bilgileri (mağaza hesapları için)</li>
                <li>Profil fotoğrafı (isteğe bağlı)</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">2.2. Otomatik Toplanan Veriler:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>IP adresi ve konum bilgisi</li>
                <li>Cihaz bilgileri (tarayıcı türü, işletim sistemi)</li>
                <li>Kullanım verileri (ziyaret edilen sayfalar, tıklamalar)</li>
                <li>Çerezler (Cookies)</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">2.3. Kullanıcı İçeriği:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Oluşturduğunuz spot'lar</li>
                <li>Yüklediğiniz fotoğraflar</li>
                <li>Yaptığınız yorumlar ve yardımlar</li>
                <li>Mağaza açıklamaları</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Veri Kullanım Amaçları</h2>
              <p className="text-gray-700 mb-4">Topladığımız verileri şu amaçlarla kullanıyoruz:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Platform hizmetlerini sağlamak ve iyileştirmek</li>
                <li>Hesap güvenliğini sağlamak</li>
                <li>Kullanıcı deneyimini kişiselleştirmek</li>
                <li>Spot ve yardım bildirimleri göndermek</li>
                <li>Teknik sorunları çözmek</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
                <li>Platform istatistikleri oluşturmak (anonim)</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Veri Paylaşımı</h2>
              <p className="text-gray-700 mb-4">Verilerinizi aşağıdaki durumlarda paylaşabiliriz:</p>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">4.1. Diğer Kullanıcılarla:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Spot oluşturduğunuzda: Kullanıcı adınız ve spot içeriğiniz</li>
                <li>Mağaza hesabınızda: İşletme bilgileriniz ve iletişim detayları</li>
                <li>Yardım ettiğinizde: Kullanıcı adınız ve yardım içeriğiniz</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">4.2. Üçüncü Taraflarla:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Yasal zorunluluklar gereği</li>
                <li>Hizmet sağlayıcılarımız (hosting, email, analiz)</li>
                <li>Platform satışı veya devri durumunda</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Çerezler (Cookies)</h2>
              <p className="text-gray-700 mb-4">
                Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanır. Çerez türleri:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Zorunlu Çerezler:</strong> Platformun çalışması için gerekli</li>
                <li><strong>Performans Çerezleri:</strong> Kullanım istatistikleri için</li>
                <li><strong>İşlevsellik Çerezleri:</strong> Tercihlerinizi hatırlamak için</li>
              </ul>
              <p className="text-gray-700">
                Tarayıcı ayarlarınızdan çerezleri kontrol edebilirsiniz, ancak bu Platform deneyiminizi etkileyebilir.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Veri Güvenliği</h2>
              <p className="text-gray-700 mb-4">
                Verilerinizi korumak için uygun teknik ve organizasyonel önlemler alıyoruz:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Veri şifreleme (SSL/TLS)</li>
                <li>Güvenli sunucular</li>
                <li>Erişim kontrolleri</li>
                <li>Düzenli güvenlik denetimleri</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Veri Saklama Süresi</h2>
              <p className="text-gray-700 mb-4">
                Verilerinizi, hizmet sağlamak için gerekli olduğu sürece saklıyoruz. Hesabınızı sildiğinizde:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Kişisel bilgileriniz silinir</li>
                <li>Oluşturduğunuz spot'lar anonim hale getirilir</li>
                <li>Yasal saklama yükümlülüğü olan veriler saklanmaya devam eder</li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. KVKK Haklarınız</h2>
              <p className="text-gray-700 mb-4">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında sahip olduğunuz haklar:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Eksik veya yanlış verilerin düzeltilmesini isteme</li>
                <li>Verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>İşlenen verilerin aktarılabileceği kişileri bildirme</li>
                <li>İtiraz etme</li>
              </ul>
              <p className="text-gray-700">
                Haklarınızı kullanmak için:{" "}
                <a href="mailto:spotitformeweb@gmail.com" className="text-blue-600 hover:text-blue-800">
                  spotitformeweb@gmail.com
                </a>
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Çocukların Gizliliği</h2>
              <p className="text-gray-700">
                Platform 18 yaşından küçüklerin kullanımına yönelik değildir. Bilmeden çocuklardan veri 
                topladığımızı fark edersek, bu verileri derhal sileriz.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Değişiklikler ve İletişim</h2>
              <p className="text-gray-700 mb-4">
                Bu Gizlilik Politikasını güncelleyebiliriz. Değişiklikler Platform üzerinden duyurulacaktır.
              </p>
              <p className="text-gray-700">
                Gizlilik ile ilgili sorularınız için:{" "}
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


export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header layouttan gelmektedir */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-yellow-700 mb-6">Sıkça Sorulan Sorular</h1>
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-2">SpotItForMe nedir?</h2>
              <p className="text-gray-700">SpotItForMe, topluluk gücüyle aradığınız ürün, kişi veya nesneyi bulmanızı sağlayan bir platformdur.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-2">Spot nasıl oluşturulur?</h2>
              <p className="text-gray-700">Ana sayfadaki "Spot Oluştur" butonuna tıklayarak, aradığınız şeyi detaylıca açıklayarak spot oluşturabilirsiniz.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-2">Yardım nasıl yapılır?</h2>
              <p className="text-gray-700">Bir spotu gördüyseniz veya bilgi sahibiyseniz, ilgili spotun sayfasında "Yardım Et" butonunu kullanarak yardımda bulunabilirsiniz.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-2">Mağaza nasıl açılır?</h2>
              <p className="text-gray-700">İşletmeniz için mağaza açmak için "İşletme Kaydı" sayfasını ziyaret edin ve formu doldurun.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-2">Premium paketler ücretli mi?</h2>
              <p className="text-gray-700">Şu anda tüm mağazalar ücretsizdir. Premium paketler çok yakında aktif olacak ve yıllık 10 USD olacak.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-2">Hesabımı nasıl silebilirim?</h2>
              <p className="text-gray-700">Ayarlar sayfasından hesabınızı kalıcı olarak silebilirsiniz. Tüm verileriniz silinir.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-2">Gizlilik ve güvenlik nasıl sağlanıyor?</h2>
              <p className="text-gray-700">Tüm verileriniz gizli tutulur ve asla üçüncü kişilerle paylaşılmaz. Güvenliğiniz için gelişmiş şifreleme ve moderasyon uygulanır.</p>
            </div>
          </div>
        </div>
      </main>
      {/* Footer layouttan gelmektedir */}
    </div>
  )
}

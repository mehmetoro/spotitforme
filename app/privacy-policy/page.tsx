

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header layouttan gelmektedir */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-700 mb-6">Gizlilik Politikası</h1>
          <p className="text-gray-700 mb-8 text-center">SpotItForMe olarak gizliliğinize önem veriyoruz. Kişisel verilerinizin korunması ve güvenliği için aşağıdaki ilkelere uyarız.</p>
          <div className="space-y-6 text-gray-700">
            <div>
              <h2 className="text-xl font-bold mb-2">1. Toplanan Veriler</h2>
              <ul className="list-disc pl-6">
                <li>Ad, email, telefon (isteğe bağlı)</li>
                <li>Kullanıcı tarafından yüklenen içerikler</li>
                <li>IP adresi, cihaz ve kullanım bilgileri</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">2. Veri Kullanımı</h2>
              <ul className="list-disc pl-6">
                <li>Hizmet sunmak ve geliştirmek</li>
                <li>Kullanıcı güvenliğini sağlamak</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">3. Veri Paylaşımı</h2>
              <ul className="list-disc pl-6">
                <li>Yasal zorunluluklar dışında üçüncü kişilerle paylaşılmaz</li>
                <li>Hizmet sağlayıcılarla sadece gerekli ölçüde paylaşılır</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">4. Güvenlik</h2>
              <ul className="list-disc pl-6">
                <li>Veriler şifreli ve güvenli sunucularda saklanır</li>
                <li>Düzenli güvenlik kontrolleri yapılır</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">5. Haklarınız</h2>
              <ul className="list-disc pl-6">
                <li>Verilerinize erişme, düzeltme ve silme hakkınız vardır</li>
                <li>Gizlilik ile ilgili sorularınız için <a href="mailto:help@spotitforme.com" className="text-blue-600 underline">help@spotitforme.com</a> adresine ulaşabilirsiniz</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">6. Değişiklikler</h2>
              <p>Gizlilik politikası güncellenirse bu sayfadan duyurulur.</p>
            </div>
          </div>
        </div>
      </main>
      {/* Footer layouttan gelmektedir */}
    </div>
  )
}



export default function PremiumPackagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header layouttan gelmektedir */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-yellow-700 mb-6">Premium Paketler</h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            Mağazanız için daha fazla ürün eklemek ve gelişmiş özelliklere erişmek için premium paketleri inceleyin. Ücretsiz mağaza ile başlayabilir, ihtiyacınıza göre yükseltebilirsiniz.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">Ücretsiz Mağaza</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1 text-left">
                <li>20 ürün ekleme limiti</li>
                <li>Temel mağaza yönetimi</li>
                <li>Toplulukta görünürlük</li>
                <li>0 TL / ay</li>
              </ul>
              <span className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold">Aktif</span>
            </div>
            <div className="bg-yellow-100 border-2 border-yellow-500 rounded-xl p-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-yellow-900 mb-2">Premium Mağaza</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1 text-left">
                <li>100 ürün ekleme limiti</li>
                <li>Gelişmiş istatistikler</li>
                <li>Öne çıkarılmış mağaza</li>
                <li>Özel destek</li>
                <li>10 USD / yıl</li>
              </ul>
              <span className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">Çok Yakında</span>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl text-yellow-900 text-center">
            <p className="font-semibold">Premium paketler çok yakında aktif olacak! Şu anda tüm mağazalar ücretsiz olarak kullanılabilir. Yakında daha fazla özellik ve avantaj için premium paketlere geçiş yapabileceksiniz.</p>
          </div>
        </div>
      </main>
      {/* Footer layouttan gelmektedir */}
    </div>
  )
}

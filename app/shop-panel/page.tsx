

export default function ShopPanelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header layouttan gelmektedir */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-purple-700 mb-6">Mağaza Paneli</h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            Mağazanı yönet, ürün ekle, siparişleri ve istatistikleri görüntüle. Tüm mağaza işlemlerini tek panelden kolayca yönetebilirsin.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Ürün Yönetimi</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Yeni ürün ekle</li>
                <li>Mevcut ürünleri düzenle</li>
                <li>Stok ve fiyat güncelle</li>
              </ul>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Siparişler</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Gelen siparişleri görüntüle</li>
                <li>Sipariş durumunu güncelle</li>
                <li>Müşteri ile iletişim kur</li>
              </ul>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">İstatistikler</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Satış ve görüntülenme raporları</li>
                <li>En çok satan ürünler</li>
                <li>Mağaza puanı ve yorumlar</li>
              </ul>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Ayarlar</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Mağaza bilgilerini güncelle</li>
                <li>Adres ve iletişim ayarları</li>
                <li>Abonelik ve paketler</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="/for-business" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">
              İşletme Kaydı / Bilgileri
            </a>
          </div>
        </div>
      </main>
      {/* Footer layouttan gelmektedir */}
    </div>
  )
}

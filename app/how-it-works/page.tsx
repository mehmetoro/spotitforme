

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header layouttan gelmektedir */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-blue-700 mb-6">Nasıl Çalışır?</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">A. Spot Yayınlamanın Amacı ve İşleyişi</h2>
              <p className="text-gray-700 mb-2">Aradığınız ürün, kişi veya nesneyi topluluğa duyurmak için spot oluşturursunuz. Spotlar, topluluğun dikkatine sunulur ve aradığınız şeyin bulunma şansını artırır.</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Detaylı açıklama ve görsel ekleyin</li>
                <li>Kategori ve konum belirtin</li>
                <li>Topluluk üyeleri spotunuzu görür ve yardımcı olur</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">B. Sosyal Paylaşımın Amacı ve İşleyişi</h2>
              <p className="text-gray-700 mb-2">Gördüğünüz ilginç, faydalı veya ilham verici şeyleri toplulukla paylaşmak için sosyal paylaşım yaparsınız. Bu paylaşımlar, başkalarına ilham verir ve topluluk etkileşimini artırır.</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Fotoğraf, hikaye veya öneri paylaşın</li>
                <li>Beğeni ve yorum alın</li>
                <li>Müze seçeneğiyle kalıcı paylaşımlar oluşturun</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">C. Spota Cevaben Yardım Paylaşımı</h2>
              <p className="text-gray-700 mb-2">Bir spota doğrudan "Ben gördüm" veya "Bende var" diyerek yardım paylaşımı yapabilirsiniz. Bu, arayan kişiye doğrudan yardımcı olmanızı sağlar.</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Konum, fiyat, detay ve not ekleyin</li>
                <li>Spot sahibine bildirim gider</li>
                <li>Yardım amaçlı veya ticaret amaçlı olabilir</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">D. Spota Cevap Olmayan Yardım Paylaşımı</h2>
              <p className="text-gray-700 mb-2">Genel yardım paylaşımı ile topluluğa faydalı bilgiler sunabilirsiniz. Bu paylaşımlar, doğrudan bir spota bağlı olmayabilir.</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Genel bilgi, ipucu veya öneri paylaşın</li>
                <li>Topluluğun tamamı faydalanır</li>
                <li>Yardım veya ticaret amaçlı olabilir</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">E. Koleksiyon Paylaşımı</h2>
              <p className="text-gray-700 mb-2">Koleksiyonunuza ait nadir veya özel parçaları paylaşarak diğer koleksiyoncularla iletişim kurabilir, takas veya satış yapabilirsiniz.</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Parça detaylarını ve hikayesini anlatın</li>
                <li>İlgilenenlerle iletişime geçin</li>
                <li>Takas, satış veya yardım amaçlı paylaşım yapın</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">F. Müze Seçenekli Sosyal Paylaşım</h2>
              <p className="text-gray-700 mb-2">Sosyal paylaşımlarınızı müze seçeneğiyle kalıcı hale getirebilir, topluluğun arşivine katkı sağlayabilirsiniz.</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Paylaşımınızı müze olarak işaretleyin</li>
                <li>Topluluk arşivinde kalıcı olarak yer alın</li>
                <li>İlham verici içerikler oluşturun</li>
              </ul>
            </section>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-xl text-blue-900 text-center mt-10">
            <p className="font-semibold">Tüm paylaşımlar hem yardım hem de ticaret amaçlı yapılabilir. Topluluk kurallarına uygun hareket etmeyi unutmayın!</p>
          </div>
        </div>
      </main>
      {/* Footer layouttan gelmektedir */}
    </div>
  )
}

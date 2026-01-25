export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-white py-16 md:py-24">
      <div className="container-custom text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Bulunması zor ürünleri{' '}
          <span className="text-blue-600">toplulukla bulun</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Bir şey mi arıyorsunuz? Dünyanın dört bir yanındaki kullanıcılar 
          sizin için göz kulak olsun. Vintage, nadir, eski model ürünler için 
          topluluğumuzdan yardım alın.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-white rounded-xl shadow-lg p-2 flex">
            <input
              type="text"
              placeholder="Ne aramıştınız? Örnek: 'vintage kamera lensi', 'eski çay makinesi parçası'"
              className="flex-grow px-6 py-4 text-lg border-0 focus:ring-0 focus:outline-none rounded-l-xl"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition duration-200">
              Ara
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Popüler aramalar:{' '}
            <button className="ml-2 text-blue-600 hover:underline">vintage saat</button>
            <button className="ml-4 text-blue-600 hover:underline">retro oyun</button>
            <button className="ml-4 text-blue-600 hover:underline">yedek parça</button>
            <button className="ml-4 text-blue-600 hover:underline">antika mobilya</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Aktif Spot</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">2K+</div>
            <div className="text-gray-600">Topluluk Üyesi</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">150+</div>
            <div className="text-gray-600">Başarı Hikayesi</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-gray-600">Şehir</div>
          </div>
        </div>
      </div>
    </section>
  )
}
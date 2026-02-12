export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Spot Oluştur',
      description: 'Aradığınız ürünün fotoğrafını ekleyin, detayları yazın',
      icon: '📝',
      color: 'bg-blue-100 text-blue-600',
      features: ['Ücretsiz', '2 dakika', 'Resim yükle']
    },
    {
      number: '02',
      title: 'Topluluk Görsün',
      description: 'Binlerce kullanıcı şehirlerinde gezerken göz kulak olur',
      icon: '👁️',
      color: 'bg-purple-100 text-purple-600',
      features: ['Anlık bildirim', 'Konum bazlı', 'Uzman topluluk']
    },
    {
      number: '03',
      title: 'Bildirim Al',
      description: 'Biri ürünü görünce anında fotoğraf ve konum bilgisi gelir',
      icon: '🔔',
      color: 'bg-green-100 text-green-600',
      features: ['Gerçek zamanlı', 'Fotoğraflı', 'Detaylı bilgi']
    },
    {
      number: '04',
      title: 'Bul ve Mutlu Ol',
      description: 'Ürünü bulun, alın ve başarı hikayenizi paylaşın!',
      icon: '🎯',
      color: 'bg-orange-100 text-orange-600',
      features: ['%94 başarı', 'Teşekkür puanı', 'Topluluk rozeti']
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            🚀 4 ADIMDA ÇÖZÜM
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            SpotItForMe Nasıl Çalışır?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kayıp ürünlerinizi bulmak artık çok kolay. 4 basit adımda binlerce göz sizin için arasın.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative group">
              {/* Çizgi (masaüstü için) */}
              {step.number !== '04' && (
                <div className="hidden lg:block absolute top-12 right-0 w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent translate-x-1/2 z-0" />
              )}
              
              <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 z-10">
                {/* Üst kısım */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-xl ${step.color} flex items-center justify-center text-2xl`}>
                    {step.icon}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                
                {/* İçerik */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {step.description}
                </p>
                
                {/* Özellikler */}
                <div className="space-y-2">
                  {step.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Alt çizgi */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-xs text-gray-500 font-medium">
                    {step.number === '01' && 'ÜCRETSİZ başlayın'}
                    {step.number === '02' && '24/7 aktif topluluk'}
                    {step.number === '03' && 'Anında bildirim'}
                    {step.number === '04' && 'Garantili memnuniyet'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video açıklama */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-2/3">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                🎥 90 Saniyede SpotItForMe
              </h3>
              <p className="text-gray-600 mb-6">
                Nasıl çalıştığımızı 90 saniyede öğrenin. Binlerce kullanıcının kayıp ürünlerini 
                nasıl bulduğunu görün ve siz de hemen başlayın.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center">
                  <span className="mr-2">▶️</span>
                  Tanıtım Filmini İzle
                </button>
                <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl border border-gray-300">
                  Başarı Hikayeleri
                </button>
              </div>
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-1">
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="text-5xl mb-4">📱</div>
                  <h4 className="font-bold text-gray-900 mb-2">Mobil Uygulama</h4>
                  <p className="text-sm text-gray-600 mb-4">Yoldayken bile spot oluşturun</p>
                  <div className="flex justify-center space-x-3">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                      App Store
                    </button>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                      Google Play
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
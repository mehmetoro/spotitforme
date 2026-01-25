export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Spot Oluştur',
      description: 'Aradığınız ürünün fotoğrafını ve açıklamasını ekleyin. Konum ve kategori seçin.',
      icon: '📝',
    },
    {
      number: '02',
      title: 'Topluluk Görsün',
      description: 'Binlerce kullanıcı şehirlerinde gezerken spotunuza göz kulak olur.',
      icon: '👁️',
    },
    {
      number: '03',
      title: 'Bildirim Al',
      description: 'Biri ürünü görünce anında fotoğraf, konum ve fiyat bilgisi alırsınız.',
      icon: '🔔',
    },
    {
      number: '04',
      title: 'Bul ve Mutlu Ol',
      description: 'Ürünü bulun, alın ve başarı hikayenizi paylaşın!',
      icon: '🎉',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            SpotItForMe Nasıl Çalışır?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            4 kolay adımda bulunması zor ürünleri bulun
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {step.number}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="btn-primary text-lg px-8 py-3">
            Hemen Ücretsiz Spot Oluşturun
          </button>
          <p className="mt-4 text-gray-600">
            Kayıt olmadan deneyebilirsiniz
          </p>
        </div>
      </div>
    </section>
  )
}
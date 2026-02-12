export default function Stats() {
  const stats = [
    { value: '10,000+', label: 'Aktif Spot', icon: '📝', color: 'from-blue-500 to-blue-600' },
    { value: '50,000+', label: 'Topluluk Üyesi', icon: '👥', color: 'from-purple-500 to-purple-600' },
    { value: '5,000+', label: 'Başarı Hikayesi', icon: '🎉', color: 'from-green-500 to-green-600' },
    { value: '100+', label: 'Şehir', icon: '📍', color: 'from-orange-500 to-orange-600' },
    { value: '24s', label: 'Ort. Yanıt Süresi', icon: '⚡', color: 'from-pink-500 to-pink-600' },
    { value: '94%', label: 'Memnuniyet Oranı', icon: '⭐', color: 'from-indigo-500 to-indigo-600' },
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            SpotItForMe İstatistikleri
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Türkiye'nin en büyük kayıp ürün bulma topluluğu olarak her gün binlerce kişiye yardım ediyoruz
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl text-white mx-auto mb-4`}>
                {stat.icon}
              </div>
              
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Canlı aktivite */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🎯 Şu Anda Aktif Aramalar</h3>
              <p className="text-gray-600">
                <span className="font-bold text-blue-600">127 kişi</span> şu anda topluluğumuzdan yardım bekliyor
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">+ daha fazlası yardım ediyor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
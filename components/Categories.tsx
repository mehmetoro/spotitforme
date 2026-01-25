interface Category {
  id: number
  name: string
  count: number
  icon: string
  color: string
}

export default function Categories() {
  const categories: Category[] = [
    { id: 1, name: 'Elektronik', count: 156, icon: '📱', color: 'bg-blue-100 text-blue-800' },
    { id: 2, name: 'Giyim & Aksesuar', count: 89, icon: '👕', color: 'bg-green-100 text-green-800' },
    { id: 3, name: 'Ev & Bahçe', count: 123, icon: '🏠', color: 'bg-yellow-100 text-yellow-800' },
    { id: 4, name: 'Koleksiyon', count: 67, icon: '🎨', color: 'bg-purple-100 text-purple-800' },
    { id: 5, name: 'Kitap & Müzik', count: 45, icon: '📚', color: 'bg-red-100 text-red-800' },
    { id: 6, name: 'Oyuncak & Oyun', count: 78, icon: '🎮', color: 'bg-indigo-100 text-indigo-800' },
    { id: 7, name: 'Spor & Outdoor', count: 34, icon: '⚽', color: 'bg-pink-100 text-pink-800' },
    { id: 8, name: 'Araç & Parça', count: 56, icon: '🚗', color: 'bg-gray-100 text-gray-800' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popüler Kategoriler
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İhtiyacınız olan ürünü kategorilere göre arayın veya yeni bir spot oluşturun
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:shadow-md transition duration-200 cursor-pointer"
            >
              <div className={`w-16 h-16 ${category.color.split(' ')[0]} rounded-full flex items-center justify-center text-2xl mx-auto mb-4`}>
                {category.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-gray-500 text-sm">{category.count} aktif spot</p>
            </div>
          ))}
        </div>

        {/* Search by city */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Şehirlere Göre Ara
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Trabzon'].map((city) => (
              <button
                key={city}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-medium transition duration-200"
              >
                {city}
              </button>
            ))}
            <button className="px-6 py-3 text-blue-600 hover:text-blue-800 font-medium">
              + Tüm Şehirler
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
interface Spot {
  id: number
  title: string
  description: string
  category: string
  location: string
  user: string
  timeAgo: string
  imageColor: string
}

export default function RecentSpots() {
  const spots: Spot[] = [
    {
      id: 1,
      title: 'Vintage Nikon F2 Kamera Lens',
      description: 'Orijinal 50mm f/1.4 lens arıyorum. 1970\'lerden kalma, orijinal kutusunda olursa çok iyi olur.',
      category: 'Fotoğraf Makineleri',
      location: 'İstanbul',
      user: 'Ahmet Y.',
      timeAgo: '2 saat önce',
      imageColor: 'bg-blue-200',
    },
    {
      id: 2,
      title: 'Eski Çay Makinesi Cam Kapağı',
      description: 'Arçelik K 2712 modeli için cam kapak arıyorum. Üretimi durdu, bulamıyorum.',
      category: 'Ev Eşyaları',
      location: 'İzmir',
      user: 'Zeynep K.',
      timeAgo: '5 saat önce',
      imageColor: 'bg-green-200',
    },
    {
      id: 3,
      title: 'Retro PlayStation 1 Oyunu',
      description: 'Crash Bandicoot orijinal CD\'si, kutusuyla birlikte. İyi durumda olmalı.',
      category: 'Oyunlar',
      location: 'Ankara',
      user: 'Mehmet T.',
      timeAgo: '1 gün önce',
      imageColor: 'bg-purple-200',
    },
    {
      id: 4,
      title: '1970 Model Rolex Saat Kayışı',
      description: 'Rolex Datejust 1601 modeli için orijinal kayış arıyorum.',
      category: 'Saat & Aksesuar',
      location: 'İstanbul',
      user: 'Can B.',
      timeAgo: '1 gün önce',
      imageColor: 'bg-yellow-200',
    },
    {
      id: 5,
      title: 'Eski Tip Dikiş Makinesi İğnesi',
      description: 'Singer marka eski dikiş makinesi için özel iğne arıyorum.',
      category: 'Hobi & El İşi',
      location: 'Bursa',
      user: 'Ayşe M.',
      timeAgo: '2 gün önce',
      imageColor: 'bg-pink-200',
    },
    {
      id: 6,
      title: 'Antika Halı Tamircisi',
      description: 'Eski Hereke halımı tamir edecek usta arıyorum. İstanbul içi.',
      category: 'Antika',
      location: 'İstanbul',
      user: 'Mustafa K.',
      timeAgo: '3 gün önce',
      imageColor: 'bg-red-200',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Son Eklenen Spot'lar</h2>
            <p className="text-gray-600">Topluluğumuzun en son aradığı ürünler</p>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Tümünü Gör →
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <div key={spot.id} className="card hover:shadow-xl transition duration-300">
              <div className="flex items-start mb-4">
                <div className={`w-16 h-16 ${spot.imageColor} rounded-lg mr-4 flex-shrink-0`}></div>
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                    <div>
                      <p className="font-semibold text-sm">{spot.user}</p>
                      <p className="text-xs text-gray-500">{spot.timeAgo}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{spot.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{spot.description}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                  {spot.category}
                </span>
                <span className="text-gray-500 text-sm">📍 {spot.location}</span>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 btn-secondary text-sm py-2">
                  💬 Yardım Et
                </button>
                <button className="flex-1 btn-primary text-sm py-2">
                  👁️ Gördüm
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* More spots CTA */}
        <div className="text-center mt-12">
          <button className="btn-primary px-8 py-3">
            Daha Fazla Spot Görüntüle
          </button>
          <p className="mt-4 text-gray-600">
            Topluluğumuza katılın, siz de aradığınız ürünü bulun
          </p>
        </div>
      </div>
    </section>
  )
}
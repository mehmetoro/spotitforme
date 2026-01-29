'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Spot {
  id: string
  title: string
  description: string
  category: string
  location: string
  image_url: string | null
  timeAgo: string
  user: string
  status: 'active' | 'found'
  helps: number
}

export default function RecentSpots() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Örnek spot'lar - Gerçekte API'den gelecek
  const sampleSpots: Spot[] = [
    {
      id: '1',
      title: 'Vintage Nikon F2 Kamera Lens 50mm f/1.4',
      description: 'Orijinal 50mm f/1.4 lens arıyorum. 1970lerden kalma, orijinal kutusunda olursa çok iyi olur. Sadece İstanbul içi.',
      category: 'Fotoğraf Makineleri',
      location: 'İstanbul',
      image_url: 'https://gobzxreumkbgaohvzoef.supabase.co/storage/v1/object/public/spot-images/7f4b4b19-992c-47b6-a1ba-29d339dade1b/1769311004662.png',
      timeAgo: '2 saat önce',
      user: 'Ahmet Y.',
      status: 'active',
      helps: 3
    },
    {
      id: '2',
      title: 'Eski Arçelik Çay Makinesi Cam Kapağı',
      description: 'Arçelik K 2712 modeli için cam kapak arıyorum. Üretimi durdu, bulamıyorum. Yedek parça satan yer biliyorsanız lütfen yardım edin.',
      category: 'Ev Eşyaları',
      location: 'İzmir',
      image_url: null,
      timeAgo: '5 saat önce',
      user: 'Zeynep K.',
      status: 'active',
      helps: 1
    },
    {
      id: '3',
      title: 'Retro PlayStation 1 Oyun Koleksiyonu',
      description: 'Crash Bandicoot, Tekken 3, Resident Evil orijinal CDleri, kutusuyla birlikte. İyi durumda olmalı.',
      category: 'Oyunlar',
      location: 'Ankara',
      image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
      timeAgo: '1 gün önce',
      user: 'Mehmet T.',
      status: 'active',
      helps: 7
    },
    {
      id: '4',
      title: '1970 Model Rolex Datejust Kayışı',
      description: 'Rolex Datejust 1601 modeli için orijinal altın kaplama kayış arıyorum. Saat babamdan yadigar, kayışı koptu.',
      category: 'Saat & Aksesuar',
      location: 'İstanbul',
      image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop',
      timeAgo: '1 gün önce',
      user: 'Can B.',
      status: 'found',
      helps: 12
    },
    {
      id: '5',
      title: 'Antika Hereke Halı Tamircisi',
      description: 'Eski Hereke halımı tamir edecek usta arıyorum. İstanbul Avrupa yakasında olursa çok iyi olur. 30 yıllık halı.',
      category: 'Antika',
      location: 'İstanbul',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      timeAgo: '2 gün önce',
      user: 'Mustafa K.',
      status: 'active',
      helps: 5
    },
    {
      id: '6',
      title: 'Eski Tip Dikiş Makinesi İğnesi',
      description: 'Singer marka eski dikiş makinesi için özel iğne arıyorum. Yeni modeller uymuyor. Ankara içi.',
      category: 'Hobi & El İşi',
      location: 'Ankara',
      image_url: null,
      timeAgo: '3 gün önce',
      user: 'Ayşe M.',
      status: 'active',
      helps: 2
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Son Eklenen Spot'lar
            </h2>
            <p className="text-gray-600">
              Topluluğumuzun en son aradığı ürünler. Siz de yardım edin!
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* Görünüm modu */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                ⏹️ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                📃 Liste
              </button>
            </div>
            
            <button 
              onClick={() => router.push('/spots')}
              className="group text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              Tümünü Gör
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Spot Grid/List */}
        <div className={viewMode === 'grid' 
          ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {sampleSpots.map((spot) => (
            <div 
              key={spot.id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Resim */}
              <div className={`
                ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}
                relative bg-gray-100 overflow-hidden
              `}>
                {spot.image_url ? (
                  <img
                    src={spot.image_url}
                    alt={spot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <span className="text-4xl block mb-2 text-gray-400">📷</span>
                      <p className="text-sm text-gray-500">Resim Yok</p>
                    </div>
                  </div>
                )}
                
                {/* Durum */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    spot.status === 'active' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {spot.status === 'active' ? 'Aktif' : 'Bulundu!'}
                  </span>
                </div>
                
                {/* Yardım sayısı */}
                <div className="absolute bottom-3 right-3">
                  <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    🤝 {spot.helps}
                  </div>
                </div>
              </div>

              {/* İçerik */}
              <div className="p-6 flex-grow">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                    {spot.user[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{spot.user}</p>
                    <p className="text-xs text-gray-500">{spot.timeAgo}</p>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-blue-600">
                  {spot.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {spot.description}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                      {spot.category}
                    </span>
                    <span className="text-gray-500 text-sm flex items-center">
                      📍 {spot.location}
                    </span>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Yardım Et →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daha fazla butonu */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/spots')}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
          >
            Daha Fazla Spot Görüntüle
            <span className="ml-3 group-hover:translate-x-2 transition-transform">⟶</span>
          </button>
          <p className="mt-4 text-gray-600">
            Topluluğumuza katılın, siz de aradığınız ürünü bulun
          </p>
        </div>
      </div>
    </section>
  )
}
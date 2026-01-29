// components/SearchFilters.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterState {
  category: string
  location: string
  status: string
  sortBy: string
  minPrice: string
  maxPrice: string
  dateRange: string
}

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || 'all',
    status: searchParams.get('status') || 'all',
    sortBy: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    dateRange: searchParams.get('dateRange') || 'all'
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const categories = [
    'Tümü', 'Elektronik', 'Giyim & Aksesuar', 'Ev & Bahçe',
    'Koleksiyon', 'Kitap & Müzik', 'Oyuncak & Oyun',
    'Spor & Outdoor', 'Araç & Parça', 'Diğer'
  ]

  const locations = [
    'Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
    'Adana', 'Konya', 'İzmir', 'Trabzon', 'Türkiye Geneli', 'Yurt Dışı'
  ]

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (filters.category !== 'all') params.set('category', filters.category)
    if (filters.location !== 'all') params.set('location', filters.location)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange)

    router.push(`/spots?${params.toString()}`)
  }

  const resetFilters = () => {
    setFilters({
      category: 'all',
      location: 'all',
      status: 'all',
      sortBy: 'newest',
      minPrice: '',
      maxPrice: '',
      dateRange: 'all'
    })
    router.push('/spots')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Detaylı Filtrele</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showAdvanced ? 'Basit Görünüm' : 'Gelişmiş Filtreler'}
        </button>
      </div>

      {/* Temel Filtreler */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'Tümü' ? 'all' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Konum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konum
          </label>
          <select
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc === 'Tümü' ? 'all' : loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Durum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="found">Bulundu</option>
            <option value="urgent">Acil</option>
          </select>
        </div>
      </div>

      {/* Gelişmiş Filtreler */}
      {showAdvanced && (
        <div className="border-t pt-6 mb-6">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sıralama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sırala
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="most_viewed">En Çok Görüntülenen</option>
                <option value="most_helped">En Çok Yardım Alan</option>
              </select>
            </div>

            {/* Fiyat Aralığı */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat Aralığı (TL)
              </label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Tarih Aralığı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zaman Aralığı
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="today">Bugün</option>
                <option value="week">Bu Hafta</option>
                <option value="month">Bu Ay</option>
                <option value="3months">Son 3 Ay</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={resetFilters}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Filtreleri Temizle
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg"
          >
            Filtrele
          </button>
        </div>
      </div>
    </div>
  )
}
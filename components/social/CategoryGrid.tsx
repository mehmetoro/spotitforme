'use client'

import { useState, useEffect } from 'react'
import Feed from './Feed'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  icon: string
  gradient: string
  description: string
  count?: number
}

export const CATEGORIES: Category[] = [
  {
    id: 'elektronik',
    name: 'Elektronik',
    icon: '📱',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Telefonlar, bilgisayarlar, aksesuarlar',
    count: 156
  },
  {
    id: 'giyim',
    name: 'Giyim & Aksesuar',
    icon: '👕',
    gradient: 'from-pink-500 to-rose-500',
    description: 'Vintage kıyafetler, takılar, çantalar',
    count: 234
  },
  {
    id: 'ev',
    name: 'Ev & Dekorasyon',
    icon: '🏠',
    gradient: 'from-amber-500 to-orange-500',
    description: 'Mobilya, dekorasyon ürünleri',
    count: 189
  },
  {
    id: 'koleksiyon',
    name: 'Koleksiyon',
    icon: '🎨',
    gradient: 'from-purple-500 to-indigo-500',
    description: 'Antika, sanat eserleri, özel parçalar',
    count: 127
  },
  {
    id: 'kitap',
    name: 'Kitap & Müzik',
    icon: '📚',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Nadir kitaplar, plaklar, enstrümanlar',
    count: 98
  },
  {
    id: 'oyuncak',
    name: 'Oyuncak & Oyun',
    icon: '🎮',
    gradient: 'from-red-500 to-pink-500',
    description: 'Retro oyuncaklar, konsol oyunları',
    count: 145
  },
  {
    id: 'spor',
    name: 'Spor & Outdoor',
    icon: '⚽',
    gradient: 'from-green-500 to-lime-500',
    description: 'Spor ekipmanları, outdoor malzemeler',
    count: 76
  },
  {
    id: 'arac',
    name: 'Araç & Parça',
    icon: '🚗',
    gradient: 'from-slate-500 to-gray-600',
    description: 'Klasik arabalar, yedek parçalar',
    count: 64
  },
  {
    id: 'saat',
    name: 'Saat & Aksesuar',
    icon: '⌚',
    gradient: 'from-yellow-500 to-amber-500',
    description: 'Vintage saatler, lüks aksesuarlar',
    count: 112
  },
  {
    id: 'mutfak',
    name: 'Mutfak & Sofra',
    icon: '🍽️',
    gradient: 'from-orange-500 to-red-500',
    description: 'Antika mutfak eşyaları, porselen',
    count: 83
  },
  {
    id: 'bahce',
    name: 'Bahçe & Dış Mekan',
    icon: '🌿',
    gradient: 'from-lime-500 to-green-500',
    description: 'Bahçe malzemeleri, dış mekan dekor',
    count: 54
  },
  {
    id: 'diger',
    name: 'Diğer',
    icon: '🔍',
    gradient: 'from-gray-500 to-slate-500',
    description: 'Sınıflandırılmamış özel parçalar',
    count: 91
  }
]

export default function CategoryGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>(CATEGORIES)
  const [loading, setLoading] = useState(true)

  // Kategorilere ait gerçek paylaşım sayılarını yükle
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true)
        
        // Her kategori için paylaşım sayısını al
        const updatedCategories = await Promise.all(
          CATEGORIES.map(async (category) => {
            const { count, error } = await supabase
              .from('social_posts')
              .select('*', { count: 'exact', head: true })
              .eq('category', category.id)
            
            if (error) {
              console.warn(`Kategori ${category.id} sayısı alınamadı:`, error)
              return category
            }
            
            return {
              ...category,
              count: count || 0
            }
          })
        )
        
        setCategories(updatedCategories)
      } catch (error) {
        console.error('Kategori sayıları yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryCounts()
  }, [])

  // Kategori seçiliyse, o kategoriye özel feed göster
  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory)
    return (
      <div className="max-w-2xl mx-auto">
        {/* Geri dön butonu */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
          >
            <span>←</span>
            <span>Kategorilere Dön</span>
          </button>
          <div className="mt-3 flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category?.gradient} flex items-center justify-center text-2xl shadow-lg`}>
              {category?.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{category?.name}</h2>
              <p className="text-sm text-gray-500">{category?.description}</p>
            </div>
          </div>
        </div>

        {/* Kategoriye özel feed */}
        <Feed type="for-you" category={selectedCategory} />
      </div>
    )
  }

  // Kategori seçilmemişse, kategori grid'i göster
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Başlık */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          🏷️ Kategoriler
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          İlgilendiğin kategoriye göre nadir parçaları, spotları ve paylaşımları keşfet
        </p>
      </div>

      {/* Kategori kartları - daha büyük ve gösterişli */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          // Yükleniyor placeholder'ları
          [...Array(12)].map((_, i) => (
            <div key={i} className="rounded-2xl shadow-lg animate-pulse">
              <div className="bg-gray-300 h-48 rounded-2xl"></div>
            </div>
          ))
        ) : (
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
            {/* Gradient arka plan */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
            
            {/* İçerik */}
            <div className="relative p-6 text-white">
              {/* Icon */}
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              
              {/* Başlık */}
              <h3 className="text-2xl font-bold mb-2">
                {category.name}
              </h3>
              
              {/* Açıklama */}
              <p className="text-white/90 text-sm mb-4 line-clamp-2">
                {category.description}
              </p>
              
              {/* İstatistik */}
              {category.count !== undefined && (
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-white/80 text-sm">Toplam paylaşım</span>
                  <span className="text-xl font-bold">{category.count}</span>
                </div>
              )}
            </div>
            
            {/* Hover efekti */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        ))
        )}
      </div>

      {/* Alt bilgi */}
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">
          Aradığınız kategoriyi bulamadınız mı? 
          <button className="text-blue-600 hover:text-blue-700 font-medium ml-1">
            Öneri gönderin
          </button>
        </p>
      </div>
    </div>
  )
}

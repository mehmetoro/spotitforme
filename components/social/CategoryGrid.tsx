'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SOCIAL_CATEGORIES, type SocialCategory, findCategoryByValue, getCategorySlug } from '@/lib/social-categories'

interface CategoryWithCount extends SocialCategory {
  count?: number
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryWithCount[]>(SOCIAL_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Kategorilere ait gerçek paylaşım sayılarını yükle
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true)

        const baseCounts: Record<string, number> = Object.fromEntries(
          SOCIAL_CATEGORIES.map((category) => [category.id, 0])
        )

        const { data, error } = await supabase
          .from('social_posts')
          .select('category')

        if (error) {
          console.warn('Kategori sayilari alinamadi:', error)
          setCategories(SOCIAL_CATEGORIES)
          return
        }

        ;(data || []).forEach((row: { category: string | null }) => {
          const matchedCategory = findCategoryByValue(row.category)
          if (!matchedCategory) return
          baseCounts[matchedCategory.id] = (baseCounts[matchedCategory.id] || 0) + 1
        })

        const updatedCategories = SOCIAL_CATEGORIES.map((category) => ({
          ...category,
          count: baseCounts[category.id] || 0,
        }))

        setCategories(updatedCategories)
      } catch (error) {
        console.error('Kategori sayıları yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryCounts()
  }, [])

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
              onClick={() => router.push(`/kategori/${getCategorySlug(category.id)}`)}
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

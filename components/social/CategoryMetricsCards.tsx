'use client'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { findCategoryByValue, getCitySlug } from '@/lib/social-categories'

interface CategoryMetricsCardsProps {
  categoryId: string
  currentCity?: string
}

interface MetricsState {
  totalPosts: number
  cityDiversity: number
  selectedCityCount: number
}

export default function CategoryMetricsCards({ categoryId, currentCity = '' }: CategoryMetricsCardsProps) {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<MetricsState>({
    totalPosts: 0,
    cityDiversity: 0,
    selectedCityCount: 0,
  })

  useEffect(() => {
    let cancelled = false

    const fetchMetrics = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('social_posts')
          .select('category, city')

        if (error) {
          if (!cancelled) {
            setMetrics({ totalPosts: 0, cityDiversity: 0, selectedCityCount: 0 })
          }
          return
        }

        const categoryPosts = (data || []).filter((row: any) => {
          const matched = findCategoryByValue(row.category)
          if (matched?.id === categoryId) return true
          if (categoryId === 'Diger' && !matched) return true
          return false
        })

        const citySet = new Set<string>()
        const currentCitySlug = currentCity ? getCitySlug(currentCity) : ''
        let selectedCityCount = 0

        categoryPosts.forEach((row: any) => {
          const city = (row.city || '').trim()
          if (city) {
            citySet.add(getCitySlug(city))
          }
          if (currentCitySlug && getCitySlug(city) === currentCitySlug) {
            selectedCityCount += 1
          }
        })

        if (!cancelled) {
          setMetrics({
            totalPosts: categoryPosts.length,
            cityDiversity: citySet.size,
            selectedCityCount: currentCity ? selectedCityCount : categoryPosts.length,
          })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchMetrics()

    return () => {
      cancelled = true
    }
  }, [categoryId, currentCity])

  const selectedFilterLabel = useMemo(() => (currentCity || 'Tum Sehirler'), [currentCity])

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="text-sm text-gray-500">Toplam Paylasim</div>
        <div className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : metrics.totalPosts}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="text-sm text-gray-500">Sehir Cesitliligi</div>
        <div className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : metrics.cityDiversity}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="text-sm text-gray-500">Secili Filtre</div>
        <div className="text-lg font-semibold text-gray-900 mt-2">{selectedFilterLabel}</div>
        <div className="text-xs text-gray-500 mt-1">
          {loading ? 'Yukleniyor...' : `${metrics.selectedCityCount} paylasim`}
        </div>
      </div>
    </div>
  )
}

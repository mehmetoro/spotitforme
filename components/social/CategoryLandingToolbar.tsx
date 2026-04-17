'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { findCategoryByValue, getCitySlug } from '@/lib/social-categories'

interface CityOption {
  city: string
  count: number
}

interface CategoryLandingToolbarProps {
  cityOptions: CityOption[]
  basePath: string
  categoryId: string
  currentCity?: string
}

export default function CategoryLandingToolbar({ cityOptions, basePath, categoryId, currentCity = '' }: CategoryLandingToolbarProps) {
  const router = useRouter()
  const [dynamicCityOptions, setDynamicCityOptions] = useState<CityOption[]>(cityOptions)

  useEffect(() => {
    setDynamicCityOptions(cityOptions)
  }, [cityOptions])

  useEffect(() => {
    let cancelled = false

    const fetchCityOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('social_posts')
          .select('category, city')

        if (cancelled || error) return

        const cityMap: Record<string, { city: string; count: number }> = {}
        ;(data || []).forEach((row: any) => {
          const matchedCategory = findCategoryByValue(row.category)
          if (matchedCategory?.id !== categoryId && !(categoryId === 'Diger' && !matchedCategory)) return

          const city = (row.city || '').trim()
          if (!city) return
          const cityKey = getCitySlug(city)
          if (!cityMap[cityKey]) {
            cityMap[cityKey] = { city, count: 0 }
          }
          cityMap[cityKey].count += 1
        })

        const options = Object.values(cityMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 50)

        if (!cancelled) {
          setDynamicCityOptions(options)
        }
      } catch {
        // Keep existing options if dynamic fetch fails.
      }
    }

    fetchCityOptions()

    return () => {
      cancelled = true
    }
  }, [categoryId])

  const mergedOptions = useMemo(() => {
    const map = new Map<string, CityOption>()
    dynamicCityOptions.forEach((item) => {
      const key = getCitySlug(item.city)
      const existing = map.get(key)
      if (existing) {
        existing.count += item.count
      } else {
        map.set(key, { city: item.city, count: item.count })
      }
    })

    if (currentCity) {
      const currentKey = getCitySlug(currentCity)
      if (!map.has(currentKey)) {
        map.set(currentKey, { city: currentCity, count: 0 })
      }
    }

    return Array.from(map.values())
  }, [dynamicCityOptions, currentCity])

  const handleCityChange = (value: string) => {
    router.push(value ? `${basePath}/${getCitySlug(value)}` : basePath)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:justify-between">
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 mb-2">Sehir Bazli Kesif</div>
          <select
            value={currentCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full lg:max-w-sm px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tum Sehirler</option>
            {mergedOptions.map((option) => (
              <option key={option.city} value={option.city}>
                {option.city} ({option.count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/discovery')}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium transition"
          >
            Tum Nadir Seyahat
          </button>
          <button
            onClick={() => router.push('/discovery?filter=popular')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            Populer Kesifler
          </button>
        </div>
      </div>
    </div>
  )
}

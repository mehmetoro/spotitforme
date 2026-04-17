'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { findCategoryByValue, getCitySlug } from '@/lib/social-categories'

interface CategorySummaryStatsProps {
  categoryId: string
  currentCity?: string
}

interface SummaryState {
  count: number
  latestDate: string | null
}

function formatDateLabel(value: string | null) {
  if (!value) return 'Henuz veri yok'
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default function CategorySummaryStats({ categoryId, currentCity = '' }: CategorySummaryStatsProps) {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryState>({ count: 0, latestDate: null })

  useEffect(() => {
    let cancelled = false

    const fetchSummary = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('social_posts')
          .select('category, city, created_at')

        if (cancelled) return

        if (error) {
          setSummary({ count: 0, latestDate: null })
          return
        }

        const filtered = (data || []).filter((row: any) => {
          const matched = findCategoryByValue(row.category)
          if (matched?.id !== categoryId && !(categoryId === 'Diger' && !matched)) return false
          if (!currentCity) return true
          return getCitySlug((row.city || '').trim()) === getCitySlug(currentCity)
        })

        const latestDate = filtered.reduce<string | null>((latest, row: any) => {
          const value = row.created_at || null
          if (!value) return latest
          if (!latest) return value
          return new Date(value).getTime() > new Date(latest).getTime() ? value : latest
        }, null)

        setSummary({ count: filtered.length, latestDate })
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchSummary()

    return () => {
      cancelled = true
    }
  }, [categoryId, currentCity])

  return (
    <>
      <div className="mt-3 text-3xl font-bold">{loading ? '...' : summary.count}</div>
      <div className="text-sm text-white/90">aktif paylasim gosteriliyor</div>
      <div className="mt-4 text-sm text-white/80">Son hareket</div>
      <div className="font-semibold">{loading ? 'Yukleniyor...' : formatDateLabel(summary.latestDate)}</div>
    </>
  )
}

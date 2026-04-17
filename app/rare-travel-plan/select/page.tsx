'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { findCategoryBySlug, findCategoryByValue, getCategoryMatchValues, getCitySlug } from '@/lib/social-categories'
import { buildSocialPath } from '@/lib/sighting-slug'

type Post = {
  id: string
  title: string | null
  content: string | null
  description: string | null
  category: string | null
  city: string | null
  district: string | null
  location_name: string | null
  location: string | null
  image_urls: string[] | null
  images: string[] | null
  image_url: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  is_public?: boolean | null
}

function getThumb(post: Post): string | null {
  if (Array.isArray(post.image_urls) && post.image_urls.length > 0) return post.image_urls[0]
  if (Array.isArray(post.images) && post.images.length > 0) return post.images[0]
  if (post.image_url) return post.image_url
  return null
}

function getTitle(post: Post): string {
  return post.title || post.content || post.description || post.location || 'Paylaşım'
}

function normalizeText(value: string | null | undefined): string {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchesCategoryOrDigerFallback(rowCategory: string | null | undefined, targetCategoryId: string) {
  const matchedCategory = findCategoryByValue(rowCategory)
  if (matchedCategory?.id === targetCategoryId) return true
  if (targetCategoryId === 'Diger' && !matchedCategory) return true

  // DB'de kategori isimleri ek metinle tutulduysa daha esnek bir metin eslesmesi yap
  const rowNorm = normalizeText(rowCategory)
  const targetNorm = normalizeText(targetCategoryId)
  if (rowNorm && targetNorm && (rowNorm.includes(targetNorm) || targetNorm.includes(rowNorm))) return true

  return false
}

export default function TravelSelectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const categoryParam = searchParams.get('category') || ''
  const cityParam = searchParams.get('city') || ''
  const fromParam = searchParams.get('from') || ''
  const activeCategory = findCategoryByValue(categoryParam) || findCategoryBySlug(categoryParam)

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [fromInput, setFromInput] = useState(fromParam)
  const [toInput, setToInput] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        let query = supabase
          .from('social_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5000)

        // Feed tarafindaki gibi kategori alias degerleriyle DB seviyesinde filtrele.
        if (activeCategory) {
          const categoryValues = getCategoryMatchValues(activeCategory.id)
          const categoryConditions = categoryValues
            .map((value) => `category.ilike.${value.replace(/,/g, '\\,')}`)
            .join(',')

          if (categoryConditions) {
            query = query.or(categoryConditions)
          }
        }

        const { data, error } = await query
        if (error) throw error

        let filtered = ((data || []) as Post[]).filter((row) => row?.is_public !== false)

        if (activeCategory) {
          filtered = filtered.filter((row) => matchesCategoryOrDigerFallback(row.category, activeCategory.id))

          // Kategori map'ine girmeyen varyasyonlar icin son bir metin fallback'i.
          if (filtered.length === 0) {
            const fallbackNeedle = normalizeText(activeCategory.name || categoryParam)
            const raw = ((data || []) as Post[]).filter((row) => row?.is_public !== false)
            filtered = raw.filter((row) => normalizeText(row.category).includes(fallbackNeedle))
          }
        }

        // Kategori sayfasiyla ayni davranis: city slug gercekten eslesirse filtre uygula.
        if (cityParam) {
          const citySlug = getCitySlug(cityParam.replace(/-/g, ' '))
          const hasMatchingCity = filtered.some((row) => getCitySlug((row.city || '').trim()) === citySlug)
          if (hasMatchingCity) {
            filtered = filtered.filter((row) => getCitySlug((row.city || '').trim()) === citySlug)
          }
        }

        // Koordinatı olan paylaşımları öne al
        const withCoord = filtered.filter((p: any) => p.latitude && p.longitude)
        const withoutCoord = filtered.filter((p: any) => !p.latitude || !p.longitude)
        setPosts([...withCoord, ...withoutCoord] as Post[])
      } catch (err) {
        console.error('Paylaşımlar alınamadı:', err)
        setLoadError('Paylaşımlar alınırken bir sorgu hatası oluştu. Lütfen sayfayı yenileyip tekrar dene.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [activeCategory, cityParam])

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Tarayıcınız konum desteği sunmuyor.')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=tr`,
            { headers: { 'User-Agent': 'spotitforme/1.0' } },
          )
          const data = await res.json()
          const city = data?.address?.city || data?.address?.town || data?.address?.province || ''
          const district = data?.address?.state_district || data?.address?.county || ''
          const country = data?.address?.country || ''
          const display = [district, city, country].filter(Boolean).join(', ')
          setFromInput(display || `${lat.toFixed(6)},${lng.toFixed(6)}`)
        } catch {
          setFromInput(`${lat.toFixed(6)},${lng.toFixed(6)}`)
        }
        setGettingLocation(false)
      },
      () => {
        alert('Konum alınamadı. Lütfen başlangıç noktanı manuel gir.')
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    )
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(posts.map((p) => p.id)))
  const clearAll = () => setSelected(new Set())

  // Koordinatı olan seçili postlar
  const selectedWithCoord = useMemo(
    () => posts.filter((p) => selected.has(p.id) && p.latitude && p.longitude),
    [posts, selected]
  )

  const canPlan = selected.size > 0 && fromInput.trim()

  const handlePlan = () => {
    const params = new URLSearchParams()
    params.set('from', fromInput.trim())
    if (toInput.trim()) params.set('to', toInput.trim())
    if (categoryParam) params.append('category', categoryParam)
    // Seçili post ID'lerini ekle
    for (const id of selected) params.append('postId', id)
    params.set('stops', String(Math.min(selected.size, 12)))
    params.set('sortBy', 'likes_shares')
    params.set('corridorKm', '999') // seçili postlar için koridor geniş olsun
    router.push(`/rare-travel-plan?${params.toString()}`)
  }

  const label = [
    (activeCategory?.name || categoryParam) && `${activeCategory?.name || categoryParam} kategorisi`,
    cityParam && cityParam.replace(/-/g, ' '),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <main className="container-custom py-6 md:py-8">
      {/* Başlık */}
      <div className="mb-6">
        <Link href={`/rare-travel-plan`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Seyahat Planına Dön
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
          Seyahate Dahil Edilecek Paylaşımları Seç
        </h1>
        {label && (
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-medium">{label}</span> paylaşımları — konumu olan paylaşımlar rotaya eklenir.
          </p>
        )}
      </div>

      {/* Rota girişi */}
      <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4 md:p-5">
        <h2 className="mb-3 text-base font-bold text-gray-900">1) Önce Başlangıç Konumunu Seç</h2>
        <p className="mb-3 text-xs text-gray-600">
          Planın çıkış noktası bu konum olur. Bu alan listeyi filtrelemez, sadece rota başlangıcını belirler.
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={gettingLocation}
            className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
          >
            {gettingLocation ? 'Konum alınıyor…' : '📍 Mevcut Konumumu Kullan'}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Başlangıç noktası</label>
            <input
              type="text"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              placeholder="Örn: İstanbul veya 41.0082,28.9784"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bitiş noktası <span className="text-gray-400 font-normal">(boş bırakılırsa başlangıç kullanılır)</span></label>
            <input
              type="text"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              placeholder="Örn: Ankara"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Seçim kontrolü */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-semibold">{selected.size}</span> paylaşım seçildi
          {selectedWithCoord.length < selected.size && (
            <span className="text-amber-600">
              ({selectedWithCoord.length} konumlu — yalnız bunlar rotaya eklenir)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Tümünü Seç
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Temizle
          </button>
          <button
            onClick={handlePlan}
            disabled={!canPlan}
            className="rounded-xl bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            🛣️ Planı Oluştur ({selected.size})
          </button>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white h-48" />
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600">Bu filtre için paylaşım bulunamadı.</p>
          <p className="mt-2 text-xs text-gray-500">
            Aktif filtreler: {activeCategory?.name || 'Tümü'}{cityParam ? ` · ${cityParam.replace(/-/g, ' ')}` : ''}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const isSelected = selected.has(post.id)
            const thumb = getThumb(post)
            const hasCoord = Boolean(post.latitude && post.longitude)
            return (
              <div
                key={post.id}
                onClick={() => toggleSelect(post.id)}
                className={`relative cursor-pointer rounded-2xl border-2 transition select-none overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 shadow-md'
                    : 'border-gray-200 hover:border-emerald-300'
                } bg-white`}
              >
                {/* Seçim işareti */}
                <div
                  className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm transition ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-gray-300 text-transparent'
                  }`}
                >
                  ✓
                </div>

                {/* Koordinat uyarısı */}
                {!hasCoord && (
                  <div className="absolute top-3 left-3 z-10 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Konum yok
                  </div>
                )}

                {thumb ? (
                  <img
                    src={thumb}
                    alt={getTitle(post)}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-3xl">📍</span>
                  </div>
                )}

                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900 line-clamp-2">{getTitle(post)}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {[post.city, post.district, post.category].filter(Boolean).join(' · ')}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={buildSocialPath(post.id, getTitle(post))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Paylaşımı aç ↗
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Alt sabit plan butonu */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 mt-8 flex justify-center">
          <button
            onClick={handlePlan}
            disabled={!canPlan}
            className="rounded-2xl bg-emerald-600 px-8 py-3 text-base font-bold text-white shadow-xl hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            🛣️ {selected.size} Paylaşımla Seyahat Planı Oluştur
          </button>
        </div>
      )}
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'
import { buildSpotPath, extractSightingIdFromParam } from '@/lib/sighting-slug'

interface Sighting {
  id: string
  spot_id: string
  spotter_id: string
  image_url: string | null
  location_description: string
  price: string | null
  notes: string | null
  category: string | null
  hashtags: string | null
  latitude: number | null
  longitude: number | null
  source_channel: 'physical' | 'virtual' | null
  product_url: string | null
  marketplace: string | null
  seller_name: string | null
  link_preview_title: string | null
  link_preview_image: string | null
  link_preview_description: string | null
  link_preview_brand: string | null
  link_preview_availability: string | null
  link_preview_currency: string | null
  source_domain: string | null
  created_at: string
  spotter: { id: string; full_name: string; avatar_url: string | null } | null
  spot: { id: string; title: string; description: string } | null
  title: string | null
}

export default function SightingDetailClient() {
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const [sighting, setSighting] = useState<Sighting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
    }

    loadCurrentUser()

    const rawId = Array.isArray(params.id) ? params.id[0] : params.id
    const id = rawId ? extractSightingIdFromParam(rawId) : rawId
    if (id) {
      fetchSighting(id)
    } else {
      setError('Sighting ID not found')
      setLoading(false)
    }
  }, [params.id])

  const fetchSighting = async (sightingId: string) => {
    try {
      if (!sightingId || sightingId === 'undefined' || sightingId.trim() === '') {
        setError('Sighting ID invalid')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/sightings/${sightingId}`)
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load sighting')
        setLoading(false)
        return
      }

      const sightingData = await response.json()
      if (!sightingData) {
        setError('Sighting not found')
        setLoading(false)
        return
      }

      setSighting({
        ...sightingData,
        spotter: sightingData.spotter || null,
        spot: sightingData.spot || null,
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to load sighting')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCurrencyPrefix = (currency: string | null | undefined) => {
    const code = (currency || 'TRY').toUpperCase()
    if (code === 'TRY') return '₺'
    if (code === 'USD') return '$'
    if (code === 'EUR') return '€'
    if (code === 'GBP') return '£'
    return `${code} `
  }

  const openGoogleMaps = () => {
    if (sighting?.latitude && sighting?.longitude) {
      window.open(`https://www.google.com/maps?q=${sighting.latitude},${sighting.longitude}`, '_blank')
    }
  }

  const handleMessageRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Mesaj talebi için giriş yapmanız gerekir')
        router.push('/auth/login')
        return
      }

      if (!sighting?.spotter_id) {
        toast.error('Yardım sağlayan kullanıcı bilgisi bulunamadı')
        return
      }

      if (sighting.spotter_id === user.id) {
        toast.error('Kendi yardım bildiriminiz için mesaj talebi gönderemezsiniz.')
        return
      }

      const draft = `Merhaba, "${sighting.spot?.title || 'yardım bildirimi'}" için paylaştığınız bilgi hakkında konuşmak istiyorum. Uygun olunca dönüş yapabilir misiniz?`
      const params = new URLSearchParams({
        receiver: sighting.spotter_id,
        type: 'reward',
        draft,
      })

      router.push(`/messages?${params.toString()}`)
    } catch {
      toast.error('Mesaj talebi başlatılamadı')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !sighting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Yardım bulunamadı'}</h1>
          <Link href="/sightings" className="text-blue-600 hover:text-blue-700">
            Geri Dön
          </Link>
        </div>
      </div>
    )
  }

  const displayTitle = sighting.title || sighting.link_preview_title || sighting.spot?.title || 'Yardım bildirimi'
  const displayDetail = sighting.notes || sighting.link_preview_description || sighting.location_description
  const titleNode = sighting.product_url ? (
    <a
      href={sighting.product_url}
      target="_blank"
      rel="nofollow ugc noopener noreferrer"
      className="hover:text-blue-700 underline-offset-4 hover:underline"
    >
      {displayTitle}
    </a>
  ) : (
    displayTitle
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        <Link href="/sightings" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Yardımlara Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {sighting.image_url ? (
                <img src={sighting.image_url} alt={displayTitle} className="w-full h-96 object-cover" />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400 text-5xl">📷</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold text-gray-900 mb-3">👤 Kim Buldu?</h3>
              <div className="flex items-center space-x-3">
                {sighting.spotter?.avatar_url && (
                  <img src={sighting.spotter.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{sighting.spotter?.full_name || 'Kullanıcı'}</p>
                  <p className="text-xs text-gray-500">{formatDate(sighting.created_at)}</p>
                </div>
              </div>
              {sighting.spotter_id !== currentUserId && (
                <button onClick={handleMessageRequest} className="mt-4 w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold">
                  Yardımcıya Mesaj Talebi Gönder
                </button>
              )}
            </div>

            {sighting.price && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Fiyat</p>
                <p className="text-2xl font-bold text-green-600">{getCurrencyPrefix(sighting.link_preview_currency)}{Number(sighting.price).toLocaleString('tr-TR')}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">📍 Nerede Bulundu?</p>
              <p className="font-medium text-gray-900 mb-3">{sighting.location_description}</p>
              {sighting.latitude && sighting.longitude && (
                <button onClick={openGoogleMaps} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                  🗺️ Haritada Gör
                </button>
              )}
            </div>

            {(sighting.product_url || sighting.link_preview_title || sighting.marketplace || sighting.source_channel === 'virtual') && (
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold text-gray-900 mb-3">🔗 Otomatik Ürün Kartı</h3>
                <a
                  href={sighting.product_url || '#'}
                  target="_blank"
                  rel="nofollow ugc noopener noreferrer"
                  className="block rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300"
                >
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate">{sighting.marketplace || sighting.source_domain || 'Online kaynak'}</span>
                    <span className="text-[11px] text-gray-500">SEO ürün önizlemesi</span>
                  </div>
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-100 shrink-0 flex items-center justify-center">
                      {sighting.link_preview_image || sighting.image_url ? (
                        <img src={sighting.link_preview_image || sighting.image_url || ''} alt={displayTitle} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🛍️</span>
                      )}
                    </div>
                    <div className="p-3 min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{displayTitle}</p>
                      <p className="text-xs text-gray-600 line-clamp-3 mt-1">{displayDetail || 'Bu yardım için ürün linki paylaşıldı.'}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                        {sighting.link_preview_brand && <span>Marka: {sighting.link_preview_brand}</span>}
                        {sighting.seller_name && <span>Satıcı: {sighting.seller_name}</span>}
                        {sighting.link_preview_availability && <span>Durum: {sighting.link_preview_availability}</span>}
                        {sighting.price && <span className="font-semibold text-green-700">{getCurrencyPrefix(sighting.link_preview_currency)}{Number(sighting.price).toLocaleString('tr-TR')}</span>}
                      </div>
                    </div>
                  </div>
                  {sighting.product_url && <div className="px-3 py-2 border-t border-gray-100 text-xs text-blue-700 truncate">{sighting.product_url}</div>}
                </a>
              </div>
            )}
          </div>
        </div>

        {displayDetail && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="font-bold text-gray-900 mb-3">📝 Ürün ve Paylaşım Detayı</h2>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{titleNode}</h1>
            <p className="text-gray-700 whitespace-pre-wrap">{displayDetail}</p>
          </div>
        )}

        {sighting.spot && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="font-bold text-gray-900 mb-3">🎯 Aranan Ürün Hakkında</h2>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{sighting.spot.title}</h3>
            <p className="text-gray-600 mb-4">{sighting.spot.description}</p>
            <Link href={buildSpotPath(sighting.spot.id, sighting.spot.title)} className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Spotu Aç
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

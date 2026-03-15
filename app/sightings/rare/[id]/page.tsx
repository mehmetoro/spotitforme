// app/sightings/rare/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface RareSighting {
  id: string
  user_id: string
  description: string
  category: string | null
  price: number | null
  has_photo: boolean
  photo_url: string | null
  location_name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  city: string | null
  district: string | null
  points_earned: number
  is_in_museum: boolean
  helper_commission_rate: number | null
  status: string
  created_at: string
  user: { id: string; full_name: string; avatar_url: string | null } | null
}

const CATEGORIES: Record<string, string> = {
  electronics: 'Elektronik',
  fashion: 'Giyim & Aksesuar',
  home: 'Ev & Bahçe',
  collectible: 'Koleksiyon',
  vehicle: 'Araç & Parça',
  other: 'Diğer',
}

export default function RareSightingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const [sighting, setSighting] = useState<RareSighting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [museumToggleLoading, setMuseumToggleLoading] = useState(false)

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
    }

    loadCurrentUser()

    const id = Array.isArray(params.id) ? params.id[0] : params.id
    if (id) fetchSighting(id)
  }, [params.id])

  const fetchSighting = async (id: string) => {
    try {
      const res = await fetch(`/api/quick-sightings/${id}`)
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Kayıt bulunamadı')
        return
      }
      const data = await res.json()
      setSighting(data)
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const openMaps = () => {
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

      if (!sighting?.user_id) {
        toast.error('Yardım sağlayan kullanıcı bilgisi bulunamadı')
        return
      }

      if (sighting.user_id === user.id) {
        toast.error('Kendi nadir paylaşımınız için mesaj talebi gönderemezsiniz.')
        return
      }

      const commissionRate = Number(sighting.helper_commission_rate ?? 15)
      const draft = `Merhaba, \"${sighting.description}\" paylaşımınız için iletişime geçmek istiyorum. Uygun olursa ürün bağlantısı ve detayları paylaşabilir misiniz? (%${commissionRate} yardım komisyonu modelini kabul ediyorum.)`
      const params = new URLSearchParams({
        receiver: sighting.user_id,
        type: 'reward',
        draft,
      })

      router.push(`/messages?${params.toString()}`)
    } catch (err) {
      console.error('Rare sighting message request navigation error:', err)
      toast.error('Mesaj talebi başlatılamadı')
    }
  }

  const toggleMuseumStatus = async () => {
    if (!sighting) return

    try {
      setMuseumToggleLoading(true)
      const nextStatus = !sighting.is_in_museum

      const { error: updateError } = await supabase
        .from('quick_sightings')
        .update({ is_in_museum: nextStatus })
        .eq('id', sighting.id)

      if (updateError) {
        throw updateError
      }

      setSighting({ ...sighting, is_in_museum: nextStatus })
      toast.success(nextStatus ? 'Paylaşım nadir müzenize eklendi.' : 'Paylaşım nadir müzenizden çıkarıldı.')
    } catch (err: any) {
      console.error('Toggle museum status error:', err)
      toast.error(err?.message || 'Müze durumu güncellenemedi')
    } finally {
      setMuseumToggleLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (error || !sighting) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Kayıt bulunamadı</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/sightings" className="text-purple-600 hover:underline font-medium">
          ← Tüm Yardımlara Dön
        </Link>
      </div>
    )
  }

  return (
    <main className="container-custom py-8 overflow-x-hidden">
      {/* Back */}
      <div className="mb-6">
        <Link
          href="/sightings?tab=rare"
          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium text-sm"
        >
          ← Nadir Görülenler Listesine Dön
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Photo */}
          {sighting.photo_url ? (
            <div className="h-72 overflow-hidden">
              <img
                src={sighting.photo_url}
                alt="Nadir görülen ürün"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-44 bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center justify-center gap-2">
              <span className="text-6xl">💎</span>
              <span className="text-sm text-purple-400">Fotoğraf eklenmemiş</span>
            </div>
          )}

          <div className="p-6">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">💎 NADİR GÖRÜLEN</span>
              {sighting.category && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {CATEGORIES[sighting.category] ?? sighting.category}
                </span>
              )}
              {sighting.price != null && (
                <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                  ₺{sighting.price.toLocaleString('tr-TR')}
                </span>
              )}
            </div>

            {/* Description */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4 break-words">{sighting.description}</h1>

            {/* Info grid */}
            <div className="space-y-3">
              {/* Location */}
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">📍</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 break-words">{sighting.location_name}</p>
                  {sighting.address && <p className="text-sm text-gray-500 break-words">{sighting.address}</p>}
                  {sighting.city && (
                    <p className="text-sm text-gray-500">{sighting.city}{sighting.district ? `, ${sighting.district}` : ''}</p>
                  )}
                </div>
              </div>

              {/* Price */}
              {sighting.price != null && (
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">💰</span>
                  <div>
                    <p className="font-medium text-green-800">Görülen Fiyat</p>
                    <p className="text-2xl font-bold text-green-700">₺{sighting.price.toLocaleString('tr-TR')}</p>
                    <p className="text-xs text-gray-400">Satıcı / etiket fiyatı — resmi değildir</p>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">📅</span>
                <div>
                  <p className="text-sm text-gray-500">Bildirim tarihi</p>
                  <p className="font-medium text-gray-900">{formatDate(sighting.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Button */}
        {sighting.latitude && sighting.longitude && (
          <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h2 className="font-bold text-gray-900 mb-3">🗺️ Haritada Gör</h2>
            <button
              onClick={openMaps}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Google Maps'te Aç
            </button>
          </div>
        )}

        {/* Reporter */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">👤 Bildiren Kullanıcı</h2>
          <div className="flex items-center gap-3">
            {sighting.user?.avatar_url ? (
              <img src={sighting.user.avatar_url} alt="" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                {sighting.user?.full_name?.[0] ?? '?'}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{sighting.user?.full_name || 'Anonim Kullanıcı'}</p>
              <p className="text-sm text-purple-600">+{sighting.points_earned} puan kazandı</p>
            </div>
          </div>

          {sighting.user_id !== currentUserId && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 mb-2">
                Bu paylaşım üzerinden mesaj talebi gönderirken yardım sahibi ürün fiyatı üstüne
                <span className="font-semibold text-gray-700"> %{Number(sighting.helper_commission_rate ?? 15)}</span>
                {' '}yardım komisyonu talep edebilir.
              </p>
              <button
                onClick={handleMessageRequest}
                className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold"
              >
                Yardımcıya Mesaj Talebi Gönder
              </button>
            </div>
          )}

          {sighting.user_id === currentUserId && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <button
                onClick={toggleMuseumStatus}
                disabled={museumToggleLoading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold disabled:opacity-60"
              >
                {museumToggleLoading
                  ? 'Güncelleniyor...'
                  : sighting.is_in_museum
                    ? 'Nadir Müzemden Çıkar'
                    : 'Nadir Müzeme Ekle'}
              </button>
            </div>
          )}
        </div>

        {/* CTA — create spot */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-lg font-bold mb-1">Bu ürünü arıyor musunuz?</h2>
          <p className="text-purple-100 text-sm mb-4">
            Bir spot oluşturarak topluluktan daha fazla bulgu toplayabilirsiniz.
          </p>
          <Link
            href="/create-spot"
            className="inline-block bg-white text-purple-700 font-bold px-5 py-2 rounded-lg hover:bg-purple-50 transition text-sm"
          >
            + Spot Oluştur
          </Link>
        </div>

        <div className="text-center">
          <Link href="/sightings" className="text-purple-600 hover:underline text-sm">
            ← Tüm Yardımlar
          </Link>
        </div>
      </div>
    </main>
  )
}

// app/api/quick-sightings/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

const geocodeCache = new Map<string, { lat: number; lng: number }>()

async function geocodeLocation(queryRaw: string): Promise<{ lat: number; lng: number } | null> {
  const query = queryRaw.trim()
  if (!query) return null
  const cacheKey = query.toLocaleLowerCase('tr-TR')
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null
  }

  try {
    const queryWithCountry = /turki|türki|turkey/i.test(query) ? query : `${query}, Turkiye`
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(queryWithCountry)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'spotitforme-rare-map/1.0',
        'Accept-Language': 'tr',
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    const first = Array.isArray(data) ? data[0] : null
    const lat = first?.lat != null ? Number(first.lat) : null
    const lng = first?.lon != null ? Number(first.lon) : null
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null

    const coords = { lat, lng }
    geocodeCache.set(cacheKey, coords)
    return coords
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const hasPrice = searchParams.get('hasPrice')
    const hasLocation = searchParams.get('hasLocation')
    const search = searchParams.get('search')
    const channel = searchParams.get('channel')
    const normalizedChannel = channel === 'seyahat' ? 'social' : channel

    const parseNumber = (value: any) => {
      const n = typeof value === 'number' ? value : Number(value)
      return Number.isFinite(n) ? n : null
    }

    const getCoords = (row: any) => {
      const lat = parseNumber(row.latitude ?? row.lat ?? row.location_lat)
      const lng = parseNumber(row.longitude ?? row.lng ?? row.location_lng)
      return lat != null && lng != null ? { lat, lng } : null
    }

    const toSearchText = (value: any) => {
      if (value == null) return ''
      if (Array.isArray(value)) return value.join(' ').toLowerCase()
      return String(value).toLowerCase()
    }

    let filtered: any[] = []

    if (normalizedChannel === 'social') {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(150)

      if (error) {
        console.error('Social posts map API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const socialRows = (data || []).filter((p: any) => {
        // Kolon varsa gizli postlari disla; eski semada alan yoksa dokunma.
        if (typeof p?.is_public === 'boolean' && p.is_public === false) return false
        return true
      })

      const withResolvedCoords = await Promise.all(
        socialRows.map(async (p: any) => {
          const directCoords = getCoords(p)
          if (directCoords) return { ...p, __coords: directCoords }

          const geoQuery = p.location || p.city || ''
          const resolved = await geocodeLocation(String(geoQuery))
          return { ...p, __coords: resolved }
        }),
      )

      filtered = withResolvedCoords

      if (hasLocation === 'with') {
        filtered = filtered.filter((p: any) => p.__coords)
      } else if (hasLocation === 'without') {
        filtered = filtered.filter((p: any) => !p.__coords)
      }

      if (category) {
        filtered = filtered.filter((p: any) => p.category === category)
      }

      if (search) {
        const text = search.toLowerCase()
        filtered = filtered.filter((p: any) =>
          toSearchText(p.title).includes(text) ||
          toSearchText(p.content).includes(text) ||
          toSearchText(p.description).includes(text) ||
          toSearchText(p.location).includes(text) ||
          toSearchText(p.city).includes(text) ||
          toSearchText(p.district).includes(text) ||
          toSearchText(p.category).includes(text) ||
          toSearchText(p.hashtags).includes(text),
        )
      }

      filtered = filtered.map((p: any) => {
        const coords = p.__coords || getCoords(p)
        const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
        return {
          id: p.id,
          title: p.title ?? p.content ?? null,
          description: p.description ?? p.content ?? null,
          country: p.country ?? 'Turkiye',
          city: p.city ?? null,
          district: p.district ?? null,
          location_name: p.location ?? null,
          category: p.category ?? null,
          marketplace: null,
          seller_name: null,
          source_channel: 'social',
          price: null,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          image_url: firstImage,
          photo_url: firstImage,
          link_preview_image: firstImage,
          created_at: p.created_at,
          user_id: p.user_id,
        }
      })
    } else {
      const { data, error } = await supabase
        .from('quick_sightings')
        .select('*')
        .eq('status', 'active')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Quick sightings API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      filtered = data || []

      if (hasLocation === 'with') {
        filtered = filtered.filter((s: any) => s.latitude && s.longitude)
      } else if (hasLocation === 'without') {
        filtered = filtered.filter((s: any) => !s.latitude || !s.longitude)
      }

      if (hasPrice === 'with') {
        filtered = filtered.filter((s: any) => s.price != null)
      } else if (hasPrice === 'without') {
        filtered = filtered.filter((s: any) => s.price == null)
      }

      if (category) {
        filtered = filtered.filter((s: any) => s.category === category)
      }

      if (normalizedChannel === 'physical' || normalizedChannel === 'virtual') {
        filtered = filtered.filter((s: any) => (s.source_channel || 'physical') === normalizedChannel)
      }

      if (search) {
        const text = search.toLowerCase()
        filtered = filtered.filter((s: any) =>
          s.title?.toLowerCase().includes(text) ||
          s.description?.toLowerCase().includes(text) ||
          s.location_name?.toLowerCase().includes(text) ||
          s.address?.toLowerCase().includes(text) ||
          s.city?.toLowerCase().includes(text) ||
          s.district?.toLowerCase().includes(text) ||
          s.product_url?.toLowerCase().includes(text) ||
          s.marketplace?.toLowerCase().includes(text) ||
          s.seller_name?.toLowerCase().includes(text) ||
          s.link_preview_title?.toLowerCase().includes(text) ||
          s.link_preview_description?.toLowerCase().includes(text) ||
          s.link_preview_brand?.toLowerCase().includes(text) ||
          s.hashtags?.toLowerCase().includes(text) ||
          s.price?.toString().toLowerCase().includes(text) ||
          s.points_earned?.toString().toLowerCase().includes(text) ||
          s.user_id?.toLowerCase().includes(text) ||
          s.status?.toLowerCase().includes(text)
        )
      }
    }

    // Fetch user profiles
    const user_ids = Array.from(new Set(filtered.map((s: any) => s.user_id).filter(Boolean)))
    let users: any[] = []
    if (user_ids.length > 0) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .in('id', user_ids)
      users = profileData || []
    }

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    const result = filtered.map((s: any) => ({
      ...s,
      user: userMap[s.user_id] || null,
    }))

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Quick sightings unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

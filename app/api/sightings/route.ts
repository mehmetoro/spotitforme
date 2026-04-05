// app/api/sightings/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const hasPrice = searchParams.get('hasPrice')
    const hasLocation = searchParams.get('hasLocation')
    const search = searchParams.get('search')
    const hashtag = searchParams.get('hashtag')
    const channel = searchParams.get('channel')

    // Supabase query ile filtreleri uygula
    let query = supabase
      .from('sightings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (category) {
      query = query.eq('category', category)
    }
    if (channel === 'physical' || channel === 'virtual') {
      query = query.eq('source_channel', channel)
    }
    if (hasLocation === 'with') {
      query = query.not('latitude', 'is', null).not('longitude', 'is', null)
    } else if (hasLocation === 'without') {
      query = query.or('latitude.is.null,longitude.is.null')
    }
    if (hasPrice === 'with') {
      query = query.not('price', 'is', null)
    } else if (hasPrice === 'without') {
      query = query.is('price', null)
    }
    if (search) {
      // Çoklu alan araması için or kullan
      const like = `%${search}%`
      query = query.or(`title.ilike.${like},location_description.ilike.${like},notes.ilike.${like},hashtags.ilike.${like},product_url.ilike.${like},marketplace.ilike.${like},seller_name.ilike.${like},link_preview_title.ilike.${like},link_preview_description.ilike.${like},link_preview_brand.ilike.${like}`)
    }
    if (hashtag) {
      const tag = `%#${hashtag.toLowerCase()}%`
      query = query.ilike('hashtags', tag)
    }

    const { data, error } = await query
    if (error) {
      console.error('Sightings API error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Spotter ve spot verilerini zenginleştirme (opsiyonel, eski kodu koruyorum)
    const spotter_ids = Array.from(new Set((data || []).map((s: any) => s.spotter_id).filter((id: any) => id)))
    const spot_ids = Array.from(new Set((data || []).map((s: any) => s.spot_id).filter((id: any) => id)))

    let spotters: any[] = []
    let spots: any[] = []

    if (spotter_ids.length > 0) {
      const result = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .in('id', spotter_ids)
      spotters = result.data || []
    }

    if (spot_ids.length > 0) {
      const result = await supabase
        .from('spots')
        .select('id, title')
        .in('id', spot_ids)
      spots = result.data || []
    }

    const spotter_map: Record<string, any> = (spotters || []).reduce((acc: any, s: any) => ({ ...acc, [s.id]: s }), {})
    const spot_map: Record<string, any> = (spots || []).reduce((acc: any, s: any) => ({ ...acc, [s.id]: s }), {})

    let enriched = (data || []).map((s: any) => ({
      ...s,
      spotter: spotter_map[s.spotter_id] || null,
      spot: spot_map[s.spot_id] || null
    }))

    return NextResponse.json(enriched)
  } catch (err: any) {
    console.error('Sightings API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

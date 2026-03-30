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

    // Fetch sightings without relations
    const { data, error } = await supabase
      .from('sightings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Sightings API error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let filtered = data || []

    // Apply filters
    if (hasLocation === 'with') {
      filtered = filtered.filter((s: any) => s.latitude && s.longitude)
    } else if (hasLocation === 'without') {
      filtered = filtered.filter((s: any) => !s.latitude || !s.longitude)
    }

    if (hasPrice === 'with') {
      filtered = filtered.filter((s: any) => s.price)
    } else if (hasPrice === 'without') {
      filtered = filtered.filter((s: any) => !s.price)
    }

    if (category) {
      filtered = filtered.filter((s: any) => s.category === category)
    }

    if (search) {
      const text = search.toLowerCase();
      filtered = filtered.filter((s: any) =>
        s.title?.toLowerCase().includes(text) ||
        s.location_description?.toLowerCase().includes(text) ||
        s.notes?.toLowerCase().includes(text) ||
        s.hashtags?.toLowerCase().includes(text)
      );
    }

    if (hashtag) {
      filtered = filtered.filter((s: any) =>
        s.hashtags?.toLowerCase().includes(`#${hashtag.toLowerCase()}`)
      )
    }

    // Fetch spotter and spot data separately if needed
    const spotter_ids = Array.from(new Set(filtered.map((s: any) => s.spotter_id).filter((id: any) => id)))
    const spot_ids = Array.from(new Set(filtered.map((s: any) => s.spot_id).filter((id: any) => id)))

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

    let enriched = filtered.map((s: any) => ({
      ...s,
      spotter: spotter_map[s.spotter_id] || null,
      spot: spot_map[s.spot_id] || null
    }));

    // Sadece sightings tablosunun kendi alanlarında arama yapılır (title dahil)
    return NextResponse.json(enriched)
  } catch (err: any) {
    console.error('Sightings API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

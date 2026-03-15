// app/api/quick-sightings/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

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

    const { data, error } = await supabase
      .from('quick_sightings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Quick sightings API error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let filtered = data || []

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

    if (search) {
      const text = search.toLowerCase()
      filtered = filtered.filter((s: any) =>
        s.description?.toLowerCase().includes(text) ||
        s.location_name?.toLowerCase().includes(text) ||
        s.address?.toLowerCase().includes(text) ||
        s.city?.toLowerCase().includes(text)
      )
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

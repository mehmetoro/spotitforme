// app/api/quick-sightings/[id]/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('quick_sightings')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })
    }

    // Listede görünmeyen kayıtlar detaydan da erişilemesin
    if (data.is_hidden || data.status !== 'active') {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })
    }

    // Fetch user profile
    let user = null
    if (data.user_id) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .eq('id', data.user_id)
        .single()
      user = profileData
    }

    return NextResponse.json({ ...data, user })
  } catch (err: any) {
    console.error('Quick sightings [id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

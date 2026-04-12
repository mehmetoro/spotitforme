import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Service role varsa onu, yoksa anon key'i kullan
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SUPABASE_ANON_KEY

    console.log('📝 API: Fetching sighting:', params.id)
    console.log('🔐 Using service role:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables')
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    const sightingId = params.id

    // Sightings verilerini al
    const { data: sightingData, error: sightingError } = await supabase
      .from('sightings')
      .select('*')
      .eq('id', sightingId)
      .maybeSingle()

    if (sightingError) {
      console.error('❌ Sighting query error:', sightingError)
      return NextResponse.json(
        { error: sightingError.message },
        { status: 400 }
      )
    }

    if (!sightingData) {
      console.warn('⚠️ Sighting not found:', sightingId)
      return NextResponse.json(
        { error: 'Sighting not found' },
        { status: 404 }
      )
    }

    // Listede görünmeyen kayıtlar detaydan da erişilemesin
    if (sightingData.is_hidden) {
      return NextResponse.json(
        { error: 'Sighting not found' },
        { status: 404 }
      )
    }

    // Spotter bilgilerini al
    let spotter = null
    if (sightingData.spotter_id) {
      const { data: spotterData } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .eq('id', sightingData.spotter_id)
        .maybeSingle()
      spotter = spotterData
    }

    // Spot bilgilerini al
    let spot = null
    if (sightingData.spot_id) {
      const { data: spotData } = await supabase
        .from('spots')
        .select('id, title, description')
        .eq('id', sightingData.spot_id)
        .maybeSingle()
      spot = spotData
    }

    const fullSighting = {
      ...sightingData,
      spotter,
      spot
    }

    console.log('✅ Sighting found and returned:', sightingId)
    return NextResponse.json(fullSighting)
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

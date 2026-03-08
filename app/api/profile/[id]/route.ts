import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRole) {
    throw new Error('Supabase service role environment variables are missing')
  }

  return createClient(supabaseUrl, serviceRole)
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const userId = String(context?.params?.id || '').trim()

    if (!userId) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı kimliği' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = getSupabaseAdmin()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user?.id) {
      return NextResponse.json({ error: 'Kullanıcı doğrulanamadı' }, { status: 401 })
    }

    let profileData: any = null
    const profileSelectCandidates = [
      'id, full_name, name, username, email, avatar_url, bio, location, created_at',
      'id, full_name, name, email, avatar_url, bio, location, created_at',
      'id, name, email, avatar_url, bio, location, created_at',
      'id, name, email, avatar_url, created_at',
    ]

    for (const selectFields of profileSelectCandidates) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(selectFields)
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        profileData = data
        break
      }
    }

    const [{ data: sightingsData }, { data: spotsData }] = await Promise.all([
      supabase
        .from('quick_sightings')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase
        .from('spots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ])

    return NextResponse.json({
      user: profileData,
      sightings: sightingsData || [],
      spots: spotsData || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Profil verisi alınamadı', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

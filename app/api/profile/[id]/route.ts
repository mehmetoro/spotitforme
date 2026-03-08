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

    const supabase = getSupabaseAdmin()

    // Önce auth.users'dan kullanıcıyı al (her zaman var olmalı)
    const { data: authUserData, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError || !authUserData?.user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı', details: authError?.message }, { status: 404 })
    }

    // Auth user'dan profil oluştur
    let profileData: any = {
      id: authUserData.user.id,
      email: authUserData.user.email,
      full_name: authUserData.user.user_metadata?.full_name || null,
      name: authUserData.user.user_metadata?.name || null,
      username: authUserData.user.user_metadata?.username || null,
      avatar_url: authUserData.user.user_metadata?.avatar_url || null,
      bio: null,
      location: null,
      created_at: authUserData.user.created_at,
    }

    // user_profiles varsa ondan ek bilgileri al
    try {
      const { data: profileExtra } = await supabase
        .from('user_profiles')
        .select('bio, location, avatar_url, full_name, name, username')
        .eq('id', userId)
        .maybeSingle()

      if (profileExtra) {
        // user_profiles'daki değerler varsa onları kullan
        profileData = {
          ...profileData,
          bio: profileExtra.bio || profileData.bio,
          location: profileExtra.location || profileData.location,
          avatar_url: profileExtra.avatar_url || profileData.avatar_url,
          full_name: profileExtra.full_name || profileData.full_name,
          name: profileExtra.name || profileData.name,
          username: profileExtra.username || profileData.username,
        }
      }
    } catch (e) {
      // user_profiles tablosu yoksa veya hata varsa, sadece auth verisiyle devam et
      console.log('user_profiles query failed, using auth data only')
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

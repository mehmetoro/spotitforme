// app/api/admin/run-cron/route.ts
// Admin panelinden güvenli cron tetikleme — CRON_SECRET client'a sızdırılmaz
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Admin kimlik doğrulaması
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Yetki gerekli' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const cronSecret = process.env.CRON_SECRET

    if (!supabaseUrl || !serviceKey || !cronSecret) {
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Kullanıcının admin olup olmadığını doğrula
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
    }

    // Parametreleri al
    const body = await request.json()
    const { dry_run = false, force = false } = body as { dry_run?: boolean; force?: boolean }

    // Cron endpoint'ini server-side çağır (CRON_SECRET güvende kalır)
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    if (dry_run) params.set('dry_run', '1')
    if (force) params.set('force', '1')

    const cronUrl = `${baseUrl}/api/cron/product-check${params.toString() ? '?' + params.toString() : ''}`

    const cronResponse = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${cronSecret}`,
      },
    })

    const cronData = await cronResponse.json()

    return NextResponse.json({
      success: true,
      dry_run,
      force,
      result: cronData,
    })
  } catch (error) {
    console.error('run-cron error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// app/api/admin/seed-from-gui/route.ts
// Server-side endpoint that seeds places from GUI
// Requires authentication (admin check)

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface SeedPlace {
  title: string
  content: string
  description?: string
  category?: string
  city?: string
  district?: string
  country?: string
  latitude?: number | null
  longitude?: number | null
  images?: string[] | null
  post_type?: string
  translations?: {
    [key: string]: { title: string; description: string }
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth: CRON_SECRET ──
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get('Authorization')
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse body
    const body = await request.json()
    const places: SeedPlace[] = body.places || []
    const adminEmail = body.adminEmail || 'spotitformeweb@gmail.com'

    if (!places.length) {
      return NextResponse.json({ error: 'No places provided' }, { status: 400 })
    }

    // ── Supabase admin client ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // ── Resolve admin user_id ──
    const { data: adminUsers, error: adminLookupErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const adminUser = adminUsers?.users?.find((u) => u.email === adminEmail)
    if (adminLookupErr || !adminUser) {
      return NextResponse.json(
        { error: `Admin user not found for email: ${adminEmail}` },
        { status: 500 }
      )
    }
    const adminUserId = adminUser.id

    // ── Build rows (graceful column fallback) ──
    const OPTIONAL_COLUMNS = ['description', 'district', 'country', 'latitude', 'longitude', 'images', 'hashtags', 'title', 'category', 'location', 'city']

    const buildRow = (p: SeedPlace, excludeColumns: string[] = []) => {
      const row: Record<string, any> = {
        user_id: adminUserId,
        content: p.content,
        post_type: p.post_type ?? 'rare_sight',
        is_public: true,
      }
      if (!excludeColumns.includes('title')) row.title = p.title
      if (!excludeColumns.includes('description')) row.description = p.description ?? p.content ?? null
      if (!excludeColumns.includes('category')) row.category = p.category ?? null
      if (!excludeColumns.includes('location')) row.location = p.location ?? null
      if (!excludeColumns.includes('city')) row.city = p.city ?? null
      if (!excludeColumns.includes('district')) row.district = p.district ?? null
      if (!excludeColumns.includes('country')) row.country = p.country ?? null
      if (!excludeColumns.includes('hashtags')) row.hashtags = p.hashtags ?? null
      if (!excludeColumns.includes('latitude')) row.latitude = p.latitude ?? null
      if (!excludeColumns.includes('longitude')) row.longitude = p.longitude ?? null
      if (!excludeColumns.includes('images')) row.images = p.images ?? null
      return row
    }

    // ── Insert posts ──
    let rows = places.map((p) => buildRow(p))
    let insertedIds: string[] = []
    let excludedColumns: string[] = []

    while (true) {
      const { data, error } = await supabase.from('social_posts').insert(rows).select('id')
      if (!error) {
        insertedIds = data?.map((r: any) => r.id) ?? []
        break
      }

      const missingCol = OPTIONAL_COLUMNS.find((col) => error.message?.includes(`'${col}'`))
      if (!missingCol) {
        console.error('seed insert error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      excludedColumns.push(missingCol)
      rows = places.map((p) => buildRow(p, excludedColumns))
    }

    // ── Insert translations ──
    const LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const
    const translationRows: Array<{ social_post_id: string; language: string; title: string | null; description: string | null }> = []

    places.forEach((place, idx) => {
      const postId = insertedIds[idx]
      if (!postId || !place.translations) return
      for (const lang of LOCALES) {
        const t = place.translations[lang]
        if (!t) continue
        translationRows.push({
          social_post_id: postId,
          language: lang,
          title: t.title ?? place.title ?? '',
          description: t.description ?? '',
        })
      }
    })

    if (translationRows.length > 0) {
      const { error: tErr } = await supabase
        .from('social_post_translations')
        .upsert(translationRows, { onConflict: 'social_post_id,language' })

      if (tErr) {
        console.error('translations insert error:', tErr)
        return NextResponse.json({
          inserted: insertedIds.length,
          ids: insertedIds,
          translationWarning: tErr.message,
        })
      }
    }

    return NextResponse.json({
      inserted: insertedIds.length,
      ids: insertedIds,
      translationsInserted: translationRows.length,
      seededByEmail: adminEmail,
      seededByUserId: adminUserId,
      excludedColumns: excludedColumns.length > 0 ? excludedColumns : undefined,
    })
  } catch (error) {
    console.error('seed-from-gui error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

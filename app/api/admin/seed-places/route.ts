// app/api/admin/seed-places/route.ts
// Admin-only endpoint to bulk-insert pre-seeded rare travel places into social_posts
// Auth: requires Authorization: Bearer <CRON_SECRET> header
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface Translations {
  tr?: string
  en?: string
  de?: string
  fr?: string
  es?: string
  ru?: string
}

interface PlaceRecord {
  title: string
  content: string
  description?: string | null
  category?: string | null
  location?: string | null
  city?: string | null
  district?: string | null
  country?: string | null
  hashtags?: string[] | null
  latitude?: number | null
  longitude?: number | null
  images?: string[] | null
  post_type?: string
  /** Multilingual title+description per locale */
  translations?: {
    tr?: { title?: string; description?: string }
    en?: { title?: string; description?: string }
    de?: { title?: string; description?: string }
    fr?: { title?: string; description?: string }
    es?: { title?: string; description?: string }
    ru?: { title?: string; description?: string }
  }
}

export async function POST(request: NextRequest) {
  // --- Auth ---
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('Authorization')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- Supabase admin client ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // --- Resolve admin user_id from request override or ADMIN_EMAIL ---
  const headerAdminEmail = request.headers.get('x-admin-email')?.trim().toLowerCase()
  const adminEmail = (headerAdminEmail || process.env.ADMIN_EMAIL || 'spotitformeweb@gmail.com').trim().toLowerCase()

  const { data: adminUsers, error: adminLookupErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const adminUser = adminUsers?.users?.find((u) => u.email === adminEmail)
  if (adminLookupErr || !adminUser) {
    return NextResponse.json(
      { error: `Admin user not found for email: ${adminEmail}` },
      { status: 500 }
    )
  }
  const adminUserId = adminUser.id

  // --- Parse body ---
  let places: PlaceRecord[]
  try {
    const body = await request.json()
    if (!Array.isArray(body?.places)) {
      return NextResponse.json(
        { error: '`places` array is required in request body' },
        { status: 400 }
      )
    }
    places = body.places
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (places.length === 0) {
    return NextResponse.json({
      inserted: 0,
      message: 'Nothing to insert',
      seededByEmail: adminEmail,
      seededByUserId: adminUserId,
    })
  }

  if (places.length > 50) {
    return NextResponse.json({ error: 'Max 50 places per request' }, { status: 400 })
  }

  // --- Build insert rows (graceful column fallback) ---
  const OPTIONAL_COLUMNS = ['description', 'district', 'country', 'latitude', 'longitude', 'images', 'hashtags', 'title', 'category', 'location', 'city']

  const buildRow = (p: PlaceRecord, excludeColumns: string[] = []) => {
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

  // --- Insert posts with automatic column fallback ---
  let rows = places.map((p) => buildRow(p))
  let insertedIds: string[] = []
  let excludedColumns: string[] = []

  while (true) {
    const { data, error } = await supabase.from('social_posts').insert(rows).select('id')
    if (!error) {
      insertedIds = data?.map((r: any) => r.id) ?? []
      break
    }

    // Detect missing column and retry without it
    const missingCol = OPTIONAL_COLUMNS.find((col) => error.message?.includes(`'${col}'`))
    if (!missingCol) {
      console.error('seed-places insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    excludedColumns.push(missingCol)
    rows = places.map((p) => buildRow(p, excludedColumns))
  }

  // --- Insert translations ---
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
        description: t.description ?? place.content ?? '',
      })
    }
  })

  if (translationRows.length > 0) {
    const { error: tErr } = await supabase
      .from('social_post_translations')
      .upsert(translationRows, { onConflict: 'social_post_id,language' })

    if (tErr) {
      console.error('seed-places translations insert error:', tErr)
      // Non-fatal — post inserted, translations failed
      return NextResponse.json({
        inserted: insertedIds.length,
        ids: insertedIds,
        translationWarning: tErr.message,
        seededByEmail: adminEmail,
        seededByUserId: adminUserId,
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
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TARGET_LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const
type TargetLocale = (typeof TARGET_LOCALES)[number]

type TranslationEntity = 'spot' | 'quick_sighting' | 'collection_post' | 'social_post' | 'sighting' | 'travel_route' | 'shop_inventory'

type SaveTranslationsBody = {
  entity?: TranslationEntity
  recordId?: string
  sourceLanguage?: string
  title?: string
  description?: string
}

async function translateOne({
  apiUrl,
  text,
  source,
  target,
}: {
  apiUrl: string
  text: string
  source: string
  target: TargetLocale
}) {
  if (!text.trim()) return ''
  if (target === source) return text

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source,
      target,
      format: 'text',
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Translation request failed (${response.status}): ${errorText.slice(0, 180)}`)
  }

  const data = await response.json()
  if (!data?.translatedText || typeof data.translatedText !== 'string') {
    throw new Error('Invalid translation response')
  }

  return data.translatedText
}

function resolveTarget(entity: TranslationEntity) {
  if (entity === 'spot') return { table: 'spot_translations', idColumn: 'spot_id' }
  if (entity === 'quick_sighting') return { table: 'quick_sighting_translations', idColumn: 'quick_sighting_id' }
  if (entity === 'social_post') return { table: 'social_post_translations', idColumn: 'social_post_id' }
  if (entity === 'sighting') return { table: 'sighting_translations', idColumn: 'sighting_id' }
  if (entity === 'travel_route') return { table: 'travel_route_translations', idColumn: 'travel_route_id' }
  if (entity === 'shop_inventory') return { table: 'shop_inventory_translations', idColumn: 'shop_inventory_id' }
  return { table: 'collection_post_translations', idColumn: 'collection_post_id' }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveTranslationsBody
    const entity = body.entity
    const recordId = (body.recordId || '').trim()
    const sourceLanguage = ((body.sourceLanguage || 'tr').toLowerCase().trim() || 'tr') as TargetLocale
    const title = (body.title || '').trim()
    const description = (body.description || '').trim()

    if (!entity || !['spot', 'quick_sighting', 'collection_post', 'social_post', 'sighting', 'travel_route', 'shop_inventory'].includes(entity)) {
      return NextResponse.json({ error: 'Invalid entity' }, { status: 400 })
    }

    if (!recordId) {
      return NextResponse.json({ error: 'recordId is required' }, { status: 400 })
    }

    if (!title && !description) {
      return NextResponse.json({ error: 'title or description is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const translationApiUrl = process.env.HUGGINGFACE_LIBRETRANSLATE_URL

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase server env vars' }, { status: 500 })
    }

    if (!translationApiUrl) {
      return NextResponse.json({ error: 'HUGGINGFACE_LIBRETRANSLATE_URL is missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { table, idColumn } = resolveTarget(entity)

    const translatedByLocale = await Promise.all(
      TARGET_LOCALES.map(async (locale) => {
        const translatedTitle = title
          ? await translateOne({ apiUrl: translationApiUrl, text: title, source: sourceLanguage, target: locale })
          : ''
        const translatedDescription = description
          ? await translateOne({ apiUrl: translationApiUrl, text: description, source: sourceLanguage, target: locale })
          : ''

        return {
          locale,
          translatedTitle,
          translatedDescription,
        }
      })
    )

    const nowIso = new Date().toISOString()
    // Fetch existing rows so we can preserve fields not provided in this request
    const { data: existingRows } = await supabase
      .from(table)
      .select(`language, title, description`)
      .eq(idColumn, recordId)
      .in('language', TARGET_LOCALES as unknown as string[])

    const existingMap: Record<string, { title: string; description: string }> = {}
    ;(existingRows || []).forEach((r: any) => {
      existingMap[r.language] = { title: r.title || '', description: r.description || '' }
    })

    const rows = translatedByLocale.map((entry) => {
      const existing = existingMap[entry.locale] || { title: '', description: '' }
      // Only overwrite a field if this request actually provided it (non-empty result)
      const resolvedTitle = entry.translatedTitle || existing.title || ''
      const resolvedDescription = entry.translatedDescription || existing.description || ''
      return {
        [idColumn]: recordId,
        language: entry.locale,
        title: resolvedTitle,
        description: resolvedDescription,
        translation_status: 'completed',
        translation_service: 'libretranslate',
        translated_at: nowIso,
        updated_at: nowIso,
      }
    })

    const { error } = await supabase.from(table).upsert(rows, {
      onConflict: `${idColumn},language`,
    })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ ok: true, translated: rows.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

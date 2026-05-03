import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const TARGET_LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const

type TranslatePayload = {
  spot_id: string
  source_language: string
  title: string
  description: string
}

type SpotRecord = {
  id?: string
  original_language?: string
  title?: string
  description?: string
}

type WebhookPayload = {
  type?: string
  table?: string
  record?: SpotRecord
  old_record?: SpotRecord
}

function normalizePayload(input: unknown): TranslatePayload | null {
  if (!input || typeof input !== 'object') return null

  const plain = input as Record<string, unknown>
  if (typeof plain.spot_id === 'string') {
    const title = typeof plain.title === 'string' ? plain.title : ''
    const description = typeof plain.description === 'string' ? plain.description : ''

    if (!plain.spot_id || !title || !description) return null

    return {
      spot_id: plain.spot_id,
      source_language:
        typeof plain.source_language === 'string' && plain.source_language
          ? plain.source_language
          : 'auto',
      title,
      description,
    }
  }

  const webhook = input as WebhookPayload
  const record = webhook.record

  if (!record?.id || !record.title || !record.description) return null

  return {
    spot_id: record.id,
    source_language: record.original_language || 'auto',
    title: record.title,
    description: record.description,
  }
}

async function translateOne({
  endpoint,
  text,
  source,
  target,
}: {
  endpoint: string
  text: string
  source: string
  target: string
}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source,
      target,
      format: 'text',
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`translate ${source}->${target} failed (${response.status}): ${body.slice(0, 180)}`)
  }

  const data = await response.json()
  if (!data?.translatedText || typeof data.translatedText !== 'string') {
    throw new Error('Invalid translation response')
  }

  return data.translatedText
}

Deno.serve(async (req) => {
  try {
    const incoming = await req.json()
    const payload = normalizePayload(incoming)

    if (!payload?.spot_id || !payload?.title || !payload?.description) {
      return new Response(JSON.stringify({ error: 'Invalid payload. Expected direct payload or Supabase webhook payload.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const libreTranslateUrl = Deno.env.get('HUGGINGFACE_LIBRETRANSLATE_URL')

    if (!supabaseUrl || !serviceRoleKey || !libreTranslateUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or HUGGINGFACE_LIBRETRANSLATE_URL' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)
    const source = (payload.source_language || 'auto').toLowerCase()

    const rows = await Promise.all(
      TARGET_LOCALES.map(async (target) => {
        const translatedTitle =
          target === source
            ? payload.title
            : await translateOne({ endpoint: libreTranslateUrl, text: payload.title, source, target })

        const translatedDescription =
          target === source
            ? payload.description
            : await translateOne({ endpoint: libreTranslateUrl, text: payload.description, source, target })

        return {
          spot_id: payload.spot_id,
          language: target,
          title: translatedTitle,
          description: translatedDescription,
          translation_status: 'completed',
          translated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    )

    const { error } = await admin.from('spot_translations').upsert(rows, {
      onConflict: 'spot_id,language',
    })

    if (error) {
      throw new Error(error.message)
    }

    return new Response(JSON.stringify({ ok: true, translated: rows.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

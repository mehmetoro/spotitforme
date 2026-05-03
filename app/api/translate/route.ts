import { NextResponse } from 'next/server'

const TARGET_LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const

type TranslateBody = {
  text?: string
  source?: string
  targets?: string[]
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
  target: string
}) {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslateBody
    const text = body.text?.trim()
    const source = (body.source || 'auto').toLowerCase()
    const requestedTargets = body.targets || [...TARGET_LOCALES]

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const apiUrl = process.env.HUGGINGFACE_LIBRETRANSLATE_URL
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'HUGGINGFACE_LIBRETRANSLATE_URL is missing' },
        { status: 500 }
      )
    }

    const targets = requestedTargets
      .map((locale) => locale.toLowerCase())
      .filter((locale, index, arr) => arr.indexOf(locale) === index)
      .filter((locale) => TARGET_LOCALES.includes(locale as (typeof TARGET_LOCALES)[number]))

    if (targets.length === 0) {
      return NextResponse.json({ error: 'No valid target language provided' }, { status: 400 })
    }

    const translations: Record<string, string> = {}

    await Promise.all(
      targets.map(async (target) => {
        if (target === source) {
          translations[target] = text
          return
        }

        translations[target] = await translateOne({
          apiUrl,
          text,
          source,
          target,
        })
      })
    )

    return NextResponse.json({ source, translations })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

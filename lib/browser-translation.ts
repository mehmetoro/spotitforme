import type { SupportedLocale } from '@/hooks/useCurrentLocale'

declare global {
  interface Window {
    LanguageDetector?: {
      availability?: (options?: Record<string, unknown>) => Promise<string> | string
      create?: (options?: Record<string, unknown>) => Promise<any>
    }
    Translator?: {
      availability?: (options?: Record<string, unknown>) => Promise<string> | string
      create?: (options?: Record<string, unknown>) => Promise<any>
    }
  }
}

type TranslationResult = {
  translatedText: string
  sourceLanguage: SupportedLocale | null
  supported: boolean
  didTranslate: boolean
}

const translationCache = new Map<string, string>()
const translatorCache = new Map<string, Promise<any | null>>()
let detectorPromise: Promise<any | null> | null = null

function normalizeLanguage(language: string | null | undefined): SupportedLocale | null {
  if (!language) return null
  const short = language.toLowerCase().split('-')[0]
  if (short === 'tr' || short === 'en' || short === 'de' || short === 'fr' || short === 'es' || short === 'ru') {
    return short
  }
  return null
}

async function getDetector() {
  if (typeof window === 'undefined' || !window.LanguageDetector?.create) return null
  if (!detectorPromise) {
    detectorPromise = (async () => {
      try {
        return await window.LanguageDetector?.create?.()
      } catch {
        return null
      }
    })()
  }
  return detectorPromise
}

async function detectLanguage(text: string): Promise<SupportedLocale | null> {
  const detector = await getDetector()
  if (!detector?.detect) return null

  try {
    const result = await detector.detect(text)
    if (Array.isArray(result) && result.length > 0) {
      const first = result[0]
      return normalizeLanguage(first?.detectedLanguage || first?.language)
    }
  } catch {
    return null
  }

  return null
}

async function getTranslator(sourceLanguage: SupportedLocale, targetLanguage: SupportedLocale) {
  const cacheKey = `${sourceLanguage}:${targetLanguage}`
  if (!translatorCache.has(cacheKey)) {
    translatorCache.set(
      cacheKey,
      (async () => {
        if (typeof window === 'undefined' || !window.Translator?.create) return null
        try {
          return await window.Translator.create({
            sourceLanguage,
            targetLanguage,
          })
        } catch {
          return null
        }
      })()
    )
  }

  return translatorCache.get(cacheKey) || null
}

export async function translateTextInBrowser(options: {
  text: string
  targetLanguage: SupportedLocale
  sourceLanguage?: string | null
}): Promise<TranslationResult> {
  const trimmedText = options.text.trim()
  if (!trimmedText) {
    return {
      translatedText: options.text,
      sourceLanguage: null,
      supported: true,
      didTranslate: false,
    }
  }

  const normalizedTargetLanguage = normalizeLanguage(options.targetLanguage)
  if (!normalizedTargetLanguage) {
    return {
      translatedText: options.text,
      sourceLanguage: null,
      supported: false,
      didTranslate: false,
    }
  }

  const normalizedSourceLanguage =
    normalizeLanguage(options.sourceLanguage) || (await detectLanguage(trimmedText))

  // Language detection failed (e.g. mobile has no LanguageDetector) — try server-side with 'auto'
  if (!normalizedSourceLanguage) {
    try {
      const resp = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmedText,
          source: 'auto',
          targets: [normalizedTargetLanguage],
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        const serverTranslation: string | undefined = data?.translations?.[normalizedTargetLanguage]
        if (serverTranslation && serverTranslation.trim()) {
          const autoKey = `auto:${normalizedTargetLanguage}:${trimmedText}`
          translationCache.set(autoKey, serverTranslation)
          return {
            translatedText: serverTranslation,
            sourceLanguage: normalizeLanguage(data?.source ?? null),
            supported: true,
            didTranslate: serverTranslation !== options.text,
          }
        }
      }
    } catch {
      // ignore
    }
    return {
      translatedText: options.text,
      sourceLanguage: null,
      supported: false,
      didTranslate: false,
    }
  }

  if (normalizedSourceLanguage === normalizedTargetLanguage) {
    return {
      translatedText: options.text,
      sourceLanguage: normalizedSourceLanguage,
      supported: true,
      didTranslate: false,
    }
  }

  const cacheKey = `${normalizedSourceLanguage}:${normalizedTargetLanguage}:${trimmedText}`
  const cachedTranslation = translationCache.get(cacheKey)
  if (cachedTranslation) {
    return {
      translatedText: cachedTranslation,
      sourceLanguage: normalizedSourceLanguage,
      supported: true,
      didTranslate: cachedTranslation !== options.text,
    }
  }

  const translator = await getTranslator(normalizedSourceLanguage, normalizedTargetLanguage)
  if (!translator?.translate) {
    // Browser API unavailable (e.g. mobile) — fall back to server-side LibreTranslate
    try {
      const resp = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmedText,
          source: normalizedSourceLanguage,
          targets: [normalizedTargetLanguage],
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        const serverTranslation: string | undefined = data?.translations?.[normalizedTargetLanguage]
        if (serverTranslation && serverTranslation.trim()) {
          translationCache.set(cacheKey, serverTranslation)
          return {
            translatedText: serverTranslation,
            sourceLanguage: normalizedSourceLanguage,
            supported: true,
            didTranslate: serverTranslation !== options.text,
          }
        }
      }
    } catch {
      // server also failed — return original
    }
    return {
      translatedText: options.text,
      sourceLanguage: normalizedSourceLanguage,
      supported: false,
      didTranslate: false,
    }
  }

  try {
    const translatedText = await translator.translate(trimmedText)
    const finalText = typeof translatedText === 'string' && translatedText.trim() ? translatedText : options.text
    translationCache.set(cacheKey, finalText)

    return {
      translatedText: finalText,
      sourceLanguage: normalizedSourceLanguage,
      supported: true,
      didTranslate: finalText !== options.text,
    }
  } catch {
    return {
      translatedText: options.text,
      sourceLanguage: normalizedSourceLanguage,
      supported: false,
      didTranslate: false,
    }
  }
}

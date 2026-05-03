import type { NextRequest } from 'next/server'

export const locales = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const
export type AppLocale = (typeof locales)[number]

export const defaultLocale: AppLocale = 'tr'

export const localeLabels: Record<AppLocale, string> = {
  tr: 'Turkce',
  en: 'English',
  de: 'Deutsch',
  fr: 'Francais',
  es: 'Espanol',
  ru: 'Russkiy',
}

const localeByRegion: Record<string, AppLocale> = {
  TR: 'tr',
  GB: 'en',
  US: 'en',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  FR: 'fr',
  BE: 'fr',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  RU: 'ru',
}

export function isValidLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value)
}

export function getLocaleFromAcceptLanguage(acceptLanguage: string | null): AppLocale {
  if (!acceptLanguage) return defaultLocale

  const parts = acceptLanguage.split(',').map((part) => part.trim().toLowerCase())

  for (const part of parts) {
    const lang = part.split(';')[0]
    const [language, region] = lang.split('-')

    if (language && isValidLocale(language)) return language

    if (region) {
      const byRegion = localeByRegion[region.toUpperCase()]
      if (byRegion) return byRegion
    }
  }

  return defaultLocale
}

export function detectLocaleFromRequest(request: NextRequest): AppLocale {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale
  }

  return getLocaleFromAcceptLanguage(request.headers.get('accept-language'))
}

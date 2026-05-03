'use client'

import { useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const locales = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const

const labels: Record<(typeof locales)[number], string> = {
  tr: 'TR',
  en: 'EN',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  ru: 'RU',
}

function withLocale(pathname: string, locale: string) {
  const parts = pathname.split('/').filter(Boolean)

  if (parts.length > 0 && locales.includes(parts[0] as (typeof locales)[number])) {
    parts[0] = locale
    return `/${parts.join('/')}`
  }

  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
}

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const activeLocale = useCurrentLocale()

  const currentLocale = useMemo(() => {
    const first = pathname.split('/')[1]
    if (locales.includes(first as (typeof locales)[number])) return first
    const fromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]

    if (fromCookie && locales.includes(fromCookie as (typeof locales)[number])) {
      return fromCookie
    }

    return 'tr'
  }, [pathname])

  const handleChange = (nextLocale: string) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`

    const query = searchParams.toString()
    const nextPathname = withLocale(pathname, nextLocale)
    const href = query ? `${nextPathname}?${query}` : nextPathname

    startTransition(() => {
      router.replace(href)
      router.refresh()
    })
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
      <span>{activeLocale === 'tr' ? 'Dil' : activeLocale === 'en' ? 'Language' : activeLocale === 'de' ? 'Sprache' : activeLocale === 'fr' ? 'Langue' : activeLocale === 'es' ? 'Idioma' : 'Yazyk'}</span>
      <select
        aria-label={activeLocale === 'tr' ? 'Dil sec' : activeLocale === 'en' ? 'Select language' : activeLocale === 'de' ? 'Sprache auswahlen' : activeLocale === 'fr' ? 'Choisir la langue' : activeLocale === 'es' ? 'Seleccionar idioma' : 'Vybrat yazyk'}
        className="bg-transparent font-semibold outline-none"
        value={currentLocale}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {labels[locale]}
          </option>
        ))}
      </select>
    </label>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

const supportedLocales = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const

export type SupportedLocale = (typeof supportedLocales)[number]

function resolveLocale(pathname: string): SupportedLocale {
  const first = pathname.split('/').filter(Boolean)[0]
  if (first && supportedLocales.includes(first as SupportedLocale)) {
    return first as SupportedLocale
  }

  if (typeof document !== 'undefined') {
    const fromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]

    if (fromCookie && supportedLocales.includes(fromCookie as SupportedLocale)) {
      return fromCookie as SupportedLocale
    }
  }

  return 'tr'
}

export function useCurrentLocale(): SupportedLocale {
  const pathname = usePathname()
  const pathnameKey = useMemo(() => pathname || '/', [pathname])
  const [locale, setLocale] = useState<SupportedLocale>(() => resolveLocale(pathnameKey))

  useEffect(() => {
    setLocale(resolveLocale(pathnameKey))
  }, [pathnameKey])

  useEffect(() => {
    const onLocaleChange = () => {
      setLocale(resolveLocale(pathnameKey))
    }

    window.addEventListener('localechange', onLocaleChange)
    window.addEventListener('focus', onLocaleChange)

    return () => {
      window.removeEventListener('localechange', onLocaleChange)
      window.removeEventListener('focus', onLocaleChange)
    }
  }, [pathnameKey])

  return locale
}

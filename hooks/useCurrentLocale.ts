'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

const supportedLocales = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const

export type SupportedLocale = (typeof supportedLocales)[number]

export function useCurrentLocale(): SupportedLocale {
  const pathname = usePathname()

  return useMemo(() => {
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
  }, [pathname])
}

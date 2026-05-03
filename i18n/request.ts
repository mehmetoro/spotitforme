import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, isValidLocale, locales } from '@/lib/i18n'

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locale && isValidLocale(locale) ? locale : defaultLocale

  return {
    locale: safeLocale,
    messages: (await import(`@/messages/${safeLocale}.json`)).default,
    timeZone: 'Europe/Istanbul',
    now: new Date(),
  }
})

export { locales }

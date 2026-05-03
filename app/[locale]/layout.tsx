 import { setRequestLocale } from 'next-intl/server'
 import { notFound } from 'next/navigation'
 import { isValidLocale } from '@/lib/i18n'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) {
    notFound()
  }

   setRequestLocale(params.locale)
 
   return <>{children}</>
}

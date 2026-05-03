import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { detectLocaleFromRequest, locales } from '@/lib/i18n'

function stripLocalePrefix(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return '/'

  const first = parts[0]
  if ((locales as readonly string[]).includes(first)) {
    const rest = parts.slice(1)
    return rest.length > 0 ? `/${rest.join('/')}` : '/'
  }

  return pathname
}

function hasLocalePrefix(pathname: string) {
  const first = pathname.split('/').filter(Boolean)[0]
  return !!first && (locales as readonly string[]).includes(first)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const normalized = stripLocalePrefix(pathname)
  if (process.env.NODE_ENV !== 'development' && normalized.startsWith('/test')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Prefixli URL'leri (SEO icin) mevcut route'lara rewrite et; locale bilgisini header'a tasir.
  if (hasLocalePrefix(pathname)) {
    const locale = pathname.split('/').filter(Boolean)[0]
    const url = request.nextUrl.clone()
    url.pathname = normalized
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', locale)
    requestHeaders.set('x-pathname', normalized)
      requestHeaders.set('x-next-intl-locale', locale)

    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    })

    if (normalized.startsWith('/admin')) {
      response.headers.set('x-admin-route', '1')
    }

    return response
  }

  // Prefixsiz URL'leri kullanicinin diline gore canonical prefixli URL'e yonlendir.
  const detectedLocale = detectLocaleFromRequest(request)
  const localizedUrl = request.nextUrl.clone()
  localizedUrl.pathname = normalized === '/' ? `/${detectedLocale}` : `/${detectedLocale}${normalized}`

  const redirectResponse = NextResponse.redirect(localizedUrl)
  redirectResponse.cookies.set('NEXT_LOCALE', detectedLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  if (normalized.startsWith('/admin')) {
    redirectResponse.headers.set('x-admin-route', '1')
  }

  return redirectResponse
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
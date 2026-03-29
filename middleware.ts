// middleware.ts (kök dizinde)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export function middleware(request: NextRequest) {
  // Sadece development'ta test sayfalarına izin ver
  if (process.env.NODE_ENV !== 'development' && request.nextUrl.pathname.startsWith('/test')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin route için özel header ekle
  const response = NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('x-admin-route', '1');
  }
  return response;
}

export const config = {
  matcher: [
    '/test/:path*',
    '/admin/:path*',
    '/admin'
  ]
}
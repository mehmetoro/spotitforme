// middleware.ts (kök dizinde)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Sadece development'ta test sayfalarına izin ver
  if (process.env.NODE_ENV !== 'development' && request.nextUrl.pathname.startsWith('/test')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/test/:path*'
}
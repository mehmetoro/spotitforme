// app/test-panel/middleware.ts (opsiyonel)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Sadece geliştirme ortamında erişime izin ver
  if (process.env.NODE_ENV !== 'development') {
    // Production'da sadece belirli IP'ler veya admin kullanıcılar
    const allowedIPs = ['127.0.0.1'] // Localhost
    const clientIP = request.ip || request.headers.get('x-forwarded-for')
    
    if (!allowedIPs.includes(clientIP || '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/test-panel/:path*',
}
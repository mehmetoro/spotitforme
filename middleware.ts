// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Test sayfasını sadece development'ta veya şifreyle aç
  if (request.nextUrl.pathname.startsWith('/test-system')) {
    // 1. Development'da her zaman izin ver
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next()
    }
    
    // 2. Production'da şifre kontrolü
    const authHeader = request.headers.get('authorization')
    if (authHeader === `Bearer ${process.env.TEST_PAGE_SECRET}`) {
      return NextResponse.next()
    }
    
    // 3. Yetkisiz erişim
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/test-system/:path*']
}
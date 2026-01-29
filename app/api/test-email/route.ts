// app/api/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { testEmailConnection } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    // Sadece development'ta çalışsın
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Bu endpoint sadece development ortamında kullanılabilir' },
        { status: 403 }
      )
    }

    const result = await testEmailConnection()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email testi başarılı',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: result.details
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Email testi sırasında hata', details: error.message },
      { status: 500 }
    )
  }
}
// app/api/test-db/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basit bir test response
    return NextResponse.json({ 
      success: true, 
      message: 'Database bağlantı testi başarılı',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 })
  }
}
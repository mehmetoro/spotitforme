// app/api/test-email/route.ts dosyasını bu kodla değiştirin:
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Email test API çalışıyor',
    instructions: 'AuthModal veya CreateSpot sayfasından test yapın',
    environment: {
      SMTP_USER: process.env.SMTP_USER ? '*** configured' : 'NOT configured',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '*** configured' : 'NOT configured',
      NODE_ENV: process.env.NODE_ENV
    }
  })
}
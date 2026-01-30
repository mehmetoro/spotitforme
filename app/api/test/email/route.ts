// app/api/test/email/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  // Basit bir API key kontrolü (isteğe bağlı)
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    status: 'online',
    service: 'email-test-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: {
      email_sending: true,
      gmail_integration: !!process.env.GMAIL_USER,
      cron_jobs: true
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email } = body

    const actions: Record<string, string> = {
      ping: 'pong',
      echo: `Echo: ${JSON.stringify(body)}`,
      status: 'Service is running',
      check_email: email ? `Email provided: ${email}` : 'No email provided'
    }

    const response = actions[action] || 'Unknown action'

    return NextResponse.json({
      success: true,
      action,
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
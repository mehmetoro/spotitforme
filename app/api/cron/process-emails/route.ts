// app/api/cron/process-emails/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { EmailQueue } from '@/lib/email-queue'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Cron job secret kontrolü
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🔄 Email queue işleniyor...')
    
    // Queue'yu işle
    const result = await EmailQueue.processQueue(100)
    
    // Stats al
    const stats = await EmailQueue.getQueueStats()
    
    return NextResponse.json({
      success: true,
      processed: result,
      stats: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Cron job hatası:', error)
    
    // Admin'e alert gönder
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.ADMIN_EMAIL || 'admin@spotitforme.com',
          template: 'admin-alert',
          data: {
            title: 'Email Queue Cron Job Failed',
            details: {
              error: error.message,
              timestamp: new Date().toISOString()
            }
          }
        })
      })
    } catch (alertError) {
      console.error('Admin alert gönderilemedi:', alertError)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
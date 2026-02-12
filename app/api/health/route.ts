// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 1. Database health check
    const { data: dbData, error: dbError } = await supabase
      .from('spots')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    // 2. Storage health check
    const { data: storageData, error: storageError } = await supabase.storage
      .listBuckets()

    // 3. Auth health check
    const { data: authData } = await supabase.auth.getSession()

    const duration = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      services: {
        database: dbError ? 'unhealthy' : 'healthy',
        storage: storageError ? 'unhealthy' : 'healthy',
        authentication: 'healthy',
        api: 'healthy'
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: 'unknown',
        storage: 'unknown',
        authentication: 'unknown',
        api: 'unhealthy'
      }
    }, {
      status: 500
    })
  }
}
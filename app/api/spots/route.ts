// app/api/spots/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Spots'ları getir
    const { data, error, count } = await supabase
      .from('spots')
      .select('*', { count: 'exact' })
      .limit(10)
      .order('created_at', { ascending: false })
    
    const duration = Date.now() - startTime
    
    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to fetch spots',
          error: error.message,
          duration
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      data: {
        spots: data,
        total: count,
        limit: 10,
        page: 1
      },
      metadata: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
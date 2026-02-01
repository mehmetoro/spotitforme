// app/api/shops/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: shops, error } = await supabase
      .from('shops')
      .select('id, shop_name, city, subscription_type, created_at')
      .limit(5)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to fetch shops',
          error: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      data: {
        shops: shops || [],
        count: shops?.length || 0
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        error: error.message
      },
      { status: 500 }
    )
  }
}
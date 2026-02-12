// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Sadece test amaçlı - production'da güvenlik önlemleri ekleyin
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, email, name, created_at')
      .limit(5)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to fetch users',
          error: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      data: {
        users: users || [],
        count: users?.length || 0
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
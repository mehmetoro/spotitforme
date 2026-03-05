// app/api/change-password/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase env variables not set')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newPassword } = body

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'userId ve newPassword gerekli' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Şifre en az 8 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Admin client ile şifre güncelle
    const supabase = await getSupabaseAdmin()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error('Şifre güncelleme hatası:', error)
      return NextResponse.json(
        { error: error.message || 'Şifre güncellenemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Şifre başarıyla güncellendi' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('API hatası:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

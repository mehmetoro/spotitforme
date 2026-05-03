// app/auth/callback/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/profile'

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth?mode=login`)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data?.user) {
    return NextResponse.redirect(`${requestUrl.origin}/auth?mode=login&error=callback`)
  }

  const user = data.user
  const name: string =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Kullanıcı'

  // Trigger already creates the row; here we just ensure name is set if still empty.
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  await adminClient
    .from('user_profiles')
    .upsert(
      { id: user.id, user_id: user.id, name, full_name: name, updated_at: new Date().toISOString() },
      { onConflict: 'id', ignoreDuplicates: false }
    )

  const redirectTo = next.startsWith('/') ? `${requestUrl.origin}${next}` : `${requestUrl.origin}/profile`
  return NextResponse.redirect(redirectTo)
}

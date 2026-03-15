// app/api/migrate/add-price-column/route.ts
// ONE-TIME migration: adds price & currency columns to quick_sightings
// Visit /api/migrate/add-price-column once in browser to apply

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const FALLBACK_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SERVICE_KEY

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Add price column
    const { error: e1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE quick_sightings ADD COLUMN IF NOT EXISTS price numeric;',
    })

    // Add currency column
    const { error: e2 } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE quick_sightings ADD COLUMN IF NOT EXISTS currency text DEFAULT 'TRY';",
    })

    if (e1 || e2) {
      // rpc may not exist – fall back to raw fetch
      return NextResponse.json(
        {
          status: 'rpc_unavailable',
          message:
            'exec_sql RPC bulunamadı. Lütfen Supabase SQL Editor\'da şu kodu çalıştırın:\n\nALTER TABLE quick_sightings ADD COLUMN IF NOT EXISTS price numeric;\nALTER TABLE quick_sightings ADD COLUMN IF NOT EXISTS currency text DEFAULT \'TRY\';',
          e1: e1?.message,
          e2: e2?.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ status: 'ok', message: 'price ve currency kolonları başarıyla eklendi!' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

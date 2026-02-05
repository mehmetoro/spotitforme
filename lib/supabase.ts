// lib/supabase.ts - ESKİ VERSİYONU GÜNCELLE
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// ESKİ: export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
// YENİ: Sadece client-side için basit versiyon

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// VEYA direkt bu dosyayı silip yukarıdaki yapıyı kullanın
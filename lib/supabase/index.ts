// lib/supabase/index.ts
// Client-side için (browser)
export { createBrowserClient, supabase } from './client'

// Server-side için (server components, API routes)
export { createServerClient } from './server'

// Type re-export
export type { SupabaseClient } from '@supabase/supabase-js'
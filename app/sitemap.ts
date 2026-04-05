import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

import { buildCollectionPath, buildRareSightingPath, buildSightingPath, buildSocialPath, buildSpotPath } from '@/lib/sighting-slug'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.com'
const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_SUPABASE_ANON_KEY

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getClient()

  const [spotsResult, sightingsResult, rareResult, collectionResult] = await Promise.all([
    supabase.from('spots').select('id, title, created_at, updated_at').in('status', ['active', 'found']).order('created_at', { ascending: false }).limit(5000),
    supabase.from('sightings').select('id, title, link_preview_title, created_at, updated_at').order('created_at', { ascending: false }).limit(5000),
    supabase.from('quick_sightings').select('id, title, link_preview_title, description, created_at, updated_at').eq('status', 'active').order('created_at', { ascending: false }).limit(5000),
    supabase.from('collection_posts').select('id, title, created_at, updated_at').eq('is_public', true).eq('status', 'active').order('created_at', { ascending: false }).limit(5000),
  ])

  const socialWithTitle = await supabase
    .from('social_posts')
    .select('id, title, content, description, location, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  let socialItems: Array<{
    id: string
    title: string | null
    content: string | null
    description: string | null
    location: string | null
    created_at: string | null
    updated_at: string | null
  }> = []

  if (socialWithTitle.error?.message?.includes('title')) {
    const fallback = await supabase
      .from('social_posts')
      .select('id, content, description, location, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(5000)

    socialItems = (fallback.data || []).map((item: any) => ({
      ...item,
      title: null,
    }))
  } else {
    socialItems = (socialWithTitle.data || []) as any
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/spots'), changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/sightings'), changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/virtual-sightings'), changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/social'), changeFrequency: 'hourly', priority: 0.8 },
    { url: absoluteUrl('/collection'), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/museum'), changeFrequency: 'daily', priority: 0.7 },
  ]

  const spotEntries = (spotsResult.data || []).map((spot) => ({
    url: absoluteUrl(buildSpotPath(spot.id, spot.title)),
    lastModified: spot.updated_at || spot.created_at || undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const sightingEntries = (sightingsResult.data || []).map((item) => ({
    url: absoluteUrl(buildSightingPath(item.id, item.title || item.link_preview_title)),
    lastModified: item.updated_at || item.created_at || undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const rareEntries = (rareResult.data || []).map((item) => ({
    url: absoluteUrl(buildRareSightingPath(item.id, item.title || item.link_preview_title || item.description)),
    lastModified: item.updated_at || item.created_at || undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const socialEntries = socialItems.map((item) => ({
    url: absoluteUrl(buildSocialPath(item.id, item.title || item.content || item.description || item.location)),
    lastModified: item.updated_at || item.created_at || undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  const collectionEntries = (collectionResult.data || []).map((item) => ({
    url: absoluteUrl(buildCollectionPath(item.id, item.title)),
    lastModified: item.updated_at || item.created_at || undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  return [...staticEntries, ...spotEntries, ...sightingEntries, ...rareEntries, ...socialEntries, ...collectionEntries]
}

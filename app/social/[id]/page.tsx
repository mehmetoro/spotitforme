import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { permanentRedirect } from 'next/navigation'

import { buildArticleJsonLd } from '@/lib/seo-jsonld'
import { buildSocialPath, extractSightingIdFromParam } from '@/lib/sighting-slug'
import SocialPostDetailClient from './SocialPostDetailClient'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

interface SocialMetadataRecord {
  id: string
  title: string | null
  content: string | null
  description: string | null
  location: string | null
  city: string | null
  image_urls: string[] | null
  post_type: string | null
}

const trimMeta = (value: string, max = 160) => {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trim()}…`
}

async function getBaseUrl() {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000'
  const protocol = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}

async function getSocialRecord(id: string): Promise<SocialMetadataRecord | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    let { data, error } = await supabase
      .from('social_posts')
      .select('id, title, content, description, location, city, image_urls, post_type')
      .eq('id', id)
      .maybeSingle()

    if (error?.message?.includes('title')) {
      const fallback = await supabase
        .from('social_posts')
        .select('id, content, description, location, city, image_urls, post_type')
        .eq('id', id)
        .maybeSingle()

      data = fallback.data ? { ...fallback.data, title: null } : null
      error = fallback.error
    }

    if (error || !data) return null
    return data as SocialMetadataRecord
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getSocialRecord(resolvedId)
  const canonical = `${baseUrl}${record ? buildSocialPath(resolvedId, record.title || record.content || record.description || record.location) : `/social/${id}`}`

  if (!record) {
    return {
      title: 'Sosyal paylaşım | SpotItForMe',
      description: 'Topluluktaki sosyal paylaşımları SpotItForMe üzerinde inceleyin.',
      alternates: { canonical },
      robots: { index: false, follow: true },
    }
  }

  const title = record.title || record.content || record.description || record.location || 'Sosyal paylaşım'
  const description = trimMeta(
    [record.content, record.description, record.location, record.city, record.post_type]
      .filter(Boolean)
      .join(' ') || 'Topluluktaki sosyal paylaşımları SpotItForMe üzerinde inceleyin.'
  )
  const ogImage = Array.isArray(record.image_urls) ? record.image_urls[0] : undefined

  return {
    title: `${title} | SpotItForMe`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function SocialPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getSocialRecord(resolvedId)

  if (record) {
    const canonicalPath = buildSocialPath(resolvedId, record.title || record.content || record.description || record.location)
    if (canonicalPath !== `/social/${id}`) {
      permanentRedirect(canonicalPath)
    }
  }

  const canonical = `${baseUrl}${record ? buildSocialPath(resolvedId, record.title || record.content || record.description || record.location) : `/social/${id}`}`
  const jsonLd = record
    ? buildArticleJsonLd({
        url: canonical,
        title: record.title || record.content || record.description || record.location || 'Sosyal paylaşım',
        description: trimMeta(
          [record.content, record.description, record.location, record.city, record.post_type]
            .filter(Boolean)
            .join(' ') || 'Topluluktaki sosyal paylaşımları SpotItForMe üzerinde inceleyin.'
        ),
        images: Array.isArray(record.image_urls) ? record.image_urls : [],
        keywords: [record.post_type, record.city, record.location],
        section: record.post_type,
      })
    : null

  return (
    <>
      <SocialPostDetailClient />
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </>
  )
}

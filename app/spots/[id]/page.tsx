import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { permanentRedirect } from 'next/navigation'

import { buildArticleJsonLd } from '@/lib/seo-jsonld'
import { buildSpotPath, extractSightingIdFromParam } from '@/lib/sighting-slug'
import SpotDetailClient from './SpotDetailClient'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

interface SpotMetadataRecord {
  id: string
  title: string
  description: string
  category: string | null
  location: string | null
  image_url: string | null
  status: string
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

async function getSpotRecord(id: string): Promise<SpotMetadataRecord | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await supabase
      .from('spots')
      .select('id, title, description, category, location, image_url, status')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) return null
    return data as SpotMetadataRecord
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getSpotRecord(resolvedId)
  const canonical = `${baseUrl}${record ? buildSpotPath(resolvedId, record.title) : `/spots/${id}`}`

  if (!record) {
    return {
      title: 'Spot detayı | SpotItForMe',
      description: 'Aranan ürün spotlarını SpotItForMe üzerinde inceleyin.',
      alternates: { canonical },
      robots: { index: false, follow: true },
    }
  }

  const title = record.title || 'Spot detayı'
  const description = trimMeta(
    [record.description, record.category, record.location, record.status]
      .filter(Boolean)
      .join(' ') || 'Aranan ürün spotlarını SpotItForMe üzerinde inceleyin.'
  )

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
      images: record.image_url ? [{ url: record.image_url, alt: title }] : undefined,
    },
    twitter: {
      card: record.image_url ? 'summary_large_image' : 'summary',
      title,
      description,
      images: record.image_url ? [record.image_url] : undefined,
    },
  }
}

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getSpotRecord(resolvedId)

  if (record) {
    const canonicalPath = buildSpotPath(resolvedId, record.title)
    if (canonicalPath !== `/spots/${id}`) {
      permanentRedirect(canonicalPath)
    }
  }

  const canonical = `${baseUrl}${record ? buildSpotPath(resolvedId, record.title) : `/spots/${id}`}`
  const jsonLd = record
    ? buildArticleJsonLd({
        url: canonical,
        title: record.title || 'Spot detayı',
        description: trimMeta(
          [record.description, record.category, record.location, record.status]
            .filter(Boolean)
            .join(' ') || 'Aranan ürün spotlarını SpotItForMe üzerinde inceleyin.'
        ),
        images: record.image_url ? [record.image_url] : [],
        keywords: [record.category, record.location, record.status],
        section: record.category,
      })
    : null

  return (
    <>
      <SpotDetailClient />
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </>
  )
}

import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { permanentRedirect } from 'next/navigation'

import { buildArticleJsonLd } from '@/lib/seo-jsonld'
import { buildCollectionPath, extractSightingIdFromParam } from '@/lib/sighting-slug'
import CollectionDetailClient from './CollectionDetailClient'

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ'

interface CollectionMetadataRecord {
  id: string
  title: string
  description: string
  category: string | null
  photo_url: string | null
  estimated_price: number | null
  city: string | null
  district: string | null
  is_public: boolean
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

async function getCollectionRecord(id: string): Promise<CollectionMetadataRecord | null> {
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
      .from('collection_posts')
      .select('id, title, description, category, photo_url, estimated_price, city, district, is_public, status')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) return null
    return data as CollectionMetadataRecord
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getCollectionRecord(resolvedId)
  const canonical = `${baseUrl}${record ? buildCollectionPath(resolvedId, record.title) : `/collection/${id}`}`

  if (!record) {
    return {
      title: 'Koleksiyon paylaşımı | SpotItForMe',
      description: 'Topluluktaki koleksiyon paylaşımlarını SpotItForMe üzerinde inceleyin.',
      alternates: { canonical },
      robots: { index: false, follow: true },
    }
  }

  const title = record.title || 'Koleksiyon paylaşımı'
  const description = trimMeta(
    [record.description, record.category, record.city, record.district, record.estimated_price ? `Tahmini deger ${record.estimated_price}` : null]
      .filter(Boolean)
      .join(' ') || 'Topluluktaki koleksiyon paylaşımlarını SpotItForMe üzerinde inceleyin.'
  )

  return {
    title: `${title} | SpotItForMe`,
    description,
    alternates: { canonical },
    robots: { index: record.is_public && record.status === 'active', follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: record.photo_url ? [{ url: record.photo_url, alt: title }] : undefined,
    },
    twitter: {
      card: record.photo_url ? 'summary_large_image' : 'summary',
      title,
      description,
      images: record.photo_url ? [record.photo_url] : undefined,
    },
  }
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getCollectionRecord(resolvedId)

  if (record) {
    const canonicalPath = buildCollectionPath(resolvedId, record.title)
    if (canonicalPath !== `/collection/${id}`) {
      permanentRedirect(canonicalPath)
    }
  }

  const canonical = `${baseUrl}${record ? buildCollectionPath(resolvedId, record.title) : `/collection/${id}`}`
  const jsonLd = record
    ? buildArticleJsonLd({
        url: canonical,
        title: record.title || 'Koleksiyon paylaşımı',
        description: trimMeta(
          [record.description, record.category, record.city, record.district, record.estimated_price ? `Tahmini deger ${record.estimated_price}` : null]
            .filter(Boolean)
            .join(' ') || 'Topluluktaki koleksiyon paylaşımlarını SpotItForMe üzerinde inceleyin.'
        ),
        images: record.photo_url ? [record.photo_url] : [],
        keywords: [record.category, record.city, record.district],
        section: record.category,
      })
    : null

  return (
    <>
      <CollectionDetailClient />
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </>
  )
}

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'

import { buildArticleJsonLd } from '@/lib/seo-jsonld'
import { buildSightingPath, extractSightingIdFromParam } from '@/lib/sighting-slug'
import SightingDetailClient from './SightingDetailClient'

interface SightingMetadataRecord {
  id: string
  title: string | null
  notes: string | null
  location_description: string | null
  marketplace: string | null
  seller_name: string | null
  link_preview_title: string | null
  link_preview_image: string | null
  link_preview_description: string | null
  link_preview_brand: string | null
  source_domain: string | null
  spot: { title: string | null } | null
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

async function getSightingRecord(id: string): Promise<SightingMetadataRecord | null> {
  try {
    const baseUrl = await getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sightings/${id}`, { cache: 'no-store' })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getSightingRecord(resolvedId)
  const canonical = `${baseUrl}${record ? buildSightingPath(resolvedId, record.title || record.link_preview_title || record.spot?.title) : `/sightings/${id}`}`

  if (!record) {
    return {
      title: 'Yardım detayı | SpotItForMe',
      description: 'Topluluktan gelen yardım detaylarını SpotItForMe üzerinde inceleyin.',
      alternates: { canonical },
      robots: { index: false, follow: true },
    }
  }

  const title = record.title || record.link_preview_title || record.spot?.title || 'Yardım detayı'
  const description = trimMeta(
    [
      record.notes,
      record.link_preview_description,
      record.location_description,
      record.marketplace,
      record.seller_name,
      record.link_preview_brand,
      record.source_domain,
    ]
      .filter(Boolean)
      .join(' ') || 'Topluluktan gelen yardım detaylarını SpotItForMe üzerinde inceleyin.'
  )
  const ogImage = record.link_preview_image || undefined

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

export default async function SightingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getSightingRecord(resolvedId)

  if (!record) notFound()

  if (record) {
    const canonicalPath = buildSightingPath(resolvedId, record.title || record.link_preview_title || record.spot?.title)
    if (canonicalPath !== `/sightings/${id}`) {
      permanentRedirect(canonicalPath)
    }
  }

  const canonical = `${baseUrl}${record ? buildSightingPath(resolvedId, record.title || record.link_preview_title || record.spot?.title) : `/sightings/${id}`}`
  const jsonLd = record
    ? buildArticleJsonLd({
        url: canonical,
        title: record.title || record.link_preview_title || record.spot?.title || 'Yardım detayı',
        description: trimMeta(
          [
            record.notes,
            record.link_preview_description,
            record.location_description,
            record.marketplace,
            record.seller_name,
            record.link_preview_brand,
            record.source_domain,
          ]
            .filter(Boolean)
            .join(' ') || 'Topluluktan gelen yardım detaylarını SpotItForMe üzerinde inceleyin.'
        ),
        images: record.link_preview_image ? [record.link_preview_image] : [],
        keywords: [record.location_description, record.marketplace, record.seller_name, record.link_preview_brand],
        section: record.marketplace || record.source_domain,
      })
    : null

  return (
    <>
      <SightingDetailClient />
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </>
  )
}

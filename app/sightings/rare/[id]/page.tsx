// app/sightings/rare/[id]/page.tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'

import { buildProductJsonLd } from '@/lib/seo-jsonld'
import { buildRareSightingPath, extractSightingIdFromParam } from '@/lib/sighting-slug'
import RareSightingDetailClient from './RareSightingDetailClient'

interface RareMetadataRecord {
  id: string
  title: string | null
  description: string | null
  location_name: string | null
  address: string | null
  city: string | null
  district: string | null
  marketplace: string | null
  seller_name: string | null
  link_preview_title: string | null
  link_preview_image: string | null
  link_preview_description: string | null
  link_preview_brand: string | null
  link_preview_availability: string | null
  source_domain: string | null
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

async function getRareRecord(id: string): Promise<RareMetadataRecord | null> {
  try {
    const baseUrl = await getBaseUrl()
    const response = await fetch(`${baseUrl}/api/quick-sightings/${id}`, { cache: 'no-store' })
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
  const record = await getRareRecord(resolvedId)
  const canonical = `${baseUrl}${record ? buildRareSightingPath(resolvedId, record.title || record.link_preview_title || record.description) : `/sightings/rare/${id}`}`

  if (!record) {
    return {
      title: 'Sanal nadir detayı | SpotItForMe',
      description: 'Nadir ürün paylaşımlarını SpotItForMe üzerinde inceleyin.',
      alternates: { canonical },
      robots: { index: false, follow: true },
    }
  }

  const title = record.title || record.link_preview_title || record.description || 'Sanal nadir detayı'
  const description = trimMeta(
    [
      record.description,
      record.link_preview_description,
      record.location_name,
      record.address,
      record.city,
      record.district,
      record.marketplace,
      record.seller_name,
      record.link_preview_brand,
      record.source_domain,
    ]
      .filter(Boolean)
      .join(' ') || 'Nadir ürün paylaşımlarını SpotItForMe üzerinde inceleyin.'
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

export default async function RareSightingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resolvedId = extractSightingIdFromParam(id)
  const baseUrl = await getBaseUrl()
  const record = await getRareRecord(resolvedId)

  if (!record) notFound()

  if (record) {
    const canonicalPath = buildRareSightingPath(resolvedId, record.title || record.link_preview_title || record.description)
    if (canonicalPath !== `/sightings/rare/${id}`) {
      permanentRedirect(canonicalPath)
    }
  }

  const canonical = `${baseUrl}${record ? buildRareSightingPath(resolvedId, record.title || record.link_preview_title || record.description) : `/sightings/rare/${id}`}`
  const jsonLd = record
    ? buildProductJsonLd({
        url: canonical,
        title: record.title || record.link_preview_title || record.description || 'Sanal nadir detayı',
        description: trimMeta(
          [
            record.description,
            record.link_preview_description,
            record.location_name,
            record.address,
            record.city,
            record.district,
            record.marketplace,
            record.seller_name,
            record.link_preview_brand,
            record.source_domain,
          ]
            .filter(Boolean)
            .join(' ') || 'Nadir ürün paylaşımlarını SpotItForMe üzerinde inceleyin.'
        ),
        image: record.link_preview_image,
        brand: record.link_preview_brand,
        marketplace: record.marketplace,
        seller: record.seller_name,
        availability: record.link_preview_availability,
        keywords: [record.marketplace, record.seller_name, record.link_preview_brand, record.city, record.district],
      })
    : null

  return (
    <>
      <RareSightingDetailClient />
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </>
  )
}

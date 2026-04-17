import type { Metadata } from 'next'

import CategoryLandingContent, { getCategoryPageMetadata } from '@/app/kategori/CategoryLandingContent'
import { SOCIAL_CATEGORIES, getCategorySlug } from '@/lib/social-categories'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return SOCIAL_CATEGORIES.map((category) => ({
    slug: getCategorySlug(category.id),
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const meta = await getCategoryPageMetadata(params.slug)

  if (!meta) {
    return {
      title: 'Kategori Bulunamadi | Spotitforme',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${meta.category.name} Kategorisi | Nadir Seyahat Kesifleri`
  const description = `${meta.category.name} kategorisindeki nadir seyahat paylasimlarini, onerilen mekanlari ve guncel kesifleri incele.`
  const path = `/kategori/${params.slug}`
  const keywords = [
    `${meta.category.name.toLowerCase()} kategorisi`,
    `${meta.category.name.toLowerCase()} mekan onerileri`,
    `${meta.category.name.toLowerCase()} gezi rotalari`,
    'nadir seyahat',
    'kesif onerileri',
  ]

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: `https://spotitforme.com${path}`,
      siteName: 'Spotitforme',
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryLandingContent slug={params.slug} />
}

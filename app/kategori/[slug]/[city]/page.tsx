import type { Metadata } from 'next'

import CategoryLandingContent, { getCategoryPageMetadata } from '@/app/kategori/CategoryLandingContent'

interface CategoryCityPageProps {
  params: {
    slug: string
    city: string
  }
}

export async function generateMetadata({ params }: CategoryCityPageProps): Promise<Metadata> {
  const meta = await getCategoryPageMetadata(params.slug, params.city)

  if (!meta) {
    return {
      title: 'Kategori Bulunamadi | Spotitforme',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const cityLabel = meta.currentCity || params.city.replace(/-/g, ' ')
  const title = `${meta.category.name} ${cityLabel} Kesifleri | Nadir Seyahat`
  const description = `${cityLabel} icindeki ${meta.category.name.toLowerCase()} paylasimlarini, onerilen mekanlari ve guncel kesifleri incele.`
  const path = `/kategori/${params.slug}/${params.city}`
  const keywords = [
    `${cityLabel.toLowerCase()} ${meta.category.name.toLowerCase()}`,
    `${meta.category.name.toLowerCase()} ${cityLabel.toLowerCase()} mekan onerileri`,
    `${cityLabel.toLowerCase()} gezi rotalari`,
    'nadir seyahat',
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

export default function CategoryCityPage({ params }: CategoryCityPageProps) {
  return <CategoryLandingContent slug={params.slug} citySlug={params.city} />
}

type MaybeString = string | null | undefined

const SITE_NAME = 'SpotItForMe'

function cleanList(values: Array<MaybeString>) {
  return values.map((value) => (value || '').trim()).filter(Boolean)
}

function imageList(images?: string[] | null) {
  return (images || []).map((image) => image.trim()).filter(Boolean)
}

export function buildArticleJsonLd(input: {
  url: string
  title: string
  description: string
  images?: string[] | null
  keywords?: Array<MaybeString>
  section?: MaybeString
}) {
  const keywords = cleanList(input.keywords || [])
  const images = imageList(input.images)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: input.url,
    headline: input.title,
    description: input.description,
    image: images.length > 0 ? images : undefined,
    articleSection: input.section || undefined,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  }
}

export function buildProductJsonLd(input: {
  url: string
  title: string
  description: string
  image?: MaybeString
  brand?: MaybeString
  marketplace?: MaybeString
  seller?: MaybeString
  availability?: MaybeString
  price?: number | null
  currency?: MaybeString
  keywords?: Array<MaybeString>
}) {
  const keywords = cleanList(input.keywords || [])
  const availabilityMap: Record<string, string> = {
    'stokta': 'https://schema.org/InStock',
    'in stock': 'https://schema.org/InStock',
    'available': 'https://schema.org/InStock',
    'stok yok': 'https://schema.org/OutOfStock',
    'out of stock': 'https://schema.org/OutOfStock',
    'sold out': 'https://schema.org/OutOfStock',
    'limited': 'https://schema.org/LimitedAvailability',
    'sinirli': 'https://schema.org/LimitedAvailability',
  }
  const normalizedAvailability = (input.availability || '').trim().toLocaleLowerCase('tr-TR')
  const offerAvailability = availabilityMap[normalizedAvailability] || undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.title,
    description: input.description,
    image: input.image || undefined,
    brand: input.brand ? { '@type': 'Brand', name: input.brand } : undefined,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    mainEntityOfPage: input.url,
    offers: {
      '@type': 'Offer',
      url: input.url,
      price: input.price ?? undefined,
      priceCurrency: input.currency || undefined,
      availability: offerAvailability,
      seller: input.seller || input.marketplace
        ? {
            '@type': 'Organization',
            name: input.seller || input.marketplace,
          }
        : undefined,
    },
  }
}

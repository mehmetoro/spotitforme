import { createServerClient as createSsrClient } from '@supabase/ssr'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

import CategoryLandingToolbar from '@/components/social/CategoryLandingToolbar'
import CategoryMetricsCards from '@/components/social/CategoryMetricsCards'
import CategorySummaryStats from '@/components/social/CategorySummaryStats'
import Feed from '@/components/social/Feed'
import { buildSocialPath } from '@/lib/sighting-slug'
import {
  SOCIAL_CATEGORIES,
  citySlugMatches,
  findCategoryBySlug,
  findCategoryByValue,
  getCategorySlug,
  getCitySlug,
} from '@/lib/social-categories'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotitforme.com'

function formatDateLabel(value: string | null) {
  if (!value) return 'Henuz veri yok'
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function humanizeCitySlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function matchesCategoryOrDigerFallback(rowCategory: string | null | undefined, targetCategoryId: string) {
  const matchedCategory = findCategoryByValue(rowCategory)
  if (matchedCategory?.id === targetCategoryId) return true
  if (targetCategoryId === 'Diger' && !matchedCategory) return true
  return false
}

function getClient() {
  const cookieStore = cookies()

  return createSsrClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {
          // Server component context: cookie mutation intentionally skipped.
        },
        remove() {
          // Server component context: cookie mutation intentionally skipped.
        },
      },
    }
  )
}

const CATEGORY_EDITORIAL_COPY: Record<string, { intro: string; angle: string; tips: string[] }> = {
  'Tarihi Yerler': {
    intro: 'Tarihi dokusu guclu rotalari, tas yapilarin anlattigi hikayeleri ve zamana direnen duraklari tek akista toplar.',
    angle: 'Ozellikle hafta sonu kultur rotasi arayanlar icin hizli karar vermeyi kolaylastirir.',
    tips: [
      'Sabah erken saatlerde gidilen tarihi noktalar daha sakin ve fotograflik olur.',
      'Yakindaki muze, carsi ve kahve duraklarini birlikte planlamak rotayi verimli hale getirir.',
      'Kisa tarih notu eklenmis paylasimlar genelde daha fazla kaydedilir.',
    ],
  },
  'Muzeler ve Sergiler': {
    intro: 'Donemsel sergiler, kalici koleksiyonlar ve yaratici kultur mekanlarini ayni kategoride bulusturur.',
    angle: 'Sehir gezisini kultur duraklari etrafinda kurmak isteyenler icin dogrudan ilham sayfasi gibi calisir.',
    tips: [
      'Sergi tarihlerini kontrol edip guncel paylasimlari one al.',
      'Muze cikisinda yakin kahve veya kitapci notu paylasimlara ekstra deger katar.',
      'Gorsel kalitesi yuksek paylasimlar muzelerde daha fazla tiklanir.',
    ],
  },
}

function getDefaultEditorial(categoryName: string) {
  return {
    intro: `${categoryName} odakli seyahat planlari, topluluk tarafindan birakilan guncel notlar ve kesif onerileriyle zenginlesir.`,
    angle: `${categoryName} kategorisi, benzer zevke sahip kisilerin hizli rota cikarmasi icin tasarlandi.`,
    tips: [
      'Sehir filtresi ile sonuclari once yerel duzeyde daralt.',
      'Populerlik sekmesinden toplulugun en cok etkilesim verdigi paylasimlara bak.',
      'Kendi kesfini eklerken konum ve fotograf bilgisini eksik birakma.',
    ],
  }
}

interface CategoryLandingContentProps {
  slug: string
  citySlug?: string
}

export async function getCategoryPageMetadata(slug: string, citySlug?: string) {
  const category = findCategoryBySlug(slug)

  if (!category) {
    return null
  }

  const supabase = getClient()
  const { data } = await supabase
    .from('social_posts')
    .select('category, city')
    .limit(5000)

  const matchedPosts = (data || []).filter((item: any) => {
    return matchesCategoryOrDigerFallback(item.category, category.id)
  })

  const matchedCity = citySlug
    ? matchedPosts.find((item: any) => citySlugMatches(item.city, citySlug))?.city || null
    : null

  return {
    category,
    currentCity: matchedCity || (citySlug ? humanizeCitySlug(citySlug) : null),
  }
}

export default async function CategoryLandingContent({ slug, citySlug }: CategoryLandingContentProps) {
  const category = findCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const supabase = getClient()
  const editorial = CATEGORY_EDITORIAL_COPY[category.id] || getDefaultEditorial(category.name)

  const { data: allPosts, error: postsError } = await supabase
    .from('social_posts')
    .select('id, title, content, description, location, category, city, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const serverDataLimited = !!postsError

  const categoryPosts = (allPosts || []).filter((item: any) => {
    return matchesCategoryOrDigerFallback(item.category, category.id)
  })

  const resolvedCity = citySlug
    ? categoryPosts.find((item: any) => citySlugMatches(item.city, citySlug))?.city || null
    : null

  const currentCity = resolvedCity || ''
  const currentCityLabel = resolvedCity || (citySlug ? humanizeCitySlug(citySlug) : '')
  const basePath = `/kategori/${slug}`
  const canonicalPath = currentCityLabel ? `${basePath}/${getCitySlug(currentCityLabel)}` : basePath
  const filteredPosts = categoryPosts.filter((item: any) => {
    if (!currentCity) return true
    return getCitySlug((item.city || '').trim()) === getCitySlug(currentCity)
  })

  const cityMap: Record<string, { city: string; count: number }> = {}
  categoryPosts.forEach((item: any) => {
    const city = (item.city || '').trim()
    if (!city) return
    const cityKey = getCitySlug(city)
    if (!cityMap[cityKey]) {
      cityMap[cityKey] = { city, count: 0 }
    }
    cityMap[cityKey].count += 1
  })

  const cityOptions = Object.values(cityMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  const topCities = cityOptions.slice(0, 6)
  const featuredPosts = filteredPosts.slice(0, 3)
  const relatedCategories = SOCIAL_CATEGORIES.filter((item) => item.id !== category.id).slice(0, 4)
  const contentHighlights = [
    editorial.intro,
    currentCity
      ? `${currentCity} odakli filtre ile bu kategorideki yerel kesifleri daha hizli ayiklayabilirsin.`
      : 'Sehir bazli dropdown ile sonuclari lokal olarak daraltabilirsin.',
    editorial.angle,
  ]
  const travelerTips = editorial.tips


  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: currentCityLabel ? `${category.name} ${currentCityLabel} Kesifleri` : `${category.name} Kategorisi`,
    description: `${category.name} kategorisindeki nadir seyahat paylasimlari`,
    url: `${SITE_URL}${canonicalPath}`,
    inLanguage: 'tr-TR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Spotitforme',
      url: SITE_URL,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Nadir Seyahat',
        item: `${SITE_URL}/discovery`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${category.name} Kategorisi`,
        item: `${SITE_URL}${basePath}`,
      },
      ...(currentCityLabel
        ? [
            {
              '@type': 'ListItem',
              position: 4,
              name: currentCityLabel,
              item: `${SITE_URL}${canonicalPath}`,
            },
          ]
        : []),
    ],
  }

  const faqItems = [
    {
      question: `${category.name} kategorisinde ne bulabilirim?`,
      answer: `${category.name} kategorisinde topluluk tarafindan paylasilan mekan onerileri, seyahat notlari ve nadir kesif paylasimlarini gorebilirsin.`,
    },
    {
      question: `${category.name} paylasimlari nasil siralanir?`,
      answer: 'Paylasimlar varsayilan olarak guncellige gore listelenir; discovery icinde populerlik ve zaman filtreleriyle de inceleme yapabilirsin.',
    },
    {
      question: `${category.name} kategorisinde sehre gore arama yapabilir miyim?`,
      answer: 'Evet. Discovery akisinda ve kategoriye bagli kesiflerde sehir bazli filtreleme kullanarak sonuclari daraltabilirsin.',
    },
  ]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} kategorisindeki one cikan sehirler`,
    itemListElement: topCities.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${item.city} ${category.name}`,
      url: `${SITE_URL}${basePath}/${getCitySlug(item.city)}`,
    })),
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {topCities.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}

      <div className="container-custom py-8">
        <nav className="text-sm mb-4 text-gray-600">
          <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <Link href="/discovery" className="hover:text-blue-600">Nadir Seyahat</Link>
          <span className="mx-2">/</span>
          <Link href={basePath} className="hover:text-blue-600">{category.name}</Link>
          {currentCityLabel && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{currentCityLabel}</span>
            </>
          )}
        </nav>

        <header className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl" aria-hidden>{category.icon}</span>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentCityLabel ? `${category.name} ${currentCityLabel} Kesifleri` : `${category.name} Kategorisi`}
                </h1>
              </div>
              <p className="text-gray-600 max-w-3xl">
                {category.description}. Bu sayfada bu kategoriye ait tum kesif paylasimlarini gorebilir, sehirlere gore daraltabilir ve ilgili rotalara gecebilirsin.
              </p>
            </div>

            <div className={`rounded-2xl bg-gradient-to-br ${category.gradient} text-white p-5 min-w-[240px] shadow-lg`}>
              <div className="text-sm text-white/80">Kategori Ozeti</div>
              <CategorySummaryStats categoryId={category.id} currentCity={currentCity} />
            </div>
          </div>
        </header>

        <CategoryMetricsCards categoryId={category.id} currentCity={currentCity} />

        <CategoryLandingToolbar
          cityOptions={cityOptions}
          basePath={basePath}
          categoryId={category.id}
          currentCity={currentCityLabel}
        />

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bu Kategoride Neler Var?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {contentHighlights.map((item) => (
              <div key={item} className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        {!serverDataLimited && topCities.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">One Cikan Sehirler</h2>
              <span className="text-sm text-gray-500">Kategori icinde en cok icerik bulunan rotalar</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {topCities.map((item) => (
                <Link
                  key={item.city}
                  href={`${basePath}/${getCitySlug(item.city)}`}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                    currentCity === item.city
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  {item.city} ({item.count})
                </Link>
              ))}
            </div>
          </section>
        )}

        {!serverDataLimited && featuredPosts.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">One Cikan Kesifler</h2>
              <span className="text-sm text-gray-500">Bu kategori icinde yeni ve dikkat ceken paylasimlar</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredPosts.map((post: any) => {
                const postTitle = post.title || post.content || post.description || post.location || category.name
                return (
                  <Link
                    key={post.id}
                    href={buildSocialPath(post.id, postTitle)}
                    className="group rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:border-blue-200 hover:bg-white transition"
                  >
                    <div className="text-xs font-semibold text-blue-600 mb-2">{post.city || 'Konum belirtilmedi'}</div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-2">
                      {postTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                      {post.description || post.content || 'Detaya giderek bu kesifin tam notlarini inceleyebilirsin.'}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">{formatDateLabel(post.created_at)}</div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <Feed type="for-you" category={category.id} city={currentCity || undefined} />

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kesfi Guclendiren Ipuclari</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {travelerTips.map((tip) => (
              <div key={tip} className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-gray-700">
                {tip}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Ilgili Kategoriler</h2>
            <Link href="/discovery" className="text-blue-600 hover:text-blue-700 font-medium">Tum kategorilere don</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedCategories.map((item) => (
              <Link
                key={item.id}
                href={`/kategori/${getCategorySlug(item.id)}`}
                className="group rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-blue-200 hover:bg-white transition"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Daha Fazlasini Kesfet</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Discovery - filtrelenmiş feed */}
            <Link
              href={`/discovery?category=${encodeURIComponent(category.id)}${currentCityLabel ? `&city=${encodeURIComponent(currentCityLabel)}` : ''}`}
              className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 hover:bg-blue-100 transition flex flex-col gap-2"
            >
              <span className="text-2xl">🔍</span>
              <div className="font-bold text-blue-900">Filtrelenmiş Feed</div>
              <p className="text-sm text-blue-700">
                {currentCityLabel
                  ? `${currentCityLabel} · ${category.name} paylasimlarini`
                  : `${category.name} kategorisindeki tum paylasimları`} Discovery akisinda incele.
              </p>
              <span className="mt-auto text-xs font-semibold text-blue-500 group-hover:underline">Discovery'e git →</span>
            </Link>

            {/* Harita */}
            <Link
              href={`/rare-travel-map?category=${encodeURIComponent(category.id)}${currentCityLabel ? `&city=${encodeURIComponent(currentCityLabel)}` : ''}`}
              className="group rounded-2xl border border-emerald-100 bg-emerald-50 p-5 hover:bg-emerald-100 transition flex flex-col gap-2"
            >
              <span className="text-2xl">🗺️</span>
              <div className="font-bold text-emerald-900">Haritada Gor</div>
              <p className="text-sm text-emerald-700">
                {currentCityLabel
                  ? `${currentCityLabel} bolgesindeki`
                  : `${category.name} kategorisindeki`} paylasim konumlarini harita uzerinde kesfet.
              </p>
              <span className="mt-auto text-xs font-semibold text-emerald-600 group-hover:underline">Haritayi ac →</span>
            </Link>

            {/* Seyahat planı */}
            <Link
              href={`/rare-travel-plan/select?category=${encodeURIComponent(category.id)}${currentCityLabel ? `&city=${encodeURIComponent(getCitySlug(currentCityLabel))}` : ''}`}
              className="group rounded-2xl border border-purple-100 bg-purple-50 p-5 hover:bg-purple-100 transition flex flex-col gap-2"
            >
              <span className="text-2xl">🛣️</span>
              <div className="font-bold text-purple-900">Seyahat Planla</div>
              <p className="text-sm text-purple-700">
                {currentCityLabel
                  ? `${currentCityLabel} cikisli`
                  : 'Baslangic noktani sec,'} {category.name} duraklarini kapsayan guzergah olustur.
              </p>
              <span className="mt-auto text-xs font-semibold text-purple-600 group-hover:underline">Plani ac →</span>
            </Link>
          </div>
        </section>

        {/* SEO şehir linkleri */}
        {cityOptions.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{category.name} — Sehirler</h2>
            <p className="text-sm text-gray-500 mb-4">Sehir secip o bolgedeki {category.name.toLocaleLowerCase('tr-TR')} paylasimlarini goruntule.</p>
            <div className="flex flex-wrap gap-2">
              {cityOptions.map((item) => (
                <Link
                  key={item.city}
                  href={`${basePath}/${getCitySlug(item.city)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                    getCitySlug(item.city) === getCitySlug(currentCityLabel || '')
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  {item.city}{item.count > 0 ? ` (${item.count})` : ''}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.name} Kategorisi Hakkinda SSS</h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <article key={item.question} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

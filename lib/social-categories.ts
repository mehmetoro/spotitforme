export interface SocialCategory {
  id: string
  name: string
  icon: string
  gradient: string
  description: string
  badgeColor: string
  aliases?: string[]
}

export const SOCIAL_CATEGORIES: SocialCategory[] = [
  {
    id: 'Tarihi Yerler',
    name: 'Tarihi Yerler',
    icon: '🏛️',
    gradient: 'from-amber-600 to-orange-500',
    description: 'Kaleler, antik kentler, hanlar ve tarih kokan yapilar',
    badgeColor: 'bg-amber-100 text-amber-800',
    aliases: ['Tarihi Carsi ve Han', 'Tarihi Çarşı ve Han'],
  },
  {
    id: 'Muzeler ve Sergiler',
    name: 'Muzeler ve Sergiler',
    icon: '🖼️',
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Ozel koleksiyonlar, donemsel sergiler ve kulturel duraklar',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    aliases: ['Muze ve Sergi', 'Müze ve Sergi', 'Sahaf ve Plakci', 'Sahaf ve Plakçı'],
  },
  {
    id: 'Ibadethaneler',
    name: 'Ibadethane',
    icon: '🕌',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Camiler, kiliseler, sinagoglar ve ruhani mekanlar',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    aliases: ['Ibadethane', 'Ibadethaneler'],
  },
  {
    id: 'Konaklama',
    name: 'Konaklama',
    icon: '🏨',
    gradient: 'from-sky-500 to-blue-500',
    description: 'Tarihi oteller, butik pansiyonlar ve ozel konaklama deneyimleri',
    badgeColor: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'Restoran ve Lezzet Duraklari',
    name: 'Restoran ve Lezzet Duraklari',
    icon: '🍽️',
    gradient: 'from-red-500 to-rose-500',
    description: 'Yerel mutfaklar, imza tabaklar ve kesfedilmeyi bekleyen tatlar',
    badgeColor: 'bg-rose-100 text-rose-800',
    aliases: ['Mutfak ve Zanaat', 'Mutfak & Sofra'],
  },
  {
    id: 'Kafeler ve Kahveciler',
    name: 'Kafeler ve Kahveciler',
    icon: '☕',
    gradient: 'from-orange-500 to-amber-500',
    description: 'Ozgunsel mekanlar, butik kahveciler ve mola noktalari',
    badgeColor: 'bg-orange-100 text-orange-800',
    aliases: ['Kafe ve Mola Noktasi', 'Kafe ve Mola Noktası'],
  },
  {
    id: 'Yerel Pazarlar ve Carsilar',
    name: 'Yerel Pazarlar ve Carsilar',
    icon: '🛍️',
    gradient: 'from-fuchsia-500 to-pink-500',
    description: 'El emegi urunler, antikalar ve yerel alim noktalari',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800',
    aliases: ['Pazar ve Bit Pazari', 'Pazar ve Bit Pazarı'],
  },
  {
    id: 'Antika ve Bit Pazarlari',
    name: 'Antika ve Bit Pazarlari',
    icon: '🗝️',
    gradient: 'from-yellow-500 to-amber-600',
    description: 'Nadir parcalar, koleksiyon urunleri ve ikinci el hazineler',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    aliases: ['Antika ve Koleksiyon', 'Koleksiyon', 'Saat ve Taki', 'Saat ve Takı'],
  },
  {
    id: 'Doga Rotalari ve Milli Parklar',
    name: 'Doga Rotalari ve Milli Parklar',
    icon: '🌲',
    gradient: 'from-green-500 to-lime-500',
    description: 'Vadiler, yuruyus rotalari, milli parklar ve doga kacamaklari',
    badgeColor: 'bg-green-100 text-green-800',
    aliases: ['Spor & Outdoor', 'Bahce ve Dis Mekan', 'Bahçe ve Dış Mekan'],
  },
  {
    id: 'Kiyi ve Plajlar',
    name: 'Kiyi ve Plajlar',
    icon: '🏖️',
    gradient: 'from-cyan-500 to-sky-500',
    description: 'Sakin koylar, gizli plajlar ve kiyida ozel duraklar',
    badgeColor: 'bg-cyan-100 text-cyan-800',
  },
  {
    id: 'Seyir Teraslari ve Manzara Noktalari',
    name: 'Seyir Teraslari ve Manzara Noktalari',
    icon: '🌄',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Panoramik manzaralar ve fotograflik seyir noktalar',
    badgeColor: 'bg-violet-100 text-violet-800',
    aliases: ['Fotograflik Nokta', 'Fotoğraflık Nokta'],
  },
  {
    id: 'Sanat Sokaklari ve Atolyeler',
    name: 'Sanat Sokaklari ve Atolyeler',
    icon: '🎨',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Galeriler, duvar sanati ve yaratici atolyeler',
    badgeColor: 'bg-purple-100 text-purple-800',
    aliases: ['Yerel Dukkan ve Atolye', 'Yerel Dükkan ve Atölye'],
  },
  {
    id: 'Festival ve Etkinlik Alanlari',
    name: 'Festival ve Etkinlik Alanlari',
    icon: '🎪',
    gradient: 'from-rose-500 to-red-500',
    description: 'Donemsel etkinlikler, panayirlar ve kulturel bulusmalar',
    badgeColor: 'bg-red-100 text-red-800',
    aliases: ['Etkinlik ve Festival'],
  },
  {
    id: 'Gece Hayati ve Eglence',
    name: 'Gece Hayati ve Eglence',
    icon: '🌃',
    gradient: 'from-slate-600 to-indigo-700',
    description: 'Canli muzik noktalar, barlar ve gece rotalari',
    badgeColor: 'bg-slate-100 text-slate-800',
  },
  {
    id: 'Koyler ve Kasabalar',
    name: 'Koyler ve Kasabalar',
    icon: '🏘️',
    gradient: 'from-lime-500 to-emerald-500',
    description: 'Sakin yasam duraklari ve yerel deneyim noktalar',
    badgeColor: 'bg-lime-100 text-lime-800',
  },
  {
    id: 'Rota Ustu Duraklar',
    name: 'Rota Ustu Duraklar',
    icon: '🧭',
    gradient: 'from-blue-500 to-indigo-500',
    description: 'Uzun yol uzerinde kesfedilecek ozel noktalar',
    badgeColor: 'bg-blue-100 text-blue-800',
    aliases: ['Rota Ustu Durak', 'Rota Üstü Durak', 'arac', 'Araç & Parça'],
  },
  {
    id: 'Gizli Mekanlar',
    name: 'Gizli Mekanlar',
    icon: '🕵️',
    gradient: 'from-gray-600 to-slate-700',
    description: 'Az bilinen, yerellerin bildigi ozel kesif rotalari',
    badgeColor: 'bg-gray-100 text-gray-800',
    aliases: ['Gizli Mekan'],
  },
  {
    id: 'Diger',
    name: 'Diger',
    icon: '🔍',
    gradient: 'from-neutral-500 to-zinc-600',
    description: 'Diger nadir seyahat kesifleri',
    badgeColor: 'bg-neutral-100 text-neutral-800',
    aliases: ['Diger', 'Diğer', 'elektronik', 'giyim', 'ev', 'kitap', 'oyuncak', 'mutfak'],
  },
]

function normalizeCategoryValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9\s&]/g, '')
    .replace(/\s+/g, ' ')
}

export function getCategoryMatchValues(categoryId: string): string[] {
  const category = SOCIAL_CATEGORIES.find((item) => item.id === categoryId)
  if (!category) return [categoryId]

  const values = new Set<string>([category.id, category.name, ...(category.aliases || [])])
  return Array.from(values)
}

export function findCategoryByValue(value: string | null | undefined): SocialCategory | undefined {
  if (!value) return undefined
  const normalizedInput = normalizeCategoryValue(value)

  return SOCIAL_CATEGORIES.find((category) => {
    const candidates = getCategoryMatchValues(category.id)
    return candidates.some((candidate) => normalizeCategoryValue(candidate) === normalizedInput)
  })
}

function slugifyCategoryValue(value: string): string {
  return normalizeCategoryValue(value)
    .replace(/&/g, ' ve ')
    .replace(/\s+/g, '-')
}

export function getCategorySlug(categoryId: string): string {
  const category = SOCIAL_CATEGORIES.find((item) => item.id === categoryId)
  const baseValue = category?.name || categoryId
  return slugifyCategoryValue(baseValue)
}

export function findCategoryBySlug(slug: string | null | undefined): SocialCategory | undefined {
  if (!slug) return undefined
  const normalizedSlug = slug.trim().toLocaleLowerCase('tr-TR')

  return SOCIAL_CATEGORIES.find((category) => getCategorySlug(category.id) === normalizedSlug)
}

export function getCitySlug(city: string): string {
  return normalizeCategoryValue(city).replace(/\s+/g, '-')
}

export function citySlugMatches(city: string | null | undefined, slug: string | null | undefined): boolean {
  if (!city || !slug) return false
  return getCitySlug(city) === slug.trim().toLocaleLowerCase('tr-TR')
}

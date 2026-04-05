import { slugifySightingTitle } from '@/lib/sighting-slug'

const STOP_WORDS = new Set([
  've', 'veya', 'ile', 'icin', 'ama', 'fakat', 'gibi', 'olan', 'olanlar', 'bir', 'bu', 'su', 'o', 'da', 'de',
  'mi', 'mu', 'mü', 'mı', 'en', 'cok', 'az', 'daha', 'gore', 'göre', 'icin', 'icin', 'icin', 'olarak', 'kadar',
  'the', 'and', 'for', 'with', 'from', 'into', 'your', 'that', 'have', 'has', 'are', 'was', 'were', 'biraz',
])

const KEYWORD_EQUIVALENTS: Record<string, string[]> = {
  vintage: ['retro', 'koleksiyon'],
  retro: ['vintage', 'nostalji'],
  antika: ['koleksiyon', 'nadir'],
  nadir: ['koleksiyon', 'ozel'],
  saat: ['kolsaati', 'vintage'],
  rolex: ['saat', 'lux'],
  kamera: ['fotograf', 'lens'],
  fotograf: ['kamera', 'analog'],
  analog: ['kamera', 'vintage'],
  walkman: ['sony', 'retro'],
  plak: ['muzik', 'vintage'],
  koleksiyon: ['antika', 'nadir'],
  oyuncak: ['vintage', 'koleksiyon'],
  elektronik: ['teknoloji', 'cihaz'],
  giyim: ['moda', 'stil'],
  kitap: ['sahaf', 'koleksiyon'],
  otomobil: ['arac', 'parca'],
  arac: ['otomobil', 'parca'],
}

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
}

export function suggestHashtagsFromText(parts: Array<string | null | undefined>, limit = 6) {
  const source = parts.filter(Boolean).join(' ')
  const words = normalizeText(source)
    .replace(/[#.,/\\()\[\]{}!?;:+*"'`’“”|<>@~-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3)
    .filter((word) => !STOP_WORDS.has(word))

  const uniqueWords: string[] = []
  for (const word of words) {
    if (!uniqueWords.includes(word)) {
      uniqueWords.push(word)
    }
    const equivalents = KEYWORD_EQUIVALENTS[word] || []
    for (const equivalent of equivalents) {
      if (!uniqueWords.includes(equivalent)) {
        uniqueWords.push(equivalent)
      }
      if (uniqueWords.length >= limit) break
    }
    if (uniqueWords.length >= limit) break
  }

  return uniqueWords.map((word) => `#${word}`)
}

export function buildSeoImageAlt(input: {
  title: string | null | undefined
  category?: string | null | undefined
  location?: string | null | undefined
}) {
  return [input.title, input.category, input.location].filter(Boolean).join(' - ').trim() || 'SpotItForMe gorseli'
}

export function buildSeoImageFileName(input: {
  folder: string
  userId: string
  title: string | null | undefined
  originalName: string
  prefix?: string
  index?: number
}) {
  const extension = input.originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const safeTitle = slugifySightingTitle(input.title, 8)
  const prefix = input.prefix ? `${slugifySightingTitle(input.prefix, 3)}-` : ''
  const indexPart = typeof input.index === 'number' ? `-${input.index + 1}` : ''
  const timestamp = Date.now()
  return `${input.userId}/${input.folder}/${prefix}${safeTitle}${indexPart}-${timestamp}.${extension}`
}

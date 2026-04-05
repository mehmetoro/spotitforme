const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeTurkish(text: string) {
  return text
    .replace(/ç/gi, 'c')
    .replace(/ğ/gi, 'g')
    .replace(/ı/gi, 'i')
    .replace(/ö/gi, 'o')
    .replace(/ş/gi, 's')
    .replace(/ü/gi, 'u')
}

export function slugifySightingTitle(value: string | null | undefined, maxWords = 5) {
  if (!value) return 'detay'

  const normalized = normalizeTurkish(value)
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()

  const words = normalized.split(/\s+/).filter(Boolean).slice(0, maxWords)
  return words.join('-').replace(/-+/g, '-') || 'detay'
}

export function extractSightingIdFromParam(value: string) {
  const match = value.match(UUID_PATTERN)
  return match?.[0] || value
}

export function buildSightingPath(id: string, title: string | null | undefined) {
  return `/sightings/${slugifySightingTitle(title)}-${id}`
}

export function buildRareSightingPath(id: string, title: string | null | undefined) {
  return `/sightings/rare/${slugifySightingTitle(title)}-${id}`
}

export function buildCollectionPath(id: string, title: string | null | undefined) {
  return `/collection/${slugifySightingTitle(title)}-${id}`
}

export function buildSocialPath(id: string, title: string | null | undefined) {
  return `/social/${slugifySightingTitle(title)}-${id}`
}

export function buildSpotPath(id: string, title: string | null | undefined) {
  return `/spots/${slugifySightingTitle(title)}-${id}`
}

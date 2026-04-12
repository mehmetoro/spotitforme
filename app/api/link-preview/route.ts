import { NextRequest, NextResponse } from 'next/server'

function extractTag(html: string, key: string) {
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
  const match = html.match(regex)
  return match?.[1] || null
}

function extractTitle(html: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch?.[1]?.trim() || null
}

function extractFirstTag(html: string, keys: string[]) {
  for (const key of keys) {
    const value = extractTag(html, key)
    if (value) return value
  }
  return null
}

function extractJsonLdBlocks(html: string) {
  const blocks: string[] = []
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null = regex.exec(html)
  while (match) {
    blocks.push(match[1])
    match = regex.exec(html)
  }
  return blocks
}

function tryParseJson(input: string) {
  try {
    return JSON.parse(input.trim())
  } catch {
    return null
  }
}

function collectObjects(node: any, bucket: any[]) {
  if (!node) return
  if (Array.isArray(node)) {
    for (const item of node) collectObjects(item, bucket)
    return
  }
  if (typeof node === 'object') {
    bucket.push(node)
    for (const value of Object.values(node)) collectObjects(value, bucket)
  }
}

function getType(value: any) {
  if (!value) return ''
  if (Array.isArray(value)) return value.join(' ').toLowerCase()
  return String(value).toLowerCase()
}

function getFirstString(value: any): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const first = value.find((x) => typeof x === 'string')
    return first || null
  }
  return null
}

function getOfferField(offer: any, keys: string[]) {
  if (!offer || typeof offer !== 'object') return null
  for (const key of keys) {
    const value = offer[key]
    const str = getFirstString(value)
    if (str) return str
    if (typeof value === 'number') return String(value)
  }
  return null
}

function normalizeDomain(inputUrl: string) {
  try {
    const parsed = new URL(inputUrl)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

const CURRENCY_ALIASES: Record<string, string> = {
  TRY: 'TRY',
  TL: 'TRY',
  '₺': 'TRY',
  USD: 'USD',
  US$: 'USD',
  '$': 'USD',
  EUR: 'EUR',
  '€': 'EUR',
  GBP: 'GBP',
  '£': 'GBP',
  JPY: 'JPY',
  '¥': 'JPY',
  CNY: 'CNY',
  RMB: 'CNY',
  KRW: 'KRW',
  INR: 'INR',
  '₹': 'INR',
  AED: 'AED',
  SAR: 'SAR',
  QAR: 'QAR',
  KWD: 'KWD',
  EGP: 'EGP',
  RUB: 'RUB',
  BRL: 'BRL',
  MXN: 'MXN',
  CAD: 'CAD',
  AUD: 'AUD',
  CHF: 'CHF',
  SEK: 'SEK',
  NOK: 'NOK',
  DKK: 'DKK',
  PLN: 'PLN',
  CZK: 'CZK',
  HUF: 'HUF',
  RON: 'RON',
  UAH: 'UAH',
  ZAR: 'ZAR',
  HKD: 'HKD',
  SGD: 'SGD',
  MYR: 'MYR',
  IDR: 'IDR',
  THB: 'THB',
  VND: 'VND',
  PKR: 'PKR',
}

function normalizeLocalizedDigits(input: string) {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u066B]/g, '.')
    .replace(/[\u066C]/g, ',')
    .replace(/[\u00A0\u202F]/g, ' ')
}

function mapCurrencyAlias(input: string | null) {
  if (!input) return null
  const compact = input.toUpperCase().replace(/\s+/g, '')
  if (CURRENCY_ALIASES[compact]) return CURRENCY_ALIASES[compact]
  if (/^[A-Z]{3}$/.test(compact)) return compact
  return null
}

function humanizeSlug(input: string) {
  return input
    .replace(/\?.*$/, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/--id\d+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferTitleFromUrl(inputUrl: string) {
  try {
    const parsed = new URL(inputUrl)
    const parts = parsed.pathname.split('/').filter(Boolean)
    if (!parts.length) return null

    const productIndex = parts.findIndex((part) => /^urun$/i.test(part) || /^product$/i.test(part))
    const candidate = productIndex >= 0 && parts[productIndex + 1]
      ? parts[productIndex + 1]
      : parts[parts.length - 1]

    const title = humanizeSlug(candidate)
    return title ? title.charAt(0).toUpperCase() + title.slice(1) : null
  } catch {
    return null
  }
}

function buildBlockedPreview(parsed: URL, status: number) {
  return {
    title: inferTitleFromUrl(parsed.toString()),
    image: null,
    description: 'Bu site otomatik önizleme isteklerini engelliyor olabilir. Ürün bilgileri kısmi olarak URL\'den türetildi.',
    marketplace: normalizeDomain(parsed.toString()),
    domain: normalizeDomain(parsed.toString()),
    price: null,
    currency: 'TRY',
    seller: null,
    brand: null,
    availability: null,
    url: parsed.toString(),
    blocked: true,
    fetch_status: status,
  }
}

function isBotInterruptionPage(html: string) {
  const sample = (html || '').slice(0, 20000).toLowerCase()
  const signals = [
    'pardon our interruption',
    'just a moment',
    'robot check',
    'captcha',
    'are you a robot',
    'access denied',
    'cf-chl-',
    'cloudflare',
    'splashui',
  ]
  return signals.some((signal) => sample.includes(signal))
}

function decodeHtmlEntities(input: string | null) {
  if (!input) return null
  return normalizeLocalizedDigits(input)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function extractByRegex(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtmlEntities(match[1])
  }
  return null
}

function normalizeAvailability(value: string | null) {
  if (!value) return null
  return value
    .replace(/^https?:\/\/schema\.org\//i, '')
    .replace(/[_-]/g, ' ')
    .trim()
}

function extractCurrencyFromPrice(value: string | null) {
  if (!value) return null
  const decoded = decodeHtmlEntities(value) || value
  const directCode = decoded.match(/\b([A-Z]{3})\b/)
  const mappedCode = mapCurrencyAlias(directCode?.[1] || null)
  if (mappedCode) return mappedCode

  const symbolCandidates = ['₺', '€', '£', '₹', '¥', '$']
  for (const symbol of symbolCandidates) {
    if (decoded.includes(symbol)) {
      const mapped = mapCurrencyAlias(symbol)
      if (mapped) return mapped
    }
  }

  const tokenCandidates = ['TL', 'RMB', 'US$']
  for (const token of tokenCandidates) {
    if (decoded.toUpperCase().includes(token)) {
      const mapped = mapCurrencyAlias(token)
      if (mapped) return mapped
    }
  }

  return null
}

function normalizeSingleNumericCandidate(raw: string) {
  let numeric = raw
    .replace(/[\s'’`]/g, '')
    .replace(/(USD|EUR|GBP|TRY|TL|JPY|CNY|RMB|KRW|INR|AED|SAR|QAR|KWD|EGP|RUB|BRL|MXN|CAD|AUD|CHF|SEK|NOK|DKK|PLN|CZK|HUF|RON|UAH|ZAR|HKD|SGD|MYR|IDR|THB|VND|PKR)/gi, '')
    .replace(/[₺€£₹¥$]/g, '')

  if (!numeric) return null

  const hasComma = numeric.includes(',')
  const hasDot = numeric.includes('.')
  const commaThousandsOnly = /^\d{1,3}(,\d{3})+$/.test(numeric)
  const dotThousandsOnly = /^\d{1,3}(\.\d{3})+$/.test(numeric)

  if (hasComma && hasDot) {
    const lastComma = numeric.lastIndexOf(',')
    const lastDot = numeric.lastIndexOf('.')
    if (lastComma > lastDot) {
      numeric = numeric.replace(/\./g, '').replace(',', '.')
    } else {
      numeric = numeric.replace(/,/g, '')
    }
  } else if (hasComma) {
    if (commaThousandsOnly) {
      numeric = numeric.replace(/,/g, '')
    } else if (/,[0-9]{1,2}$/.test(numeric)) {
      numeric = numeric.replace(/\./g, '').replace(',', '.')
    } else {
      numeric = numeric.replace(/,/g, '')
    }
  } else if (hasDot) {
    if (dotThousandsOnly) {
      numeric = numeric.replace(/\./g, '')
    } else if (/\.[0-9]{1,2}$/.test(numeric)) {
      numeric = numeric.replace(/,/g, '')
    } else {
      numeric = numeric.replace(/\./g, '')
    }
  }

  if (!/^\d+(\.\d{1,2})?$/.test(numeric)) return null
  if (numeric.split('.')[0].length > 9) return null
  return numeric
}

function normalizePriceValue(value: string | null) {
  if (!value) return null
  const decoded = decodeHtmlEntities(value) || ''
  const rawCandidates = Array.from(decoded.matchAll(/([0-9][0-9\s.,'’`]{0,20}[0-9]|[0-9]+)/g))
    .map((m) => ({
      raw: m[1],
      index: m.index ?? 0,
      normalized: normalizeSingleNumericCandidate(m[1]),
    }))
    .filter((candidate): candidate is { raw: string; index: number; normalized: string } => Boolean(candidate.normalized))

  if (!rawCandidates.length) return null
  if (rawCandidates.length === 1) return rawCandidates[0].normalized

  // Sayinin yakininda para birimi/sembol geciyorsa onu onceliklendir.
  const currencyNearby = rawCandidates.filter((candidate) => {
    const start = Math.max(0, candidate.index - 8)
    const end = Math.min(decoded.length, candidate.index + candidate.raw.length + 8)
    const near = decoded.slice(start, end).toUpperCase()
    return /[$€£₺¥₹]|\b(?:USD|EUR|GBP|TRY|TL|JPY|CNY|RMB|KRW|INR|AED|SAR|QAR|KWD|EGP|RUB|BRL|MXN|CAD|AUD|CHF|SEK|NOK|DKK|PLN|CZK|HUF|RON|UAH|ZAR|HKD|SGD|MYR|IDR|THB|VND|PKR)\b/.test(near)
  })

  const pool = currencyNearby.length > 0 ? currencyNearby : rawCandidates
  return pool[0].normalized
}

function extractGenericPriceFallback(html: string) {
  const priceRaw = extractByRegex(html, [
    /["'](?:currentPrice|salePrice|discountPrice|finalPrice|priceAmount|minPrice|maxPrice|specialPrice|unitPrice|promoPrice|offerPrice|final_price)["']\s*:\s*["']?([0-9][0-9\s.,'’`]{0,20}[0-9]|[0-9]+)["']?/i,
    /["']price["']\s*:\s*\{[\s\S]{0,200}?["'](?:value|amount)["']\s*:\s*["']?([0-9]+(?:[.,][0-9]{1,2})?)["']?/i,
    /["'](?:displayPrice|formattedPrice|priceText)["']\s*:\s*["']([^"']*[0-9][^"']*)["']/i,
    /itemprop=["']price["'][^>]*content=["']([^"']+)["']/i,
    /data-(?:price|sale-price|current-price)=["']([^"']+)["']/i,
  ])

  const currency = extractByRegex(html, [
    /["'](?:priceCurrency|currencyCode|currency)["']\s*:\s*["']([A-Z]{3})["']/i,
    /itemprop=["']priceCurrency["'][^>]*content=["']([A-Z]{3})["']/i,
  ]) || extractCurrencyFromPrice(priceRaw)

  return {
    price: normalizePriceValue(priceRaw),
    currency,
  }
}

function extractUrlPriceFallback(parsed: URL) {
  const directCandidates = [
    'price',
    'amount',
    'salePrice',
    'currentPrice',
    'product_price',
    'finalPrice',
    'discountPrice',
    'special_price',
    'unit_price',
    'offerPrice',
  ]
  const directCurrency =
    mapCurrencyAlias(parsed.searchParams.get('currency')) ||
    mapCurrencyAlias(parsed.searchParams.get('cur')) ||
    mapCurrencyAlias(parsed.searchParams.get('currencyCode')) ||
    mapCurrencyAlias(parsed.searchParams.get('priceCurrency'))

  for (const key of directCandidates) {
    const value = parsed.searchParams.get(key)
    const normalized = normalizePriceValue(value)
    if (normalized) {
      return {
        price: normalized,
        currency: directCurrency || extractCurrencyFromPrice(value),
      }
    }
  }

  const pdpNpi = parsed.searchParams.get('pdp_npi')
  if (pdpNpi) {
    const decoded = decodeURIComponent(pdpNpi)
    const taggedPriceMatches = Array.from(
      // AliExpress pdp_npi formati: ...!TRY!807.17!807.17!!...
      decoded.matchAll(/(?:^|!)([A-Z]{3})(?:\s|!|:|=)+([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2}))/g)
    )
      .map((m) => ({
        currency: m[1],
        value: Number(m[2].replace(/,/g, '')),
      }))
      .filter((m) => Number.isFinite(m.value) && m.value > 0)

    if (taggedPriceMatches.length > 0) {
      const preferredCurrency = taggedPriceMatches[0].currency
      const sameCurrencyPrices = taggedPriceMatches.filter((m) => m.currency === preferredCurrency)
      const likelyCurrentPrice = sameCurrencyPrices[sameCurrencyPrices.length - 1]?.value || taggedPriceMatches[taggedPriceMatches.length - 1].value
      return {
        price: String(likelyCurrentPrice),
        currency: preferredCurrency,
      }
    }
  }

  return { price: null, currency: null }
}

function extractAmazonFallback(html: string) {
  const title = extractByRegex(html, [
    /<span[^>]*id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i,
    /"title"\s*:\s*"([^"]{5,})"/i,
  ])

  const image = extractByRegex(html, [
    /"landingImageUrl"\s*:\s*"([^"]+)"/i,
    /"hiRes"\s*:\s*"([^"]+)"/i,
    /"mainUrl"\s*:\s*"([^"]+)"/i,
    /data-old-hires=["']([^"']+)["']/i,
    /data-a-dynamic-image=["']\{\s*&quot;([^&]+)&quot;/i,
    /<img[^>]+id=["']landingImage["'][^>]+src=["']([^"']+)["']/i,
  ])

  const priceRaw = extractByRegex(html, [
    /<span[^>]*class=["'][^"']*a-price[^"']*aok-align-center[^"']*["'][^>]*>[\s\S]*?<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)<\/span>/i,
    /<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)<\/span>/i,
    /&lt;span class=\\&quot;a-offscreen\\&quot;&gt;([^<]+)&lt;\/span&gt;/i,
    /"displayPrice"\s*:\s*"([^"]+)"/i,
    /"price"\s*:\s*"([\d.,]+)"/i,
    /"priceAmount"\s*:\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    /"priceToPay"[\s\S]*?"amount"\s*:\s*"?([\d.,]+)"?/i,
  ])

  const priceCurrencyJson = extractByRegex(html, [
    /"priceCurrency"\s*:\s*"([A-Z]{3})"/i,
  ])

  const brand = extractByRegex(html, [
    /<a[^>]*id=["']bylineInfo["'][^>]*>([^<]+)<\/a>/i,
    /"brand"\s*:\s*"([^"]+)"/i,
  ])

  // Amazon availability tespiti:
  // - Fiyat varsa (escaped a-offscreen) → in_stock (en güvenilir sinyal)
  // - outOfStockBuyBox div'i gerçek içerik taşıyorsa → out_of_stock
  // - Sayfada "Currently unavailable" / "unavailable" span'ı varsa → out_of_stock
  // - id=availability div'i içeriği (JS ile dolsa da)
  const hasPrice = /a-offscreen\\&quot;&gt;[^&<]{1,60}[0-9]/.test(html)
  const hasOutOfStockContent =
    /<div[^>]*id=["']outOfStock["'][^>]*>[\s\S]{1,200}?<span[^>]*>\s*[A-Za-z]/.test(html) ||
    /<p[^>]*id=["']outOfStock["'][^>]*>/.test(html)
  const currentlyUnavailableInPage =
    /<span[^>]*>\s*Currently unavailable\.?\s*<\/span>/i.test(html) ||
    /id=["']availability["'][^>]*>[\s\S]{0,300}Currently unavailable/i.test(html)

  let availability: string | null = null
  if (hasPrice) {
    availability = 'InStock'
  } else if (hasOutOfStockContent || currentlyUnavailableInPage) {
    availability = 'OutOfStock'
  } else {
    // Fallback: availability div içindeki span
    availability = extractByRegex(html, [
      /<div[^>]*id=["']availability["'][^>]*>[\s\S]*?<span[^>]*>\s*([^<]{3,}?)\s*<\/span>/i,
    ])
  }

  const seller = extractByRegex(html, [
    /<div[^>]*id=["']merchantInfoFeature_feature_div["'][^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i,
    /"seller"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/i,
  ])

  return {
    title,
    image,
    price: normalizePriceValue(priceRaw),
    currency: priceCurrencyJson || extractCurrencyFromPrice(priceRaw),
    brand,
    availability: normalizeAvailability(availability),
    seller,
  }
}

function extractEbayFallback(html: string) {
  const title = extractByRegex(html, [
    /<h1[^>]*class=["'][^"']*x-item-title__mainTitle[^"']*["'][^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i,
    /<h1[^>]*class=["'][^"']*x-item-title[^"']*["'][^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i,
  ])

  const image = extractByRegex(html, [
    /<img[^>]+id=["']icImg["'][^>]+src=["']([^"']+)["']/i,
    /"maxImageUrl"\s*:\s*"([^"]+)"/i,
  ])

  const priceRaw = extractByRegex(html, [
    /<div[^>]*class=["'][^"']*x-price-primary[^"']*["'][^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i,
    /itemprop=["']price["'][^>]*content=["']([^"']+)["']/i,
    /"price"\s*:\s*\{[\s\S]*?"value"\s*:\s*"([^"]+)"/i,
  ])

  const currency = extractByRegex(html, [
    /itemprop=["']priceCurrency["'][^>]*content=["']([^"']+)["']/i,
    /"priceCurrency"\s*:\s*"([^"]+)"/i,
  ])

  const brand = extractByRegex(html, [
    /"brand"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/i,
  ])

  const availability = extractByRegex(html, [
    /"availability"\s*:\s*"([^"]+)"/i,
    /<span[^>]*class=["'][^"']*ux-textspans ux-textspans--SECONDARY[^"']*["'][^>]*>([^<]*in stock[^<]*)<\/span>/i,
  ])

  const seller = extractByRegex(html, [
    /"seller"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/i,
    /"sellerUsername"\s*:\s*"([^"]+)"/i,
  ])

  return {
    title,
    image,
    price: normalizePriceValue(priceRaw),
    currency: currency || extractCurrencyFromPrice(priceRaw),
    brand,
    availability: normalizeAvailability(availability),
    seller,
  }
}

function extractIdeasoftFallback(html: string) {
  const priceRaw = extractByRegex(html, [
    /class=["'][^"']*product-price-new[^"']*["'][^>]*>[\s\S]*?([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{2})?|[0-9]+(?:[.,][0-9]{2})?)\s*(?:TL|₺|TRY)?/i,
    /class=["'][^"']*product-price-old[^"']*["'][^>]*>[\s\S]*?([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{2})?|[0-9]+(?:[.,][0-9]{2})?)\s*(?:TL|₺|TRY)?/i,
    /class=["'][^"']*product-list-content[^"']*["'][^>]*>\s*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{2})?|[0-9]+(?:[.,][0-9]{2})?)\s*(?:TL|₺|TRY)/i,
    /salePrice\s*:\s*([0-9]+(?:\.[0-9]+)?)/i,
    /priceWithCurrency\s*:\s*([0-9]+(?:\.[0-9]+)?)/i,
  ])

  const currency = extractByRegex(html, [
    /currency\s*:\s*["']([A-Z]{3})["']/i,
  ]) || extractCurrencyFromPrice(priceRaw)

  return {
    price: normalizePriceValue(priceRaw),
    currency,
  }
}

function isLikelyYearValue(value: string | null, title: string | null | undefined) {
  const normalized = normalizePriceValue(value)
  if (!normalized) return false
  if (!/^\d{4}$/.test(normalized)) return false
  const year = Number(normalized)
  if (year < 1900 || year > 2099) return false
  return Boolean(title && title.includes(String(year)))
}

function hasCurrencyHint(value: string | null) {
  if (!value) return false
  const upper = value.toUpperCase()
  return /[$€£₺¥₹]/.test(value) || /\b(?:USD|EUR|GBP|TRY|TL|JPY|CNY|RMB|KRW|INR|AED|SAR|QAR|KWD|EGP|RUB|BRL|MXN|CAD|AUD|CHF|SEK|NOK|DKK|PLN|CZK|HUF|RON|UAH|ZAR|HKD|SGD|MYR|IDR|THB|VND|PKR)\b/.test(upper)
}

function pickPriceCandidate(
  candidates: Array<{ price: string | null | undefined; currency?: string | null }>,
  title: string | null | undefined
) {
  for (const candidate of candidates) {
    const raw = candidate?.price || null
    if (!raw) continue

    const normalized = normalizePriceValue(raw)
    if (!normalized) continue
    // Ciplak yil degeri (2024 gibi) ve currency ipucu yoksa fiyat sayma.
    if (/^\d{4}$/.test(normalized) && !hasCurrencyHint(raw)) continue
    if (isLikelyYearValue(raw, title)) continue

    return {
      price: normalized,
      currency: mapCurrencyAlias(candidate?.currency || null) || extractCurrencyFromPrice(raw),
    }
  }

  return { price: null, currency: null }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    if (!url) {
      return NextResponse.json({ error: 'url zorunlu' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: 'gecersiz url' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'sadece http/https desteklenir' }, { status: 400 })
    }

    // Timeout: 10 saniye (çoğu sitenin HTML başlığı bu sürede gelir)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // Site-specific detections
    const isAmazonUrl = /(^|\.)amazon\./i.test(parsed.hostname)
    const isAliExpressUrl = /(^|\.)aliexpress\./i.test(parsed.hostname)
    // IdeaSoft: /urun/ path'i ve Türk e-ticaret TLD'si
    const likelyIdeaSoft =
      /\/urun\//i.test(parsed.pathname) &&
      /\.(com\.tr|net\.tr|org\.tr)$/i.test(parsed.hostname)

    const res = await fetch(parsed.toString(), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="125", "Microsoft Edge";v="125"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
        // Amazon lokasyona göre TRY fiyatı döndürür — USD cookie ile localization bypass
        ...(isAmazonUrl ? { Cookie: 'i18n-prefs=USD; lc-main=en_US' } : {}),
        // IdeaSoft WAF Referer kontrolü: kendi sitesinden geliyormuş gibi göster
        ...(!isAmazonUrl && likelyIdeaSoft ? { Referer: `https://${parsed.hostname}/` } : {}),
      },
      cache: 'no-store',
    }).finally(() => clearTimeout(timeoutId))

    if (!res.ok) {
      if ([401, 403, 429, 503].includes(res.status)) {
        return NextResponse.json(buildBlockedPreview(parsed, res.status))
      }
      return NextResponse.json({ error: 'link okunamadi' }, { status: 422 })
    }

    const html = await res.text()
    if (isBotInterruptionPage(html)) {
      return NextResponse.json(buildBlockedPreview(parsed, res.status || 200))
    }

    const ogTitle = extractFirstTag(html, ['og:title', 'twitter:title'])
    const ogImage = extractFirstTag(html, ['og:image', 'twitter:image', 'twitter:image:src'])
    const ogSiteName = extractTag(html, 'og:site_name')
    const ogDescription = extractFirstTag(html, ['og:description', 'twitter:description', 'description'])
    const ogPrice = extractFirstTag(html, [
      'product:price:amount',
      'og:price:amount',
      'price:amount',
      'twitter:data1',
    ])
    const ogCurrency = extractFirstTag(html, [
      'product:price:currency',
      'og:price:currency',
      'price:currency',
    ])

    const jsonLdBlocks = extractJsonLdBlocks(html)
    const allObjects: any[] = []
    for (const block of jsonLdBlocks) {
      const parsedBlock = tryParseJson(block)
      collectObjects(parsedBlock, allObjects)
    }

    const productObject = allObjects.find((obj) => {
      const type = getType(obj?.['@type'])
      return type.includes('product')
    })

    const offer = productObject?.offers
      ? (Array.isArray(productObject.offers) ? productObject.offers[0] : productObject.offers)
      : null

    const jsonTitle = getFirstString(productObject?.name)
    const jsonDescription = getFirstString(productObject?.description)
    const jsonImage = getFirstString(productObject?.image)
    const jsonBrand = getFirstString(productObject?.brand?.name || productObject?.brand)
    const jsonSeller = getFirstString(offer?.seller?.name || offer?.seller)
    const jsonAvailability = getFirstString(offer?.availability)
    const jsonPrice = getOfferField(offer, ['price', 'lowPrice'])
    const jsonCurrency = getOfferField(offer, ['priceCurrency'])

    const domain = normalizeDomain(parsed.toString()) || ''
    const isAmazon = /(^|\.)amazon\./i.test(domain)
    const isEbay = /(^|\.)ebay\./i.test(domain)
    const isAliExpress = /(^|\.)aliexpress\./i.test(domain)
    // IdeaSoft: URL pattern (PATH + TLD) ya da HTML pattern match
    const isIdeasoft =
      likelyIdeaSoft ||
      /product-price-new|product-price-old|salePrice\s*:|storefront\/assets\/css\/global\.css/i.test(html)

    const amazonData = isAmazon ? extractAmazonFallback(html) : null
    const ebayData = isEbay ? extractEbayFallback(html) : null
    const ideasoftData = isIdeasoft ? extractIdeasoftFallback(html) : null
    const genericData = extractGenericPriceFallback(html)
    const urlPriceData = extractUrlPriceFallback(parsed)

    const title = ogTitle || jsonTitle || amazonData?.title || ebayData?.title || extractTitle(html)
    const description = ogDescription || jsonDescription
    const image = ogImage || jsonImage || amazonData?.image || ebayData?.image
    const marketplace = ogSiteName || normalizeDomain(parsed.toString())

    const defaultPriceCandidates = [
      { price: jsonPrice, currency: jsonCurrency },
      { price: ogPrice, currency: ogCurrency },
      { price: amazonData?.price, currency: amazonData?.currency },
      { price: ebayData?.price, currency: ebayData?.currency },
      { price: ideasoftData?.price, currency: ideasoftData?.currency },
      { price: genericData?.price, currency: genericData?.currency },
      { price: urlPriceData?.price, currency: urlPriceData?.currency },
    ]

    const hasTrustedEbayPrice = Boolean(ebayData?.price || jsonPrice || ogPrice)

    const ebayPriceCandidates = hasTrustedEbayPrice
      ? [
          { price: ebayData?.price, currency: ebayData?.currency },
          { price: jsonPrice, currency: jsonCurrency },
          { price: ogPrice, currency: ogCurrency },
          { price: genericData?.price, currency: genericData?.currency },
          { price: urlPriceData?.price, currency: urlPriceData?.currency },
        ]
      : [
          { price: ebayData?.price, currency: ebayData?.currency },
          { price: jsonPrice, currency: jsonCurrency },
          { price: ogPrice, currency: ogCurrency },
        ]

    const amazonPriceCandidates = [
      { price: amazonData?.price, currency: amazonData?.currency },
      { price: jsonPrice, currency: jsonCurrency },
      { price: ogPrice, currency: ogCurrency },
      { price: genericData?.price, currency: genericData?.currency },
      { price: urlPriceData?.price, currency: urlPriceData?.currency },
    ]

    const ideasoftPriceCandidates = [
      { price: ideasoftData?.price, currency: ideasoftData?.currency },
      { price: jsonPrice, currency: jsonCurrency },
      { price: ogPrice, currency: ogCurrency },
      { price: genericData?.price, currency: genericData?.currency },
      { price: urlPriceData?.price, currency: urlPriceData?.currency },
    ]

    const orderedPriceCandidates = isEbay
      ? ebayPriceCandidates
      : isAmazon
        ? amazonPriceCandidates
        : isIdeasoft
          ? ideasoftPriceCandidates
          : defaultPriceCandidates

    const selectedPrice = pickPriceCandidate(orderedPriceCandidates, title)
    const price = selectedPrice.price
    const currency =
      (
        selectedPrice.currency ||
        mapCurrencyAlias(jsonCurrency || ogCurrency || amazonData?.currency || ebayData?.currency || ideasoftData?.currency || genericData?.currency || urlPriceData?.currency || null) ||
        extractCurrencyFromPrice(price) ||
        'TRY'
      )
        .toString()
        .toUpperCase()
    const seller = jsonSeller || amazonData?.seller || ebayData?.seller
    const brand = jsonBrand || amazonData?.brand || ebayData?.brand
    const aliHasHardOosSignal =
      /\bsold\s*out\b/i.test(html) ||
      /\bout\s+of\s+stock\b/i.test(html) ||
      /currently unavailable/i.test(html) ||
      /no longer available/i.test(html) ||
      /can't be shipped to your selected country/i.test(html)
    const aliAvailability = isAliExpress
      ? aliHasHardOosSignal
        ? 'OutOfStock'
        : urlPriceData?.price
          ? 'InStock'
          : null
      : null

    const availability =
      normalizeAvailability(jsonAvailability) || amazonData?.availability || ebayData?.availability || aliAvailability

    return NextResponse.json({
      title,
      image,
      description,
      marketplace,
      domain: normalizeDomain(parsed.toString()),
      price,
      currency,
      seller,
      brand,
      availability,
      url: parsed.toString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'link preview hatasi' }, { status: 500 })
  }
}

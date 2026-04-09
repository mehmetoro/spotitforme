// lib/product-check.ts
// Sanal paylaşım URL'lerinin stok ve erişilebilirlik kontrolü

export type ProductCheckStatus =
  | 'active'
  | 'out_of_stock'
  | 'removed'
  | 'blocked'
  | 'suspicious'
  | 'pending_review'

export interface ProductCheckResult {
  status: ProductCheckStatus
  http_status: number | null
  notes: string
}

// Bot koruması sinyalleri (çok hassas olmasın - sadece gerçek captcha/interstitial'ler)
const BLOCK_SIGNALS = [
  'pardon our interruption',
  'just a moment',
  'checking your browser',
  'enable javascript and cookies',
  'cf_clearance',
  'captcha',
  'are you a robot',
  'access denied',
  'robot check',
]

// Stok tükenmesi sinyalleri (hem schema.org hem metin)
// NOT: 'currently unavailable' Amazon JS bundle'ında her sayfada geçer → Amazon için özel kontrol var
const OUT_OF_STOCK_SIGNALS = [
  'outofstock',
  'out of stock',
  'stokta yok',
  'tükendi',
  'tükenmiştir',
  'satışa kapalı',
  'satıştan kaldırıldı',
  'discontinued',
  'no longer available',
  'sold out',
  'not in stock',
]

// Sayfa kaldırılmış sinyalleri
const REMOVED_SIGNALS = [
  'bu ürün artık mevcut değil',
  'ürün bulunamadı',
  'this item is no longer available',
  'this product is no longer',
  'no longer sold',
  'item not available',
  "we couldn't find the page",
  'product not found',
  'sayfa bulunamadı',
]

/**
 * SSRF koruması: özel/loopback adreslerini engelle
 */
function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h === '::1') return true
  if (/^127\./.test(h)) return true
  if (/^10\./.test(h)) return true
  if (/^192\.168\./.test(h)) return true
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(h)) return true
  if (h.endsWith('.local') || h.endsWith('.internal')) return true
  return false
}

/**
 * Bir ürün URL'sini kontrol eder; HTTP erişilebilirliği ve stok durumunu döner.
 * Timeout: 10 saniye. Response: maksimum 100KB okunur.
 */
export async function checkProductUrl(rawUrl: string): Promise<ProductCheckResult> {
  // URL geçerliliği
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { status: 'suspicious', http_status: null, notes: 'Geçersiz URL formatı' }
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { status: 'suspicious', http_status: null, notes: 'Sadece HTTP/HTTPS destekleniyor' }
  }

  if (isPrivateHost(parsed.hostname)) {
    return { status: 'suspicious', http_status: null, notes: 'Özel ağ adresi engellendi' }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const isAmazon = /(^|\.)amazon\./i.test(parsed.hostname)
    const isEbay = /(^|\.)ebay\./i.test(parsed.hostname)
    const isAliExpress = /(^|\.)aliexpress\./i.test(parsed.hostname)

    const response = await fetch(rawUrl, {
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
        // Amazon lokasyona göre TRY/eski kur fiyatı döndürür; USD cookie ile gerçek fiyatı al
        ...(isAmazon ? { Cookie: 'i18n-prefs=USD; lc-main=en_US' } : {}),
      },
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    const httpStatus = response.status

    // Kesin kaldırılmış
    if (httpStatus === 404 || httpStatus === 410) {
      return {
        status: 'removed',
        http_status: httpStatus,
        notes: `HTTP ${httpStatus} – sayfa bulunamadı`,
      }
    }

    // Sunucu hatası
    if (httpStatus >= 500) {
      return {
        status: 'suspicious',
        http_status: httpStatus,
        notes: `HTTP ${httpStatus} – sunucu hatası`,
      }
    }

    // Bot/erişim engeli
    if (httpStatus === 403 || httpStatus === 429) {
      return {
        status: 'blocked',
        http_status: httpStatus,
        notes: `HTTP ${httpStatus} – erişim engellendi`,
      }
    }

    // 200 aralığı dışı beklenmeyen kodu – dokunma
    if (httpStatus < 200 || httpStatus >= 400) {
      return {
        status: 'suspicious',
        http_status: httpStatus,
        notes: `Beklenmeyen HTTP ${httpStatus}`,
      }
    }

    // Gövdeyi oku — Amazon/eBay/AliExpress sayfaları büyük olabilir.
    // Amazon için 600KB, eBay için 450KB, AliExpress için 200KB, diğerleri için 100KB oku.
    const rawText = await response.text()
    const readLimit = isAmazon ? 600000 : isEbay ? 450000 : isAliExpress ? 200000 : 100000
    const html = rawText.slice(0, readLimit)
    const sampleLower = html.toLowerCase()

    // Bot koruması sayfası mı?
    const isBot = BLOCK_SIGNALS.some((s) => sampleLower.includes(s.toLowerCase()))
    if (isBot) {
      return { status: 'blocked', http_status: httpStatus, notes: 'Bot koruması tespit edildi' }
    }

    // Kaldırılmış sayfası mı?
    const isRemoved = REMOVED_SIGNALS.some((s) => sampleLower.includes(s.toLowerCase()))
    if (isRemoved) {
      return {
        status: 'removed',
        http_status: httpStatus,
        notes: 'Ürün kaldırılmış sinyali tespit edildi',
      }
    }

    // Schema.org availability kontrolü (en güvenilir kaynak)
    const schemaMatch = html.match(/"availability"\s*:\s*"?([^",\s}]+)"?/i)
    if (schemaMatch) {
      const avail = schemaMatch[1].toLowerCase().replace(/.*schema\.org\//i, '').replace(/[_-]/g, '')
      if (avail.includes('outofstock') || avail === 'discontinued') {
        return {
          status: 'out_of_stock',
          http_status: httpStatus,
          notes: 'Schema.org: OutOfStock',
        }
      }
      if (avail.includes('instock') || avail.includes('preorder')) {
        return { status: 'active', http_status: httpStatus, notes: 'Schema.org: InStock' }
      }
    }

    // Amazon'a özel stok tespiti:
    // - Escaped HTML'de a-offscreen fiyatı varsa → InStock (en güvenilir)
    // - outOfStock div içerik taşıyorsa veya gerçek 'Currently unavailable' span'ı varsa → OutOfStock
    if (isAmazon) {
      // Birden fazla format: escaped (\&quot;&gt;) veya normal (">) veya entity (&quot;&gt;)
      const hasPriceInHtml =
        /a-offscreen\\&quot;&gt;[^&<]{1,60}[0-9]/.test(html) ||
        /a-offscreen&quot;&gt;[^&<]{1,60}[0-9]/.test(html) ||
        /class="a-offscreen">[^<]{1,60}[0-9]/.test(html) ||
        /a-offscreen[^>"]{0,30}>[^<]{1,60}[0-9]/.test(html)
      const hasRealOutOfStock =
        /<div[^>]*id=["']outOfStock["'][^>]*>\s*<p/.test(html) ||
        /<span[^>]*>\s*Currently unavailable\.?\s*<\/span>/i.test(html)

      if (hasPriceInHtml) {
        return { status: 'active', http_status: httpStatus, notes: 'Amazon: fiyat mevcut, ürün stokta' }
      }
      if (hasRealOutOfStock) {
        return { status: 'out_of_stock', http_status: httpStatus, notes: 'Amazon: ürün stokta yok' }
      }
      // Fiyat da yok, stoksuz da değil → stok bilinmiyor, ama sayfa erişilebilir
      return { status: 'active', http_status: httpStatus, notes: 'Amazon: sayfa erişilebilir' }
    }

    // eBay'e özel stok tespiti:
    // - Varyant satırlarında "Out of stock" geçtiği için genel metin araması false-positive üretebilir.
    // - Güçlü OOS sinyallerini CTA yokluğuyla birlikte değerlendir.
    // - Ana fiyat + satın alma CTA (Buy It Now / Add to cart / Place bid) varsa aktif kabul et.
    if (isEbay) {
      const hasPrimaryPrice =
        /class=["'][^"']*x-price-primary[^"']*["']/i.test(html) ||
        /itemprop=["']price["'][^>]*content=["'][^"']+/i.test(html)

      const hasPurchaseCta =
        /buy it now/i.test(html) ||
        /add to cart/i.test(html) ||
        /place bid/i.test(html) ||
        /id=["']binBtn_btn["']/i.test(html) ||
        /id=["']atcRedesignId_btn["']/i.test(html) ||
        /id=["']isCartBtn_btn["']/i.test(html)

      const hasEndedSignal =
        /this listing was ended/i.test(html) ||
        /this listing has ended/i.test(html) ||
        /listing ended/i.test(html) ||
        /this item is out of stock/i.test(html) ||
        /this item is no longer available/i.test(html) ||
        /this listing is out of stock/i.test(html)

      const hasHardOosSignal =
        /class=["'][^"']*quantity-status[^"']*["'][^>]*>[^<]*(out of stock|sold out)/i.test(html) ||
        /class=["'][^"']*vi-qtyS-hot-red[^"']*["'][^>]*>[^<]*(out of stock|sold out)/i.test(html) ||
        /class=["'][^"']*x-item-unavailable[^"']*["']/i.test(html)

      // Kesin ended sinyalleri doğrudan out_of_stock
      if (hasEndedSignal) {
        return { status: 'out_of_stock', http_status: httpStatus, notes: 'eBay: ürün stokta yok' }
      }

      // Sert stok sinyalini sadece satın alma CTA'sı yoksa out_of_stock say.
      if (hasHardOosSignal && !hasPurchaseCta) {
        return { status: 'out_of_stock', http_status: httpStatus, notes: 'eBay: ürün stokta yok' }
      }

      if (hasPrimaryPrice || hasPurchaseCta) {
        return { status: 'active', http_status: httpStatus, notes: 'eBay: ürün satışta' }
      }

      return { status: 'active', http_status: httpStatus, notes: 'eBay: sayfa erişilebilir' }
    }

    // AliExpress'e özel stok tespiti:
    // - pdp_npi URL parametresi fiyat içeriyorsa ve sert OOS sinyali yoksa aktif kabul et.
    // - Sert OOS sinyali varsa out_of_stock.
    if (isAliExpress) {
      const hasHardOosSignal =
        /\bsold\s*out\b/i.test(html) ||
        /\bout\s+of\s+stock\b/i.test(html) ||
        /currently unavailable/i.test(html) ||
        /no longer available/i.test(html) ||
        /can't be shipped to your selected country/i.test(html)

      if (hasHardOosSignal) {
        return { status: 'out_of_stock', http_status: httpStatus, notes: 'AliExpress: ürün stokta yok' }
      }

      const pdpNpi = parsed.searchParams.get('pdp_npi')
      if (pdpNpi) {
        const decoded = decodeURIComponent(pdpNpi)
        const hasTaggedPrice = /(?:^|!)[A-Z]{3}(?:\s|!|:|=)+[0-9]+(?:\.[0-9]{2})?/.test(decoded)
        if (hasTaggedPrice) {
          return { status: 'active', http_status: httpStatus, notes: 'AliExpress: URL fiyat sinyali mevcut' }
        }
      }

      return { status: 'active', http_status: httpStatus, notes: 'AliExpress: sayfa erişilebilir' }
    }

    // === HYBRID GENEL KONTROL SİSTEMİ ===
    // Tanınan siteler dışında kalan tüm siteler için uygulanan kontrol sistemi:
    // 1. Sert stok tükenmesi sinyalleri → out_of_stock
    // 2. Fiyat veya satın alma CTA → active
    // 3. Fallback → active

    // 1. Metin bazlı stok tükenmesi sinyalleri
    const isOos = OUT_OF_STOCK_SIGNALS.some((s) => sampleLower.includes(s.toLowerCase()))
    if (isOos) {
      return {
        status: 'out_of_stock',
        http_status: httpStatus,
        notes: 'Stok kontrol: tükenmesi sinyali tespit edildi',
      }
    }

    // 2. Fiyat sinyalleri ara (farklı format ve parabirimler)
    const hasPriceSignal =
      /[$€£¥₺]\s*\d+[.,]\d{2}|[\d]+(?:,\d{3})*\s*(?:₺|TL|$|€|£)/i.test(html) ||
      /price[">:\s]/i.test(html) ||
      /data-price=["']\d+/i.test(html) ||
      /cost[">:\s]/i.test(html) ||
      /amount[">:\s]/i.test(html)

    // 3. Satın alma/ekleme CTA sinyalleri
    const hasCtaSignal =
      /add\s+to\s+cart|add\s+to\s+bag/i.test(html) ||
      /buy\s+now|buy\s+it\s+now/i.test(html) ||
      /\badd\b.*\bcart\b[^<]*<\//i.test(html) ||
      /checkout/i.test(html) ||
      /purchase|order\s+now/i.test(html) ||
      /place\s+order|place\s+bid/i.test(html) ||
      /id=["'][^"']*cart[^"']*["']/i.test(html) ||
      /id=["'][^"']*checkout[^"']*["']/i.test(html)

    if (hasPriceSignal || hasCtaSignal) {
      return {
        status: 'active',
        http_status: httpStatus,
        notes: 'Stok kontrol: ürün sayfası aktif sinyalleri gösteriyor',
      }
    }

    // 4. Son fallback: sayfa erişilebilir → active
    // (Bot engeli, kaldırılmış sayfa, erişim reddedilmesi zaten yukarıda handle edildi)
    return { status: 'active', http_status: httpStatus, notes: 'Stok kontrol: ürün sayfası erişilebilir' }
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err?.name === 'AbortError') {
      return { status: 'suspicious', http_status: null, notes: 'Bağlantı zaman aşımı (10s)' }
    }
    return {
      status: 'suspicious',
      http_status: null,
      notes: `Bağlantı hatası: ${err?.message || 'bilinmiyor'}`,
    }
  }
}

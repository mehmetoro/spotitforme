// app/api/shop/match-check/route.ts - DÜZELTİLMİŞ
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface MatchCriteria {
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  radius?: number
  brand?: string
  model?: string
  condition?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() // Değişiklik burada
    const { shopId, searchId, trigger } = body // Body'den al

    if (!shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required' },
        { status: 400 }
      )
    }

    // 1. Aktif aramaları getir
    const { data: activeSearches, error: searchesError } = await supabase
      .from('shop_searches')
      .select('*')
      .eq('shop_id', shopId)
      .eq('status', 'active')

    if (searchesError) throw searchesError

    let totalMatches = 0
    let newMatches = 0

    // 2. Her arama için eşleşme kontrolü yap
    for (const search of activeSearches) {
      const matches = await findMatchesForSearch(search)
      totalMatches += matches.length

      // 3. Yeni eşleşmeleri kaydet
      for (const match of matches) {
        const { error: insertError } = await supabase
          .from('shop_search_matches')
          .upsert({
            search_id: search.id,
            inventory_id: match.inventoryId,
            spot_id: match.spotId,
            match_score: match.score,
            match_reasons: match.reasons,
            status: 'pending'
          }, {
            onConflict: 'search_id, inventory_id, spot_id'
          })

        if (!insertError) {
          newMatches++
          
          // 4. Yüksek skorlu eşleşmeler için bildirim gönder
          if (match.score >= 80 && search.auto_notify !== false) {
            await sendMatchNotification(search, match)
          }
        }
      }
    }

    // 5. Mağaza analytics güncelle
    await updateShopAnalytics(shopId, newMatches)

    return NextResponse.json({
      success: true,
      message: `Match check completed for shop ${shopId}`,
      stats: {
        totalSearchesChecked: activeSearches.length,
        totalMatchesFound: totalMatches,
        newMatchesAdded: newMatches,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Match check error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

async function findMatchesForSearch(search: any): Promise<any[]> {
  const matches: any[] = []
  const criteria = buildMatchCriteria(search)

  // 1. Diğer mağazaların envanterinde ara
  const { data: inventoryMatches } = await supabase
    .from('shop_inventory')
    .select('*, shop:shops(*)')
    .eq('status', 'active')
    .neq('shop_id', search.shop_id) // Kendi mağazasını hariç tut
    .or(buildInventoryWhereClause(criteria))
    .limit(20)

  if (inventoryMatches) {
    for (const item of inventoryMatches) {
      const score = calculateMatchScore(search, item, 'inventory')
      if (score >= 50) { // %50 eşleşme eşiği
        matches.push({
          inventoryId: item.id,
          score,
          reasons: getMatchReasons(search, item)
        })
      }
    }
  }

  // 2. Spot'larda ara (kullanıcıların aradığı ürünler)
  const { data: spotMatches } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'active')
    .or(buildSpotWhereClause(criteria))

  if (spotMatches) {
    for (const spot of spotMatches) {
      const score = calculateMatchScore(search, spot, 'spot')
      if (score >= 60) { // Spot'lar için daha yüksek eşik
        matches.push({
          spotId: spot.id,
          score,
          reasons: getMatchReasons(search, spot)
        })
      }
    }
  }

  return matches.sort((a, b) => b.score - a.score) // Yüksek skordan düşüğe sırala
}

function buildMatchCriteria(search: any): MatchCriteria {
  return {
    category: search.category,
    subcategory: search.subcategory,
    minPrice: search.min_price,
    maxPrice: search.max_price,
    location: search.location,
    radius: search.location_radius,
    brand: search.brand,
    model: search.model,
    condition: search.condition
  }
}

function buildInventoryWhereClause(criteria: MatchCriteria): string {
  const conditions: string[] = []

  if (criteria.category) {
    conditions.push(`category.eq.${criteria.category}`)
  }

  if (criteria.brand) {
    conditions.push(`brand.ilike.%${criteria.brand}%`)
  }

  if (criteria.model) {
    conditions.push(`model.ilike.%${criteria.model}%`)
  }

  // Fiyat aralığı
  if (criteria.minPrice || criteria.maxPrice) {
    let priceCondition = ''
    if (criteria.minPrice && criteria.maxPrice) {
      priceCondition = `price.gte.${criteria.minPrice},price.lte.${criteria.maxPrice}`
    } else if (criteria.minPrice) {
      priceCondition = `price.gte.${criteria.minPrice}`
    } else if (criteria.maxPrice) {
      priceCondition = `price.lte.${criteria.maxPrice}`
    }
    conditions.push(priceCondition)
  }

  return conditions.join(',')
}

function buildSpotWhereClause(criteria: MatchCriteria): string {
  const conditions: string[] = []

  if (criteria.category) {
    conditions.push(`category.eq.${criteria.category}`)
  }

  // Spot başlığında marka/model ara
  if (criteria.brand || criteria.model) {
    const searchTerms = []
    if (criteria.brand) searchTerms.push(criteria.brand)
    if (criteria.model) searchTerms.push(criteria.model)
    
    conditions.push(`title.ilike.%${searchTerms.join('%')}%`)
  }

  return conditions.join(',')
}

function calculateMatchScore(search: any, item: any, type: 'inventory' | 'spot'): number {
  let score = 0
  const reasons: string[] = []

  // 1. Kategori eşleşmesi (%30)
  if (search.category && item.category === search.category) {
    score += 30
    reasons.push('category_match')
    
    // Alt kategori eşleşmesi (+%10)
    if (search.subcategory && item.subcategory === search.subcategory) {
      score += 10
      reasons.push('subcategory_match')
    }
  }

  // 2. Marka/Model eşleşmesi (%40)
  if (search.brand || search.model) {
    const title = (item.title || '').toLowerCase()
    const description = (item.description || '').toLowerCase()
    const brand = (search.brand || '').toLowerCase()
    const model = (search.model || '').toLowerCase()

    if (brand && (title.includes(brand) || description.includes(brand))) {
      score += 20
      reasons.push('brand_match')
    }

    if (model && (title.includes(model) || description.includes(model))) {
      score += 20
      reasons.push('model_match')
    }
  }

  // 3. Fiyat uyumu (%20)
  if (type === 'inventory' && item.price) {
    if (search.min_price && search.max_price) {
      if (item.price >= search.min_price && item.price <= search.max_price) {
        score += 20
        reasons.push('price_perfect_match')
      } else if (item.price <= search.max_price * 1.2) { // %20'ye kadar fazla olabilir
        score += 10
        reasons.push('price_close_match')
      }
    } else if (search.max_price && item.price <= search.max_price) {
      score += 15
      reasons.push('price_within_max')
    }
  }

  // 4. Konum uyumu (%10)
  if (search.location && item.location) {
    if (search.location === item.location) {
      score += 10
      reasons.push('exact_location_match')
    } else if (search.location.includes(item.location) || item.location.includes(search.location)) {
      score += 5
      reasons.push('partial_location_match')
    }
  }

  // 5. Durum eşleşmesi (%5)
  if (search.condition && item.condition === search.condition) {
    score += 5
    reasons.push('condition_match')
  }

  // 6. Görsel benzerliği bonusu (%15)
  if (item.images && item.images.length > 0 && search.images && search.images.length > 0) {
    // Burada görsel benzerlik algoritması eklenebilir
    score += 5 // Basit bonus
    reasons.push('has_images')
  }

  return Math.min(100, score) // Maksimum 100
}

function getMatchReasons(search: any, item: any): string[] {
  const reasons: string[] = []
  
  if (search.category && item.category === search.category) {
    reasons.push('Kategori eşleşmesi')
  }
  
  if (search.brand && item.brand === search.brand) {
    reasons.push('Marka eşleşmesi')
  }
  
  if (item.price && search.max_price && item.price <= search.max_price) {
    reasons.push('Bütçe aralığında')
  }
  
  return reasons
}

async function sendMatchNotification(search: any, match: any) {
  // Mağaza sahibine email/notification gönder
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: await getShopOwnerEmail(search.shop_id),
        template: 'shop-match-found',
        data: {
          search_title: search.title,
          match_score: match.score,
          match_reasons: match.reasons.join(', '),
          match_link: `/shop/${search.shop_id}/matches/${match.inventoryId || match.spotId}`
        }
      })
    })

    // In-app notification
    await supabase.from('shop_notifications').insert({
      shop_id: search.shop_id,
      type: 'new_match',
      title: 'Yeni eşleşme bulundu!',
      message: `"${search.title}" aramanız için %${match.score} eşleşme bulundu.`,
      action_url: `/shop/${search.shop_id}/matches`,
      metadata: {
        search_id: search.id,
        match_id: match.inventoryId || match.spotId,
        score: match.score
      }
    })

  } catch (error) {
    console.error('Notification gönderilemedi:', error)
  }
}

async function getShopOwnerEmail(shopId: string): Promise<string> {
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single()

  if (!shop) throw new Error('Shop not found')

  const { data: owner } = await supabase
    .from('user_profiles')
    .select('email')
    .eq('id', shop.owner_id)
    .single()

  return owner?.email || 'admin@spotitforme.com'
}

async function updateShopAnalytics(shopId: string, newMatches: number) {
  const today = new Date().toISOString().split('T')[0]

  await supabase
    .from('shop_analytics_daily')
    .upsert({
      shop_id: shopId,
      date: today,
      matches_found: newMatches,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'shop_id,date'
    })
}

async function sendErrorNotification(errorMessage: string, shopId?: string) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: process.env.ADMIN_EMAIL,
        template: 'system-error',
        data: {
          error: errorMessage,
          shop_id: shopId,
          timestamp: new Date().toISOString()
        }
      })
    })
  } catch (err) {
    console.error('Error notification failed:', err)
  }
}
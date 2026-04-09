// app/api/product-check/route.ts
// Yayın öncesi ürün URL güvenlik ve stok kontrolü (modal'lar tarafından çağrılır)
import { NextRequest, NextResponse } from 'next/server'
import { checkProductUrl } from '@/lib/product-check'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const url = typeof body?.url === 'string' ? body.url.trim() : null

    if (!url) {
      return NextResponse.json({ error: 'url alanı zorunlu' }, { status: 400 })
    }

    const result = await checkProductUrl(url)
    return NextResponse.json(result)
  } catch (err: any) {
    // Hata durumunda kontrol edilemedi olarak döndür; modal 'pending_review' yolunu izler
    return NextResponse.json(
      { status: 'suspicious', http_status: null, notes: err?.message || 'İç hata' },
      { status: 200 },
    )
  }
}

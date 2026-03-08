import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return { user: null, error: 'Yetkilendirme hatası' };
  }

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { user: null, error: 'Kullanıcı bulunamadı' };
  }

  return { user, error: null };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const shopId = params.id;
    const productId = params.productId;

    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Yetkisiz' }, { status: 401 });
    }

    const { data: requestRow, error } = await supabase
      .from('shop_product_discount_requests')
      .select('id, spot_amount, discount_amount_usd, discount_amount_local, original_price, final_price, currency, exchange_rate, status, created_at, responded_at, updated_at')
      .eq('buyer_id', user.id)
      .eq('shop_id', shopId)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message || 'Talep durumu alınamadı' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      request: requestRow || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Sunucu hatası',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { 
      spotAmount, 
      discountAmountUsd, 
      discountAmountLocal, 
      originalPrice,
      finalPrice,
      currency,
      exchangeRate,
    } = await request.json();
    
    const shopId = params.id;
    const productId = params.productId;

    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Yetkisiz' }, { status: 401 });
    }

    const buyerId = user.id;

    const { data: product, error: productError } = await supabase
      .from('shop_inventory')
      .select('id, shop_id, title, status, spot_discount')
      .eq('id', productId)
      .eq('shop_id', shopId)
      .eq('status', 'active')
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Ürün bulunamadı veya aktif değil' }, { status: 404 });
    }

    // User tarafından talep edilen Spot miktarı (1-50 arası)
    const requestedSpotAmount = Number(spotAmount);

    if (!requestedSpotAmount || requestedSpotAmount < 1 || requestedSpotAmount > 50) {
      return NextResponse.json(
        { error: 'Lütfen 1 ile 50 arasında bir Spot miktarı seçin' },
        { status: 400 }
      );
    }

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shopId)
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: 'Mağaza bulunamadı' }, { status: 404 });
    }

    const sellerId = shop.owner_id;

    if (buyerId === sellerId) {
      return NextResponse.json({ error: 'Kendi ürününüz için talep oluşturamazsınız' }, { status: 400 });
    }

    const { data: existingPending } = await supabase
      .from('shop_product_discount_requests')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('product_id', productId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingPending) {
      return NextResponse.json(
        {
          success: true,
          message: 'Bu ürün için bekleyen bir indirim talebiniz zaten var.',
          request_id: existingPending.id,
        },
        { status: 200 }
      );
    }

    const { data: requestRow, error: insertError } = await supabase
      .from('shop_product_discount_requests')
      .insert({
        buyer_id: buyerId,
        seller_id: sellerId,
        product_id: productId,
        shop_id: shopId,
        spot_amount: requestedSpotAmount,
        discount_amount_usd: Number(discountAmountUsd) || requestedSpotAmount,
        discount_amount_local: Number(discountAmountLocal) || 0,
        original_price: Number(originalPrice) || 0,
        final_price: Number(finalPrice) || 0,
        currency: currency || 'TRY',
        exchange_rate: Number(exchangeRate) || 1,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError.message);
      return NextResponse.json(
        { error: insertError.message || 'İndirim talebi kaydedilemedi' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        request_id: requestRow.id,
        message:
          'İndirim talebiniz mağazaya iletildi. Alışveriş tamamlandığında ve mağaza onayladığında Spot transferi gerçekleşir.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Discount request error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Sunucu hatası',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}

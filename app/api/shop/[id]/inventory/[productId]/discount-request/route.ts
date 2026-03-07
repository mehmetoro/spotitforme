import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { spotAmount } = await request.json();
    const shopId = params.id;
    const productId = params.productId;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
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

    if (!product.spot_discount) {
      return NextResponse.json(
        { error: 'Bu ürün için Spot indirimi tanımlanmamış' },
        { status: 400 }
      );
    }

    const requestedSpotAmount = Number(spotAmount ?? product.spot_discount);

    if (requestedSpotAmount !== product.spot_discount) {
      return NextResponse.json(
        { error: `Bu ürün için yalnızca ${product.spot_discount} Spot indirimi talep edilebilir` },
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
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
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
    return NextResponse.json(
      {
        error: error.message || 'Sunucu hatası',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}

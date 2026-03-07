// app/api/shop/[id]/inventory/[productId]/purchase/route.ts
// POST endpoint for Spot-based product purchases

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

    // 1) Validate input
    if (!spotAmount || ![1, 2, 3].includes(spotAmount)) {
      return NextResponse.json(
        { error: 'Geçersiz Spot miktarı (1, 2 veya 3 olmalı)' },
        { status: 400 }
      );
    }

    // 2) Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // 3) Extract token and verify user
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    const buyerId = user.id;

    // 4) Verify product exists and get seller
    const { data: product, error: productError } = await supabase
      .from('shop_inventory')
      .select('shop_id, title, price, price_currency')
      .eq('id', productId)
      .eq('shop_id', shopId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // 5) Get shop owner (seller)
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('user_id')
      .eq('id', shopId)
      .single();

    if (shopError || !shop) {
      return NextResponse.json(
        { error: 'Mağaza bulunamadı' },
        { status: 404 }
      );
    }

    const sellerId = shop.user_id;

    // 6) Prevent self-purchase
    if (buyerId === sellerId) {
      return NextResponse.json(
        { error: 'Kendi ürünlerinizi satın alamazsınız' },
        { status: 400 }
      );
    }

    // 7) Call RPC function to process purchase
    const { data: result, error: rpcError } = await supabase.rpc(
      'process_spot_purchase',
      {
        p_buyer_id: buyerId,
        p_seller_id: sellerId,
        p_product_id: productId,
        p_shop_id: shopId,
        p_spot_amount: spotAmount,
      }
    );

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return NextResponse.json(
        {
          error: rpcError.message || 'Satın alma işlemi başarısız',
          code: rpcError.code,
        },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Bilinmeyen hata' },
        { status: 400 }
      );
    }

    // 8) Return success response
    return NextResponse.json(
      {
        success: true,
        message: result.message,
        purchase_id: result.purchase_id,
        buyer_spot_balance: result.buyer_spot_balance,
        seller_spot_balance: result.seller_spot_balance,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Purchase endpoint error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Sunucu hatası',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}


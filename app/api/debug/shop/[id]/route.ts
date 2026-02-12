// app/api/debug/shop/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shopId = params.id
  
  // UUID format kontrolü
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(shopId);
  
  if (!isValidUUID) {
    return NextResponse.json({
      success: false,
      message: 'Invalid UUID format',
      shopId,
      isValidUUID: false
    }, { status: 400 });
  }

  try {
    // shops tablosundan kontrol
    const { data: shop, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single()

    return NextResponse.json({
      success: !error,
      shopId,
      isValidUUID: true,
      shop: shop || null,
      error: error?.message || null
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      shopId,
      error: error.message
    }, { status: 500 });
  }
}
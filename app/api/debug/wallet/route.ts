import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
  }

  try {
    // Cüzdan bilgisi
    const { data: wallet, error: walletError } = await supabase
      .from('spot_wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Bloke edilen Spot'lar
    const { data: blockedRequests } = await supabase
      .from('shop_product_discount_requests')
      .select('id, buyer_id, spot_amount, status, created_at')
      .eq('buyer_id', user.id)
      .in('status', ['pending', 'approved']);

    // Tüm işlemler
    const { data: ledger } = await supabase
      .from('spot_ledger')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      user_id: user.id,
      user_email: user.email,
      wallet,
      blocked_requests: blockedRequests,
      blocked_spots_total: (blockedRequests || []).reduce((sum, r) => sum + (r.spot_amount || 0), 0),
      recent_ledger: ledger,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_SUPABASE_URL = 'https://gobzxreumkbgaohvzoef.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYnp4cmV1bWtiZ2FvaHZ6b2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODI2MjksImV4cCI6MjA4NDg1ODYyOX0.9r7Ds_Ja0ulkTYWxJsl9r14ylIbUHzdFULvWehfoTDQ';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      FALLBACK_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    let { data: quickSightings, error } = await supabase
      .from('quick_sightings')
      .select('id, user_id, description, location, category, city, district, address, location_name, price, currency, photo_url, created_at, status')
      .or(`description.ilike.%${search}%,location.ilike.%${search}%,category.ilike.%${search}%,city.ilike.%${search}%,district.ilike.%${search}%,address.ilike.%${search}%,location_name.ilike.%${search}%`)
      .order('created_at', { ascending: false });

    if (typeof quickSightings === 'undefined') quickSightings = null;
    quickSightings = quickSightings ?? [];

    // Filtreleme
    if (category) {
      quickSightings = quickSightings.filter((q: any) => q.category === category);
    }
    if (city) {
      quickSightings = quickSightings.filter((q: any) => q.city === city);
    }
    if (minPrice) {
      quickSightings = quickSightings.filter((q: any) => Number(q.price) >= Number(minPrice));
    }
    if (maxPrice) {
      quickSightings = quickSightings.filter((q: any) => Number(q.price) <= Number(maxPrice));
    }

    // Sonuçları sırala
    const results = (quickSightings || []).map((q: any) => ({ ...q, type: 'quick' }));
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ results, error });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  TRY: 30,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 110,
  INR: 74,
  BRL: 5,
  MXN: 20,
  PLN: 4,
  RUB: 80,
};

async function getLiveRate(toCurrency: string): Promise<number | null> {
  if (toCurrency === 'USD') return 1;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const rate = data?.rates?.[toCurrency];

    if (typeof rate !== 'number' || rate <= 0) return null;
    return rate;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  try {
    const fromCurrency = (request.nextUrl.searchParams.get('from') || 'USD').toUpperCase();
    const toCurrency = (request.nextUrl.searchParams.get('to') || 'TRY').toUpperCase();

    if (fromCurrency !== 'USD') {
      return NextResponse.json(
        { error: 'Sadece USD kaynağından çeviri desteklenir' },
        { status: 400 }
      );
    }

    if (!FALLBACK_RATES[toCurrency]) {
      return NextResponse.json(
        { error: `${toCurrency} para birimi desteklenmiyor` },
        { status: 400 }
      );
    }

    const liveRate = await getLiveRate(toCurrency);
    const rate = liveRate ?? FALLBACK_RATES[toCurrency];

    return NextResponse.json({
      from: fromCurrency,
      to: toCurrency,
      rate,
      source: liveRate ? 'live' : 'fallback',
      timestamp: new Date().toISOString(),
      example: `1 ${fromCurrency} = ${rate} ${toCurrency}`,
    });
  } catch (error) {
    console.error('Exchange rate error:', error);
    return NextResponse.json(
      { error: 'Döviz kuru alınamadı' },
      { status: 500 }
    );
  }
}

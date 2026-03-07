import { NextResponse } from 'next/server';

// Statik kur verileri (production'da real API'den çekilebilir)
// Bu veriler örnek amaçlı; real app'te exchangerate-api.com veya benzeri kullanılabilir
const EXCHANGE_RATES: Record<string, number> = {
  TRY: 30,    // 1 USD = 30 TRY (örnek)
  EUR: 0.92,  // 1 USD = 0.92 EUR
  GBP: 0.79,  // 1 USD = 0.79 GBP
  JPY: 110,   // 1 USD = 110 JPY
  INR: 74,    // 1 USD = 74 INR
  BRL: 5,     // 1 USD = 5 BRL
  MXN: 20,    // 1 USD = 20 MXN
  PLN: 4,     // 1 USD = 4 PLN
  RUB: 80,    // 1 USD = 80 RUB
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCurrency = searchParams.get('from') || 'USD';
    const toCurrency = searchParams.get('to') || 'TRY';

    if (fromCurrency !== 'USD') {
      return NextResponse.json(
        { error: 'Sadece USD kaynağından çeviri desteklenir' },
        { status: 400 }
      );
    }

    const rate = EXCHANGE_RATES[toCurrency];

    if (!rate) {
      return NextResponse.json(
        { error: `${toCurrency} para birimi desteklenmiyor` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      from: fromCurrency,
      to: toCurrency,
      rate,
      timestamp: new Date().toISOString(),
      // Örnek: 1 USD kaç TRY
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

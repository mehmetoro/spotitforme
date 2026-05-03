import Link from 'next/link'

export default function AdminAdReportsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reklam Raporlari</h1>
        <p className="text-gray-600 mt-1">Gelir, gosterim ve tiklama metriklerini bu panelden takip edebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Toplam Gosterim</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Toplam Tiklama</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Tahmini Gelir</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">₺0.00</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Not: Bu sayfa iskelet olarak eklendi. Raporlarin otomatik dolmasi icin mevcut reklam metrikleri baglantilanabilir.
      </div>

      <Link href="/admin/ads" className="inline-flex rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800">
        Reklam Yonetimine Don
      </Link>
    </div>
  )
}

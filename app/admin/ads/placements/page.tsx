import Link from 'next/link'

export default function AdminAdPlacementsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reklam Yerlesimleri</h1>
        <p className="text-gray-600 mt-1">
          Bu alan, sitenin farkli bolumlerindeki reklam alanlarini yonetmek icin hazirlandi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-900">Ana Sayfa</h2>
          <p className="text-sm text-gray-600 mt-1">Hero alti, sidebar ve icerik arasi reklam bloklari.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-900">Yardim Sayfalari</h2>
          <p className="text-sm text-gray-600 mt-1">Fiziki ve sanal yardim listeleri icindeki sponsor alanlari.</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        Yerlesimlerin teknik kodu hazir. Detayli reklam ayarlari icin AdSense sayfasina gecis yapin.
      </div>

      <Link href="/admin/adsense" className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        AdSense Yonetimine Git
      </Link>
    </div>
  )
}

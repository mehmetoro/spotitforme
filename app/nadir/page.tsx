

export default function NadirPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header layouttan gelmektedir */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-yellow-700 mb-6">Nadir Keşifler</h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            Topluluğun en nadir, en ilginç ve en az bulunan spotlarını burada keşfet! Her gün güncellenen nadir paylaşımlar, koleksiyoncular ve meraklılar için özel olarak listelenir.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl mb-8">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">Nadirlik Neye Göre?</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Toplulukta az sayıda bulunan veya az paylaşılmış spotlar</li>
              <li>Koleksiyoncuların ve uzmanların önerdiği özel paylaşımlar</li>
              <li>Yüksek etkileşim alan, ancak az bulunan ürünler</li>
            </ul>
          </div>
          <div className="text-center mt-8">
            <a href="/discovery" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">
              Tüm Keşifleri Gör
            </a>
          </div>
        </div>
      </main>
      {/* Footer layouttan gelmektedir */}
    </div>
  )
}

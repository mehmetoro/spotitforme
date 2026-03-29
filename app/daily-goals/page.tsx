

export default function DailyGoalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header layouttan gelmektedir */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-blue-700 mb-6">Günlük Hedefler</h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            Her gün toplulukta aktif ol, görevleri tamamla ve ekstra puanlar kazan! Günlük hedeflerini tamamlayarak rozet ve ödüller kazanabilirsin.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-xl mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Bugünün Görevleri</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>1 yeni spot oluştur</li>
              <li>2 farklı spota yardım et</li>
              <li>1 sosyal paylaşım yap</li>
              <li>Bir spotu favorilerine ekle</li>
              <li>Toplamda 10 puan kazan</li>
            </ul>
          </div>
          <div className="text-center mt-8">
            <a href="/leaderboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">
              Lider Tablosunu Gör
            </a>
          </div>
        </div>
      </main>
      {/* Footer layouttan gelmektedir */}
    </div>
  )
}

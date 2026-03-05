import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Anını Paylaş - SpotItForMe ile Keşiflerini Göster',
  description: 'Karşılaştığın ilginç, nadir veya özel anları binlerce kişiyle paylaş. Gördüğün güzelliği kaçırmayanlara göster!',
}

export default function ShareMomentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📸</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Anını Paylaş
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            O özel anı sadece sen mi gördün? Binlerce kişi görmedi! Paylaş, başkalarının da görmesini sağla.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Neden Paylaşmalısın?
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="font-bold text-pink-700 text-lg mb-3">🌈 İlham Ver</h3>
                <p className="text-gray-700">
                  Senin gördüğün güzellik, başkasının gününü güzelleştirebilir. 
                  Paylaştığın nadir bir kuş, muhteşem bir gün batımı veya ilginç bir sahne, 
                  binlerce kişiye ilham verebilir.
                </p>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="font-bold text-pink-700 text-lg mb-3">👥 Topluluk Oluştur</h3>
                <p className="text-gray-700">
                  Benzer ilgi alanlarına sahip insanlarla tanış. 
                  Senin gibi nadir şeyleri keşfetmeyi seven, 
                  fotoğraf çekmeyi seven bir topluluk seni bekliyor.
                </p>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="font-bold text-pink-700 text-lg mb-3">📍 Başkalarına Yol Göster</h3>
                <p className="text-gray-700">
                  "Orada da böyle bir şey var mıymış?" dedirtebilirsin. 
                  Paylaştığın konum bilgisi, başkalarının da aynı güzelliği 
                  görmesine yardımcı olur.
                </p>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="font-bold text-pink-700 text-lg mb-3">🏆 Fark Edilme</h3>
                <p className="text-gray-700">
                  En ilginç paylaşımlar öne çıkar, rozetler kazanırsın. 
                  Topluluk tarafından takdir edilme hissi paha biçilemez!
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ne Paylaşabilirsin?
            </h2>

            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-bold text-purple-700 mb-2">🦋 Nadir Hayvan Görüntüsü</h3>
                <p className="text-gray-700 mb-2">
                  "Evimin önünde pembe flamingo gördüm!", "Şehir merkezinde tilki!" - 
                  Beklenmedik yerlerde gördüğün hayvanlar toplulukta ilgi çeker.
                </p>
                <p className="text-sm text-gray-500 italic">
                  💡 İpucu: Fotoğrafı çektiğin tam konumu işaretle, başkaları da görebilsin.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-700 mb-2">🌅 Eşsiz Manzara</h3>
                <p className="text-gray-700 mb-2">
                  Muhteşem bir gün batımı, bulutların şekli, gökkuşağı, şimşek... 
                  Doğanın sunduğu eşsiz anları kaçıranlara göster!
                </p>
                <p className="text-sm text-gray-500 italic">
                  💡 İpucu: Saat ve hava durumu bilgisi ekle, aynı manzarayı görmek isteyenler için.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-700 mb-2">🎨 İlginç Sahne</h3>
                <p className="text-gray-700 mb-2">
                  Sokak sanatı, ilginç bir bina, garip bir durum, komik bir anons... 
                  Günlük hayatta karşılaştığın sıra dışı her şey paylaşılabilir!
                </p>
                <p className="text-sm text-gray-500 italic">
                  💡 İpucu: Hikayesini anlat! İnsanlar neden özel olduğunu bilmek ister.
                </p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-l-4 border-amber-500">
                <h3 className="font-bold text-amber-700 mb-2">🍜 Nadir Lezzet</h3>
                <p className="text-gray-700 mb-2">
                  "Bu tadı sadece burada var!", "Bu kadar büyük pideyi ilk defa gördüm!" - 
                  Yemek deneyimlerini paylaş, gurmelere yol göster.
                </p>
                <p className="text-sm text-gray-500 italic">
                  💡 İpucu: Mekanın adını ve özelliklerini ekle, başkaları ziyaret edebilsin.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nasıl Paylaşılır?
            </h2>

            <div className="bg-gradient-to-br from-pink-100 to-rose-100 p-8 rounded-xl border border-pink-300 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Fotoğrafını Çek</h4>
                    <p className="text-gray-700">Anı yakaladığın anda hemen fotoğrafla. Kaliteli fotoğraf daha fazla beğeni getirir!</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">"Nadir Gördüm" Butonuna Tıkla</h4>
                    <p className="text-gray-700">Ana sayfadaki hızlı paylaşım butonu ile anında paylaş!</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Hikayeni Anlat</h4>
                    <p className="text-gray-700">Ne gördüğünü, nerede olduğunu, neden özel olduğunu anlat. İyi bir hikaye daha fazla ilgi çeker!</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Konumu İşaretle</h4>
                    <p className="text-gray-700">Başkaları da görmek isteyebilir, konumu işaretlemeyi unutma!</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Paylaş!</h4>
                    <p className="text-gray-700">Topluluğa sun, beğenileri ve yorumları izle. Belki sen de trend olursun!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-8">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <span>⭐</span> Pro İpuçları
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span className="text-yellow-600">•</span>
                  <span><strong>Hashtag kullan:</strong> #NadirGördüm #İlginçAnlar gibi etiketler paylaşımını öne çıkarır</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-600">•</span>
                  <span><strong>Detay ver:</strong> Ne zaman, nerede, nasıl gördüğünü anlat</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-600">•</span>
                  <span><strong>Sorulara cevap ver:</strong> Yorumlara yanıt ver, toplulukla etkileşimde kal</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-600">•</span>
                  <span><strong>Düzenli paylaş:</strong> Aktif kullanıcılar daha fazla takipçi kazanır</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Hemen Paylaşmaya Başla!</h2>
          <p className="text-pink-100 mb-6 text-lg">
            Bugün gördüğün özel bir şey vardı mı? Hemen paylaş!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/create-spot"
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              Nadir Gördüm Paylaş
            </Link>
            <Link
              href="/sightings"
              className="bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-800 transition-colors border-2 border-white"
            >
              Paylaşımları İncele
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Keşfet & Keşfettir - SpotItForMe Sosyal Keşif Platformu',
  description: 'Senin keşfin, başkalarının ilhamı! Gördüğün güzellikleri paylaş, başka güzellikleri keşfet.',
}

export default function SocialDiscoveryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Keşfet & Keşfettir
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sen keşfet, başkaları da keşfetsin. Senin gözünle dünyanın güzelliklerini paylaş, 
            başkalarının gözünden de görmeyen güzellikleri keşfet.
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-2">47.234</div>
            <div className="text-sm md:text-base text-gray-600">Keşif Paylaşıldı</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-2">189K</div>
            <div className="text-sm md:text-base text-gray-600">İlham Aldı</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-2">93%</div>
            <div className="text-sm md:text-base text-gray-600">Memnuniyet</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Nasıl Çalışır?
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border-2 border-cyan-200">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-bold text-cyan-800 text-lg mb-3">1. Sen Paylaş</h3>
              <p className="text-gray-700 mb-4">
                Gördüğün ilginç, güzel veya nadir şeyleri fotoğrafla, konumunu işaretle, 
                hikayesini anlat. 30 saniyede paylaş!
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">✓</span>
                  <span>Hızlı ve kolay paylaşım</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">✓</span>
                  <span>Konum işaretleme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">✓</span>
                  <span>Hashtag ve kategori desteği</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-bold text-blue-800 text-lg mb-3">2. Topluluk Keşfetsin</h3>
              <p className="text-gray-700 mb-4">
                Binlerce kişi senin paylaşımını görür, beğenir, yorum yapar. 
                Belki de bir sonraki popüler keşif senin olur!
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>50.000+ aktif kullanıcı</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Gerçek zamanlı etkileşim</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Trend keşifler sistemi</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
              <div className="text-4xl mb-4">💫</div>
              <h3 className="font-bold text-purple-800 text-lg mb-3">3. İlham Ver</h3>
              <p className="text-gray-700 mb-4">
                Senin paylaşımın sayesinde birisi yeni bir yer keşfeder, 
                yeni bir hobi edinir veya hayatına renk gelir!
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Başarı hikayeleri</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Topluluk teşekkürleri</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Özel rozetler kazan</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-green-800 text-lg mb-3">4. Sen de Keşfet</h3>
              <p className="text-gray-700 mb-4">
                Başkalarının paylaşımlarından ilham al, yeni yerler keşfet, 
                bilmediğin şeyleri öğren. Döngü devam eder!
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Günlük yeni keşifler</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Kişiselleştirilmiş öneriler</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Haritada keşifler</span>
                </li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Gerçek Keşif Hikayeleri
          </h2>

          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border-l-4 border-amber-400">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🦅</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Ahmet'in Kartal Keşfi</h4>
                  <p className="text-gray-700 mb-3 italic">
                    "İstanbul'da balkonda kitap okurken dev bir kartal gördüm. 
                    Fotoğrafını çekip paylaştım. 10 dakika içinde 500+ beğeni geldi! 
                    Yorumlarda ornitolog arkadaşlar kuşun türünü ve özelliklerini anlattı. 
                    Harika bir deneyimdi!"
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>👁️ 23.4K görüntülenme</span>
                    <span>❤️ 1.8K beğeni</span>
                    <span>💬 127 yorum</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border-l-4 border-blue-400">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌺</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Zeynep'in Gizli Bahçe Keşfi</h4>
                  <p className="text-gray-700 mb-3 italic">
                    "Şehir merkezinde gizli bir bahçe keşfettim. Paylaştıktan sonra 
                    aynı semtte oturan 40+ kişi 'ben hiç bilmiyordum' dedi. 
                    Şimdi orası mahalle buluşma noktası oldu. Keşke herkes bilseydi dedim, 
                    paylaştım ve herkes öğrendi!"
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>👁️ 15.2K görüntülenme</span>
                    <span>❤️ 2.1K beğeni</span>
                    <span>💬 89 yorum</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-purple-400">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🍜</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Can'ın Sokak Lezzeti Keşfi</h4>
                  <p className="text-gray-700 mb-3 italic">
                    "Ara sokakta 40 yıldır açık bir mantı salonu buldum. 
                    Paylaşımım viral oldu! Şimdi o esnaf 'SpotItForMe sayesinde yeniden keşfedildik' diyor. 
                    Hem gurme dostlar yeni bir yer keşfetti, hem de esnafımız mutlu oldu!"
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>👁️ 47.8K görüntülenme</span>
                    <span>❤️ 4.2K beğeni</span>
                    <span>💬 234 yorum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-6">
            <h3 className="font-bold text-cyan-900 text-lg mb-4">
              ✨ Keşfetmenin Büyüsü
            </h3>
            <p className="text-gray-700 mb-4">
              SpotItForMe sadece bir platform değil, bir keşif hareketi! 
              Her gün binlerce insan, senin gibi meraklı ve paylaşımı seven insanlar 
              sayesinde yeni şeyler öğreniyor, yeni yerler keşfediyor.
            </p>
            <p className="text-gray-700 font-semibold">
              Senin keşfin, birinin hayatını değiştirebilir. Bugün ne keşfettin?
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Hadi Sen de Keşfet!</h2>
          <p className="text-cyan-100 mb-6 text-lg">
            Bugün keşfettiğin bir şey oldu mu? Hemen paylaş, binlerce kişiye ilham ver!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/create-spot"
              className="bg-white text-cyan-600 px-8 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-colors"
            >
              Keşfimi Paylaş
            </Link>
            <Link
              href="/sightings"
              className="bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-800 transition-colors border-2 border-white"
            >
              Keşifleri İncele
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

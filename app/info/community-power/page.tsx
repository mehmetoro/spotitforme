import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Topluluk Gücü - 50.000 Göz Senin İçin Arıyor',
  description: '1 kişi ararken yorulur, 50.000 kişi birlikte arar ve bulur! SpotItForMe topluluğunun gücünü keşfet.',
}

export default function CommunityPowerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🤝</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Topluluk Gücü
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sen ararken yoruldun mu? Endişelenme! 50.000+ göz şu anda senin için bakıyor.
          </p>
        </div>

        {/* Güç Göstergesi */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 mb-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Şu Anda Aktif</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">52.847</div>
                <div className="text-sm opacity-90">Aktif Kullanıcı</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">1.234</div>
                <div className="text-sm opacity-90">Aktif Spot</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">892</div>
                <div className="text-sm opacity-90">Bugün Bulundu</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">3.2 dk</div>
                <div className="text-sm opacity-90">Ort. Bulma Süresi</div>
              </div>
            </div>
          </div>
          <p className="text-center text-lg opacity-90">
            Şu anda binlerce kişi aynı platformda! Senin spotunu görecek ve bulacak birisi mutlaka var.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Topluluk Nasıl Çalışır?
          </h2>

          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">📢</span>
                1. Spotunu Oluştur
              </h3>
              <p className="text-gray-700 mb-3">
                Aradığın şeyi anlat: "1980 model Arçelik buzdolabı cam rafı arıyorum" gibi.
                Ne kadar detaylı anlatırsan, bulma şansı o kadar artar!
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-700 mb-2">İyi Spot Örneği:</p>
                <p className="text-gray-600 italic">
                  "1985 model Grundig radyo için hoparlör arıyorum. Modeli: 4090. 
                  Eski evde vardı ama kayboldu. Kim biliyorsa yardımcı olabilir mi?"
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-l-4 border-indigo-500">
              <h3 className="font-bold text-indigo-800 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                2. Topluluk Bildirim Alır
              </h3>
              <p className="text-gray-700 mb-3">
                Spotun oluşturulduğu anda, ilgili kategorileri takip eden binlerce kişiye bildirim gider.
                "Hey! Biri Arçelik buzdolabı rafı arıyor, sen biliyor musun?"
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-600 mt-1">✓</span>
                  <span><strong>Akıllı eşleştirme:</strong> İlgilenebilecek kişilere öncelikli bildirim</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-600 mt-1">✓</span>
                  <span><strong>Konum bazlı:</strong> Yakın bölgedeki kullanıcılar önce haberdar olur</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-600 mt-1">✓</span>
                  <span><strong>Kategori takibi:</strong> İlgi alanına göre özelleştirilmiş bildirimler</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h3 className="font-bold text-purple-800 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                3. Herkes Aramaya Başlar
              </h3>
              <p className="text-gray-700 mb-3">
                Topluluk üyeleri kendi bilgi birikimlerini, bağlantılarını, yerel bilgilerini kullanarak arar:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="font-semibold text-purple-700 mb-1">Mehmet:</p>
                  <p className="text-sm text-gray-600">"Babamın dükkânında vardı sanki, yarın sorayım"</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="font-semibold text-purple-700 mb-1">Ayşe:</p>
                  <p className="text-sm text-gray-600">"Bit pazarında böyle bir şey gördüm geçen hafta"</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="font-semibold text-purple-700 mb-1">Can:</p>
                  <p className="text-sm text-gray-600">"Sahaf arkadaşım var, ona sorayım bulur belki"</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="font-semibold text-purple-700 mb-1">Zeynep:</p>
                  <p className="text-sm text-gray-600">"Annem koleksiyoncu, hemen sordum!"</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500">
              <h3 className="font-bold text-green-800 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                4. Birisi Bulur!
              </h3>
              <p className="text-gray-700 mb-3">
                Ortalama 3.2 dakika içinde birisi "Ben buldum!" der. Fotoğraf paylaşır, konum bilgisi verir.
                Sen de gider ve aradığını bulursun!
              </p>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="font-semibold text-green-700 mb-2">🏆 Başarı Hikayesi:</p>
                <p className="text-gray-600 italic mb-2">
                  "30 yıllık vintage fotoğraf makinesi lensi arıyordum. 7 dakikada bulundu! 
                  İstanbul'un öbür ucundaki bir hobi dükkânında varmış. 
                  Topluluk sayesinde hayalim gerçek oldu!" - Kerem Y.
                </p>
                <p className="text-sm text-gray-500">✓ 7 dakikada bulundu • ✓ 23 kişi aramaya katıldı</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Neden Bu Kadar Güçlü?
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="text-4xl mb-3">🌍</div>
              <h4 className="font-bold text-gray-900 mb-2">Geniş Coğrafya</h4>
              <p className="text-gray-600 text-sm">
                Türkiye'nin her yerinden kullanıcılar. Hangi şehirde olursa olsun, orada birisi var.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <div className="text-4xl mb-3">🧠</div>
              <h4 className="font-bold text-gray-900 mb-2">Çeşitli Bilgi</h4>
              <p className="text-gray-600 text-sm">
                Koleksiyoncular, antikacılar, hobi sahipleri, esnaflar... Herkes farklı bir şey bilir.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Hızlı Yanıt</h4>
              <p className="text-gray-600 text-sm">
                Gerçek zamanlı bildirimler sayesinde dakikalar içinde yardım gelir.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
            <h3 className="font-bold text-yellow-800 text-lg mb-4 flex items-center gap-2">
              <span>💡</span> Topluluk Gücü İstatistikleri
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-1">En Hızlı Bulma:</p>
                <p className="text-gray-700 text-sm">42 saniye! "1990 model Walkman kulaklığı"</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">En Çok Katılım:</p>
                <p className="text-gray-700 text-sm">340 kişi aynı spotu aramış</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">En Uzak Bulma:</p>
                <p className="text-gray-700 text-sm">Ankara'dan soran, Trabzon'da bulunmuş</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Başarı Oranı:</p>
                <p className="text-gray-700 text-sm">%87 - Spotların çoğu bulunuyor!</p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Sen de Topluluk Gücünü Kullan!</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Aradığın şeyi bulamadın mı? 50.000 kişi sana yardım etmeye hazır!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/create-spot"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Spot Oluştur
            </Link>
            <Link
              href="/spots"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white"
            >
              Başkalarına Yardım Et
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

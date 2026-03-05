import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Yardım Et, Mutlu Ol - Birinin Gününü Güzelleştir',
  description: 'Birinin aradığını bulmak, hem ona hem sana mutluluk getirir. SpotItForMe ile yardımlaşmanın tadını çıkar.',
}

export default function HelpOthersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">💝</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Yardım Et, Mutlu Ol
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Birinin aradığını buldun mu? O mutlu olur, sen daha mutlu olursun!
            Yardımlaşmanın gücünü hisset.
          </p>
        </div>

        {/* Mutluluk Metrikleri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-rose-500">
            <div className="text-3xl font-bold text-rose-600 mb-2">28.543</div>
            <div className="text-sm text-gray-600">Mutlu Edilen İnsan</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-pink-500">
            <div className="text-3xl font-bold text-pink-600 mb-2">4.7★</div>
            <div className="text-sm text-gray-600">Teşekkür Puanı</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 mb-2">12 dk</div>
            <div className="text-sm text-gray-600">Ort. Yardım Süresi</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-red-500">
            <div className="text-3xl font-bold text-red-600 mb-2">96%</div>
            <div className="text-sm text-gray-600">Mutluluk Oranı</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Yardım Etmek Neden Bu Kadar İyi Hissettir?
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-xl border-2 border-rose-200">
              <div className="text-4xl mb-4">🧡</div>
              <h3 className="font-bold text-rose-800 text-lg mb-3">Dopamin Etkisi</h3>
              <p className="text-gray-700">
                Bilim kanıtladı: Başkasına yardım ettiğinde beyinde dopamin salgılanır. 
                Yani yardım etmek, tam anlamıyla mutluluk hormonu üretir!
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl border-2 border-pink-200">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="font-bold text-pink-800 text-lg mb-3">Anlam Duygusu</h3>
              <p className="text-gray-700">
                "Bugün birinin hayatına dokundum"demenin verdiği huzur, 
                hayata anlam katar. Sen önemli birisin ve fark yaratıyorsun!
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
              <div className="text-4xl mb-4">🤗</div>
              <h3 className="font-bold text-purple-800 text-lg mb-3">Sosyal Bağ</h3>
              <p className="text-gray-700">
                Yardım ettiğin kişiyle kurulan bağ, topluluk hissiyatını güçlendirir. 
                Siz artık bir hikayenin parçasısınız!
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border-2 border-red-200">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-red-800 text-lg mb-3">Karma Döngüsü</h3>
              <p className="text-gray-700">
                Bugün sen yardım edersen, yarın birisi sana yardım eder. 
                İyilik döngüsü böyle işler!
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Gerçek Yardım Hikayeleri ❤️
          </h2>

          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border-l-4 border-amber-400">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">👵</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Fatma Teyze'nin Mutluluğu</h4>
                  <p className="text-gray-700 mb-3 italic">
                    "Annemiz 80 yaşında, 40 yıl önce evlendiği Kütahya porselen yemek takımı kırılmıştı. 
                    Aynısından bulmak istiyordu ama hiçbir yerde yoktu. SpotItForMe'de spot oluşturduk. 
                    3 gün sonra Eskişehir'den bir hanımefendi 'bende var' dedi. 
                    Annemin mutluluğu tarifsizdi. O kadar teşekkür mesajı attık ki..."
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong className="text-amber-700">Yardım Eden:</strong> Elif H. (Eskişehir)
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      "Evlenirken aldığım takımı kullanmıyordum. Fatma Teyze'ye verdiğimde 
                      gözyaşlarını gördüm. Benim için kullanılmayan bir eşyaydı, 
                      onun için anılarıydı. Ben daha çok mutlu oldum galiba!" 😊
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border-l-4 border-blue-400">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">🎸</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Müzisyenin Hayali</h4>
                  <p className="text-gray-700 mb-3 italic">
                    "Klasik gitar için vintage manyetik arıyordum. 1970'lerde üretilmiş, 
                    ülkede belki 5 tane var. Umudumu kesmiştim. SpotItForMe'de denedim. 
                    İzmir'den bir müzik koleksiyoncusu 'tam da bu model var' dedi!"
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong className="text-blue-700">Yardım Eden:</strong> Ahmet B. (İzmir)
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      "Babamdan kalan koleksiyondaydı. Genç bir müzisyenin hayalini 
                      gerçekleştirdim. Sonra konsere gittim, sahnede o manyetikle çalıyordu. 
                      İçim doldu, babam da sevinirdi!" 🎵
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-400">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">📚</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Üniversite Öğrencisinin Tezi</h4>
                  <p className="text-gray-700 mb-3 italic">
                    "Tezim için 1980'lerde basılmış bir kitaba ihtiyacım vardı. 
                    Tüm sahaflara, kütüphanelere sordum. Yok. 
                    Son çare SpotItForMe! Ankara'dan bir emekli öğretmen vardı dedi."
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong className="text-green-700">Yardım Eden:</strong> Hasan Bey (Ankara)
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      "38 yıl öğretmenlik yaptım, kütüphanem çok zengin. 
                      O kitap bende vardı. Üstelik ilk baskısıydı! 
                      Genç arkadaşa hediye ettim. Tezini başarıyla bitirdi, 
                      teşekkür plaketiyle geldi. Gurur duydum!" 🎓
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Nasıl Yardım Edersin?
          </h2>

          <div className="bg-gradient-to-br from-rose-100 to-pink-100 p-8 rounded-xl border border-rose-300 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Spotları İncele</h4>
                  <p className="text-gray-700">İnsanların ne aradığına bak. Belki senin bildiğin bir şeydir!</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Bildiğini Paylaş</h4>
                  <p className="text-gray-700">"Ben bilirim, ben bulabilirim" diyorsan hemen bildir!</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Detay Ver</h4>
                  <p className="text-gray-700">Nerede, ne kadar, nasıl ulaşılabileceğini anlat. Fotoğraf ekle!</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">İletişimi Sağla</h4>
                  <p className="text-gray-700">Kişi sana ulaşsın, arayan ve bulan buluşsun!</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Mutluluğu Hisset!</h4>
                  <p className="text-gray-700">Teşekkür mesajlarını al, rozet kazan, toplulukta öne çık!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
            <h3 className="font-bold text-yellow-800 text-lg mb-4 flex items-center gap-2">
              <span>🏅</span> Yardım Rozetleri Kazan
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl mb-2">🌟</div>
                <p className="font-semibold text-gray-900">Yardım Meleği</p>
                <p className="text-sm text-gray-600">10 kişiye yardım et</p>
              </div>
              <div>
                <div className="text-3xl mb-2">💫</div>
                <p className="font-semibold text-gray-900">Süper Yardımcı</p>
                <p className="text-sm text-gray-600">50 kişiye yardım et</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🏆</div>
                <p className="font-semibold text-gray-900">Efsane Yardımcı</p>
                <p className="text-sm text-gray-600">100 kişiye yardım et</p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Bugün Kime Yardım Edeceksin?</h2>
          <p className="text-rose-100 mb-6 text-lg">
            Şu anda binlerce insan bir şeyler arıyor. Belki senin bildiğin bir şeydir!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/spots"
              className="bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
            >
              Spotları İncele
            </Link>
            <Link
              href="/sightings"
              className="bg-rose-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-rose-800 transition-colors border-2 border-white"
            >
              Yardım Geçmişi
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

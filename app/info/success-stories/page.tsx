import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Başarı Hikayeleri - 10.000+ Kişi Aradığını Buldu',
  description: 'SpotItForMe topluluğunun gerçek başarı hikayeleri. İnsanlar nasıl aradıklarını buldu, hayalleri nasıl gerçek oldu.',
}

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Başarı Hikayeleri
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            10.000+ kişi SpotItForMe sayesinde aradığını buldu. İşte gerçek hikayeler...
          </p>
        </div>

        {/* İstatistikler */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-8 mb-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">12.847</div>
              <div className="text-sm opacity-90">Başarılı Buluşma</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">87%</div>
              <div className="text-sm opacity-90">Bulma Oranı</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3.2 dk</div>
              <div className="text-sm opacity-90">Ort. Bulma Süresi</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-sm opacity-90">Memnuniyet</div>
            </div>
          </div>
        </div>

        {/* Başarı Hikayeleri */}
        <div className="space-y-8 mb-12">
          
          {/* Hikaye 1: Vintage Kamera */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-200 to-yellow-200 px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📷</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">30 Yıllık Arayış Sona Erdi</h3>
                  <p className="text-gray-700">Kerem Y. - İstanbul | Bulunma Süresi: 7 dakika</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-lg italic">
                  "Babam fotoğrafçıydı. 1985'te aldığı Minolta X-700 kamerasını çok seviyordu. 
                  2010'da vefat ettiğinde kamera kaybolmuştu. 10 yıldır her yerde arıyordum. 
                  Sahaflar, antikacılar, online platformlar... Hiçbir yerde yoktu."
                </p>
                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400 mb-4">
                  <p className="font-semibold text-yellow-900 mb-2">SpotItForMe'de Ne Oldu?</p>
                  <p className="text-gray-700 mb-2">
                    Spot oluşturdum: "1985 model Minolta X-700, mümkünse aynı lens setiyle."
                  </p>
                  <p className="text-gray-700 font-semibold">
                    7 dakika sonra Kadıköy'den bir fotoğrafçı "Tam da bu model bende var!" dedi.
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Buluştuğumuzda gözyaşlarımı tutamadım. Sadece kamera değil, babamla olan anılarım geri gelmişti. 
                  O fotoğrafçı, kamerayı babamdan almış! Küçük dükkanında saklıyormuş. 
                  "Senin gibi birini bekliyordum" dedi.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ✓ 30 yıllık arayış 7 dakikada bitti • ✓ 450+ beğeni • ✓ "Yılın Hikayesi" rozeti kazandı
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hikaye 2: Annenin Gelinlik Kumaşı */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-200 to-rose-200 px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">👗</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Anne Kız Aynı Gelinlik</h3>
                  <p className="text-gray-700">Ayşe M. - Bursa | Bulunma Süresi: 2 saat</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-lg italic">
                  "Annem 1988'de evlendiğinde çok özel bir kumaştan gelinlik dikdirmişti. 
                  Ben de evlenirken aynı kumaştan gelinlik giymek istiyordum. 
                  40 yıl öncenin kumaşını bulmak imkansız gibiydi."
                </p>
                <div className="bg-pink-50 p-6 rounded-lg border-l-4 border-pink-400 mb-4">
                  <p className="font-semibold text-pink-900 mb-2">SpotItForMe Mucizesi</p>
                  <p className="text-gray-700 mb-2">
                    Annemin düğün fotoğrafını paylaştım: "Bu kumaştan kim bilir, kim saklamıştır?"
                  </p>
                  <p className="text-gray-700 font-semibold">
                    2 saat sonra Gaziantep'ten bir teyze: "Kızım bu kumaş bende var, senin olsun!"
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Meğer o teyze de 1988'de evlenmiş, aynı kumaştan aldırmış ama kullanmamış! 
                  40 yıl sandıkta saklamış. "Birileri arayacak" diye beklemiş. 
                  Kargo ile gönderdi, gelinliğim dikildi. Düğünümde iki kadın da ağladı!
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ✓ 40 yıllık kumaş bulundu • ✓ İki nesil birleşti • ✓ "Duygusal Hikaye" rozeti
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hikaye 3: Klasik Otomobil Parçası */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-200 to-cyan-200 px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🚗</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Dedenin Otomobili Yeniden Yollarda</h3>
                  <p className="text-gray-700">Mehmet K. - Ankara | Bulunma Süresi: 18 saat</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-lg italic">
                  "Dedem 1970 model Murat 124'ünü 50 yıl sürdü. Vefat ettiğinde otomobil çalışmıyordu. 
                  Orijinal parça bulamadığımız için restore edemiyorduk. 
                  Motor enjektörü artık üretilmiyordu, dünya çapında belki 10 tane vardı."
                </p>
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-4">
                  <p className="font-semibold text-blue-900 mb-2">Topluluk Mucizesi</p>
                  <p className="text-gray-700 mb-2">
                    "1970 Murat 124 motor enjektörü arıyorum" spotunu oluşturdum.
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Ertesi gün sabah Konya'dan bir usta: "Yedeğim var, gel al gitsin!"
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  O usta da klasik araba koleksiyoncusuymuş. Yedek enjektörü varmış. 
                  "Para istemiyorum, o araba yeniden yaşasın yeter" dedi. 
                  Bugün dedemin otomobili klasik araba rallilerinde turluyor. 
                  O usta da bizimle geliyor, kahramanımız oldu!
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ✓ İmkansız parça bulundu • ✓ 50 yıllık araba yeniden yollarda • ✓ "Nostoloji" rozeti
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hikaye 4: Çocukluk Oyuncağı */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-200 to-pink-200 px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🧸</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">25 Yıl Sonra Tekrar Bir Arada</h3>
                  <p className="text-gray-700">Zeynep S. - İzmir | Bulunma Süresi: 3 gün</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-lg italic">
                  "6 yaşındayken en sevdiğim oyuncak bir peluş tavşandı. Adı 'Pamuk'tu. 
                  Taşınırken kaybolmuştu. 25 yıldır hiç unutamadım. 
                  Çocuklarıma o oyuncaktan bahsederdim hep."
                </p>
                <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400 mb-4">
                  <p className="font-semibold text-purple-900 mb-2">İnanılmaz Tesadüf</p>
                  <p className="text-gray-700 mb-2">
                    "1995 model pembe tavşan oyuncak, kulakları uzun" diye spot açtım.
                  </p>
                  <p className="text-gray-700 font-semibold">
                    3 gün sonra ortaokul arkadaşım mesaj attı: "Senin Pamuk'un bende!"
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Taşınırken o almış, saklarmış! 25 yıl sonra SpotItForMe'de gördü. 
                  Buluştuğumuzda ikimiz de ağladık. Pamuk hala duruyormuş. 
                  Şimdi kızımın oyuncağı, üçüncü nesil! Bu platformu yapanlara sonsuz teşekkürler.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ✓ 25 yıllık ayrılık bitti • ✓ Çocukluk arkadaşı bulundu • ✓ "Nostalji Turu" rozeti
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hikaye 5: İlk Baskı Kitap */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-200 to-purple-200 px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📚</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">İmzalı İlk Baskı Bulundu</h3>
                  <p className="text-gray-700">Can T. - Adana | Bulunma Süresi: 45 dakika</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-lg italic">
                  "Orhan Kemal'in imzalı ilk baskı kitabını koleksiyon için arıyordum. 
                  Tüm sahaflara, kitap pazarlarına gittim. Böyle bir kitap bulmak çok zordu."
                </p>
                <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-400 mb-4">
                  <p className="font-semibold text-indigo-900 mb-2">Hızlı Buluşma</p>
                  <p className="text-gray-700 mb-2">
                    SpotItForMe'de detaylı açıklama ile spot oluşturdum.
                  </p>
                  <p className="text-gray-700 font-semibold">
                    45 dakika sonra emekli bir edebiyat öğretmeni: "İmzalısı var!"
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Öğretmen, 1960'larda Orhan Kemal'in imza gününe gitmiş, kitabını imzalatmış. 
                  "Sana vereyim, genç nesil okusun" dedi. Hediye etmek istedi ama ben ısrar ettim. 
                  Şimdi koleksiyonumun en değerli parçası!
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ✓ 60 yıllık imzalı kitap • ✓ Edebiyat aşkı buluştu • ✓ "Kitap Kurdu" rozeti
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* İstatistik Kutusu */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-300 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📊 Başarı İstatistikleri
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-green-800 mb-3">En Hızlı Bulunan</h4>
              <p className="text-gray-700 text-sm mb-1">🥇 42 saniye - "1990 Walkman kulaklığı"</p>
              <p className="text-gray-700 text-sm mb-1">🥈 3 dakika - "Vintage Coca-Cola şişesi"</p>
              <p className="text-gray-700 text-sm">🥉 7 dakika - "Minolta X-700 kamera"</p>
            </div>
            <div>
              <h4 className="font-bold text-green-800 mb-3">En Çok Katılım</h4>
              <p className="text-gray-700 text-sm mb-1">🥇 847 kişi - "Cumhuriyet gazetesi 1940"</p>
              <p className="text-gray-700 text-sm mb-1">🥈 623 kişi - "1970 Murat 124 parçası"</p>
              <p className="text-gray-700 text-sm">🥉 512 kişi - "Vintage sinema afişi"</p>
            </div>
            <div>
              <h4 className="font-bold text-green-800 mb-3">En Uzak Buluşma</h4>
              <p className="text-gray-700 text-sm mb-1">🌍 Van → Edirne (1.847 km)</p>
              <p className="text-gray-700 text-sm mb-1">🌍 Ankara → Antalya (478 km)</p>
              <p className="text-gray-700 text-sm">🌍 İstanbul → Trabzon (1.069 km)</p>
            </div>
            <div>
              <h4 className="font-bold text-green-800 mb-3">En Duygusal</h4>
              <p className="text-gray-700 text-sm mb-1">❤️ Anne-kız aynı gelinlik</p>
              <p className="text-gray-700 text-sm mb-1">❤️ Babanın kamerası bulundu</p>
              <p className="text-gray-700 text-sm">❤️ 25 yıllık oyuncak kavuşması</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Senin Hikayeni Yazmaya Hazır mısın?</h2>
          <p className="text-yellow-100 mb-6 text-lg">
            Bir sonraki başarı hikayesi senin olabilir! Hemen başla.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/create-spot"
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
            >
              Spot Oluştur
            </Link>
            <Link
              href="/spots"
              className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors border-2 border-white"
            >
              Başkalarına Yardım Et
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

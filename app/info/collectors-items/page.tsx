import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Koleksiyon Parçası Bul - Koleksiyoncular Topluluğu',
  description: 'Koleksiyonunu tamamla! Diğer koleksiyoncular sana yardım etsin. Nadir parçaları bulmanın en kolay yolu.',
}

export default function CollectorsItemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">💎</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Koleksiyonunu Tamamla!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Yıllardır aradığın o nadir parça, başka bir koleksiyoncuda olabilir. 
            50.000+ koleksiyoncu topluluğu senin için arayacak!
          </p>
        </div>

        {/* Koleksiyoncu İstatistikleri */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-8 mb-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">8,439</div>
              <div className="text-sm opacity-90">Aktif Koleksiyoncu</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">94%</div>
              <div className="text-sm opacity-90">Bulma Başarısı</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">127</div>
              <div className="text-sm opacity-90">Koleksiyon Türü</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3.4</div>
              <div className="text-sm opacity-90">Ortalama Gün</div>
            </div>
          </div>
        </div>

        {/* Neden Koleksiyoncular İçin Mükemmel? */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🎯 Neden Koleksiyoncular İçin Mükemmel?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">Uzman Topluluk</h3>
              <p className="text-gray-700">
                8,000+ koleksiyoncu birbirinin aradığını biliyor. Posta pulu koleksiyoncusu, 
                eski madeni para koleksiyoncusu, vintage oyuncak koleksiyoncusu... 
                Her alanda uzmanlar var!
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="text-xl font-bold text-pink-900 mb-2">Takas & Paylaşım</h3>
              <p className="text-gray-700">
                Sadece sat-al değil! Koleksiyoncular takaslaşıyor, yedek parçalarını paylaşıyor, 
                birbirlerine hediye ediyor. Gerçek bir topluluk ruhu var.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-bold text-indigo-900 mb-2">Katalog Bilgisi</h3>
              <p className="text-gray-700">
                Hangi seri, hangi yıl, hangi varyant? Koleksiyoncular detayları biliyor. 
                "1985 seri 3 mavi varyantı" dersin, hemen tanırlar!
              </p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-lg">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-xl font-bold text-rose-900 mb-2">Geniş Ağ</h3>
              <p className="text-gray-700">
                Koleksiyoncular birbirleriyle bağlantılı! Biri bilmese bile "tanıdığım var" diyerek 
                seni doğru kişiye yönlendiriyor.
              </p>
            </div>
          </div>
        </div>

        {/* Popüler Koleksiyon Türleri */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-8 border-2 border-yellow-300 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🎨 Popüler Koleksiyon Türleri
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">📮 Posta Pulları</h3>
              <p className="text-sm text-gray-600 mb-2">2,847 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                Osmanlı pulları, ilk baskılar, hatalar, limitli seriler
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">🪙 Madeni Paralar</h3>
              <p className="text-sm text-gray-600 mb-2">1,923 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                Cumhuriyet paraları, hatıra paraları, eski lira
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">🧸 Vintage Oyuncaklar</h3>
              <p className="text-sm text-gray-600 mb-2">1,634 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                1980-90 oyuncaklar, Lego, Hot Wheels, aksiyon figürleri
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">📚 Nadir Kitaplar</h3>
              <p className="text-sm text-gray-600 mb-2">1,428 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                İlk baskılar, imzalı kitaplar, eski basımlar
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">🎵 Plaklar & Kasetler</h3>
              <p className="text-sm text-gray-600 mb-2">1,247 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                Vinyl plaklar, eski kasetler, nadir albümler
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">🎬 Sinema & Poster</h3>
              <p className="text-sm text-gray-600 mb-2">892 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                Vintage afişler, otantik postler, film araçları
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">⌚ Klasik Saatler</h3>
              <p className="text-sm text-gray-600 mb-2">743 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                Mekanik saatler, cep saatleri, vintage modeller
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">📷 Vintage Kameralar</h3>
              <p className="text-sm text-gray-600 mb-2">681 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                Film kameralar, lens setleri, fotoğraf ekipmanları
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-900 mb-2">🏺 Antika Eşyalar</h3>
              <p className="text-sm text-gray-600 mb-2">534 aktif koleksiyoncu</p>
              <p className="text-xs text-gray-500">
                Osmanlı eserleri, eski evyaları, antika mobilya
              </p>
            </div>
          </div>
        </div>

        {/* Gerçek Koleksiyoncu Hikayeleri */}
        <div className="space-y-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            ✨ Gerçek Koleksiyoncu Hikayeleri
          </h2>

          {/* Hikaye 1: Posta Pulu */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-200 to-indigo-200 px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📮</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">15 Yıllık Koleksiyon Tamamlandı</h3>
                  <p className="text-gray-700">Ahmet B. - İstanbul | Posta Pulu Koleksiyoncusu</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-lg italic">
                  "1940-1960 arası Cumhuriyet pullarının tamamını topluyordum. 15 yıl sürdü. 
                  Sadece bir tane eksikti: 1953 İzmir Fuarı hatıra pulu. 
                  Her yerde aradım, bulamadım. Çok nadirdi."
                </p>
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-4">
                  <p className="font-semibold text-blue-900 mb-2">SpotItForMe'de 3 Gün!</p>
                  <p className="text-gray-700 mb-2">
                    "1953 İzmir Fuarı hatıra pulu, kullanılmamış, tam halinde arıyorum" dedim.
                  </p>
                  <p className="text-gray-700 font-semibold">
                    3 gün sonra İzmir'den emekli posta müdürü: "Bende var, senin olsun!"
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Meğer o emekli müdür de koleksiyoncu! Yedek pulu varmış. 
                  "15 yıllık emeğin boşa gitmesin" diyerek hediye etti. 
                  Şimdi koleksiyonum tam! SpotItForMe sayesinde rüyam gerçek oldu.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ✓ 15 yıllık koleksiyon tamamlandı • ✓ Nadir pul bulundu • ✓ 847 beğeni
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hikaye 2: Hot Wheels */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-200 to-orange-200 px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🚗</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Çocukluğun O Arabası!</h3>
                  <p className="text-gray-700">Emre K. - Ankara | Hot Wheels Koleksiyoncusu</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-lg italic">
                  "7 yaşındayken en sevdiğim Hot Wheels arabası kaybolmuştu: 1995 model kırmızı Ferrari F40. 
                  30 yıl sonra aynısını bulmak istedim. Nostolji için..."
                </p>
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400 mb-4">
                  <p className="font-semibold text-red-900 mb-2">Koleksiyoncu Dayanışması</p>
                  <p className="text-gray-700 mb-2">
                    Spot açtım, detayları yazdım. 1995, kırmızı, Ferrari F40, kutulu olursa süper!
                  </p>
                  <p className="text-gray-700 font-semibold">
                    2 saat sonra İzmir'den bir koleksiyoncu: "Kutulu halinde 3 tane var!"
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Adam profesyonel koleksiyoncuymuş. "Hangi rengi istiyorsun?" dedi. 
                  Kırmızı olanı aldım, kutusuyla geldi. Çocukluğuma döndüm! 
                  Şimdi 200 parçalık koleksiyonum oldu, hepsi SpotItForMe'den!
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ✓ Çocukluk hayali gerçek oldu • ✓ Koleksiyon başladı • ✓ 423 beğeni
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hikaye 3: Vinyl Plak */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-200 to-pink-200 px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎵</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">İlk Baskı Pink Floyd Bulundu</h3>
                  <p className="text-gray-700">Deniz Y. - İzmir | Vinyl Plak Koleksiyoncusu</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 text-lg italic">
                  "Pink Floyd 'Dark Side of the Moon' albümünün 1973 ilk baskısını arıyordum. 
                  UK basımı, orijinal kapakla. Dünyada çok az kalmıştı."
                </p>
                <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400 mb-4">
                  <p className="font-semibold text-purple-900 mb-2">İnanılmaz Bağlantı</p>
                  <p className="text-gray-700 mb-2">
                    Detayları verdim: "1973, UK baskı, Harvest Records, katalog numarası SHVL 804"
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Bir gün sonra İstanbul'dan eski plakçı: "Var! Mükemmel durumda!"
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Emekli plakçı, 40 yıllık koleksiyonunu satıyormuş. O plak varmış! 
                  Görünce inanamadım, ağladım. Şimdi koleksiyonumun tacı. 
                  SpotItForMe imkansızı mümkün yaptı!
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ✓ 50 yıllık nadir plak • ✓ Mükemmel durum • ✓ 1.2K beğeni
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Nasıl Çalışır? */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border-2 border-indigo-300 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🎯 Nasıl Çalışır?
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Detaylı Spot Oluştur</h3>
                <p className="text-gray-700">
                  Ne aradığını detaylı yaz: seri numarası, yıl, renk, varyant, durum. 
                  Kolektörler detayları anlar! Fotoğraf varsa daha iyi.
                </p>
                <p className="text-sm text-gray-500 italic mt-2">
                  Örnek: "1985 model mavi Hot Wheels Porsche 959, kutulu, kullanılmamış"
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Koleksiyoncu Topluluğu Bildirim Alır</h3>
                <p className="text-gray-700">
                  Aynı kategorideki 8,000+ koleksiyoncu bildirma alır. 
                  Herkes kendi koleksiyonuna bakar, arkadaşlarına sorar.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Birileri Bulur!</h3>
                <p className="text-gray-700">
                  Ya kendinde vardır, ya tanıdığı bilir, ya yedeği çıkar! 
                  Koleksiyoncular birbirlerine yardım etmeyi sever.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-rose-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Koleksiyonun Tamamlanır!</h3>
                <p className="text-gray-700">
                  Takas edersiniz, satın alırsınız veya hediye ederler! 
                  Ortalama 3.4 günde koleksiyonunu tamamlarsın.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Koleksiyoncu Rozetleri */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🏅 Koleksiyoncu Rozetleri
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-b from-yellow-100 to-yellow-50 rounded-lg">
              <div className="text-5xl mb-3">🥉</div>
              <h3 className="font-bold text-gray-900 mb-2">Koleksiyoncu</h3>
              <p className="text-sm text-gray-600 mb-2">5 parça bulunca</p>
              <p className="text-xs text-gray-500">İlk adımını attın!</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-b from-gray-200 to-gray-50 rounded-lg">
              <div className="text-5xl mb-3">🥈</div>
              <h3 className="font-bold text-gray-900 mb-2">Uzman Koleksiyoncu</h3>
              <p className="text-sm text-gray-600 mb-2">25 parça bulunca</p>
              <p className="text-xs text-gray-500">Ciddi koleksiyoncusun!</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-b from-yellow-300 to-yellow-100 rounded-lg">
              <div className="text-5xl mb-3">🥇</div>
              <h3 className="font-bold text-gray-900 mb-2">Efsane Koleksiyoncu</h3>
              <p className="text-sm text-gray-600 mb-2">100 parça bulunca</p>
              <p className="text-xs text-gray-500">Sen bir efsanesin!</p>
            </div>
          </div>
        </div>

        {/* Pro İpuçları */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border-2 border-amber-300 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            💡 Koleksiyoncular İçin Pro İpuçları
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">✓ Detay Ver, Detay Al</h3>
              <p className="text-gray-700 text-sm">
                Seri numarası, üretim yılı, renk kodu, varyant bilgileri... 
                Ne kadar detay verirsen, o kadar hızlı bulursun!
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">✓ Fotoğraf Ekle</h3>
              <p className="text-gray-700 text-sm">
                Referans fotoğraf paylaş. "Böyle bir şey arıyorum" demek, 
                bin kelimeden daha etkili!
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">✓ Takasa Açık Ol</h3>
              <p className="text-gray-700 text-sm">
                "Takas yapabilirim" de. Koleksiyoncular takas yapmayı sever. 
                Senin yedeğin, onun eksiği olabilir!
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">✓ Sabırlı Ol</h3>
              <p className="text-gray-700 text-sm">
                Çok nadir parçalar 1-2 haftaya çıkabilir. Spot aktif kalır, 
                birisi mutlaka görür ve bulur!
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">✓ Başkalarına da Yardım Et</h3>
              <p className="text-gray-700 text-sm">
                Sen de başkalarının spotlarına bak. Belki senin yedeğin, 
                birinin hayali! Karma geri döner.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Koleksiyonunu Tamamlamaya Başla!</h2>
          <p className="text-purple-100 mb-6 text-lg">
            8,000+ koleksiyoncu senin için aramaya hazır. O nadir parçayı birlikte bulacağız!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/create-spot"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Aradığını Anlat
            </Link>
            <Link
              href="/spots"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors border-2 border-white"
            >
              Koleksiyonculara Yardım Et
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

// components/Footer.tsx - GÜNCELLENMİŞ
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-16">
      <div className="container-custom">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h2 className="text-2xl font-bold">SpotItForMe</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Topluluk gücüyle kayıp ürünleri bulma platformu. 
              Keşfet, bul, paylaş, kazan!
            </p>
            <div className="flex space-x-4">
              <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                📘
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                📷
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                🐦
              </button>
            </div>
          </div>

          {/* Spot & Keşfet */}
          <div>
            <h3 className="text-lg font-bold mb-4">Spot & Keşfet</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/spots" className="text-gray-400 hover:text-white">
                  Tüm Spot'lar
                </Link>
              </li>
              <li>
                <Link href="/create-spot" className="text-gray-400 hover:text-white">
                  Spot Oluştur
                </Link>
              </li>
              <li>
                <Link href="/discovery" className="text-gray-400 hover:text-white">
                  Keşfet
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-white">
                  Lider Tablosu
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="text-gray-400 hover:text-white">
                  Günlük Hedefler
                </Link>
              </li>
            </ul>
          </div>

          {/* Mağazalar */}
          <div>
            <h3 className="text-lg font-bold mb-4">Mağazalar</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shops" className="text-gray-400 hover:text-white">
                  Mağazaları Keşfet
                </Link>
              </li>
              <li>
                <Link href="/for-business" className="text-gray-400 hover:text-white">
                  İşletme Kaydı
                </Link>
              </li>
              <li>
                <Link href="/shop-dashboard" className="text-gray-400 hover:text-white">
                  Mağaza Paneli
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-400 hover:text-white">
                  Premium Paketler
                </Link>
              </li>
            </ul>
          </div>

          {/* Yardım & Destek */}
          <div>
            <h3 className="text-lg font-bold mb-4">Yardım & Destek</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white">
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  Kullanım Koşulları
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter - YENİ */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-4">📬 Bültenimize Abone Olun</h3>
            <p className="text-gray-400 mb-6">
              Yeni özellikler, başarı hikayeleri ve özel fırsatlardan haberdar olun.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-grow px-6 py-3 rounded-l-lg bg-gray-800 text-white border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-r-lg"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} SpotItForMe. Tüm hakları saklıdır.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Made with ❤️ for people who search | v2.0
          </p>
          
          {/* Yeni Özellikler Badge */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-xs">
              🔥 Yeni: Keşfet
            </span>
            <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-xs">
              🏆 Puan Sistemi
            </span>
            <span className="px-3 py-1 bg-purple-900 text-purple-200 rounded-full text-xs">
              🏪 Mağaza 2.0
            </span>
            <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-xs">
              👁️ Nadir Gördüm
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h2 className="text-2xl font-bold">SpotItForMe</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Topluluk gücüyle kayıp ürünleri bulma platformu. 
              Herkesin yardımıyla, her şeyi bulun.
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

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hızlı Erişim</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Ana Sayfa
                </Link>
              </li>
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
                <Link href="/success-stories" className="text-gray-400 hover:text-white">
                  Başarı Hikayeleri
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h3 className="text-lg font-bold mb-4">İşletmeler İçin</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/for-business" className="text-gray-400 hover:text-white">
                  Mağaza Kaydı
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-gray-400 hover:text-white">
                  Reklam Ver
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-400 hover:text-white">
                  Premium Paketler
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-gray-400 hover:text-white">
                  İş Ortakları
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
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
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-4">Bültenimize Abone Olun</h3>
            <p className="text-gray-400 mb-6">
              Yeni özellikler, başarı hikayeleri ve özel fırsatlardan haberdar olun.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-grow px-6 py-3 rounded-l-lg bg-gray-800 text-white border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-r-lg">
                Abone Ol
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 SpotItForMe. Tüm hakları saklıdır.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Made with ❤️ for people who search
          </p>
        </div>
      </div>
    </footer>
  )
}
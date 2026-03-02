// components/Header.tsx - GÜNCELLENMİŞ
import Link from 'next/link'
import UserMenu from './UserMenu'

export default function Header() {
  return (
    <header className="bg-white shadow relative z-50">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Ana sayfa linki eklendi */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                SpotItForMe
              </h1>
              <p className="text-sm text-gray-600 hidden md:block">Toplulukla bulma platformu</p>
            </div>
          </Link>

          {/* Navigation - Nadir Gördüm eklendi */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Ana Sayfa
            </Link>
            <Link href="/discovery" className="text-gray-700 hover:text-blue-600 font-medium">
              👁️ Nadir Gördüm
            </Link>
            <Link href="/spots" className="text-gray-700 hover:text-blue-600 font-medium">
              Spot'lar
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">
              Nasıl Çalışır?
            </Link>
            <Link href="/for-business" className="text-gray-700 hover:text-blue-600 font-medium">
              İşletmeler İçin
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
              Ürünler
            </Link>
          </nav>

          {/* Buttons */}
          <div className="flex items-center space-x-4">
            <UserMenu />
            <Link 
              href="/create-spot"
              className="btn-primary hidden md:inline-block"
            >
              Spot Oluştur
            </Link>
          </div>
        </div>

        {/* Mobile Navigation - Nadir Gördüm eklendi */}
        <div className="md:hidden mt-4 flex justify-center space-x-6">
          <Link href="/discovery" className="text-gray-700 hover:text-blue-600 text-sm">
            👁️ Nadir
          </Link>
          <Link href="/spots" className="text-gray-700 hover:text-blue-600 text-sm">
            Spot'lar
          </Link>
          <Link href="/how-it-works" className="text-gray-700 hover:text-blue-600 text-sm">
            Nasıl Çalışır?
          </Link>
          <Link href="/for-business" className="text-gray-700 hover:text-blue-600 text-sm">
            İşletmeler
          </Link>
        </div>

        {/* Mobile Spot Oluştur Butonu */}
        <div className="md:hidden mt-4">
          <Link 
            href="/create-spot"
            className="btn-primary w-full block text-center"
          >
            Ücretsiz Spot Oluştur
          </Link>
        </div>
      </div>
    </header>
  )
}
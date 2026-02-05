// components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Kullanıcılar', href: '/admin/users', icon: '👥' },
    { name: 'Spot\'lar', href: '/admin/spots', icon: '📍' },
    { name: 'Mağazalar', href: '/admin/shops', icon: '🏪' },
    { name: 'AdSense', href: '/admin/adsense', icon: '💰' },
    { name: 'Ödemeler', href: '/admin/payments', icon: '💳' },
    { name: 'Ayarlar', href: '/admin/settings', icon: '⚙️' },
    { name: 'Loglar', href: '/admin/logs', icon: '📋' },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-gray-400 text-sm mt-1">SpotItForMe Yönetim</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-6 py-3 hover:bg-gray-800 ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center space-x-3 text-gray-400 hover:text-white"
        >
          <span>←</span>
          <span>Siteye Dön</span>
        </Link>
      </div>
    </aside>
  )
}